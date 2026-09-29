import { Router } from 'express';
import { ContentController } from '../controllers/contentController.ts';
import { StrategyController } from '../controllers/strategyController.ts';
import { MemoryController } from '../controllers/memoryController.ts';
import { AnalyticsController } from '../controllers/analyticsController.ts';
import {
  validateBody,
  createContentSchema,
  recallQuerySchema,
  strategyQuerySchema,
  retainDirectSchema,
  settingsSchema
} from '../middleware/validate.ts';
import { hindsightService } from '../services/hindsight.ts';
import { checkSystemStatus } from '../services/systemStatus.ts';
import { contentService } from '../services/content.ts';

const router = Router();

// Health check
router.get('/health', async (_req, res) => {
  const hindsightHealth = await hindsightService.checkHealth();
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hindsight: hindsightHealth,
    environment: {
      demoMode: process.env.DEMO_MODE === 'true'
    }
  });
});

// Dashboard
router.get('/dashboard', AnalyticsController.dashboard);

// Content Management
router.get('/content', ContentController.list);
router.get('/content/:id', ContentController.getById);
router.post('/content', validateBody(createContentSchema), ContentController.create);
router.post('/content/import', ContentController.importBatch);
router.put('/content/:id', ContentController.update);
router.delete('/content/:id', ContentController.delete);

// Analytics & Insights
router.get('/analytics', AnalyticsController.analytics);
router.get('/topics', AnalyticsController.topics);
router.get('/gaps', AnalyticsController.gaps);
router.get('/gaps/analysis', (_req, res) => {
  try {
    return res.json({ success: true, data: contentService.getContentGapAnalysis() });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err?.message || 'Failed to compute content gap analysis' }
    });
  }
});
router.get('/brand-voice', AnalyticsController.brandVoice);

// System status (real database / Hindsight / Groq checks)
router.get('/status', async (_req, res) => {
  try {
    const status = await checkSystemStatus();
    return res.json({ success: true, data: status });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { message: err?.message || 'Failed to check system status' }
    });
  }
});

// AI Strategy Engine
router.post('/strategy', validateBody(strategyQuerySchema), StrategyController.generate);

// Hindsight Memory Operations
router.post('/memory/retain', validateBody(retainDirectSchema), MemoryController.retain);
router.post('/memory/recall', validateBody(recallQuerySchema), MemoryController.recall);
router.post('/memory/reflect', MemoryController.reflect);
router.get('/memory/status', MemoryController.status);
router.get('/memory/activity', MemoryController.activity);

// Settings & Workspace
router.get('/settings', AnalyticsController.getSettings);
router.post('/settings', validateBody(settingsSchema), AnalyticsController.updateSettings);
router.post('/workspace/reset', AnalyticsController.resetWorkspace);

export default router;
