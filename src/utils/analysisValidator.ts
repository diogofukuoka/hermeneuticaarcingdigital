import { bookIdMap } from './api';
import { bibleBooks } from './bible';

export interface ParsedRef {
  bookName: string;
  chapter: string;
  startVerse: string;
  endVerse: string;
}

/**
 * Parses a title or string reference into bookName, chapter, startVerse, endVerse.
 * Example inputs: "João 17:11-12", "Jo 17:11-12", "Gênesis 1:1", "Salmos 23"
 */
export function parseBibleReference(ref: string): ParsedRef | null {
  if (!ref || typeof ref !== 'string') return null;

  const cleanRef = ref.trim();
  const match = cleanRef.match(/^([1-3]?\s*[A-Za-zÀ-ÿ]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/);
  if (!match) return null;

  const rawBook = match[1].toLowerCase().replace(/\s+/g, '');
  const chapter = match[2];
  const startVerse = match[3] || '';
  const endVerse = match[4] || startVerse;

  const bookId = bookIdMap[rawBook];
  if (!bookId) return null;

  const bookObj = bibleBooks[bookId - 1] || bibleBooks.find(b => b.id.toLowerCase() === rawBook || b.name.toLowerCase() === rawBook);
  if (!bookObj) return null;

  return {
    bookName: bookObj.name,
    chapter,
    startVerse,
    endVerse
  };
}

/**
 * Validates whether an existing AI analysis text belongs to the given document text/title,
 * detecting if it was accidentally saved from another passage (e.g. Jo 17:26 stored inside Jo 17:11-12).
 */
export function isAiAnalysisMatchingText(
  aiText: string | null | undefined,
  docText: string,
  docTitle?: string
): boolean {
  if (!aiText || !aiText.trim()) return false;
  if (!docText || !docText.trim()) return true;

  const normalizedAi = aiText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 1. Extract verses mentioned in docText or docTitle
  const docVerses: number[] = [];
  const bracketMatches = Array.from(docText.matchAll(/\[(\d+)\]/g));
  for (const m of bracketMatches) {
    const v = parseInt(m[1], 10);
    if (!isNaN(v) && !docVerses.includes(v)) docVerses.push(v);
  }

  if (docTitle) {
    const titleMatch = docTitle.match(/:(\d+)(?:-(\d+))?/);
    if (titleMatch) {
      const start = parseInt(titleMatch[1], 10);
      const end = titleMatch[2] ? parseInt(titleMatch[2], 10) : start;
      for (let v = start; v <= end; v++) {
        if (!isNaN(v) && !docVerses.includes(v)) docVerses.push(v);
      }
    }
  }

  // 2. Extract significant content words from docText
  const stopWords = new Set([
    'sobre', 'porque', 'portanto', 'quando', 'aquele', 'aquela', 'aquilo',
    'assim', 'mesmo', 'mesma', 'depois', 'antes', 'entao', 'então', 'estava',
    'estavam', 'sendo', 'tinha', 'tinham', 'disse', 'dizendo', 'tambem', 'também',
    'pelos', 'pelas', 'desta', 'deste', 'estes', 'estas', 'onde', 'como', 'para',
    'qual', 'quais', 'quem', 'cujo', 'cuja', 'cujos', 'cujas'
  ]);

  const cleanWord = (w: string) =>
    w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  const rawDocWords = docText
    .replace(/\[\d+\]/g, ' ')
    .split(/\s+/)
    .map(cleanWord)
    .filter(w => w.length >= 4 && !stopWords.has(w));

  const uniqueDocWords = Array.from(new Set(rawDocWords));

  // Check if ANY of the doc verses are mentioned in the AI text
  let hasVerseMatch = false;
  if (docVerses.length > 0) {
    for (const v of docVerses) {
      const patterns = [
        `${v}a`, `${v}b`, `${v}c`, `${v}d`,
        `versiculo ${v}`, `v. ${v}`, `v.${v}`,
        `[${v}]`, `(${v})`, ` ${v}:`, `:${v}`
      ];
      if (patterns.some(p => normalizedAi.includes(p))) {
        hasVerseMatch = true;
        break;
      }
    }
  }

  // Check how many significant words from docText appear in the AI text
  let wordMatches = 0;
  for (const w of uniqueDocWords) {
    if (normalizedAi.includes(w)) {
      wordMatches++;
    }
  }

  const wordMatchRatio = uniqueDocWords.length > 0 ? wordMatches / uniqueDocWords.length : 1;

  // If we have doc verses:
  if (docVerses.length > 0) {
    if (!hasVerseMatch && wordMatchRatio < 0.25) {
      return false;
    }
    if (!hasVerseMatch && wordMatches < 3) {
      return false;
    }
  } else {
    if (uniqueDocWords.length >= 4 && wordMatchRatio < 0.20 && wordMatches < 3) {
      return false;
    }
  }

  return true;
}
