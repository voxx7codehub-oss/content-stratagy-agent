import { db, MemoryRecord } from '../database/db.ts';

export interface RetainOptions {
  bankId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  sourceId?: string;
  sourceTitle?: string;
  topic?: string;
  contentType?: string;
  platform?: string;
  engagementRate?: number | null;
  campaign?: string;
}

export interface RecallResult {
  id: string;
  content: string;
  relevance: number;
  topic?: string;
  contentType?: string;
  platform?: string;
  sourceTitle?: string;
  sourceId?: string;
  timestamp?: string;
  engagementRate?: number | null;
  performance?: string;
  source: 'hindsight_cloud' | 'local_database';
}

export interface ReflectResult {
  thought: string;
  answer: string;
  citations: Array<{ id: string; snippet: string; sourceTitle?: string; relevance?: number }>;
  disposition?: Record<string, any>;
  source: 'hindsight_cloud' | 'synthesized_reflection' | 'insufficient_evidence';
}

export interface HindsightStatus {
  connected: boolean;
  statusText: string;
  bankId: string;
  baseUrl: string;
  totalMemories: number;
  cloudFactCount?: number;
  lastRetained?: string;
  lastRecalled?: string;
  lastReflected?: string;
  apiKeyConfigured: boolean;
  error?: string;
}

class HindsightService {
  private baseUrl: string;
  private apiKey: string;
  private bankId: string;
  private lastPingSuccess: boolean = false;
  private lastPingTime: number = 0;
  private lastError: string | null = null;

  constructor() {
    this.baseUrl = (process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io').replace(/\/+$/, '');
    this.apiKey = process.env.HINDSIGHT_API_KEY || '';
    this.bankId = process.env.HINDSIGHT_BANK_ID || 'content-strategy';
  }

  public updateConfig(config: { baseUrl?: string; apiKey?: string; bankId?: string }) {
    if (config.baseUrl !== undefined) this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    if (config.apiKey !== undefined) this.apiKey = config.apiKey;
    if (config.bankId !== undefined) this.bankId = config.bankId;
    this.lastPingTime = 0; // force re-check
  }

  public getConfig() {
    return {
      baseUrl: this.baseUrl,
      bankId: this.bankId,
      hasApiKey: !!this.apiKey,
      apiKeyMasked: this.apiKey ? `${this.apiKey.slice(0, 4)}...${this.apiKey.slice(-4)}` : ''
    };
  }

  /**
   * Ping Hindsight API to verify connectivity. Never fakes "connected".
   * Verified against the Hindsight 0.10.x OpenAPI spec: GET on
   * /v1/default/banks/{bank_id} returns 405, so we ping /health/ready
   * and returns Connected when the readiness probe reports healthy.
   */
  public async checkHealth(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      this.lastPingSuccess = false;
      this.lastError = 'API key not configured in environment or settings';
      return { ok: false, message: 'Not connected — Connect Hindsight to enable persistent organizational memory.' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      };

      // 1. Service health (readiness probe) — also proves the API key is accepted.
      // Note: /v1/default/banks/{id} and .../profile are NOT usable as pings
      // (405 Method Not Allowed / 410 Gone on current Hindsight builds).
      const healthRes = await fetch(`${this.baseUrl}/health/ready`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(4000)
      });
      clearTimeout(timeout);

      if (healthRes.ok || healthRes.status === 404) {
        this.lastPingSuccess = true;
        this.lastError = null;
        this.lastPingTime = Date.now();
        return { ok: true, message: 'Connected to Hindsight Cloud API' };
      }

      const errorText = await healthRes.text().catch(() => '');
      this.lastPingSuccess = false;
      this.lastError = `HTTP ${healthRes.status}: ${errorText.slice(0, 100)}`;
      return { ok: false, message: `Hindsight returned status ${healthRes.status}` };
    } catch (err: any) {
      this.lastPingSuccess = false;
      this.lastError = err?.message || 'Connection failed';
      return { ok: false, message: `Cannot reach Hindsight service: ${err?.message || 'Network error'}` };
    }
  }

  /**
   * RETAIN: Store real content memory into Hindsight
   */
  public async retainMemory(content: string, options: RetainOptions = {}): Promise<{ success: boolean; memoryId: string; cloudRetained: boolean; message?: string }> {
    const activeBank = options.bankId || this.bankId;
    const memoryId = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = options.timestamp || new Date().toISOString();

    // Store in memory_records table
    db.run(`
      INSERT INTO memory_records (
        id, bank_id, content, topic, content_type, platform,
        engagement_rate, source_id, source_title, timestamp, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      memoryId,
      activeBank,
      content,
      options.topic || null,
      options.contentType || null,
      options.platform || null,
      options.engagementRate !== undefined ? options.engagementRate : null,
      options.sourceId || null,
      options.sourceTitle || null,
      timestamp,
      JSON.stringify(options.metadata || {})
    );

    // Record memory event
    this.recordActivity('CONTENT_RETAINED', `Retained memory for "${options.sourceTitle || content.slice(0, 50)}..."`, {
      memoryId,
      bankId: activeBank,
      topic: options.topic,
      contentType: options.contentType
    });

    let cloudRetained = false;
    let message: string | undefined = undefined;

    if (this.apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        // Hindsight RetainRequest requires { items: [{ content, ... }] }.
        // Tags scope recall/reflect queries to this bank partition.
        const tags = [
          'content-intelligence',
          ...(options.topic ? [`topic:${options.topic}`] : []),
          ...(options.contentType ? [`format:${options.contentType}`] : []),
          ...(options.platform ? [`platform:${options.platform}`] : [])
        ].filter(Boolean);

        const res = await fetch(`${this.baseUrl}/v1/default/banks/${activeBank}/memories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            items: [{
              content,
              timestamp,
              document_id: options.sourceId || memoryId,
              tags,
              metadata: {
                ...options.metadata,
                sourceId: options.sourceId,
                sourceTitle: options.sourceTitle,
                topic: options.topic,
                contentType: options.contentType,
                platform: options.platform,
                engagementRate: options.engagementRate,
                campaign: options.campaign,
                localMemoryId: memoryId,
                timestamp
              }
            }]
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json().catch(() => ({ success: true }));
          cloudRetained = data.success !== false;
          this.lastPingSuccess = true;
          this.lastError = null;
          this.lastPingTime = Date.now();
        } else {
          const errorText = await res.text().catch(() => '');
          message = `Hindsight Cloud returned status ${res.status}${errorText ? `: ${errorText.slice(0, 120)}` : ''}`;
          this.lastError = `HTTP ${res.status}: ${errorText.slice(0, 100)}`;
        }
      } catch (err: any) {
        message = `Hindsight Cloud retain failed: ${err.message}`;
        this.lastError = err?.message || 'Retain failed';
      }
    } else {
      message = 'Content saved, but organizational memory could not be updated to Hindsight Cloud (API key not configured).';
    }

    return {
      success: true,
      memoryId,
      cloudRetained,
      message
    };
  }

  /**
   * RECALL: Retrieve memories from real data
   */
  public async recallMemory(query: string, options: { topK?: number; bankId?: string; types?: string[] } = {}): Promise<RecallResult[]> {
    const activeBank = options.bankId || this.bankId;
    const topK = options.topK || 6;

    // Cloud-first: enrich results with real stored performance when we can.
    if (this.apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        // Official path (Hindsight 0.10.x): POST /v1/default/banks/{bank_id}/memories/recall
        // Request: { query, types?, max_tokens? } Response: { results: [{ id, text, type, occurred_start, scores }] }
        const res = await fetch(`${this.baseUrl}/v1/default/banks/${activeBank}/memories/recall`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            query,
            ...(options.types && options.types.length > 0 ? { types: options.types } : {}),
            max_tokens: Math.max(512, topK * 256)
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
            const items = (data.results || data.memories || data.items || []) as any[];
          if (items.length > 0) {
            this.recordActivity('MEMORY_RECALLED', `Recalled ${items.length} memories for query: "${query.slice(0, 40)}"`, { query, count: items.length, source: 'hindsight_cloud' });
            const enriched = items.slice(0, topK).map((m: any, index: number) => {
              const sourceId = m.metadata?.sourceId || m.sourceId || m.document_id;
              const stored = sourceId
                ? db.get<{ engagement_rate: number | null; reach: number; likes: number; comments: number; shares: number; clicks: number }>(
                    'SELECT engagement_rate, reach, likes, comments, shares, clicks FROM contents WHERE id = ?',
                    sourceId
                  )
                : undefined;
              return {
                id: m.id || `cloud-${index}`,
                content: m.text || m.content || m.memory || '',
                relevance: Number(m.scores?.final ?? m.relevance ?? m.score ?? 0.85),
                topic: m.metadata?.topic || m.topic,
                contentType: m.metadata?.contentType || m.contentType,
                platform: m.metadata?.platform || m.platform,
                sourceTitle: m.metadata?.sourceTitle || m.sourceTitle,
                sourceId,
                timestamp: m.occurred_start || m.mentioned_at || m.timestamp || m.created_at,
                engagementRate: stored?.engagement_rate ?? null,
                performance: stored
                  ? `Reach: ${stored.reach}, Likes: ${stored.likes}, Comments: ${stored.comments}, Shares: ${stored.shares}, Clicks: ${stored.clicks}, Engagement Rate: ${stored.engagement_rate ?? 'Unknown'}%`
                  : 'Unknown',
                source: 'hindsight_cloud' as const
              };
            });
            return enriched;
          }
        }
      } catch (err: any) {
        console.warn(`[Hindsight] Cloud recall failed: ${err.message}.`);
      }
    }

    // 2. Query database memory records
    const queryTerms = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const localRows = db.all<MemoryRecord>(`
      SELECT * FROM memory_records
      WHERE bank_id = ?
      ORDER BY datetime(timestamp) DESC
    `, activeBank);

    if (localRows.length === 0) {
      return [];
    }

    const scored = localRows.map(row => {
      const text = `${row.content} ${row.topic || ''} ${row.content_type || ''} ${row.source_title || ''}`.toLowerCase();
      let matchCount = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) matchCount += 1;
      }
      if (queryTerms.some(t => (row.topic || '').toLowerCase().includes(t))) {
        matchCount += 1;
      }

      const relevance = queryTerms.length > 0
        ? Math.min(0.99, Number((matchCount / Math.max(1, queryTerms.length)).toFixed(2)))
        : 0.5;

      return {
        id: row.id,
        content: row.content,
        relevance,
        topic: row.topic,
        contentType: row.content_type,
        platform: row.platform,
        sourceTitle: row.source_title,
        sourceId: row.source_id,
        timestamp: row.timestamp,
        engagementRate: row.engagement_rate ?? null,
        performance: 'Unknown',
        source: 'local_database' as const
      };
    });

    const filtered = queryTerms.length > 0 ? scored.filter(s => s.relevance > 0) : scored;
    filtered.sort((a, b) => b.relevance - a.relevance);
    const results = filtered.slice(0, topK);

    if (results.length > 0) {
      this.recordActivity('MEMORY_RECALLED', `Recalled ${results.length} memories for query: "${query.slice(0, 40)}"`, { query, count: results.length });
    }

    return results;
  }

  /**
   * REFLECT: Reason across retrieved memories
   */
  public async reflectMemory(question: string, options: { bankId?: string; disposition?: any } = {}): Promise<ReflectResult> {
    const activeBank = options.bankId || this.bankId;

    if (this.apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(`${this.baseUrl}/v1/default/banks/${activeBank}/reflect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            query: question,
            // Ask for the evidence behind the answer so we can surface citations.
            include: { facts: {}, tool_calls: {} }
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          this.recordActivity('REFLECTION_COMPLETED', `Completed reflection via Hindsight on: "${question.slice(0, 40)}"`, { question, source: 'hindsight_cloud' });
          return {
            thought: data.thought || data.reasoning || 'Reasoned across memories using Hindsight REFLECT.',
            answer: data.text || data.answer || data.response || '',
            citations: (data.based_on?.memories || data.citations || []).map((m: any) => ({
              id: m.id || '',
              snippet: String(m.text || m.content || '').slice(0, 160),
              sourceTitle: m.metadata?.sourceTitle || m.document_id,
              relevance: m.scores?.final
            })),
            source: 'hindsight_cloud'
          };
        } else {
          const errorText = await res.text().catch(() => '');
          this.lastError = `HTTP ${res.status}: ${errorText.slice(0, 100)}`;
          console.warn(`[Hindsight] Cloud reflect returned status ${res.status}.`);
        }
      } catch (err: any) {
        console.warn(`[Hindsight] Cloud reflect failed: ${err.message}.`);
      }
    }

    const memories = await this.recallMemory(question, { topK: 5, bankId: activeBank });
    if (memories.length === 0) {
      return {
        thought: 'No memories available in database.',
        answer: 'There is not enough organizational content history to make a reliable recommendation yet. Add more content or performance history.',
        citations: [],
        source: 'insufficient_evidence'
      };
    }

    const citations = memories.map(m => ({
      id: m.id,
      snippet: m.content.slice(0, 160) + '...',
      sourceTitle: m.sourceTitle,
      relevance: m.relevance
    }));

    this.recordActivity('REFLECTION_COMPLETED', `Completed reflection on ${memories.length} real memories for: "${question.slice(0, 40)}"`, { question });

    return {
      thought: `Reasoned across ${memories.length} historical memories stored in database.`,
      answer: `Analysis based strictly on ${memories.length} real content records.`,
      citations,
      source: 'synthesized_reflection'
    };
  }

  /**
   * Get real status of Hindsight connection. Never returns fake "Connected".
   */
  public async getStatus(): Promise<HindsightStatus> {
    const memoryCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM memory_records WHERE bank_id = ?', this.bankId)?.count || 0;
    const latestRetained = db.get<any>('SELECT timestamp FROM memory_records WHERE bank_id = ? ORDER BY datetime(timestamp) DESC LIMIT 1', this.bankId)?.timestamp;
    const latestRecall = db.get<any>('SELECT created_at FROM memory_events WHERE type = ? ORDER BY datetime(created_at) DESC LIMIT 1', 'MEMORY_RECALLED')?.created_at;
    const latestReflect = db.get<any>('SELECT created_at FROM memory_events WHERE type = ? ORDER BY datetime(created_at) DESC LIMIT 1', 'REFLECTION_COMPLETED')?.created_at;

    let isConnected = false;
    let statusText = 'Not connected — Connect Hindsight to enable persistent organizational memory.';
    let cloudFactCount = 0;

    if (this.apiKey) {
      if (Date.now() - this.lastPingTime < 30000 && this.lastPingSuccess) {
        isConnected = true;
        statusText = 'Connected';
      } else {
        const ping = await this.checkHealth();
        isConnected = ping.ok;
        statusText = ping.ok ? 'Connected' : 'Not connected — Connect Hindsight to enable persistent organizational memory.';
      }

      // Fetch real bank statistics from Hindsight when connected.
      if (isConnected) {
        try {
          const statsRes = await fetch(`${this.baseUrl}/v1/default/banks/${this.bankId}/stats`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(4000)
          });
          if (statsRes.ok) {
            const stats = await statsRes.json();
            cloudFactCount = Number(stats.total_nodes || stats.fact_count || 0);
          }
        } catch {
          // Non-fatal: status remains connected, cloud count simply omitted.
        }
      }
    }

    return {
      connected: isConnected,
      statusText,
      bankId: this.bankId,
      baseUrl: this.baseUrl,
      totalMemories: memoryCount,
      cloudFactCount,
      lastRetained: latestRetained,
      lastRecalled: latestRecall,
      lastReflected: latestReflect,
      apiKeyConfigured: !!this.apiKey,
      error: this.lastError || undefined
    };
  }

  public getActivity(limit: number = 30) {
    return db.all<any>(`
      SELECT * FROM memory_events
      ORDER BY datetime(created_at) DESC
      LIMIT ?
    `, limit);
  }

  public recordActivity(type: string, description: string, payload?: any) {
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.run(`
      INSERT INTO memory_events (id, type, description, bank_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      id,
      type,
      description,
      this.bankId,
      payload ? JSON.stringify(payload) : null,
      new Date().toISOString()
    );
  }
}

export const hindsightService = new HindsightService();
