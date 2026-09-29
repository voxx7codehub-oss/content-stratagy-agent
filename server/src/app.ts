import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.ts';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API router
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[API Unhandled Error]', err);
    res.status(err.status || 500).json({
      success: false,
      error: {
        message: err.message || 'Internal server error occurred'
      }
    });
  });

  return app;
}
