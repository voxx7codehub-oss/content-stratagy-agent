import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Search, Sun, Moon, Bell, Database } from 'lucide-react';
import { api } from '../../services/api.ts';
import { StatusIndicator } from '../common/StatusIndicator.tsx';

export const Topbar: React.FC = () => {
  const { currentView, theme, toggleTheme, setIsSearchOpen, refreshKey } = useApp();
  const [memoryInfo, setMemoryInfo] = useState<{ connected: boolean; bankId: string; total: number }>({
    connected: false,
    bankId: 'content-strategy',
    total: 0
  });

  useEffect(() => {
    api.getMemoryStatus().then(st => {
      setMemoryInfo({
        connected: st.connected,
        bankId: st.bankId,
        total: st.totalMemories
      });
    }).catch(() => {});
  }, [refreshKey]);

  const viewTitles: Record<string, string> = {
    dashboard: 'Executive Dashboard',
    content_library: 'Content Library',
    import_content: 'Import Content Archive',
    performance: 'Performance Analytics',
    strategist: 'AI Content Strategist',
    content_gaps: 'Content Gap Analysis',
    topic_intelligence: 'Topic Intelligence & Graph',
    brand_voice: 'Brand Voice Architecture',
    memory_overview: 'Hindsight Memory Overview',
    retrieved_memories: 'Memory Recall & Exploration',
    memory_activity: 'Memory Activity Timeline',
    settings: 'Settings & Integrations'
  };

  return (
    <header className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Zone 1: Section Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          {viewTitles[currentView] || 'Content Intelligence'}
        </h1>
        <span className="hidden sm:inline text-xs text-neutral-400">/</span>
        <span className="hidden sm:inline text-xs font-mono text-neutral-500 dark:text-neutral-400">
          bank: {memoryInfo.bankId}
        </span>
      </div>

      {/* Zone 2: Search Trigger */}
      <div className="flex items-center">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors w-44 md:w-64"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="truncate">Search content & memory...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono border border-neutral-300 dark:border-neutral-700 px-1 rounded text-neutral-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Status Indicator, Theme Toggle, Actions */}
      <div className="flex items-center gap-3">
        <StatusIndicator
          connected={memoryInfo.connected}
          bankId={memoryInfo.bankId}
          totalMemories={memoryInfo.total}
        />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <div className="h-7 w-7 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center font-bold text-xs ring-1 ring-neutral-700">
            ST
          </div>
        </div>
      </div>
    </header>
  );
};
