import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { DashboardData } from '../../types/index.ts';
import { StatCard } from './StatCard.tsx';
import { ChartsSection } from './ChartsSection.tsx';
import {
  FileText,
  Layers,
  AlertCircle,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  UploadCloud,
  Database,
  RefreshCw,
  FolderOpen,
  TrendingUp
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { setSelectedContentId, setCurrentView, setIsAddModalOpen, refreshKey } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        api.getDashboard(),
        api.getAnalytics()
      ]);
      setData(dashRes);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6 max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 inline-block">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Failed to load dashboard
        </h3>
        <p className="text-xs text-neutral-500">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, topPerformers } = data;
  const hasContent = stats.totalContent > 0;

  // Empty first-run experience per requirements #2 & #4 & #34
  if (!hasContent) {
    return (
      <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-3 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Workspace Ready · Zero Data Populated</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome to Content Intelligence
          </h2>

          <p className="text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
            Your content intelligence will appear here once you add your first content. The system never generates fake metrics or fabricated history.
          </p>
        </div>

        {/* 3 Call-to-actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-left space-y-3 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Add Content
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Enter an article, post, or video with real metrics
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('import_content')}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-left space-y-3 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Import Content
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Batch import your CSV, JSON, or text archive
              </div>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-left space-y-3 group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Connect Data
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Configure Hindsight memory & AI inference keys
              </div>
            </div>
          </button>
        </div>

        {/* Empty Charts Notice */}
        <div className="p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-center space-y-2">
          <FolderOpen className="h-8 w-8 text-neutral-400 mx-auto" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            No performance data yet
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Charts, engagement averages, and gap analysis will generate automatically as real records are added.
          </p>
        </div>
      </div>
    );
  }

  // Populated Dashboard State with Real Data
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-semibold">
            EXECUTIVE INTELLIGENCE
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            CONTENT INTELLIGENCE
          </h2>
          <p className="text-xs text-neutral-500 max-w-xl">
            Calculated strictly from your {stats.totalContent} published content records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('import_content')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setCurrentView('strategist')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ask Strategist</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Content"
          value={stats.totalContent}
          sublabel="Real records stored"
          icon={FileText}
        />

        <StatCard
          label="Topics Discovered"
          value={stats.totalTopics}
          sublabel="Extracted from content"
          icon={Layers}
        />

        <StatCard
          label="Avg Engagement"
          value={stats.averageEngagementRate !== null ? `${stats.averageEngagementRate}%` : 'Unavailable'}
          sublabel={stats.averageEngagementRate !== null ? 'Across measured assets' : 'Reach metric required'}
          icon={TrendingUp}
        />

        <StatCard
          label="Identified Gaps"
          value={stats.totalGaps > 0 ? stats.totalGaps : 'None yet'}
          sublabel={stats.totalGaps > 0 ? 'High-opportunity areas' : 'Requires more topic variety'}
          icon={AlertCircle}
        />

        <StatCard
          label="Memory Records"
          value={stats.totalMemories}
          sublabel="Retained in Hindsight bank"
          icon={BrainCircuit}
        />
      </div>

      {/* Charts Section */}
      {analytics && (
        <ChartsSection
          timeline={analytics.timeline}
          byTopic={analytics.byTopic}
          byContentType={analytics.byContentType}
          byPlatform={analytics.byPlatform}
        />
      )}

      {/* Top Performing Content Section */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Top Performing Content Assets
            </h3>
            <p className="text-xs text-neutral-500">
              Ranked by verifiable engagement rate and reach
            </p>
          </div>
          <button
            onClick={() => setCurrentView('content_library')}
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {topPerformers.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No performance metrics recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-normal">Content Asset</th>
                  <th className="pb-3 font-normal">Platform</th>
                  <th className="pb-3 font-normal">Topic</th>
                  <th className="pb-3 font-normal">Format</th>
                  <th className="pb-3 font-normal text-right">Reach</th>
                  <th className="pb-3 font-normal text-right">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {topPerformers.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedContentId(item.id);
                      setCurrentView('content_library');
                    }}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-4 max-w-md truncate">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-500 transition-colors">
                        {item.title}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-neutral-500 capitalize">
                      {item.platform}
                    </td>
                    <td className="py-3 pr-4 text-neutral-500">
                      {item.topic}
                    </td>
                    <td className="py-3 pr-4 text-neutral-500 capitalize">
                      {item.content_type.replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {item.reach > 0 ? item.reach.toLocaleString() : '—'}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-xs">
                      {item.engagement_rate !== null ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.engagement_rate}%</span>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">Engagement rate unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
