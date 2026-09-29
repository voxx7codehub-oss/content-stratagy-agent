import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { HindsightStatus } from '../../types/index.ts';
import { BrainCircuit, RefreshCw, PlusCircle, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const MemoryOverviewView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [status, setStatus] = useState<HindsightStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.getMemoryStatus();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (!status) {
    return <div className="p-8 text-center text-xs text-neutral-400">Loading memory status...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Hindsight Memory Architecture
          </h2>
          <p className="text-xs text-neutral-500">
            Persistent organizational memory bank for AI agent reasoning
          </p>
        </div>

        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>Test Connection</span>
        </button>
      </div>

      {/* Real Connection Status Banner per Section 10 */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
          MEMORY STATUS
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              status.connected ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'border-2 border-neutral-400'
            }`}
          />
          <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {status.connected ? 'Connected' : 'Not connected'}
          </span>
        </div>

        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {status.connected ? (
            <span>Hindsight Cloud API is verified and operational for bank <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{status.bankId}</strong>.</span>
          ) : (
            <span>Connect Hindsight to enable persistent organizational memory. You can configure your API credentials in Settings.</span>
          )}
        </div>

        {!status.connected && (
          <div className="pt-1">
            <button
              onClick={() => setCurrentView('settings')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 cursor-pointer"
            >
              Configure Hindsight Credentials
            </button>
          </div>
        )}
      </div>

      {/* Memory Bank Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Memory Bank</div>
          <div className="text-base font-mono font-bold text-neutral-900 dark:text-white">
            {status.bankId}
          </div>
          <div className="text-[11px] text-neutral-500">Dedicated organizational namespace</div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
          <div className="text-[10px] uppercase font-bold text-neutral-400">Stored Memories</div>
          <div className="text-2xl font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
            {status.totalMemories}
          </div>
          <div className="text-[11px] text-neutral-500">
            {status.totalMemories === 0 ? 'No memories retained yet' : 'Real memories stored in bank'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Memory Operations
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentView('retrieved_memories')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white cursor-pointer"
          >
            Test Recall & Search
          </button>
          <button
            onClick={() => setCurrentView('memory_activity')}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer"
          >
            View Event Activity
          </button>
        </div>
      </div>
    </div>
  );
};
