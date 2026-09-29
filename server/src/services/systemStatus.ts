/**
 * System Status Service
 * ---------------------
 * Performs REAL connectivity checks for the database, Hindsight and Groq.
 * A dependency is only ever reported as "connected" when the check
 * actually succeeds. No status value is ever faked.
 */

import { db } from '../database/db.ts';
import { hindsightService } from './hindsight.ts';
import { strategyEngine } from './groq.ts';

export type ServiceState = 'connected' | 'unavailable' | 'not_configured';

export interface SystemStatus {
  database: ServiceState;
  hindsight: ServiceState;
  groq: ServiceState;
  details: {
    database: string;
    hindsight: string;
    groq: string;
  };
  checkedAt: string;
}

export async function checkSystemStatus(): Promise<SystemStatus> {
  // --- Database: execute a real read query ---
  let database: ServiceState = 'unavailable';
  let databaseDetail = 'Database query failed';
  try {
    const row = db.get<{ count: number }>('SELECT COUNT(*) as count FROM contents');
    database = 'connected';
    databaseDetail = `SQLite reachable — ${row?.count ?? 0} content record(s) stored`;
  } catch (err: any) {
    databaseDetail = err?.message || 'Database query failed';
  }

  // --- Hindsight: real health probe already implemented in the service ---
  const hindsightHealth = await hindsightService.checkHealth();
  const hindsightConfig = hindsightService.getConfig();
  const hindsight: ServiceState = hindsightConfig.hasApiKey
    ? (hindsightHealth.ok ? 'connected' : 'unavailable')
    : 'not_configured';

  // --- Groq: delegate to the real health check in the strategy engine ---
  const groqHealth = await strategyEngine.checkHealth();
  const groq: ServiceState = groqHealth.state;

  return {
    database,
    hindsight,
    groq,
    details: {
      database: databaseDetail,
      hindsight: hindsightHealth.message,
      groq: groqHealth.message
    },
    checkedAt: new Date().toISOString()
  };
}
