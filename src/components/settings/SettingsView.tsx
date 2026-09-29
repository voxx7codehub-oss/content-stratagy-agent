import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { useApp } from '../../context/AppContext.tsx';
import { Save, BrainCircuit, Cpu, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Trash2, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast, triggerRefresh } = useApp();
  const [hindsightBaseUrl, setHindsightBaseUrl] = useState('https://api.hindsight.vectorize.io');
  const [hindsightApiKey, setHindsightApiKey] = useState('');
  const [hindsightBankId, setHindsightBankId] = useState('content-strategy');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState('openai/gpt-oss-120b');
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.hindsight) {
        setHindsightBaseUrl(res.hindsight.baseUrl || 'https://api.hindsight.vectorize.io');
        setHindsightBankId(res.hindsight.bankId || 'content-strategy');
      }
      if (res.ai) {
        setGroqModel(res.ai.groqModel || 'openai/gpt-oss-120b');
      }
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings({
        hindsightBaseUrl,
        hindsightApiKey: hindsightApiKey || undefined,
        hindsightBankId,
        groqApiKey: groqApiKey || undefined,
        groqModel
      });
      showToast('Configuration settings updated successfully', 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const testHindsightConnection = async () => {
    try {
      const res = await api.getHealth();
      setTestResult(res.hindsight);
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message || 'Ping failed' });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings & Agent Configuration
        </h2>
        <p className="text-xs text-neutral-500">
          Configure Hindsight persistent memory service, AI reasoning providers, and environment models
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Hindsight Configuration */}
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Hindsight Memory API
              </h3>
            </div>
            <button
              type="button"
              onClick={testHindsightConnection}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Ping Hindsight</span>
            </button>
          </div>

          <p className="text-xs text-neutral-500">
            Official documentation at <a href="https://hindsight.vectorize.io/" target="_blank" rel="noreferrer" className="text-emerald-500 underline">hindsight.vectorize.io</a>. Uses Vectorize agent memory for Retain, Recall, and Reflect.
          </p>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                testResult.ok
                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-950/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {testResult.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Base URL
              </label>
              <input
                type="text"
                value={hindsightBaseUrl}
                onChange={e => setHindsightBaseUrl(e.target.value)}
                placeholder="https://api.hindsight.vectorize.io"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Memory Bank ID
              </label>
              <input
                type="text"
                value={hindsightBankId}
                onChange={e => setHindsightBankId(e.target.value)}
                placeholder="content-strategy"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Hindsight API Key (Optional in local demo mode)
              </label>
              <input
                type="password"
                value={hindsightApiKey}
                onChange={e => setHindsightApiKey(e.target.value)}
                placeholder="Leave blank to use local durable SQLite bank, or paste Hindsight Cloud API Key"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                When blank, the system maintains complete durability in your local SQLite memory bank with TEMPR search.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: AI Reasoning Engines */}
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              AI Reasoning Engine (Groq & Gemini)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Groq Model
              </label>
              <select
                value={groqModel}
                onChange={e => setGroqModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
              >
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
                <option value="qwen/qwen3-32b">qwen/qwen3-32b</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Groq API Key
              </label>
              <input
                type="password"
                value={groqApiKey}
                onChange={e => setGroqApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Google Gemini Server-Side Fallback: Injected & Ready</span>
            </div>
            <span className="font-mono text-emerald-500 font-semibold">Active</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-white transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Section 3: Data Management & Empty State Guarantee */}
      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-neutral-400" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Workspace Data Management
          </h3>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Content Intelligence operates strictly on real user data with zero fabricated numbers. If you wish to wipe all saved content records, memory banks, topics, and metrics back to a clean empty state, use the reset option below.
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Reset Workspace to Zero Data
            </div>
            <div className="text-[11px] text-neutral-400">
              Permanently clears all content assets, performance stats, and memory logs.
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('Are you sure you want to reset the workspace? All content and memories will be permanently wiped.')) return;
              try {
                await api.resetWorkspace();
                showToast('Workspace reset to empty state', 'success');
                triggerRefresh();
              } catch (err: any) {
                showToast(err?.message || 'Failed to reset workspace', 'error');
              }
            }}
            className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
