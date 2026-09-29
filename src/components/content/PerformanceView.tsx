import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { ChartsSection } from '../dashboard/ChartsSection.tsx';
import { ContentItem } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { BarChart3, TrendingUp, Award, ArrowUpRight } from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { setSelectedContentId } = useApp();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(res => {
      setAnalytics(res);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !analytics) {
    return <div className="p-8 text-center text-xs text-neutral-400">Loading performance models...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Performance Analytics
        </h2>
        <p className="text-xs text-neutral-500">
          Empirical interaction cohorts, channel throughput, and audience bookmark velocity
        </p>
      </div>

      {/* Visual Analytics */}
      <ChartsSection
        timeline={analytics.timeline}
        byTopic={analytics.byTopic}
        byContentType={analytics.byContentType}
        byPlatform={analytics.byPlatform}
      />

      {/* Cohort Breakdown Table */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Top Performing Content Cohorts
          </h3>
          <p className="text-xs text-neutral-500">
            Assets delivering sustained reader engagement and high algorithmic distribution
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[10px] uppercase">
                <th className="pb-3 font-normal">Asset Title</th>
                <th className="pb-3 font-normal">Channel</th>
                <th className="pb-3 font-normal">Format</th>
                <th className="pb-3 font-normal text-right">Reach</th>
                <th className="pb-3 font-normal text-right">Impressions</th>
                <th className="pb-3 font-normal text-right">Clicks</th>
                <th className="pb-3 font-normal text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {analytics.topPerformers.map((item: ContentItem) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedContentId(item.id)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-500 truncate max-w-xs">
                    {item.title}
                  </td>
                  <td className="py-3 pr-4 text-neutral-500 capitalize">{item.platform}</td>
                  <td className="py-3 pr-4 text-neutral-500 capitalize">{item.content_type.replace('_', ' ')}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-300">{item.reach.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-300">{item.impressions.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-300">{item.clicks.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono tabular-nums font-bold text-emerald-500">{item.engagement_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
