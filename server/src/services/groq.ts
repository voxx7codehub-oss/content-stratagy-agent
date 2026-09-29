import { GoogleGenAI } from '@google/genai';
import { RecallResult, ReflectResult } from './hindsight.ts';
import { db } from '../database/db.ts';

export interface StrategyResponse {
  hasSufficientData: boolean;
  recommendation: string;
  evidence: Array<{
    number: string;
    headline: string;
    details: string;
  }>;
  contentGaps: Array<{
    topic: string;
    observation: string;
  }>;
  suggestedActions: Array<{
    number: string;
    action: string;
    format: string;
  }>;
  confidence: string;
  supportingMemories: Array<{
    id: string;
    snippet: string;
    sourceTitle?: string;
    date?: string;
    relevance: number;
    platform?: string;
    topic?: string;
    engagementRate?: number | null;
    performance?: string;
  }>;
  meta: {
    modelUsed: string;
    provider: 'groq' | 'gemini' | 'system';
    memoriesConsulted: number;
    totalHistoricalRecords: number;
    timestamp: string;
  };
}

class StrategyEngineService {
  private groqApiKey: string;
  private groqModel: string;
  private geminiApiKey: string;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  public updateConfig(config: { groqApiKey?: string; groqModel?: string }) {
    if (config.groqApiKey !== undefined) this.groqApiKey = config.groqApiKey;
    if (config.groqModel !== undefined) this.groqModel = config.groqModel;
  }

  /**
   * Real connectivity check for Groq. Never reports success without a
   * verified authenticated response from the Groq API.
   */
  public async checkHealth(): Promise<{ ok: boolean; state: 'connected' | 'unavailable' | 'not_configured'; message: string }> {
    if (!this.groqApiKey) {
      return { ok: false, state: 'not_configured', message: 'No Groq API key configured' };
    }
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.groqApiKey}` },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        return { ok: true, state: 'connected', message: `Groq API reachable (model: ${this.groqModel})` };
      }
      return { ok: false, state: 'unavailable', message: `Groq returned HTTP ${res.status}` };
    } catch (err: any) {
      return { ok: false, state: 'unavailable', message: `Cannot reach Groq: ${err?.message || 'Network error'}` };
    }
  }

  public getConfig() {
    return {
      groqModel: this.groqModel,
      hasGroqApiKey: !!this.groqApiKey,
      hasGeminiApiKey: !!this.geminiApiKey,
      activeProvider: this.groqApiKey ? 'groq' : this.geminiApiKey ? 'gemini' : 'none'
    };
  }

  /**
   * Main strategy generation strictly based on real historical data
   */
  public async generateStrategy(
    question: string,
    memories: RecallResult[],
    reflection: ReflectResult
  ): Promise<StrategyResponse> {
    const totalHistoricalRecords = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;

    // Rule: If no content exists in database, NEVER fabricate recommendations!
    if (totalHistoricalRecords === 0 || memories.length === 0) {
      return {
        hasSufficientData: false,
        recommendation: 'There is not enough organizational content history to make a reliable recommendation yet. Add more content or performance history.',
        evidence: [],
        contentGaps: [],
        suggestedActions: [],
        confidence: 'Insufficient historical evidence',
        supportingMemories: [],
        meta: {
          modelUsed: 'system_boundary_checker',
          provider: 'system',
          memoriesConsulted: 0,
          totalHistoricalRecords: 0,
          timestamp: new Date().toISOString()
        }
      };
    }

    const systemPrompt = `You are an AI Content Strategy Agent.
CRITICAL CONSTRAINT: You must ground recommendations STRICTLY in the provided real historical memories and metrics.
DO NOT invent metrics, DO NOT assume past campaigns not listed, and DO NOT fabricate audience behavior.
If the evidence is limited, state the limitations clearly.

OUTPUT STRICTLY AS JSON:
{
  "recommendation": "Main strategic recommendation based only on the provided records.",
  "evidence": [
    {
      "number": "01",
      "headline": "Empirical observation",
      "details": "Specific real metric or content item from memories"
    }
  ],
  "contentGaps": [
    {
      "topic": "Topic name",
      "observation": "Why this represents a gap based only on real data"
    }
  ],
  "suggestedActions": [
    {
      "number": "01",
      "action": "Concrete directive",
      "format": "Suggested format"
    }
  ],
  "confidence": "e.g. Moderate (based on 3 historical records) or High"
}`;

    const userContent = `USER QUESTION:
"${question}"

TOTAL REAL RECORDS IN ARCHIVE: ${totalHistoricalRecords}

RECALLED REAL MEMORIES (${memories.length} records):
${memories.map((m, i) => `[Memory ${i + 1}] Source: "${m.sourceTitle || 'Untitled'}" (${m.platform || 'N/A'}, Topic: ${m.topic || 'General'}, Date: ${m.timestamp || 'N/A'})\nContent: ${m.content}`).join('\n\n')}

HINDSIGHT REFLECTION:
${reflection.thought}
${reflection.answer}

Provide evidence-grounded strategic guidance.`;

    // Try Groq if configured
    if (this.groqApiKey) {
      try {
        const groqResult = await this.callGroq(systemPrompt, userContent);
        if (groqResult) {
          return this.formatResponse(groqResult, memories, 'groq', this.groqModel, totalHistoricalRecords);
        }
      } catch (err: any) {
        console.warn(`[Groq Error]: ${err.message}`);
      }
    }

    // Try Gemini if available
    if (this.geminiApiKey) {
      try {
        const geminiResult = await this.callGemini(systemPrompt, userContent);
        if (geminiResult) {
          return this.formatResponse(geminiResult, memories, 'gemini', 'gemini-2.5-flash', totalHistoricalRecords);
        }
      } catch (err: any) {
        console.warn(`[Gemini Error]: ${err.message}`);
      }
    }

    // Grounded synthesis using real memories only
    return this.synthesizeRealFallback(question, memories, totalHistoricalRecords);
  }

  private async callGroq(systemPrompt: string, userContent: string): Promise<any> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqApiKey}`
      },
      body: JSON.stringify({
        model: this.groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}');
  }

  private async callGemini(systemPrompt: string, userContent: string): Promise<any> {
    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userContent}` }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from Gemini');
    return JSON.parse(text);
  }

  private formatResponse(
    parsed: any,
    memories: RecallResult[],
    provider: 'groq' | 'gemini',
    modelUsed: string,
    totalHistoricalRecords: number
  ): StrategyResponse {
    return {
      hasSufficientData: true,
      recommendation: parsed.recommendation || 'Recommendation based on retrieved memories.',
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      contentGaps: Array.isArray(parsed.contentGaps) ? parsed.contentGaps : [],
      suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
      confidence: parsed.confidence || `Based on ${memories.length} historical record(s)`,
      supportingMemories: memories.map(m => ({
        id: m.id,
        snippet: m.content,
        sourceTitle: m.sourceTitle,
        date: m.timestamp ? new Date(m.timestamp).toLocaleDateString() : undefined,
        relevance: m.relevance,
        platform: m.platform,
        topic: m.topic,
        engagementRate: m.engagementRate,
        performance: m.performance
      })),
      meta: {
        modelUsed,
        provider,
        memoriesConsulted: memories.length,
        totalHistoricalRecords,
        timestamp: new Date().toISOString()
      }
    };
  }

  private synthesizeRealFallback(
    question: string,
    memories: RecallResult[],
    totalHistoricalRecords: number
  ): StrategyResponse {
    const topMemory = memories[0];
    return {
      hasSufficientData: true,
      recommendation: `Based on ${memories.length} historical content item(s) in your archive, strategic priority should align with proven topics such as "${topMemory?.topic || 'recent subjects'}" which demonstrated reader interaction.`,
      evidence: memories.slice(0, 3).map((m, idx) => ({
        number: `0${idx + 1}`,
        headline: `Historical performance on ${m.platform ? m.platform.toUpperCase() : 'archive'}`,
        details: `"${m.sourceTitle || 'Published asset'}": ${m.content.slice(0, 140)}...`
      })),
      contentGaps: [],
      suggestedActions: [
        {
          number: '01',
          action: `Develop follow-up content on "${topMemory?.topic || 'core themes'}"`,
          format: topMemory?.contentType ? `Similar to ${topMemory.contentType}` : 'Standard format'
        }
      ],
      confidence: totalHistoricalRecords >= 5 ? 'Moderate' : 'Preliminary (limited historical records)',
      supportingMemories: memories.map(m => ({
        id: m.id,
        snippet: m.content,
        sourceTitle: m.sourceTitle,
        date: m.timestamp ? new Date(m.timestamp).toLocaleDateString() : undefined,
        relevance: m.relevance,
        platform: m.platform,
        topic: m.topic,
        engagementRate: m.engagementRate,
        performance: m.performance
      })),
      meta: {
        modelUsed: 'deterministic_memory_reasoner',
        provider: 'system',
        memoriesConsulted: memories.length,
        totalHistoricalRecords,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export const strategyEngine = new StrategyEngineService();
