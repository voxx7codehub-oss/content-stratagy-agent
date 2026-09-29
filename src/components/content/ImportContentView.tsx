import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Download,
  Loader2
} from 'lucide-react';

interface ParsedRow {
  title: string;
  body: string;
  platform?: string;
  topic?: string;
  content_type?: string;
  tone?: string;
  published_at?: string;
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  campaign?: string;
  url?: string;
  isValid: boolean;
  error?: string;
}

export const ImportContentView: React.FC = () => {
  const { setCurrentView, triggerRefresh, showToast } = useApp();
  const [inputText, setInputText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [showInvalid, setShowInvalid] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const sampleCsv = `title,body,platform,topic,content_type,tone,published_at,reach,impressions,likes,comments,shares,clicks,campaign
"Migrating to Real-Time Streaming","Our technical journey moving from batch ETL to real-time event ingestion with Apache Kafka.","blog","Data Engineering","case_study","technical","2026-09-10T12:00:00Z",45000,54000,3200,240,410,1800,"Q3 Infrastructure"
"Why Developer Ergonomics Matter","Developer experience directly impacts velocity and code quality. Key findings from our internal audit.","linkedin","Productivity","thought_leadership","professional","2026-09-14T09:00:00Z",28000,34000,2100,180,260,950,"Developer Guild"
"Hands-on Vector Search Tutorial","A step-by-step code walkthrough implementing Hindsight memory in Node.js.","blog","AI & Machine Learning","tutorial","educational","2026-09-20T15:00:00Z",52000,61000,4800,390,580,2900,"Agent Memory"`;

  const parseInput = (raw: string) => {
    if (!raw.trim()) {
      setParsedRows([]);
      return;
    }

    const trimmed = raw.trim();

    // Check if JSON
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          const rows: ParsedRow[] = json.map(j => {
            const hasTitle = Boolean(j.title && String(j.title).trim());
            const hasBody = Boolean((j.body || j.content) && String(j.body || j.content).trim());
            return {
              title: j.title || '',
              body: j.body || j.content || '',
              platform: j.platform || 'linkedin',
              topic: j.topic || 'General',
              content_type: j.content_type || 'educational',
              tone: j.tone || 'professional',
              published_at: j.published_at || new Date().toISOString(),
              reach: Number(j.reach) || 0,
              impressions: Number(j.impressions) || 0,
              likes: Number(j.likes) || 0,
              comments: Number(j.comments) || 0,
              shares: Number(j.shares) || 0,
              clicks: Number(j.clicks) || 0,
              campaign: j.campaign,
              url: j.url,
              isValid: hasTitle && hasBody,
              error: !hasTitle ? 'Missing title' : !hasBody ? 'Missing content body' : undefined
            };
          });
          setParsedRows(rows);
          return;
        }
      } catch (err) {
        // Fall through to CSV parser
      }
    }

    // CSV parsing
    const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 1) return;

    // Header inspection
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const dataLines = lines.slice(1);

    const rows: ParsedRow[] = dataLines.map((line, idx) => {
      // Basic CSV splitter respecting quotes
      const values: string[] = [];
      let inQuotes = false;
      let curVal = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"' || c === "'") {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          values.push(curVal.trim().replace(/^["']|["']$/g, ''));
          curVal = '';
        } else {
          curVal += c;
        }
      }
      values.push(curVal.trim().replace(/^["']|["']$/g, ''));

      const record: any = {};
      headers.forEach((h, hIdx) => {
        record[h] = values[hIdx] !== undefined ? values[hIdx] : '';
      });

      const title = record.title || values[0] || '';
      const body = record.body || record.content || values[1] || '';
      const isValid = Boolean(title.trim() && body.trim());

      return {
        title,
        body,
        platform: record.platform || 'linkedin',
        topic: record.topic || 'General',
        content_type: record.content_type || 'educational',
        tone: record.tone || 'professional',
        published_at: record.published_at || new Date().toISOString(),
        reach: Number(record.reach) || 0,
        impressions: Number(record.impressions) || 0,
        likes: Number(record.likes) || 0,
        comments: Number(record.comments) || 0,
        shares: Number(record.shares) || 0,
        clicks: Number(record.clicks) || 0,
        campaign: record.campaign,
        url: record.url,
        isValid,
        error: !isValid ? 'Missing title or content body in row' : undefined
      };
    });

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setInputText(text);
      parseInput(text);
    };
    reader.readAsText(file);
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);

  const executeImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);
    try {
      const res = await api.importContent(validRows);
      setImportResult(res);
      triggerRefresh();
      showToast(`Successfully imported ${res.validCount} content records into memory`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to import records', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'content_intelligence_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Import Real Content History
          </h2>
          <p className="text-xs text-neutral-500">
            Import your actual published articles, posts, and performance metrics (CSV, JSON, Markdown)
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {importResult ? (
        /* Import Success Confirmation */
        <div className="p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 text-center space-y-5">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Import Completed Successfully
            </h3>
            <p className="text-xs text-neutral-500">
              {importResult.validCount} content records stored in SQLite and retained in Hindsight memory.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setCurrentView('content_library')}
              className="px-5 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
            >
              View in Content Library
            </button>
          </div>
        </div>
      ) : (
        /* Upload & Paste Area */
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/40 text-center space-y-3">
            <UploadCloud className="h-8 w-8 text-neutral-400 mx-auto" />
            <div className="space-y-1">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Upload a CSV or JSON file from your machine
              </div>
              <p className="text-[11px] text-neutral-500">
                Supports standard columns: title, body, platform, topic, content_type, tone, published_at, reach, impressions, likes, comments, shares, clicks
              </p>
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white cursor-pointer transition-colors">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Paste Raw Data */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Or paste CSV or JSON data directly:
              </label>
              <button
                type="button"
                onClick={() => {
                  setInputText(sampleCsv);
                  parseInput(sampleCsv);
                }}
                className="text-[11px] text-emerald-500 hover:underline font-semibold"
              >
                Paste Sample CSV Format
              </button>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                parseInput(e.target.value);
              }}
              placeholder={`title,body,platform,topic,published_at,reach,likes,comments,shares\n"Article Title","Content text here...","blog","AI","2026-09-01",12000,800,45,60`}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Verification & Preview Box per Section 13 */}
          {parsedRows.length > 0 && (
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    IMPORT PREVIEW
                  </div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {parsedRows.length} records detected
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-3">
                    <span className="text-emerald-500 font-bold">Valid: {validRows.length}</span>
                    <span>·</span>
                    <span className={invalidRows.length > 0 ? 'text-amber-500 font-bold' : 'text-neutral-400'}>
                      Invalid: {invalidRows.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {invalidRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowInvalid(prev => !prev)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {showInvalid ? 'Hide Invalid' : 'View Invalid Records'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setParsedRows([]);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isImporting || validRows.length === 0}
                    onClick={executeImport}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>Import {validRows.length} Records</span>
                  </button>
                </div>
              </div>

              {/* Invalid Rows Notice */}
              {showInvalid && invalidRows.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-950/10 text-xs text-amber-500 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Invalid rows detected (these will be skipped):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-400">
                    {invalidRows.map((inv, idx) => (
                      <li key={idx}>
                        Row {idx + 1}: {inv.title || '(No Title)'} — {inv.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="overflow-x-auto max-h-60 border border-neutral-100 dark:border-neutral-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/60 sticky top-0 text-[10px] uppercase text-neutral-400">
                    <tr>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Platform</th>
                      <th className="p-2.5">Topic</th>
                      <th className="p-2.5 text-right">Reach</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {parsedRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className={!row.isValid ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}>
                        <td className="p-2.5 font-medium text-neutral-800 dark:text-neutral-200 max-w-xs truncate">
                          {row.title || <span className="text-red-400 italic">Empty Title</span>}
                        </td>
                        <td className="p-2.5 text-neutral-500 capitalize">{row.platform}</td>
                        <td className="p-2.5 text-neutral-500">{row.topic}</td>
                        <td className="p-2.5 text-right font-mono tabular-nums text-neutral-500">
                          {row.reach ? row.reach.toLocaleString() : '—'}
                        </td>
                        <td className="p-2.5 text-right">
                          {row.isValid ? (
                            <span className="text-emerald-500 font-mono text-[10px]">Valid</span>
                          ) : (
                            <span className="text-amber-500 font-mono text-[10px]">Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
