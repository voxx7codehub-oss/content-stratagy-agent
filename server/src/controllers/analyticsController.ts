import { Request, Response } from 'express';
import { contentService } from '../services/content.ts';
import { hindsightService } from '../services/hindsight.ts';
import { strategyEngine } from '../services/groq.ts';
import { db } from '../database/db.ts';

export class AnalyticsController {
  public static async dashboard(req: Request, res: Response) {
    try {
      const stats = contentService.getDashboardStats();
      const analytics = contentService.getAnalytics();
      const memoryStatus = await hindsightService.getStatus();

      return res.json({
        success: true,
        data: {
          stats,
          topPerformers: analytics.topPerformers.slice(0, 5),
          topicHighlights: analytics.byTopic.slice(0, 4),
          memoryStatus: {
            connected: memoryStatus.connected,
            bankId: memoryStatus.bankId,
            totalMemories: memoryStatus.totalMemories
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to fetch dashboard statistics' }
      });
    }
  }

  public static async analytics(req: Request, res: Response) {
    try {
      const data = contentService.getAnalytics();
      return res.json({
        success: true,
        data
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to fetch analytics' }
      });
    }
  }

  public static async topics(req: Request, res: Response) {
    try {
      const data = contentService.getTopics();
      return res.json({
        success: true,
        data
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to fetch topic intelligence' }
      });
    }
  }

  public static async gaps(req: Request, res: Response) {
    try {
      const data = contentService.getGaps();
      return res.json({
        success: true,
        data
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to fetch content gap analysis' }
      });
    }
  }

  public static async brandVoice(req: Request, res: Response) {
    try {
      const data = contentService.getBrandVoice();
      return res.json({
        success: true,
        data
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to fetch brand voice analysis' }
      });
    }
  }

  public static async getSettings(req: Request, res: Response) {
    try {
      const hindsightConfig = hindsightService.getConfig();
      const aiConfig = strategyEngine.getConfig();

      return res.json({
        success: true,
        data: {
          hindsight: hindsightConfig,
          ai: aiConfig,
          demoMode: process.env.DEMO_MODE === 'true'
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to get settings' }
      });
    }
  }

  public static async updateSettings(req: Request, res: Response) {
    try {
      const { hindsightBaseUrl, hindsightApiKey, hindsightBankId, groqApiKey, groqModel } = req.body;

      if (hindsightBaseUrl || hindsightApiKey !== undefined || hindsightBankId) {
        hindsightService.updateConfig({
          baseUrl: hindsightBaseUrl,
          apiKey: hindsightApiKey,
          bankId: hindsightBankId
        });
      }

      if (groqApiKey !== undefined || groqModel) {
        strategyEngine.updateConfig({
          groqApiKey,
          groqModel
        });
      }

      return res.json({
        success: true,
        data: {
          message: 'Settings updated successfully',
          hindsight: hindsightService.getConfig(),
          ai: strategyEngine.getConfig()
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to update settings' }
      });
    }
  }

  public static async resetWorkspace(_req: Request, res: Response) {
    try {
      db.exec(`
        DELETE FROM contents;
        DELETE FROM topics;
        DELETE FROM content_metrics;
        DELETE FROM campaigns;
        DELETE FROM memory_records;
        DELETE FROM memory_events;
        DELETE FROM insights;
      `);

      return res.json({
        success: true,
        data: {
          message: 'Workspace completely reset to empty state. All content and memories removed.'
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to reset workspace' }
      });
    }
  }
}
