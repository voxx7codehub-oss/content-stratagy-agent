import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createApp } from './server/src/app.ts';
import { createServer as createViteServer } from 'vite';

async function start() {
  const app = createApp();

  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProd) {
    // Mount Vite dev middleware so single server on port 3000 handles both API and React SPA
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Content Intelligence] Server operational on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Fatal Startup Error]', err);
  process.exit(1);
});
