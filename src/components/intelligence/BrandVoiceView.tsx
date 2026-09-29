import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { BrandVoiceProfile } from '../../types/index.ts';
import { Mic, PlusCircle, UploadCloud } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const BrandVoiceView: React.FC = () => {
  const { setIsAddModalOpen, setCurrentView } = useApp();
  const [profile, setProfile] = useState<BrandVoiceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getBrandVoice().then(data => {
      setProfile(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !profile) {
    return <div className="p-8 text-center text-xs text-neutral-400">Evaluating brand voice from content corpus...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Brand Voice Profile
        </h2>
        <p className="text-xs text-neutral-500">
          Analyzed directly from the tone and copy of content entered by your organization
        </p>
      </div>

      {/* Empty / Insufficient State per Section 18 */}
      {!profile.hasEnoughData ? (
        <div className="p-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-4 max-w-lg mx-auto">
          <Mic className="h-8 w-8 text-neutral-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {profile.hasEnoughData ? 'Not enough content to reliably determine brand voice.' : 'Limited brand voice evidence'}
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {profile.message || 'Add more content to build a reliable brand voice profile. The voice analyzer does not fabricate tone distributions without sufficient records.'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tone Distribution */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold mb-1">
                OBSERVED TONES
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Primary Tone: {profile.primaryTone || 'N/A'}
              </h3>
              <p className="text-xs text-neutral-500">
                Based on {profile.totalAnalyzed} published items
              </p>
            </div>

            <div className="space-y-3">
              {profile.toneDistribution.map(t => (
                <div key={t.tone} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{t.tone}</span>
                    <span className="font-mono text-neutral-500">{t.percentage}% ({t.count} items)</span>
                  </div>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-900 dark:bg-neutral-100 h-full rounded-full transition-all"
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observed Themes & Samples */}
          <div className="space-y-6">
            {profile.writingStyle && (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Writing Style &amp; Sentence Characteristics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-neutral-500">Detected Style</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">{profile.writingStyle}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Sentences Analyzed</div>
                    <div className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                      {profile.sentenceCharacteristics?.totalSentences ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Average Sentence Length</div>
                    <div className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                      {profile.sentenceCharacteristics?.averageSentenceLength ?? 0} words
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Longest Sentence</div>
                    <div className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                      {profile.sentenceCharacteristics?.longestSentenceLength ?? 0} words
                    </div>
                  </div>
                </div>
              </div>
            )}

            {profile.recurringTerminology && profile.recurringTerminology.length > 0 && (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Recurring Terminology
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.recurringTerminology.map(term => (
                    <span
                      key={term.term}
                      className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 font-medium"
                    >
                      {term.term} <span className="font-mono text-[10px] text-neutral-400">×{term.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.observedThemes && profile.observedThemes.length > 0 && (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Recurring Content Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.observedThemes.map((th, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 font-medium"
                    >
                      {th}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.sampleSnippets && profile.sampleSnippets.length > 0 && (
              <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Sample Content Titles
                </h4>
                <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 list-disc list-inside">
                  {profile.sampleSnippets.map((sn, idx) => (
                    <li key={idx} className="truncate">
                      "{sn}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
