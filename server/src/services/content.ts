import { db, ContentRecord } from '../database/db.ts';

export interface DashboardStats {
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
}

export interface BrandVoiceProfile {
  hasEnoughData: boolean;
  totalAnalyzed: number;
  toneDistribution: Array<{ tone: string; percentage: number; count: number }>;
  primaryTone?: string;
  sampleSnippets?: string[];
  observedThemes?: string[];
  message?: string;
  // Additive fields — derived only from real stored content
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
  gaps: DynamicGapItem[];
  typeImbalances: Array<{
    contentType: string;
    count: number;
    averageEngagement: number | null;
    observation: string;
  }>;
  underrepresentedPlatforms: string[];
}

export interface DynamicGapItem {
  id: string;
  topic: string;
  coverage_score: number;
  performance_score: number;
  opportunity_score: number;
  recommendation: string;
}

export class ContentService {
  /**
   * Get calculated dashboard statistics from real SQLite database
   */
  public getDashboardStats(): DashboardStats {
    const contentCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;
    const topicCount = db.get<{ count: number }>("SELECT COUNT(DISTINCT topic) as count FROM contents WHERE topic IS NOT NULL AND topic != ''")?.count || 0;
    const memoryCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM memory_records')?.count || 0;

    const totals = db.get<{
      reach: number;
      impressions: number;
      likes: number;
      shares: number;
      comments: number;
      clicks: number;
      avgEng: number | null;
    }>(`
      SELECT 
        COALESCE(SUM(reach), 0) as reach,
        COALESCE(SUM(impressions), 0) as impressions,
        COALESCE(SUM(likes), 0) as likes,
        COALESCE(SUM(shares), 0) as shares,
        COALESCE(SUM(comments), 0) as comments,
        COALESCE(SUM(clicks), 0) as clicks,
        AVG(engagement_rate) as avgEng
      FROM contents
    `);

    // Gaps count: only calculated if contentCount >= 3
    const gaps = this.getGaps();

    return {
      totalContent: contentCount,
      totalTopics: topicCount,
      totalGaps: gaps.length,
      totalMemories: memoryCount,
      totalReach: totals?.reach || 0,
      totalImpressions: totals?.impressions || 0,
      averageEngagementRate: totals?.avgEng !== null && totals?.avgEng !== undefined ? Number(Number(totals.avgEng).toFixed(2)) : null,
      totalLikes: totals?.likes || 0,
      totalShares: totals?.shares || 0,
      totalComments: totals?.comments || 0,
      totalClicks: totals?.clicks || 0
    };
  }

  /**
   * Get performance analytics for charts - strictly real records
   */
  public getAnalytics() {
    const contentCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;
    if (contentCount === 0) {
      return {
        timeline: [],
        byTopic: [],
        byContentType: [],
        byPlatform: [],
        topPerformers: []
      };
    }

    // 1. Performance over time
    const timeline = db.all<any>(`
      SELECT 
        strftime('%Y-%m-%d', published_at) as date,
        AVG(engagement_rate) as engagementRate,
        SUM(reach) as reach,
        SUM(impressions) as impressions,
        COUNT(*) as count
      FROM contents
      WHERE published_at IS NOT NULL AND published_at != ''
      GROUP BY date
      ORDER BY date ASC
    `);

    // 2. Engagement by topic
    const byTopic = db.all<any>(`
      SELECT 
        topic,
        COUNT(*) as contentCount,
        ROUND(AVG(engagement_rate), 2) as averageEngagement,
        SUM(reach) as totalReach
      FROM contents
      WHERE topic IS NOT NULL AND topic != ''
      GROUP BY topic
      ORDER BY averageEngagement DESC
    `);

    // 3. Distribution by content_type
    const byContentType = db.all<any>(`
      SELECT 
        content_type as type,
        COUNT(*) as count,
        ROUND(AVG(engagement_rate), 2) as avgEngagement
      FROM contents
      WHERE content_type IS NOT NULL AND content_type != ''
      GROUP BY content_type
      ORDER BY count DESC
    `);

    // 4. Platform performance
    const byPlatform = db.all<any>(`
      SELECT 
        platform,
        COUNT(*) as count,
        SUM(reach) as totalReach,
        ROUND(AVG(engagement_rate), 2) as avgEngagement,
        SUM(clicks) as totalClicks
      FROM contents
      WHERE platform IS NOT NULL AND platform != ''
      GROUP BY platform
      ORDER BY totalReach DESC
    `);

    // 5. Top performing content items
    const topPerformers = db.all<ContentRecord>(`
      SELECT *
      FROM contents
      ORDER BY COALESCE(engagement_rate, 0) DESC, reach DESC
      LIMIT 8
    `);

    return {
      timeline,
      byTopic,
      byContentType,
      byPlatform,
      topPerformers
    };
  }

  /**
   * Get topics dynamically extracted from real content
   */
  public getTopics() {
    const topics = db.all<any>(`
      SELECT 
        topic as name,
        COUNT(*) as content_count,
        ROUND(AVG(engagement_rate), 2) as average_engagement,
        SUM(reach) as total_reach,
        GROUP_CONCAT(DISTINCT platform) as platforms
      FROM contents
      WHERE topic IS NOT NULL AND topic != ''
      GROUP BY topic
      ORDER BY content_count DESC, average_engagement DESC
    `);

    return {
      topics: topics.map((t, idx) => ({
        id: `topic-${idx + 1}`,
        name: t.name,
        description: `Topic extracted from ${t.content_count} published item(s)`,
        content_count: t.content_count,
        average_engagement: t.average_engagement,
        total_reach: t.total_reach,
        platforms: t.platforms ? t.platforms.split(',') : []
      })),
      relationships: []
    };
  }

  /**
   * Calculate content gaps dynamically from real content distribution
   * Only returns gaps if at least 3 content items exist.
   */
  public getGaps(): DynamicGapItem[] {
    const totalCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;
    if (totalCount < 3) {
      return [];
    }

    const topicStats = db.all<{ topic: string; count: number; avgEng: number | null }>(`
      SELECT 
        topic,
        COUNT(*) as count,
        AVG(engagement_rate) as avgEng
      FROM contents
      WHERE topic IS NOT NULL AND topic != ''
      GROUP BY topic
    `);

    if (topicStats.length < 2) {
      return [];
    }

    const avgOverallEng = db.get<{ avgEng: number }>('SELECT AVG(engagement_rate) as avgEng FROM contents WHERE engagement_rate IS NOT NULL')?.avgEng || 1;

    return topicStats.map((t, idx) => {
      const coverageScore = Math.round((t.count / totalCount) * 100);
      const eng = t.avgEng || 0;
      const perfScore = avgOverallEng > 0 ? Math.min(100, Math.round((eng / avgOverallEng) * 50)) : 50;
      // High opportunity = high performance but low coverage
      const oppScore = Math.max(5, Math.min(99, Math.round((perfScore * 1.2) - (coverageScore * 0.5))));

      let recommendation = `Maintain coverage for ${t.topic}.`;
      if (coverageScore < 20 && perfScore >= 50) {
        recommendation = `High opportunity: ${t.topic} demonstrates above-average engagement (${eng.toFixed(1)}%) but represents only ${coverageScore}% of your library. Consider increasing volume.`;
      } else if (coverageScore >= 40 && perfScore < 40) {
        recommendation = `Potential fatigue: ${t.topic} accounts for ${coverageScore}% of output but engagement is trailing behind your average. Consider adjusting the format or angle.`;
      } else {
        recommendation = `Topic ${t.topic} represents ${coverageScore}% of content with an average engagement of ${eng.toFixed(1)}%.`;
      }

      return {
        id: `gap-${idx + 1}`,
        topic: t.topic,
        coverage_score: coverageScore,
        performance_score: perfScore,
        opportunity_score: oppScore,
        recommendation
      };
    }).sort((a, b) => b.opportunity_score - a.opportunity_score);
  }

  /**
   * Dynamic brand voice derived strictly from user-provided content
   */
  public getBrandVoice(): BrandVoiceProfile {
    const contentCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;
    if (contentCount < 3) {
      return {
        hasEnoughData: false,
        totalAnalyzed: contentCount,
        toneDistribution: [],
        message: 'Not enough content to reliably determine brand voice.'
      };
    }

    const toneRows = db.all<{ tone: string; count: number }>(`
      SELECT tone, COUNT(*) as count
      FROM contents
      WHERE tone IS NOT NULL AND tone != ''
      GROUP BY tone
      ORDER BY count DESC
    `);

    const totalTones = toneRows.reduce((acc, r) => acc + r.count, 0) || 1;
    const toneDistribution = toneRows.map(r => ({
      tone: r.tone.charAt(0).toUpperCase() + r.tone.slice(1),
      percentage: Math.round((r.count / totalTones) * 100),
      count: r.count
    }));

    const primaryTone = toneDistribution.length > 0 ? toneDistribution[0].tone : undefined;

    // Extract recent titles as sample snippets
    const sampleSnippets = db.all<{ title: string }>('SELECT title FROM contents ORDER BY published_at DESC LIMIT 5').map(r => r.title);

    // Extract actual topics
    const observedThemes = db.all<{ topic: string }>("SELECT DISTINCT topic FROM contents WHERE topic IS NOT NULL AND topic != '' LIMIT 6").map(r => r.topic);

    // --- Recurring terminology: measured across real bodies ---
    const bodies = db.all<{ body: string }>('SELECT body FROM contents');
    const termFrequency = new Map<string, number>();
    for (const { body } of bodies) {
      const seen = new Set<string>();
      for (const word of (body || '')
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 4)) {
        seen.add(word);
      }
      for (const word of seen) {
        termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
      }
    }
    const recurringTerminology = [...termFrequency.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    // --- Sentence characteristics: measured, never estimated ---
    const allSentences: number[] = [];
    for (const { body } of bodies) {
      for (const sentence of (body || '').split(/[.!?\n]+/)) {
        const wordCount = sentence.split(/\s+/).filter(Boolean).length;
        if (wordCount > 0) allSentences.push(wordCount);
      }
    }
    const totalSentences = allSentences.length;
    const averageSentenceLength = totalSentences > 0
      ? Number((allSentences.reduce((a, b) => a + b, 0) / totalSentences).toFixed(1))
      : 0;
    const longestSentenceLength = allSentences.length > 0 ? Math.max(...allSentences) : 0;

    let writingStyle = 'Unknown';
    if (totalSentences > 0) {
      if (averageSentenceLength <= 12) writingStyle = 'Concise and direct';
      else if (averageSentenceLength <= 20) writingStyle = 'Balanced explanatory';
      else writingStyle = 'Long-form narrative';
    }

    return {
      hasEnoughData: true,
      totalAnalyzed: contentCount,
      toneDistribution,
      primaryTone,
      sampleSnippets,
      observedThemes,
      recurringTerminology,
      writingStyle,
      sentenceCharacteristics: {
        totalSentences,
        averageSentenceLength,
        longestSentenceLength
      }
    };
  }

  /**
   * Content gap detection built purely from real content distribution:
   * topic frequency, content type mix, performance and platform spread.
   */
  public getContentGapAnalysis(): ContentGapAnalysis {
    const totalCount = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;
    const topicCount = db.get<{ count: number }>("SELECT COUNT(DISTINCT topic) as count FROM contents WHERE topic IS NOT NULL AND topic != ''")?.count || 0;

    if (totalCount < 3 || topicCount < 2) {
      return {
        hasSufficientData: false,
        message: 'Insufficient data to identify meaningful content gaps.',
        gaps: [],
        typeImbalances: [],
        underrepresentedPlatforms: []
      };
    }

    const gaps = this.getGaps();

    // Content type imbalance: compare each type's share against an even spread.
    const typeStats = db.all<{ type: string; count: number; avgEng: number | null }>(`
      SELECT content_type as type, COUNT(*) as count, AVG(engagement_rate) as avgEng
      FROM contents
      WHERE content_type IS NOT NULL AND content_type != ''
      GROUP BY content_type
      ORDER BY count DESC
    `);

    const distinctTypes = typeStats.length;
    const evenShare = distinctTypes > 0 ? 100 / distinctTypes : 0;
    const typeImbalances = typeStats.map(t => {
      const share = Number(((t.count / totalCount) * 100).toFixed(1));
      let observation: string;
      if (share > evenShare * 2) {
        observation = `"${t.type}" accounts for ${share}% of your content (${t.count} of ${totalCount} items) versus an even spread of ${evenShare.toFixed(1)}% across ${distinctTypes} observed type(s) — a strong over-representation.`;
      } else if (share < evenShare * 0.5) {
        observation = `"${t.type}" accounts for only ${share}% of your content (${t.count} of ${totalCount} items) versus an even spread of ${evenShare.toFixed(1)}% — underrepresented.`;
      } else {
        observation = `"${t.type}" accounts for ${share}% of your content (${t.count} of ${totalCount} items), close to an even spread of ${evenShare.toFixed(1)}%.`;
      }
      return {
        contentType: t.type,
        count: t.count,
        averageEngagement: t.avgEng !== null && t.avgEng !== undefined ? Number(Number(t.avgEng).toFixed(2)) : null,
        observation
      };
    }).sort((a, b) => b.count - a.count);

    // Platforms present in content vs. those appearing only once.
    const platformStats = db.all<{ platform: string; count: number }>(`
      SELECT platform, COUNT(*) as count
      FROM contents
      WHERE platform IS NOT NULL AND platform != ''
      GROUP BY platform
    `);
    const underrepresentedPlatforms = platformStats
      .filter(p => p.count <= 1)
      .map(p => p.platform);

    return {
      hasSufficientData: gaps.length > 0 || typeImbalances.length > 0,
      gaps,
      typeImbalances,
      underrepresentedPlatforms
    };
  }
}

export const contentService = new ContentService();
