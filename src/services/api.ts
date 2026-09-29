import {
  ContentItem,
  DashboardData,
  StrategyReport,
  MemoryRecallItem,
  MemoryActivityItem,
  HindsightStatus,
  BrandVoiceProfile,
  TopicItem,
  TopicRelationship,
  GapAnalysisItem,
  ContentGapAnalysis,
  SystemStatus
} from '../types/index.ts';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok || !json.success) {
    const errorMsg = json?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return json.data as T;
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse<DashboardData>(res);
  },

  // Content
  async listContent(params: {
    search?: string;
    platform?: string;
    topic?: string;
    content_type?: string;
    tone?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ items: ContentItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.platform) query.set('platform', params.platform);
    if (params.topic) query.set('topic', params.topic);
    if (params.content_type) query.set('content_type', params.content_type);
    if (params.tone) query.set('tone', params.tone);
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/content?${query.toString()}`);
    return handleResponse<{ items: ContentItem[]; total: number }>(res);
  },

  async getContentById(id: string): Promise<{ item: ContentItem; memory: any }> {
    const res = await fetch(`${API_BASE}/content/${id}`);
    return handleResponse<{ item: ContentItem; memory: any }>(res);
  },

  async createContent(data: Partial<ContentItem>): Promise<{
    id: string;
    title: string;
    engagementRate: number | null;
    memoryId: string;
    cloudRetained: boolean;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async importContent(items: any[]): Promise<{
    total: number;
    validCount: number;
    invalidCount: number;
    errors: Array<{ row: number; error: string }>;
    importedIds: string[];
  }> {
    const res = await fetch(`${API_BASE}/content/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return handleResponse<any>(res);
  },

  async updateContent(id: string, data: Partial<ContentItem>): Promise<any> {
    const res = await fetch(`${API_BASE}/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async deleteContent(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/content/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<any>(res);
  },

  // Analytics & Insights
  async getAnalytics(): Promise<{
    timeline: any[];
    byTopic: any[];
    byContentType: any[];
    byPlatform: any[];
    topPerformers: ContentItem[];
  }> {
    const res = await fetch(`${API_BASE}/analytics`);
    return handleResponse<any>(res);
  },

  async getTopics(): Promise<{ topics: TopicItem[]; relationships: TopicRelationship[] }> {
    const res = await fetch(`${API_BASE}/topics`);
    return handleResponse<{ topics: TopicItem[]; relationships: TopicRelationship[] }>(res);
  },

  async getGaps(): Promise<GapAnalysisItem[]> {
    const res = await fetch(`${API_BASE}/gaps`);
    return handleResponse<GapAnalysisItem[]>(res);
  },

  async getGapAnalysis(): Promise<ContentGapAnalysis> {
    const res = await fetch(`${API_BASE}/gaps/analysis`);
    return handleResponse<ContentGapAnalysis>(res);
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/status`);
    return handleResponse<SystemStatus>(res);
  },

  async getBrandVoice(): Promise<BrandVoiceProfile> {
    const res = await fetch(`${API_BASE}/brand-voice`);
    return handleResponse<BrandVoiceProfile>(res);
  },

  // Strategy
  async generateStrategy(question: string, bankId?: string): Promise<StrategyReport> {
    const res = await fetch(`${API_BASE}/strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, bankId })
    });
    return handleResponse<StrategyReport>(res);
  },

  // Hindsight Memory
  async recallMemory(query: string, topK: number = 6, bankId?: string): Promise<{ query: string; count: number; memories: MemoryRecallItem[] }> {
    const res = await fetch(`${API_BASE}/memory/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK, bankId })
    });
    return handleResponse<any>(res);
  },

  async reflectMemory(question: string, bankId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/memory/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, bankId })
    });
    return handleResponse<any>(res);
  },

  async getMemoryStatus(): Promise<HindsightStatus> {
    const res = await fetch(`${API_BASE}/memory/status`);
    return handleResponse<HindsightStatus>(res);
  },

  async getMemoryActivity(limit: number = 30): Promise<MemoryActivityItem[]> {
    const res = await fetch(`${API_BASE}/memory/activity?limit=${limit}`);
    return handleResponse<MemoryActivityItem[]>(res);
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse<any>(res);
  },

  async updateSettings(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async resetWorkspace(): Promise<any> {
    const res = await fetch(`${API_BASE}/workspace/reset`, {
      method: 'POST'
    });
    return handleResponse<any>(res);
  }
};
