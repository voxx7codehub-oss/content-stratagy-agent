import { Request, Response } from 'express';
import { hindsightService } from '../services/hindsight.ts';
import { db } from '../database/db.ts';

export class MemoryController {
  public static async retain(req: Request, res: Response) {
    try {
      const { content, bankId, topic, metadata } = req.body;
      const result = await hindsightService.retainMemory(content, {
        bankId,
        topic,
        metadata
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to retain memory' }
      });
    }
  }

  public static async recall(req: Request, res: Response) {
    try {
      const { query, topK, bankId, types } = req.body;
      const results = await hindsightService.recallMemory(query, {
        topK: Number(topK) || 6,
        bankId,
        types
      });

      return res.json({
        success: true,
        data: {
          query,
          count: results.length,
          memories: results
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to recall memories' }
      });
    }
  }

  public static async reflect(req: Request, res: Response) {
    try {
      const { question, bankId, disposition } = req.body;
      const result = await hindsightService.reflectMemory(question, {
        bankId,
        disposition
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to reflect over memories' }
      });
    }
  }

  public static async status(req: Request, res: Response) {
    try {
      const status = await hindsightService.getStatus();
      return res.json({
        success: true,
        data: status
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to query memory status' }
      });
    }
  }

  public static async activity(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit) || 30;
      const activity = hindsightService.getActivity(limit);
      return res.json({
        success: true,
        data: activity
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { message: err?.message || 'Failed to retrieve memory activity' }
      });
    }
  }
}
