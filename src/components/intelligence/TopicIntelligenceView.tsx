import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { TopicItem } from '../../types/index.ts';
import { Network, PlusCircle, UploadCloud, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const TopicIntelligenceView: React.FC = () => {
  const { setCurrentView, setIsAddModalOpen } = useApp();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getTopics().then(res => {
      setTopics(res.topics);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-neutral-400">Loading topic intelligence...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Topic Intelligence
        </h2>
        <p className="text-xs text-neutral-500">
          Topics discovered and aggregated strictly from your organization's actual published content
        </p>
      </div>

      {/* Empty State */}
      {topics.length === 0 ? (
        <div className="p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-4 max-w-lg mx-auto">
          <Network className="h-8 w-8 text-neutral-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              No topics discovered yet
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Topics are extracted directly from your published content. Add or import content to build your topic intelligence graph.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Content</span>
            </button>
            <button
              onClick={() => setCurrentView('import_content')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Import Content</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map(t => (
            <div
              key={t.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{t.name}</h3>
                <span className="font-mono text-xs font-bold text-emerald-500 tabular-nums">
                  {t.average_engagement !== null ? `${t.average_engagement}% avg eng` : 'Engagement N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="text-[11px] text-neutral-400 block">Content Items</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">{t.content_count}</span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block">Total Reach</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                    {t.total_reach ? t.total_reach.toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              {t.platforms && t.platforms.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1">
                  <span>Platforms:</span>
                  <span className="capitalize text-neutral-700 dark:text-neutral-300">
                    {t.platforms.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
