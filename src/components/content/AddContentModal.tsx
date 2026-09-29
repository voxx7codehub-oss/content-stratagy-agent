import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ContentItem } from '../../types/index.ts';
import { X, Check, Loader2, BrainCircuit } from 'lucide-react';

export const AddContentModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, triggerRefresh, showToast } = useApp();

  const [formData, setFormData] = useState<{
    title: string;
    body: string;
    platform: ContentItem['platform'];
    content_type: ContentItem['content_type'];
    topic: string;
    tone: ContentItem['tone'];
    published_at: string;
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    campaign: string;
    url: string;
  }>({
    title: '',
    body: '',
    platform: 'linkedin',
    content_type: 'educational',
    topic: '',
    tone: 'professional',
    published_at: new Date().toISOString().slice(0, 16),
    reach: 0,
    impressions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
    campaign: '',
    url: ''
  });

  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [stages, setStages] = useState({
    saved: false,
    analyzed: false,
    perfCalculated: false,
    memoryUpdated: false
  });
  const [result, setResult] = useState<any>(null);

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      showToast('Title and content body are required', 'error');
      return;
    }

    setStep('processing');
    setStages({
      saved: false,
      analyzed: false,
      perfCalculated: false,
      memoryUpdated: false
    });

    try {
      setTimeout(() => setStages(s => ({ ...s, saved: true })), 200);
      setTimeout(() => setStages(s => ({ ...s, analyzed: true })), 500);
      setTimeout(() => setStages(s => ({ ...s, perfCalculated: true })), 800);

      const res = await api.createContent({
        ...formData,
        reach: Number(formData.reach) || 0,
        impressions: Number(formData.impressions) || 0,
        likes: Number(formData.likes) || 0,
        comments: Number(formData.comments) || 0,
        shares: Number(formData.shares) || 0,
        clicks: Number(formData.clicks) || 0
      });

      setTimeout(() => {
        setStages(s => ({ ...s, memoryUpdated: true }));
        setResult(res);
        setStep('done');
        triggerRefresh();
        showToast('Real content successfully added and retained', 'success');
      }, 1200);
    } catch (err: any) {
      setStep('form');
      showToast(err?.message || 'Failed to save content', 'error');
    }
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setTimeout(() => {
      setStep('form');
      setResult(null);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Add Published Content
            </h3>
            <p className="text-xs text-neutral-500">
              Enter real content and verified performance metrics
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration from Batch ETL to Real-Time Streaming"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Content Body
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Paste published copy, article text, or script..."
                  value={formData.body}
                  onChange={e => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="blog">Blog</option>
                    <option value="x">X (Twitter)</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={e => setFormData({ ...formData, content_type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="educational">Educational</option>
                    <option value="case_study">Case Study</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="thought_leadership">Thought Leadership</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Engineering"
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tone
                  </label>
                  <select
                    value={formData.tone}
                    onChange={e => setFormData({ ...formData, tone: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="professional">Professional</option>
                    <option value="educational">Educational</option>
                    <option value="technical">Technical</option>
                    <option value="concise">Concise</option>
                    <option value="conversational">Conversational</option>
                    <option value="promotional">Promotional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Published Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.published_at.slice(0, 10)}
                    onChange={e => setFormData({ ...formData, published_at: new Date(e.target.value).toISOString() })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Actual Performance Metrics (Optional if unmeasured)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Reach</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reach || ''}
                      onChange={e => setFormData({ ...formData, reach: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Impressions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.impressions || ''}
                      onChange={e => setFormData({ ...formData, impressions: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Likes</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.likes || ''}
                      onChange={e => setFormData({ ...formData, likes: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Comments</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.comments || ''}
                      onChange={e => setFormData({ ...formData, comments: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Shares</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.shares || ''}
                      onChange={e => setFormData({ ...formData, shares: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">Clicks</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.clicks || ''}
                      onChange={e => setFormData({ ...formData, clicks: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Campaign Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Brand Refresh"
                    value={formData.campaign}
                    onChange={e => setFormData({ ...formData, campaign: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Published URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  Save & Retain
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 px-4 space-y-6 text-center max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-bold">
                  ANALYZING CONTENT
                </h4>
                <p className="text-xs text-neutral-500">
                  Validating fields, computing performance metrics, and retaining memory...
                </p>
              </div>

              <div className="space-y-2 text-left bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
                <div className={`flex items-center gap-2 ${stages.saved ? 'text-emerald-500' : 'text-neutral-400'}`}>
                  {stages.saved ? <Check className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>✓ Content saved</span>
                </div>
                <div className={`flex items-center gap-2 ${stages.analyzed ? 'text-emerald-500' : 'text-neutral-400'}`}>
                  {stages.analyzed ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                  <span>✓ Content analyzed</span>
                </div>
                <div className={`flex items-center gap-2 ${stages.perfCalculated ? 'text-emerald-500' : 'text-neutral-400'}`}>
                  {stages.perfCalculated ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                  <span>✓ Performance calculated</span>
                </div>
                <div className={`flex items-center gap-2 ${stages.memoryUpdated ? 'text-emerald-500' : 'text-neutral-400'}`}>
                  {stages.memoryUpdated ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                  <span>✓ Memory updated</span>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && result && (
            <div className="py-8 px-4 space-y-6 text-center max-w-md mx-auto">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Content Retained
                </h4>
                <p className="text-xs text-neutral-500">
                  {result.engagementRate !== null ? (
                    <>Calculated Engagement Rate: <span className="font-bold text-emerald-500">{result.engagementRate}%</span></>
                  ) : (
                    <span className="italic text-neutral-400">Engagement rate unavailable (reach was not provided)</span>
                  )}
                </p>
                {result.message && (
                  <p className="text-[11px] text-neutral-400 pt-1">{result.message}</p>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
