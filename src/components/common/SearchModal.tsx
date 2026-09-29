import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Search, X, FileText, ArrowRight, BrainCircuit } from 'lucide-react';
import { api } from '../../services/api.ts';
import { ContentItem, MemoryRecallItem } from '../../types/index.ts';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setSelectedContentId, setCurrentView } = useApp();
  const [query, setQuery] = useState('');
  const [contentResults, setContentResults] = useState<ContentItem[]>([]);
  const [memoryResults, setMemoryResults] = useState<MemoryRecallItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
      setContentResults([]);
      setMemoryResults([]);
      return;
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setContentResults([]);
      setMemoryResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [contentRes, memRes] = await Promise.all([
          api.listContent({ search: query, limit: 5 }),
          api.recallMemory(query, 4)
        ]);
        setContentResults(contentRes.items);
        setMemoryResults(memRes.memories);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles, topics, or ask a memory question..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isSearching && (
            <div className="py-8 text-center text-xs text-neutral-500">
              Querying database and memory bank...
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && contentResults.length === 0 && memoryResults.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching content records or memories found.
            </div>
          )}

          {/* Content records */}
          {contentResults.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 px-1">
                Content Records
              </div>
              <div className="space-y-1">
                {contentResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedContentId(item.id);
                      setIsSearchOpen(false);
                      setCurrentView('content_library');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                          <span className="capitalize">{item.platform}</span>
                          <span>·</span>
                          <span>{item.topic}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">{item.engagement_rate}% eng</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Memory records */}
          {memoryResults.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 px-1">
                Recalled Hindsight Memories
              </div>
              <div className="space-y-2">
                {memoryResults.map(mem => (
                  <div
                    key={mem.id}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1.5">
                        <BrainCircuit className="h-3 w-3 text-emerald-500" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {mem.sourceTitle || 'Retained Memory'}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums">
                        {Math.round(mem.relevance * 100)}% match
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {mem.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim().length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400 space-y-2">
              <p>Type keywords to search content titles or ask strategic queries.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['AI Tutorials', 'Customer Case Studies', 'Promotional Fatigue', 'Workflow Automation'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
