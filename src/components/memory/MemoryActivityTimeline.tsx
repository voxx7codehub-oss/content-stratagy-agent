import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { MemoryActivityItem } from '../../types/index.ts';
import {
  FileText,
  TrendingUp,
  Network,
  Mic,
  Sparkles,
  History,
  Activity,
  BrainCircuit
} from 'lucide-react';

export const MemoryActivityTimeline: React.FC = () => {
  const [activities, setActivities] = useState<MemoryActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getMemoryActivity(40).then(data => {
      setActivities(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CONTENT_RETAINED':
        return FileText;
      case 'STRATEGY_GENERATED':
        return Sparkles;
      case 'MEMORY_RECALLED':
        return History;
      case 'REFLECTION_COMPLETED':
        return BrainCircuit;
      default:
        return Activity;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'CONTENT_RETAINED':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'STRATEGY_GENERATED':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'MEMORY_RECALLED':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'REFLECTION_COMPLETED':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-neutral-400">Loading memory event log...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Memory Event Timeline
        </h2>
        <p className="text-xs text-neutral-500">
          Verifiable audit trail of all real retention, recall, reflection, and strategy events
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-2 max-w-md mx-auto">
          <Activity className="h-8 w-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No memory events recorded yet
          </h3>
          <p className="text-xs text-neutral-500">
            Events will be logged automatically as you add content, search memories, or generate strategies.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
          {activities.map((act, idx) => {
            const Icon = getEventIcon(act.type);
            const colorClass = getEventColor(act.type);

            return (
              <div key={act.id || idx} className="relative flex items-start gap-4 pl-1">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 z-10 bg-white dark:bg-neutral-900 ${colorClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {act.type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[11px]">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {act.description}
                  </p>

                  <div className="text-[11px] font-mono text-neutral-400 pt-1">
                    Bank: <span className="text-neutral-600 dark:text-neutral-300">{act.bank_id}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
