import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { StrategyReport } from '../../types/index.ts';
import {
  Sparkles,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  PlusCircle,
  UploadCloud,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const StrategistView: React.FC = () => {
  const { setIsAddModalOpen, setCurrentView } = useApp();
  const [question, setQuestion] = useState('What should we publish next month?');
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showMemories, setShowMemories] = useState(true);
  const [totalRecords, setTotalRecords] = useState<number | null>(null);

  useEffect(() => {
    api.getDashboard().then(dash => {
      setTotalRecords(dash.stats.totalContent);
    }).catch(console.error);
  }, []);

  const handleAsk = async (promptQuestion?: string) => {
    const q = promptQuestion || question;
    if (!q.trim()) return;

    setIsLoading(true);
    setLoadingStage(0);
    setReport(null);

    const stagesInterval = setInterval(() => {
      setLoadingStage(prev => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await api.generateStrategy(q);
      setReport(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      clearInterval(stagesInterval);
      setIsLoading(false);
    }
  };

  const loadingMessages = [
    'Retrieving historical memories from Hindsight bank...',
    'Analyzing real content patterns...',
    'Connecting performance signals...',
    'Generating evidence-backed strategy...'
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 space-y-1">
        <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-semibold flex items-center gap-1.5">
          <BrainCircuit className="h-3.5 w-3.5" />
          <span>HINDSIGHT STRATEGY AGENT</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
          AI STRATEGIST
        </h2>
        <p className="text-xs text-neutral-500">
          Ask questions about your content history. The strategist reasons exclusively over memories stored in your Hindsight bank.
        </p>
      </div>

      {/* Zero content empty state warning per Section 14 */}
      {totalRecords === 0 && (
        <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              No Content History in Archive
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              There is not enough organizational content history to make a reliable recommendation yet. Add or import published content to build organizational memory.
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
      )}

      {/* Input Box */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Strategic Question / Query
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleAsk()}
            placeholder="e.g. What should we publish next month?"
            className="flex-1 px-4 py-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !question.trim()}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-emerald-500" />}
            <span>Ask Strategist</span>
          </button>
        </div>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-center space-y-4 max-w-lg mx-auto">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-emerald-500 font-semibold">
              ANALYZING ORGANIZATIONAL MEMORY
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {loadingMessages[loadingStage]}
            </p>
          </div>
        </div>
      )}

      {/* Generated Strategy Report */}
      {report && !isLoading && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Recommendation Box */}
          <div
            className={`p-6 rounded-xl border space-y-3 ${
              report.hasSufficientData
                ? 'border-emerald-500/30 bg-emerald-950/10 dark:bg-emerald-950/20'
                : 'border-amber-500/30 bg-amber-950/10 dark:bg-amber-950/20'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-neutral-500">
                RECOMMENDATION
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                Confidence: <strong className="text-neutral-700 dark:text-neutral-300">{report.confidence}</strong>
              </span>
            </div>

            <p className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans">
              {report.recommendation}
            </p>
          </div>

          {/* Evidence Section */}
          {report.evidence.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Historical Evidence & Patterns
              </div>
              <div className="space-y-2">
                {report.evidence.map(ev => (
                  <div
                    key={ev.number}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-start gap-3"
                  >
                    <span className="font-mono text-xs font-bold text-neutral-400 pt-0.5">{ev.number}</span>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{ev.headline}</div>
                      <div className="text-xs text-neutral-500 leading-relaxed">{ev.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Gaps Supported by Data */}
          {report.contentGaps.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Content Gaps Supported by Data
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.contentGaps.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1"
                  >
                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{g.topic}</div>
                    <div className="text-xs text-neutral-500">{g.observation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Actions */}
          {report.suggestedActions.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Suggested Actions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.suggestedActions.map(action => (
                  <div
                    key={action.number}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-500">{action.number}</span>
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{action.action}</span>
                    </div>
                    {action.format && (
                      <div className="text-xs text-neutral-500">Format: {action.format}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Memories */}
          {report.supportingMemories.length > 0 && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden">
              <button
                onClick={() => setShowMemories(prev => !prev)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Supporting Memory ({report.supportingMemories.length} historical records)
                  </span>
                </div>
                {showMemories ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
              </button>

              {showMemories && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-neutral-950/40">
                  {report.supportingMemories.map((mem, idx) => (
                    <div
                      key={mem.id || idx}
                      className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {mem.sourceTitle || 'Content Record'}
                        </span>
                        {mem.date && <span>{mem.date}</span>}
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
                        {mem.snippet}
                      </p>
                      {mem.performance && mem.performance !== 'Unknown' && (
                        <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
                          Performance: {mem.performance}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
