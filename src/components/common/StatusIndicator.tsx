import React from 'react';

interface StatusIndicatorProps {
  connected: boolean;
  bankId: string;
  totalMemories?: number;
  compact?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  connected,
  bankId,
  totalMemories,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
        <span
          className={`h-2 w-2 rounded-full ${
            connected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-neutral-400 dark:bg-neutral-600'
          }`}
          aria-hidden="true"
        />
        <span>{connected ? 'Hindsight Cloud Connected' : 'Not connected'}</span>
      </div>
    );
  }

  return (
    <div
      title={
        connected
          ? `Hindsight Cloud Connected (${bankId})`
          : 'Not connected — Connect Hindsight to enable persistent organizational memory.'
      }
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
        connected
          ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${
          connected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'
        }`}
        aria-hidden="true"
      />
      <div className="flex items-center gap-1.5 truncate max-w-xs md:max-w-sm">
        {connected ? (
          <>
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">
              Hindsight Connected
            </span>
            <span className="text-neutral-400">/</span>
            <span className="font-mono truncate">{bankId}</span>
            {totalMemories !== undefined && (
              <>
                <span className="text-neutral-400">·</span>
                <span className="font-mono">{totalMemories} memories</span>
              </>
            )}
          </>
        ) : (
          <span className="truncate">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Not connected</span>
            <span className="hidden lg:inline text-neutral-400"> — Connect Hindsight</span>
          </span>
        )}
      </div>
    </div>
  );
};
