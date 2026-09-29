/**
 * Content Analysis Service
 * ------------------------
 * Derives structured attributes from the ACTUAL user-supplied text.
 * Nothing is invented: whenever a value cannot be determined from the
 * content itself, the literal string "Unknown" is returned.
 */

export const UNKNOWN = 'Unknown';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'you', 'your', 'our', 'from',
  'have', 'has', 'are', 'was', 'were', 'will', 'can', 'but', 'not', 'all',
  'its', 'it', 'a', 'an', 'of', 'to', 'in', 'on', 'is', 'be', 'as', 'at',
  'by', 'or', 'we', 'they', 'them', 'their', 'what', 'how', 'why', 'when',
  'who', 'which', 'this', 'these', 'those', 'more', 'most', 'than', 'then',
  'so', 'if', 'do', 'does', 'about', 'into', 'over', 'after', 'before'
]);

const TYPE_SIGNALS: Array<{ type: string; patterns: RegExp[] }> = [
  { type: 'tutorial', patterns: [/\bhow to\b/i, /\bstep[- ]by[- ]step\b/i, /\btutorial\b/i, /\bwalkthrough\b/i, /\binstall(ing|ation)?\b/i, /\bgetting started\b/i] },
  { type: 'case_study', patterns: [/\bcase stud(y|ies)\b/i, /\bour (result|results|journey|experience)\b/i, /\bmigrat(ed|ing|ion)\b/i, /\bwe achieved\b/i, /\boutcome\b/i] },
  { type: 'thought_leadership', patterns: [/\bwhy\b/i, /\bopinion\b/i, /\bperspective\b/i, /\bthe future of\b/i, /\bmyth\b/i, /\bwhat most\b/i, /\bwe believe\b/i] },
  { type: 'promotional', patterns: [/\bbuy\b/i, /\bpromo(code)?\b/i, /\bsign up\b/i, /\bstarts? (today|now)\b/i, /\bdiscount\b/i, /\blimited time\b/i, /\bbook a (demo|call)\b/i] },
  { type: 'industry_news', patterns: [/\bannounced\b/i, /\breleases?\b/i, /\bnews\b/i, /\bupdate[d]?\b/i, /\bversion \d/i, /\bpartnership\b/i, /\bacquisition\b/i] },
  { type: 'educational', patterns: [/\bexplains?\b/i, /\bguide\b/i, /\bfundamentals?\b/i, /\bintroduction to\b/i, /\boverview\b/i, /\bbasics\b/i, /\blearn\b/i] }
];

const TONE_SIGNALS: Array<{ tone: string; patterns: RegExp[] }> = [
  { tone: 'technical', patterns: [/\bAPI\b/, /\bdeploy(ment)?\b/i, /\bschema\b/i, /\bcode\b/i, /\blet'?s\b/i, /\byou will learn\b/i, /\bstep \d/i, /\bfirst,?\b/i, /\bnext,?\b/i, /\bexample\b/i, /\bunderstand\b/i] },
  { tone: 'conversational', patterns: [/\byou know\b/i, /\bhonestly\b/i, /\bwe'?re\b/i, /\bstuff\b/i, /\bbasically\b/i, /\bkind of\b/i] },
  { tone: 'promotional', patterns: [/\bunlock\b/i, /\bamazing\b/i, /\bbest\b/i, /\btransform\b/i, /\bdon'?t miss\b/i] },
  { tone: 'concise', patterns: [] }
];

export interface ContentAnalysis {
  topic: string;
  contentType: string;
  tone: string;
  keywords: string[];
  themes: string[];
  summary: string;
  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  confidence: 'high' | 'low';
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((acc, p) => acc + (p.test(text) ? 1 : 0), 0);
}

/**
 * Analyze real content. Every field is derived only from the supplied text.
 */
export function analyzeContent(title: string, body: string): ContentAnalysis {
  const safeTitle = (title || '').toString();
  const safeBody = (body || '').toString();
  const fullText = `${safeTitle}. ${safeBody}`.trim();

  if (!fullText || fullText === '.') {
    return {
      topic: UNKNOWN,
      contentType: UNKNOWN,
      tone: UNKNOWN,
      keywords: [],
      themes: [],
      summary: UNKNOWN,
      wordCount: 0,
      sentenceCount: 0,
      averageSentenceLength: 0,
      confidence: 'low'
    };
  }

  // --- Keywords: real frequency ranking of significant words ---
  const tokens = tokenize(fullText);
  const frequency = new Map<string, number>();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }
  const keywords = [...frequency.entries()]
    .filter(([word]) => word.length > 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([word]) => word);

  // --- Topic: most frequent significant phrase, else "Unknown" ---
  const bigrams = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const gram = `${tokens[i]} ${tokens[i + 1]}`;
    bigrams.set(gram, (bigrams.get(gram) || 0) + 1);
  }
  const topBigram = [...bigrams.entries()].sort((a, b) => b[1] - a[1])[0];
  let topic = UNKNOWN;
  if (topBigram && topBigram[1] >= 2) {
    topic = topBigram[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } else if (keywords.length > 0) {
    topic = keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1);
  }

  // --- Content type: only when real signals exist ---
  const typeScores = TYPE_SIGNALS.map(t => ({ type: t.type, score: countMatches(fullText, t.patterns) }));
  const bestType = typeScores.sort((a, b) => b.score - a.score)[0];
  const contentType = bestType && bestType.score > 0 ? bestType.type : UNKNOWN;

  // --- Tone: only when real signals exist ---
  const toneScores = TONE_SIGNALS.map(t => ({ tone: t.tone, score: countMatches(fullText, t.patterns) }));
  const bestTone = toneScores.sort((a, b) => b.score - a.score)[0];
  const tone = bestTone && bestTone.score > 0 ? bestTone.tone : UNKNOWN;

  // --- Themes: recurring significant terms actually present ---
  const themes = [...frequency.entries()]
    .filter(([word, count]) => count >= 3 && word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  // --- Sentence characteristics (measured, not estimated) ---
  const sentences = safeBody.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.split(/\s+/).filter(Boolean).length > 0);
  const wordCount = tokens.length;
  const sentenceCount = sentences.length;
  const averageSentenceLength = sentenceCount > 0
    ? Number((sentences.reduce((acc, s) => acc + s.split(/\s+/).filter(Boolean).length, 0) / sentenceCount).toFixed(1))
    : 0;

  // --- Summary: first real sentence of the body, else "Unknown" ---
  const summary = sentences.length > 0 ? sentences[0].slice(0, 200) : UNKNOWN;

  const signalCount = (contentType !== UNKNOWN ? 1 : 0) + (tone !== UNKNOWN ? 1 : 0) + (topic !== UNKNOWN ? 1 : 0);

  return {
    topic,
    contentType,
    tone,
    keywords,
    themes,
    summary,
    wordCount,
    sentenceCount,
    averageSentenceLength,
    confidence: signalCount >= 2 ? 'high' : 'low'
  };
}

export class AnalysisService {
  /** Exposed as a class to mirror the existing service style. */
  public analyze(title: string, body: string): ContentAnalysis {
    return analyzeContent(title, body);
  }
}

export const analysisService = new AnalysisService();
