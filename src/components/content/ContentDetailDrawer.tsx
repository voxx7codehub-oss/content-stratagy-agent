import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ContentItem } from '../../types/index.ts';
import { X, Trash2, BrainCircuit, ExternalLink, Calendar, Layers, Activity } from 'lucide-react';

export const ContentDetailDrawer: React.FC = () => {
  const { selectedContentId, setSelectedContentId, triggerRefresh, showToast } = useApp();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [memory, setMemory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedContentId) {
      setContent(null);
      setMemory(null);
      return;
    }

    setIsLoading(true);
    api.getContentById(selectedContentId)
      .then(res => {
        setContent(res.item);
        setMemory(res.memory);
      })
      .catch(err => {
        showToast(err?.message || 'Failed to load content details', 'error');
        setSelectedContentId(null);
      })
      .finally(() => setIsLoading(false));
  }, [selectedContentId]);

  if (!selectedContentId) return null;

  const handleDelete = async () => {
    if (!window.confirm('Delete this content asset and its linked Hindsight memory?')) return;
    try {
      await api.deleteContent(selectedContentId);
      showToast('Content and linked memory deleted', 'success');
      setSelectedContentId(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete content', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>ID:</span>
            <span className="text-neutral-700 dark:text-neutral-300">{selectedContentId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              aria-label="Delete content"
              className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedContentId(null)}
              aria-label="Close"
              className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading || !content ? (
            <div className="py-16 text-center text-xs text-neutral-400">Loading details...</div>
          ) : (
            <>
              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="capitalize font-semibold text-neutral-900 dark:text-neutral-100">{content.platform}</span>
                  <span>·</span>
                  <span className="capitalize">{content.content_type.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>{content.tone}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                  {content.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Published {new Date(content.published_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Performance Stats Grid */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span>Performance Signals</span>
                  {content.engagement_rate !== null ? (
                    <span className="text-emerald-500 font-mono font-bold">{content.engagement_rate}% Engagement</span>
                  ) : (
                    <span className="text-neutral-400 font-mono italic text-[11px]">Engagement rate unavailable</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Reach</div>
                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{content.reach.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Likes</div>
                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{content.likes.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Comments</div>
                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{content.comments.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Shares</div>
                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{content.shares.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Clicks</div>
                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{content.clicks.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-[10px] text-neutral-400">Impressions</div>
                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white tabular-nums">{content.impressions.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Content Copy & Thesis
                </div>
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {content.body}
                </div>
              </div>

              {/* Linked Hindsight Memory */}
              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  <BrainCircuit className="h-4 w-4 text-emerald-500" />
                  <span>Retained Organizational Memory</span>
                </div>
                {memory ? (
                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900/90 text-neutral-200 text-xs space-y-2">
                    <p className="leading-relaxed font-sans">{memory.content}</p>
                    <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between pt-1 border-t border-neutral-800">
                      <span>Bank: {memory.bank_id}</span>
                      <span>ID: {memory.id}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic">
                    Not currently retained in Hindsight memory.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
