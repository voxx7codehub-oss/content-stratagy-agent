import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ContentItem } from '../../types/index.ts';
import { Search, Plus, UploadCloud, ChevronRight, FileText } from 'lucide-react';
import { ContentDetailDrawer } from './ContentDetailDrawer.tsx';

export const ContentLibraryView: React.FC = () => {
  const { setSelectedContentId, setIsAddModalOpen, setCurrentView, refreshKey } = useApp();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('all');
  const [topic, setTopic] = useState('all');
  const [contentType, setContentType] = useState('all');
  const [sort, setSort] = useState('published_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const res = await api.listContent({
        search,
        platform,
        topic,
        content_type: contentType,
        sort,
        order,
        limit: 100
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContent();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, platform, topic, contentType, sort, order, refreshKey]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Content Library
          </h2>
          <p className="text-xs text-neutral-500">
            {total} real published item(s) stored and retained in your Hindsight bank
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('import_content')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Content</span>
          </button>
        </div>
      </div>

      {total === 0 && !search && platform === 'all' && topic === 'all' && contentType === 'all' ? (
        /* Empty State */
        <div className="p-16 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-4 max-w-md mx-auto">
          <FileText className="h-10 w-10 text-neutral-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              No content yet
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Add your first piece of content or import your archives to begin building organizational memory.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
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
        <>
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search real content..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="all">All Platforms</option>
                <option value="linkedin">LinkedIn</option>
                <option value="blog">Blog</option>
                <option value="x">X (Twitter)</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="all">All Formats</option>
                <option value="educational">Educational</option>
                <option value="case_study">Case Study</option>
                <option value="tutorial">Tutorial</option>
                <option value="thought_leadership">Thought Leadership</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={`${sort}:${order}`}
                onChange={e => {
                  const [s, o] = e.target.value.split(':');
                  setSort(s);
                  setOrder(o as any);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="published_at:desc">Newest First</option>
                <option value="published_at:asc">Oldest First</option>
                <option value="reach:desc">Highest Reach</option>
                <option value="engagement_rate:desc">Highest Engagement</option>
              </select>
            </div>
          </div>

          {/* List items */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400">Loading library assets...</div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                No content items found matching current filters.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedContentId(item.id)}
                    className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="capitalize font-semibold text-neutral-800 dark:text-neutral-200">
                          {item.platform}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{item.content_type.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>{item.topic}</span>
                        <span>·</span>
                        <span className="font-mono text-neutral-400">
                          {new Date(item.published_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-500 transition-colors truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs text-neutral-500 line-clamp-1 max-w-3xl">
                        {item.body}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-neutral-400">Reach</div>
                        <div className="font-mono text-xs text-neutral-700 dark:text-neutral-300 tabular-nums">
                          {item.reach > 0 ? item.reach.toLocaleString() : '—'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-neutral-400">Engagement</div>
                        <div className="font-mono text-xs font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                          {item.engagement_rate !== null ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{item.engagement_rate}%</span>
                          ) : (
                            <span className="text-neutral-400 italic font-normal text-[11px]">Engagement rate unavailable</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ContentDetailDrawer />
    </div>
  );
};
