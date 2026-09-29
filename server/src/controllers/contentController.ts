import { Request, Response } from 'express';
import { db, ContentRecord } from '../database/db.ts';
import { hindsightService } from '../services/hindsight.ts';
import { analyzeContent } from '../services/analysis.ts';

export class ContentController {
  public static async list(req: Request, res: Response) {
    try {
      const {
        search,
        platform,
        topic,
        content_type,
        tone,
        sort = 'published_at',
        order = 'desc',
        limit = '50',
        offset = '0'
      } = req.query;

      let sql = 'SELECT * FROM contents WHERE 1=1';
      const params: any[] = [];

      if (search) {
        sql += ' AND (title LIKE ? OR body LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (platform && platform !== 'all') {
        sql += ' AND platform = ?';
        params.push(platform);
      }

      if (topic && topic !== 'all') {
        sql += ' AND topic = ?';
        params.push(topic);
      }

      if (content_type && content_type !== 'all') {
        sql += ' AND content_type = ?';
        params.push(content_type);
      }

      if (tone && tone !== 'all') {
        sql += ' AND tone = ?';
        params.push(tone);
      }

      const validSortCols = ['published_at', 'engagement_rate', 'reach', 'impressions', 'likes', 'created_at', 'title'];
      const sortCol = validSortCols.includes(String(sort)) ? String(sort) : 'published_at';
      const sortDir = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      sql += ` ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`;
      params.push(Number(limit) || 50, Number(offset) || 0);

      const items = db.all<ContentRecord>(sql, ...params);
      const total = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents')?.count || 0;

      return res.json({
        success: true,
        data: {
          items,
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to list content items' }
      });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = db.get<ContentRecord>('SELECT * FROM contents WHERE id = ?', id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: { message: `Content item with ID "${id}" not found` }
        });
      }

      const memory = db.get<any>('SELECT * FROM memory_records WHERE source_id = ?', id);

      return res.json({
        success: true,
        data: {
          item,
          memory: memory || null
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to retrieve content item' }
      });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const b = req.body;
      const id = `cnt-${Date.now()}`;
      const publishedAt = b.published_at || new Date().toISOString();
      const createdAt = new Date().toISOString();

      const reach = Number(b.reach) || 0;
      const impressions = Number(b.impressions) || 0;
      const likes = Number(b.likes) || 0;
      const comments = Number(b.comments) || 0;
      const shares = Number(b.shares) || 0;
      const clicks = Number(b.clicks) || 0;

      // Exact requirement: Engagement Rate = (likes + comments + shares) / reach * 100
      // Only calculate if reach > 0. If reach is unavailable, engagement_rate is null.
      let engagementRate: number | null = null;
      if (reach > 0) {
        engagementRate = Number((((likes + comments + shares) / reach) * 100).toFixed(2));
      }

      // 1. Save content to SQLite
      db.run(`
        INSERT INTO contents (
          id, title, body, platform, content_type, topic, tone,
          published_at, reach, impressions, likes, comments, shares, clicks,
          engagement_rate, campaign, url, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        id, b.title, b.body, b.platform, b.content_type, b.topic, b.tone,
        publishedAt, reach, impressions, likes, comments,
        shares, clicks, engagementRate, b.campaign || null, b.url || null,
        b.status || 'published', createdAt
      );

      // 2. Analyze the ACTUAL content — unknown fields stay "Unknown".
      const analysis = analyzeContent(b.title, b.body);

      // 3. Build structured memory containing real user values
      const memoryText = `Content: "${b.title}"\nBody: ${b.body}\nPlatform: ${b.platform}\nTopic: ${b.topic}\nFormat: ${b.content_type}\nTone: ${b.tone}\nDetected Topic: ${analysis.topic}\nDetected Format: ${analysis.contentType}\nDetected Tone: ${analysis.tone}\nKeywords: ${analysis.keywords.join(', ') || 'Unknown'}\nThemes: ${analysis.themes.join(', ') || 'Unknown'}\nPerformance: ${reach > 0 ? `Reach: ${reach.toLocaleString()}, Likes: ${likes}, Comments: ${comments}, Shares: ${shares}, Clicks: ${clicks}, Engagement Rate: ${engagementRate}%` : 'Reach unavailable'}${b.campaign ? `\nCampaign: ${b.campaign}` : ''}`;

      // 4. Send to Hindsight using RETAIN
      const retainResult = await hindsightService.retainMemory(memoryText, {
        sourceId: id,
        sourceTitle: b.title,
        topic: b.topic,
        contentType: b.content_type,
        platform: b.platform,
        engagementRate,
        timestamp: publishedAt,
        campaign: b.campaign,
        metadata: {
          reach,
          impressions,
          likes,
          comments,
          shares,
          clicks,
          campaign: b.campaign,
          analysis
        }
      });

      // 5. Update topic registry
      if (b.topic && b.topic.trim()) {
        const existingTopic = db.get<any>('SELECT * FROM topics WHERE name = ?', b.topic.trim());
        if (existingTopic) {
          db.run('UPDATE topics SET content_count = content_count + 1 WHERE name = ?', b.topic.trim());
        } else {
          const topId = `top-${Date.now().toString(36)}`;
          db.run('INSERT INTO topics (id, name, description, content_count, average_engagement) VALUES (?, ?, ?, ?, ?)',
            topId, b.topic.trim(), `Topic extracted from user content`, 1, engagementRate
          );
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          id,
          title: b.title,
          engagementRate,
          memoryId: retainResult.memoryId,
          cloudRetained: retainResult.cloudRetained,
          message: retainResult.message,
          analysis
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to create and retain content' }
      });
    }
  }

  /**
   * Batch Import (CSV / JSON / TXT rows)
   */
  public static async importBatch(req: Request, res: Response) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Items array is required for import' }
        });
      }

      let validCount = 0;
      let invalidCount = 0;
      const errors: Array<{ row: number; error: string }> = [];
      const importedIds: string[] = [];
      const analyses: any[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const rawTitle = item.title !== undefined && item.title !== null ? String(item.title) : '';
        const rawBody = item.body !== undefined && item.body !== null
          ? String(item.body)
          : (item.content !== undefined && item.content !== null ? String(item.content) : '');

        if (!rawTitle.trim()) {
          invalidCount++;
          errors.push({ row: i + 1, error: 'Missing title' });
          continue;
        }
        if (!rawBody.trim()) {
          invalidCount++;
          errors.push({ row: i + 1, error: 'Missing content body' });
          continue;
        }

        // Metrics must be real non-negative numbers when supplied.
        const numericFields = ['reach', 'impressions', 'likes', 'comments', 'shares', 'clicks'] as const;
        let metricError: string | null = null;
        for (const field of numericFields) {
          const value = item[field];
          if (value === undefined || value === null || value === '') continue;
          const parsed = Number(value);
          if (!Number.isFinite(parsed) || parsed < 0) {
            metricError = `Invalid ${field}: expected a non-negative number`;
            break;
          }
        }
        if (metricError) {
          invalidCount++;
          errors.push({ row: i + 1, error: metricError });
          continue;
        }

        // Dates must be parseable when supplied.
        if (item.published_at && Number.isNaN(new Date(item.published_at).getTime())) {
          invalidCount++;
          errors.push({ row: i + 1, error: 'Invalid published_at date' });
          continue;
        }

        const id = `cnt-imp-${Date.now()}-${i}`;
        const title = rawTitle.trim();
        const body = rawBody.trim();
        const platform = item.platform ? String(item.platform).toLowerCase() : 'linkedin';
        const contentType = item.content_type ? String(item.content_type).toLowerCase() : 'educational';
        const topic = item.topic ? String(item.topic).trim() : 'General';
        const tone = item.tone ? String(item.tone).toLowerCase() : 'professional';
        const publishedAt = item.published_at ? new Date(item.published_at).toISOString() : new Date().toISOString();
        const reach = Number(item.reach) || 0;
        const impressions = Number(item.impressions) || 0;
        const likes = Number(item.likes) || 0;
        const comments = Number(item.comments) || 0;
        const shares = Number(item.shares) || 0;
        const clicks = Number(item.clicks) || 0;

        let engagementRate: number | null = null;
        if (reach > 0) {
          engagementRate = Number((((likes + comments + shares) / reach) * 100).toFixed(2));
        }

        db.run(`
          INSERT INTO contents (
            id, title, body, platform, content_type, topic, tone,
            published_at, reach, impressions, likes, comments, shares, clicks,
            engagement_rate, campaign, url, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          id, title, body, platform, contentType, topic, tone,
          publishedAt, reach, impressions, likes, comments, shares, clicks,
          engagementRate, item.campaign || null, item.url || null, 'published', new Date().toISOString()
        );

        // Analyze the real imported text — unknown fields stay "Unknown".
        const analysis = analyzeContent(title, body);

        // Retain in memory
        const memoryText = `Content: "${title}"\nBody: ${body}\nPlatform: ${platform}\nTopic: ${topic}\nFormat: ${contentType}\nTone: ${tone}\nDetected Topic: ${analysis.topic}\nDetected Format: ${analysis.contentType}\nDetected Tone: ${analysis.tone}\nKeywords: ${analysis.keywords.join(', ') || 'Unknown'}\nThemes: ${analysis.themes.join(', ') || 'Unknown'}\nPerformance: ${reach > 0 ? `Reach: ${reach.toLocaleString()}, Likes: ${likes}, Comments: ${comments}, Shares: ${shares}, Clicks: ${clicks}, Engagement Rate: ${engagementRate}%` : 'Reach unavailable'}`;

        await hindsightService.retainMemory(memoryText, {
          sourceId: id,
          sourceTitle: title,
          topic,
          contentType,
          platform,
          engagementRate,
          timestamp: publishedAt,
          metadata: { analysis }
        });

        // Update topic
        const existingTopic = db.get<any>('SELECT * FROM topics WHERE name = ?', topic);
        if (existingTopic) {
          db.run('UPDATE topics SET content_count = content_count + 1 WHERE name = ?', topic);
        } else {
          db.run('INSERT INTO topics (id, name, description, content_count, average_engagement) VALUES (?, ?, ?, ?, ?)',
            `top-${Date.now()}-${i}`, topic, 'Topic extracted from imported content', 1, engagementRate
          );
        }

        validCount++;
        importedIds.push(id);
        analyses.push({ id, title, analysis });
      }

      hindsightService.recordActivity('CONTENT_RETAINED', `Imported ${validCount} real content items into organizational memory`, { count: validCount });

      return res.json({
        success: true,
        data: {
          total: items.length,
          validCount,
          invalidCount,
          errors,
          importedIds,
          analyses
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to import batch content' }
      });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const b = req.body;
      const existing = db.get<ContentRecord>('SELECT * FROM contents WHERE id = ?', id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { message: `Content item with ID "${id}" not found` }
        });
      }

      const reach = b.reach !== undefined ? Number(b.reach) : existing.reach;
      const impressions = b.impressions !== undefined ? Number(b.impressions) : existing.impressions;
      const likes = b.likes !== undefined ? Number(b.likes) : existing.likes;
      const comments = b.comments !== undefined ? Number(b.comments) : existing.comments;
      const shares = b.shares !== undefined ? Number(b.shares) : existing.shares;
      const clicks = b.clicks !== undefined ? Number(b.clicks) : existing.clicks;

      let engagementRate: number | null = null;
      if (reach > 0) {
        engagementRate = Number((((likes + comments + shares) / reach) * 100).toFixed(2));
      }

      db.run(`
        UPDATE contents SET
          title = ?, body = ?, platform = ?, content_type = ?,
          topic = ?, tone = ?, reach = ?, impressions = ?,
          likes = ?, comments = ?, shares = ?, clicks = ?,
          engagement_rate = ?, campaign = ?, url = ?, status = ?
        WHERE id = ?
      `,
        b.title || existing.title,
        b.body || existing.body,
        b.platform || existing.platform,
        b.content_type || existing.content_type,
        b.topic || existing.topic,
        b.tone || existing.tone,
        reach, impressions, likes, comments, shares, clicks,
        engagementRate,
        b.campaign !== undefined ? b.campaign : existing.campaign,
        b.url !== undefined ? b.url : existing.url,
        b.status || existing.status,
        id
      );

      return res.json({
        success: true,
        data: { id, message: 'Content item updated successfully' }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to update content item' }
      });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      db.run('DELETE FROM contents WHERE id = ?', id);
      db.run('DELETE FROM memory_records WHERE source_id = ?', id);

      return res.json({
        success: true,
        data: { id, message: 'Content item and linked memory deleted' }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to delete content item' }
      });
    }
  }
}
