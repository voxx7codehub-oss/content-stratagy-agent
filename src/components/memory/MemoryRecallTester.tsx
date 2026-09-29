import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { MemoryRecallItem } from '../../types/index.ts';
import { Search, BrainCircuit, Loader2, ArrowRight, PlusCircle, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const MemoryRecallTester: React.FC = () => {
  const { setSelectedContentId, setCurrentView, setIsAddModalOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryRecallItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  const handleRecall = async (qText?: string) => {
    const q = qText !== undefined ? qText : query;
    if (!q.trim()) return;

    setIsLoading(true);
    setHasQueried(true);
    try {
      const res = await api.recallMemory(q, 8);
      setResults(res.memories);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Memory Recall & Exploration
        </h2>
        <p className="text-xs text-neutral-500">
          Execute TEMPR multi-strategy recall against real memories retained in your Hindsight bank
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Search Query
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleRecall()}
            placeholder="Type keywords, topics, or questions..."
            className="flex-1 px-4 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleRecall()}
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Recall Memories</span>
          </button>
        </div>
      </div>

      {/* Results Container */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto" />
          <p>Querying Hindsight memory graph...</p>
        </div>
      ) : hasQueried && results.length === 0 ? (
        <div className="p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-3 max-w-md mx-auto">
          <BrainCircuit className="h-8 w-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No memories match this query
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Ensure you have added real content containing these terms, or try broader keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {hasQueried && (
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span>Recalled {results.length} historical memories</span>
              <span className="font-mono text-[11px]">Ranked by relevance score</span>
            </div>
          )}

          {results.map((mem, index) => (
            <div
              key={mem.id || index}
              className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2.5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-2 font-medium">
                  <BrainCircuit className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                    {mem.sourceTitle || 'Retained Memory'}
                  </span>
                  {mem.platform && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{mem.platform}</span>
                    </>
                  )}
                  {mem.topic && (
                    <>
                      <span>·</span>
                      <span>{mem.topic}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-emerald-500 font-bold tabular-nums">
                    {Math.round(mem.relevance * 100)}% match
                  </span>
                  <span className="text-neutral-400 uppercase text-[10px]">
                    {mem.source === 'hindsight_cloud' ? 'Hindsight Cloud' : 'Database Record'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
                {mem.content}
              </p>

              {mem.sourceId && (
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedContentId(mem.sourceId!);
                      setCurrentView('content_library');
                    }}
                    className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>View original content item</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
