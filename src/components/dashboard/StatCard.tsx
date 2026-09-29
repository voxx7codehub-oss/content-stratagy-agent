import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  trend
}) => {
  return (
    <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums tracking-tight">
          {value}
        </div>
        {(sublabel || trend) && (
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {trend && (
              <span
                className={`font-semibold font-mono ${
                  trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {trend.value}
              </span>
            )}
            {sublabel && <span>{sublabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
