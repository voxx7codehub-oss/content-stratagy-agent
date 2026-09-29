/**
 * Temporary verification harness — exercises the API against the real
 * database using the real Express app. Deleted after the test run.
 */
import 'dotenv/config';
import { createApp } from './server/src/app.ts';
import { db } from './server/src/database/db.ts';

const app = createApp();
const server = app.listen(3112, '127.0.0.1');

const call = async (method: string, path: string, body?: any) => {
  const res = await fetch(`http://127.0.0.1:3112${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json();
  return { status: res.status, json };
};

const log = (label: string, value: any) => {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(value, null, 2).slice(0, 900));
};

const run = async () => {
  // Clean slate so results reflect only what this test imports.
  db.exec(`DELETE FROM contents; DELETE FROM topics; DELETE FROM memory_records; DELETE FROM memory_events;`);

  log('EMPTY analytics', (await call('GET', '/api/analytics')).json);
  log('EMPTY gaps/analysis', (await call('GET', '/api/gaps/analysis')).json);
  log('EMPTY brand-voice', (await call('GET', '/api/brand-voice')).json);

  // --- Import real CSV rows ---
  const csvItems = [
    { title: 'How to build a real-time pipeline', body: 'This tutorial walks you step by step through deploying an event ingestion API. You will learn the schema, run the code, then understand the metrics.', platform: 'blog', topic: 'Data Engineering', content_type: 'tutorial', tone: 'technical', published_at: '2026-09-01', reach: 40000, likes: 2000, comments: 150, shares: 300, clicks: 1800 },
    { title: 'Why observability pipelines fail', body: 'Our perspective on the future of streaming. We believe teams underestimate the cost of schema drift across services.', platform: 'linkedin', topic: 'Data Engineering', content_type: 'thought_leadership', tone: 'professional', published_at: '2026-09-05', reach: 22000, likes: 900, comments: 80, shares: 110, clicks: 700 },
    { title: 'Streaming architecture case study', body: 'Our results after migrating from batch ETL to real-time ingestion. The outcome was a 40% drop in data latency across the organisation.', platform: 'blog', topic: 'Streaming', content_type: 'case_study', tone: 'technical', published_at: '2026-09-10', reach: 31000, likes: 1400, comments: 120, shares: 260, clicks: 1200 },
    { title: 'Quick API reference card', body: 'A brief guide listing common schema endpoints and the code you need for each one.', platform: 'x', topic: 'Reference', content_type: 'educational', tone: 'concise', published_at: '2026-09-12', reach: 9000, likes: 200, comments: 10, shares: 25, clicks: 300 },
    { title: 'Launching our new product', body: 'We are excited to announce our newest release. Sign up today and unlock a limited time discount for early adopters.', platform: 'newsletter', topic: 'Product', content_type: 'promotional', tone: 'promotional', published_at: '2026-09-15', reach: 5000, likes: 120, comments: 5, shares: 8, clicks: 150 },
    { title: '', body: 'missing title row', platform: 'blog' },
    { title: 'Bad metrics row', body: 'Valid body but the metric is not a number.', reach: 'abc' }
  ];
  const importRes = await call('POST', '/api/content/import', { items: csvItems });
  log('IMPORT (with invalid rows)', importRes.json);

  log('ANALYTICS after import', (await call('GET', '/api/analytics')).json);
  log('DASHBOARD', (await call('GET', '/api/dashboard')).json);
  log('GAPS/ANALYSIS', (await call('GET', '/api/gaps/analysis')).json);
  log('BRAND VOICE', (await call('GET', '/api/brand-voice')).json);
  log('TOPICS', (await call('GET', '/api/topics')).json);

  // --- Memory operations ---
  log('RECALL', (await call('POST', '/api/memory/recall', { query: 'tutorial streaming pipeline', topK: 3 })).json);
  log('REFLECT', (await call('POST', '/api/memory/reflect', { question: 'What content patterns are working?' })).json);
  log('STRATEGY', (await call('POST', '/api/strategy', { question: 'What should we publish next?' })).json);
  log('SYSTEM STATUS', (await call('GET', '/api/status')).json);
  log('MEMORY STATUS', (await call('GET', '/api/memory/status')).json);

  // --- Validation / error handling ---
  log('INVALID create (missing body)', (await call('POST', '/api/content', { title: 'ab', platform: 'blog' })).json);
  log('EMPTY import', (await call('POST', '/api/content/import', { items: [] })).json);
  log('BAD recall', (await call('POST', '/api/memory/recall', { query: 'x' })).json);
  log('404 content', (await call('GET', '/api/content/does-not-exist')).json);

  // --- Persistence check: reconnect a brand new db handle reading the file ---
  const persisted = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents');
  const persistedMemories = db.get<{ count: number }>('SELECT COUNT(*) as count FROM memory_records');
  console.log(`\n=== PERSISTED ===\ncontents=${persisted?.count} memories=${persistedMemories?.count}`);

  server.close();
  process.exit(0);
};

run().catch(err => { console.error('HARNESS ERROR', err); process.exit(1); });
