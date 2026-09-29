import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartsProps {
  timeline: any[];
  byTopic: any[];
  byContentType: any[];
  byPlatform: any[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

export const ChartsSection: React.FC<ChartsProps> = ({
  timeline,
  byTopic,
  byContentType,
  byPlatform
}) => {
  const hasData = timeline.length > 0 || byTopic.length > 0 || byContentType.length > 0;

  if (!hasData) {
    return (
      <div className="p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-center space-y-3">
        <BarChart3 className="h-8 w-8 text-neutral-400 mx-auto" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          No performance data available
        </h4>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Add or import content with reach and interaction metrics to generate real performance charts.
        </p>
      </div>
    );
  }

  const formattedTimeline = timeline.map(t => ({
    ...t,
    displayDate: t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
    engagementRate: t.engagementRate !== null ? Number(Number(t.engagementRate).toFixed(1)) : 0
  }));

  const pieData = byContentType.map(c => ({
    name: c.type.replace('_', ' ').toUpperCase(),
    value: c.count
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Content Performance Over Time */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Content Performance Over Time
          </h3>
          <p className="text-xs text-neutral-500">
            Average engagement rate trend across actual published dates
          </p>
        </div>

        <div className="h-64 w-full">
          {timeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              No date-indexed performance records yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="engagementRate" name="Engagement Rate" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#engGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Engagement by Topic */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Engagement by Topic
          </h3>
          <p className="text-xs text-neutral-500">
            Calculated engagement rate across real subject topics
          </p>
        </div>

        <div className="h-64 w-full">
          {byTopic.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              No topic metrics recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTopic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis dataKey="topic" type="category" width={110} tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="averageEngagement" name="Avg Engagement" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Content Distribution (Donut) */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Content Format Distribution
          </h3>
          <p className="text-xs text-neutral-500">
            Actual breakdown of format types in your library
          </p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {pieData.length === 0 ? (
            <div className="text-xs text-neutral-400">No content formats indexed yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {pieData.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{entry.name}:</span>
                <span className="font-mono text-neutral-200 font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Platform Performance */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Platform Distribution
          </h3>
          <p className="text-xs text-neutral-500">
            Real reach aggregated across your publishing channels
          </p>
        </div>

        <div className="h-64 w-full">
          {byPlatform.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              No platform records yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlatform} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="totalReach" name="Total Reach" fill="#525252" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
