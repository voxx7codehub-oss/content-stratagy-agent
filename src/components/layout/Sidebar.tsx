import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ActiveView } from '../../types/index.ts';
import {
  LayoutDashboard,
  Library,
  PlusCircle,
  UploadCloud,
  BarChart3,
  Sparkles,
  SearchCode,
  Network,
  Mic,
  BrainCircuit,
  History,
  Activity,
  Settings,
  Compass
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, setIsAddModalOpen } = useApp();

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Content',
      items: [
        { id: 'content_library', label: 'Content Library', icon: Library },
        { id: 'import_content', label: 'Import Content', icon: UploadCloud },
        { id: 'performance', label: 'Performance Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'strategist', label: 'AI Strategist', icon: Sparkles, badge: 'Agent' },
        { id: 'content_gaps', label: 'Content Gaps', icon: SearchCode },
        { id: 'topic_intelligence', label: 'Topic Intelligence', icon: Network },
        { id: 'brand_voice', label: 'Brand Voice', icon: Mic }
      ]
    },
    {
      title: 'Memory Bank',
      items: [
        { id: 'memory_overview', label: 'Hindsight Memory', icon: BrainCircuit },
        { id: 'retrieved_memories', label: 'Recall & Search', icon: History },
        { id: 'memory_activity', label: 'Memory Activity', icon: Activity }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings & Integrations', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="h-9 w-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-950 font-extrabold text-sm tracking-tight transition-transform group-hover:scale-105">
            CI
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
              CONTENT INTEL
            </div>
            <div className="text-[11px] text-neutral-500 font-medium">
              Hindsight Persistent Memory
            </div>
          </div>
        </button>
      </div>

      {/* Quick Add Action */}
      <div className="p-3 space-y-2">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 transition-colors shadow-sm cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Content</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 text-sm">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation Switcher */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
        <button
          onClick={() => setCurrentView('landing')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer"
        >
          <Compass className="h-4 w-4 text-neutral-400" />
          <span>Product Overview</span>
        </button>
      </div>
    </aside>
  );
};
