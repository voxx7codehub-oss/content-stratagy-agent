import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: err.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: { message: err?.message || 'Invalid input data' }
      });
    }
  };
}

export const createContentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(10, 'Content body must be at least 10 characters'),
  platform: z.enum(['linkedin', 'x', 'youtube', 'blog', 'instagram', 'newsletter']),
  content_type: z.enum(['educational', 'case_study', 'tutorial', 'thought_leadership', 'promotional', 'industry_news']),
  topic: z.string().min(2, 'Topic is required'),
  tone: z.enum(['professional', 'educational', 'technical', 'concise', 'conversational', 'promotional']),
  published_at: z.string().optional(),
  reach: z.number().int().nonnegative().optional().default(0),
  impressions: z.number().int().nonnegative().optional().default(0),
  likes: z.number().int().nonnegative().optional().default(0),
  comments: z.number().int().nonnegative().optional().default(0),
  shares: z.number().int().nonnegative().optional().default(0),
  clicks: z.number().int().nonnegative().optional().default(0),
  status: z.enum(['published', 'draft', 'scheduled']).optional().default('published')
});

export const recallQuerySchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  topK: z.number().int().min(1).max(20).optional().default(6),
  bankId: z.string().optional()
});

export const strategyQuerySchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  bankId: z.string().optional()
});

export const retainDirectSchema = z.object({
  content: z.string().min(5, 'Content to retain is required'),
  bankId: z.string().optional(),
  topic: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const settingsSchema = z.object({
  hindsightBaseUrl: z.string().url().optional(),
  hindsightApiKey: z.string().optional(),
  hindsightBankId: z.string().optional(),
  groqApiKey: z.string().optional(),
  groqModel: z.string().optional()
});
