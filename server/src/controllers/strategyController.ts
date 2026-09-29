import { Request, Response } from 'express';
import { hindsightService } from '../services/hindsight.ts';
import { strategyEngine } from '../services/groq.ts';

export class StrategyController {
  public static async generate(req: Request, res: Response) {
    try {
      const { question, bankId } = req.body;

      if (!question || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'A question or strategic prompt is required' }
        });
      }

      // Step 1: Recall relevant memories from Hindsight
      const recalledMemories = await hindsightService.recallMemory(question, {
        topK: 8,
        bankId
      });

      // Step 2: Call Hindsight REFLECT to reason across recalled memories
      const reflection = await hindsightService.reflectMemory(question, {
        bankId
      });

      // Step 3: Run strategic synthesis through Groq / LLM
      const strategyReport = await strategyEngine.generateStrategy(
        question,
        recalledMemories,
        reflection
      );

      // Step 4: Record activity
      hindsightService.recordActivity(
        'STRATEGY_GENERATED',
        `Generated strategy report for: "${question.slice(0, 50)}"`,
        {
          question,
          memoriesConsulted: recalledMemories.length,
          model: strategyReport.meta.modelUsed,
          hasSufficientData: strategyReport.hasSufficientData,
          suggestedActionsCount: strategyReport.suggestedActions.length
        }
      );

      return res.json({
        success: true,
        data: {
          ...strategyReport,
          question,
          reflection: {
            thought: reflection.thought,
            answer: reflection.answer,
            source: reflection.source
          }
        }
      });
    } catch (err: any) {
      console.error('[Strategy Error]', err);
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to generate content strategy report' }
      });
    }
  }
}
