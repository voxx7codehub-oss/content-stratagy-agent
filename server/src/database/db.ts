import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_URL
  ? path.resolve(process.cwd(), process.env.DATABASE_URL)
  : path.join(DB_DIR, 'content_intelligence.db');

export interface ContentRecord {
  id: string;
  title: string;
  body: string;
  platform: string;
  content_type: string;
  topic: string;
  tone: string;
  published_at: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number | null; // null if reach unavailable
  campaign?: string;
  url?: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string;
}

export interface TopicRecord {
  id: string;
  name: string;
  description?: string;
  content_count: number;
  average_engagement: number | null;
}

export interface ContentMetricRecord {
  id: string;
  content_id: string;
  metric: string;
  value: number;
  recorded_at: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface MemoryRecord {
  id: string;
  bank_id: string;
  content: string;
  topic?: string;
  content_type?: string;
  platform?: string;
  engagement_rate?: number | null;
  source_id?: string;
  source_title?: string;
  timestamp: string;
  metadata_json?: string;
}

export interface MemoryEventRecord {
  id: string;
  type: string;
  description: string;
  bank_id: string;
  memory_id?: string;
  payload?: string;
  created_at: string;
}

export interface InsightRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  confidence: number;
  created_at: string;
}

class DatabaseManager {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(DB_PATH);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        platform TEXT NOT NULL,
        content_type TEXT NOT NULL,
        topic TEXT NOT NULL,
        tone TEXT NOT NULL,
        published_at TEXT NOT NULL,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        engagement_rate REAL,
        campaign TEXT,
        url TEXT,
        status TEXT DEFAULT 'published',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_contents_topic ON contents(topic);
      CREATE INDEX IF NOT EXISTS idx_contents_platform ON contents(platform);
      CREATE INDEX IF NOT EXISTS idx_contents_published ON contents(published_at);

      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        content_count INTEGER DEFAULT 0,
        average_engagement REAL
      );

      CREATE TABLE IF NOT EXISTS content_metrics (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        recorded_at TEXT NOT NULL,
        FOREIGN KEY(content_id) REFERENCES contents(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS memory_records (
        id TEXT PRIMARY KEY,
        bank_id TEXT NOT NULL,
        content TEXT NOT NULL,
        topic TEXT,
        content_type TEXT,
        platform TEXT,
        engagement_rate REAL,
        source_id TEXT,
        source_title TEXT,
        timestamp TEXT NOT NULL,
        metadata_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_memory_records_bank ON memory_records(bank_id);
      CREATE INDEX IF NOT EXISTS idx_memory_records_topic ON memory_records(topic);

      CREATE TABLE IF NOT EXISTS memory_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        bank_id TEXT NOT NULL,
        memory_id TEXT,
        payload TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_memory_events_created ON memory_events(created_at DESC);

      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        confidence REAL DEFAULT 0.85,
        created_at TEXT NOT NULL
      );
    `);
  }

  public getRawDb(): DatabaseSync {
    return this.db;
  }

  public all<T = any>(query: string, ...params: any[]): T[] {
    const stmt = this.db.prepare(query);
    return stmt.all(...params) as T[];
  }

  public get<T = any>(query: string, ...params: any[]): T | undefined {
    const stmt = this.db.prepare(query);
    return stmt.get(...params) as T | undefined;
  }

  public run(query: string, ...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint } {
    const stmt = this.db.prepare(query);
    return stmt.run(...params);
  }

  public exec(sql: string) {
    this.db.exec(sql);
  }
}

export const db = new DatabaseManager();
