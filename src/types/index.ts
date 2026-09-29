export interface ContentItem {
  id: string;
  title: string;
  body: string;
  platform: 'linkedin' | 'x' | 'youtube' | 'blog' | 'instagram' | 'newsletter' | string;
  content_type: 'educational' | 'case_study' | 'tutorial' | 'thought_leadership' | 'promotional' | 'industry_news' | string;
  topic: string;
  tone: 'professional' | 'educational' | 'technical' | 'concise' | 'conversational' | 'promotional' | string;
  published_at: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number | null;
  campaign?: string;
  url?: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string;
}

export interface TopicItem {
  id: string;
  name: string;
  description?: string;
  content_count: number;
  average_engagement: number | null;
  total_reach?: number;
  platforms?: string[];
}

export interface TopicRelationship {
  source: string;
  target: string;
  strength: number;
  type: string;
}

export interface GapAnalysisItem {
  id: string;
  topic: string;
  coverage_score: number;
  performance_score: number;
  opportunity_score: number;
  recommendation: string;
}

export interface BrandVoiceProfile {
  hasEnoughData: boolean;
  totalAnalyzed: number;
  toneDistribution: Array<{ tone: string; percentage: number; count: number }>;
  primaryTone?: string;
  sampleSnippets?: string[];
  observedThemes?: string[];
  message?: string;
  recurringTerminology?: Array<{ term: string; count: number }>;
  writingStyle?: string;
  sentenceCharacteristics?: {
    totalSentences: number;
    averageSentenceLength: number;
    longestSentenceLength: number;
  };
}

export interface ContentGapAnalysis {
  hasSufficientData: boolean;
  message?: string;
  gaps: GapAnalysisItem[];
  typeImbalances: Array<{
    contentType: string;
    count: number;
    averageEngagement: number | null;
    observation: string;
  }>;
  underrepresentedPlatforms: string[];
}

export type ServiceState = 'connected' | 'unavailable' | 'not_configured';

export interface SystemStatus {
  database: ServiceState;
  hindsight: ServiceState;
  groq: ServiceState;
  details: {
    database: string;
    hindsight: string;
    groq: string;
  };
  checkedAt: string;
}

export interface StrategyReport {
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
    provider: string;
    memoriesConsulted: number;
    totalHistoricalRecords: number;
    timestamp: string;
  };
}

export interface MemoryRecallItem {
  id: string;
  content: string;
  relevance: number;
  topic?: string;
  contentType?: string;
  platform?: string;
  sourceTitle?: string;
  sourceId?: string;
  timestamp?: string;
  source: 'hindsight_cloud' | 'local_database';
}

export interface MemoryActivityItem {
  id: string;
  type: string;
  description: string;
  bank_id: string;
  memory_id?: string;
  payload?: string;
  created_at: string;
}

export interface HindsightStatus {
  connected: boolean;
  statusText: string;
  bankId: string;
  baseUrl: string;
  totalMemories: number;
  lastRetained?: string;
  lastRecalled?: string;
  lastReflected?: string;
  apiKeyConfigured: boolean;
  error?: string;
}

export interface DashboardData {
  stats: {
    totalContent: number;
    totalTopics: number;
    totalGaps: number;
    totalMemories: number;
    totalReach: number;
    totalImpressions: number;
    averageEngagementRate: number | null;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    totalClicks: number;
  };
  topPerformers: ContentItem[];
  topicHighlights: Array<{
    topic: string;
    contentCount: number;
    averageEngagement: number;
    totalReach: number;
  }>;
  memoryStatus: {
    connected: boolean;
    bankId: string;
    totalMemories: number;
  };
}

export type ActiveView =
  | 'landing'
  | 'dashboard'
  | 'content_library'
  | 'add_content'
  | 'import_content'
  | 'performance'
  | 'strategist'
  | 'content_gaps'
  | 'topic_intelligence'
  | 'brand_voice'
  | 'memory_overview'
  | 'retrieved_memories'
  | 'memory_activity'
  | 'settings';
