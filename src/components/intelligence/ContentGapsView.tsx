import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { GapAnalysisItem, ContentGapAnalysis } from '../../types/index.ts';
import { SearchCode, PlusCircle, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const ContentGapsView: React.FC = () => {
  const { setCurrentView, setIsAddModalOpen } = useApp();
  const [gaps, setGaps] = useState<GapAnalysisItem[]>([]);
  const [analysis, setAnalysis] = useState<ContentGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getGaps(), api.getGapAnalysis()])
      .then(([gapsData, analysisData]) => {
        setGaps(gapsData);
        setAnalysis(analysisData);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-neutral-400">Evaluating content history for gaps...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Content Gap Analysis
        </h2>
        <p className="text-xs text-neutral-500">
          Calculated dynamically from the distribution and performance of your real content
        </p>
      </div>

      {/* Empty State per Section 17 */}
      {gaps.length === 0 ? (
        <div className="p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-4 max-w-lg mx-auto">
          <SearchCode className="h-8 w-8 text-neutral-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {analysis && !analysis.hasSufficientData
                ? 'Insufficient data to identify meaningful content gaps.'
                : 'Not enough content history yet'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {analysis?.message || 'Add more content across different topics to identify meaningful gaps. The system only highlights gaps when empirical data exists.'}
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
        <div className="space-y-4">
          {gaps.map((gap, i) => (
            <div
              key={gap.id || i}
              className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">0{i + 1}</span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{gap.topic}</h3>
                  </div>
                  <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">{gap.recommendation}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-semibold text-neutral-400">Opportunity Score</div>
                  <div className="text-lg font-mono font-extrabold text-emerald-500 tabular-nums">
                    {gap.opportunity_score}/100
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div>
                  <div className="flex items-center justify-between text-neutral-500 mb-1">
                    <span>Library Coverage</span>
                    <span className="font-mono tabular-nums">{gap.coverage_score}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-neutral-400 h-full rounded-full" style={{ width: `${gap.coverage_score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-neutral-500 mb-1">
                    <span>Performance Benchmark</span>
                    <span className="font-mono tabular-nums">{gap.performance_score}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${gap.performance_score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Content type imbalance — derived from real distribution */}
          {analysis && analysis.typeImbalances.length > 0 && (
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Content Type Distribution
              </h4>
              <ul className="space-y-2 text-xs">
                {analysis.typeImbalances.map(t => (
                  <li key={t.contentType} className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {t.observation}
                    {t.averageEngagement !== null && (
                      <span className="font-mono tabular-nums text-neutral-500">
                        {' '}Average engagement: {t.averageEngagement}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Underrepresented platforms — derived from real distribution */}
          {analysis && analysis.underrepresentedPlatforms.length > 0 && (
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Underrepresented Platforms
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.underrepresentedPlatforms.map(p => (
                  <span
                    key={p}
                    className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 font-medium capitalize"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
