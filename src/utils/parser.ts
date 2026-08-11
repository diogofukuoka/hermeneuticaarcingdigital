import { sortedConnectives, connectiveMap, Relation } from './relations';

export interface ConnectiveMatch {
  word: string;
  index: number;
  relations: Relation[];
}

export interface Proposition {
  id: string;
  text: string;
  originalText: string;
  hint?: string;
  connectiveMatch?: ConnectiveMatch;
  connectiveMatches?: ConnectiveMatch[];
}

export function parseText(text: string): Proposition[] {
  let cleaned = text.trim();
  if (!cleaned) return [];

  let propositions: Proposition[] = [];
  
  const hasManualBreaks = cleaned.includes('\n');

  if (hasManualBreaks) {
    let lines = cleaned.split('\n');
    let currentVerse = 1;
    let subCounter = 0;
    let currentVerseStr = "";
    
    for (const line of lines) {
      if (!line.trim()) continue;
      let propText = line.trim();
      
      if (/^\[?\(?\d+\]?\)?\.?$/.test(propText)) {
         currentVerseStr = propText + " ";
         continue;
      }
      
      if (currentVerseStr) {
         propText = currentVerseStr + propText;
         currentVerseStr = "";
      }
      
      const verseMatch = propText.match(/^\[?\(?(\d+)\]?\)?[\s.]+(.*)/);
      if (verseMatch) {
        currentVerse = parseInt(verseMatch[1], 10);
        propText = verseMatch[2];
        subCounter = 0;
      }

      addProposition(propositions, propText, currentVerse, subCounter);
      subCounter++;
    }
    return propositions;
  }

  let autoText = cleaned;
  
  autoText = autoText.replace(/(\S)\s+(\[\d+\]\s+)/g, '$1\n$2');
  
  autoText = autoText.replace(/([.;:?])\s+/g, '$1\n');
  
  const afterCommaConnectives = sortedConnectives.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const commaRegex = new RegExp(`(,\\s+)(?=${afterCommaConnectives}\\b)`, 'gi');
  autoText = autoText.replace(commaRegex, ',\n');
  
  const strongConnectives = [
    "para que", "a fim de que", "de modo que", "de forma que", 
    "porque", "pois", "portanto", "por isso", 
    "mas", "porém", "contudo", "todavia"
  ];
  const strongRegex = new RegExp(`\\s+(?=${strongConnectives.join('|')}\\b)`, 'gi');
  autoText = autoText.replace(strongRegex, '\n');
  
  autoText = autoText.replace(/(\b(?:maneira|tal|tanto)\b.*?)\s+(que\b)/gi, '$1\n$2');

  let lines = autoText.split('\n');
  let verseCounter = 1;
  let subCounter = 0;
  let currentVerseStr = "";

  for (const line of lines) {
      if (!line.trim()) continue;
      let propText = line.trim();
      
      if (/^\[?\(?\d+\]?\)?\.?$/.test(propText)) {
         currentVerseStr = propText + " ";
         continue;
      }
      
      if (currentVerseStr) {
         propText = currentVerseStr + propText;
         currentVerseStr = "";
      }
      
      const verseMatch = propText.match(/^\[?\(?(\d+)\]?\)?[\s.]+(.*)/);
      if (verseMatch) {
        verseCounter = parseInt(verseMatch[1], 10);
        propText = verseMatch[2];
        subCounter = 0;
      }

      addProposition(propositions, propText, verseCounter, subCounter);
      subCounter++;
  }

  return propositions;
}

export function findConnectives(text: string) {
  let cleanText = text.trim();
  let lowerText = cleanText.toLowerCase();
  
  let matches: ConnectiveMatch[] = [];
  
  // To avoid overlapping matches, we could search for all occurrences of all connectives,
  // then sort by index, and filter out overlapping ones.
  // sortedConnectives are already sorted by length descending in relations.ts (presumably, or we should sort them).
  
  for (const conn of sortedConnectives) {
    const escapedConn = conn.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(^|\\s|\\b(?<!-))(' + escapedConn + ')(?!-)(?:\\b|\\s|[,.;:?!]|$)', 'gi');
    
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      const matchIndex = match.index + match[1].length;
      const matchWord = match[2];
      
      // Check if this overlaps with an existing match
      const overlaps = matches.some(m => 
        (matchIndex >= m.index && matchIndex < m.index + m.word.length) ||
        (matchIndex + matchWord.length > m.index && matchIndex + matchWord.length <= m.index + m.word.length) ||
        (matchIndex <= m.index && matchIndex + matchWord.length >= m.index + m.word.length)
      );
      
      if (!overlaps) {
        matches.push({
          word: cleanText.substring(matchIndex, matchIndex + matchWord.length),
          index: matchIndex,
          relations: connectiveMap.get(conn)!
        });
      }
    }
  }
  
  matches.sort((a, b) => a.index - b.index);
  
  let hint = undefined;
  if (matches.length > 0) {
    const firstRel = matches[0].relations[0];
    if (firstRel) {
      hint = `Dica de análise gramatical:\n\nA palavra '${matches[0].word}' geralmente introduz uma relação de ${firstRel.name} (${firstRel.category}).\n\nTente agrupar esta proposição com a(s) proposição(ões) anterior(es) que formam a ação ou declaração principal à qual este conectivo se refere.`;
    }
  }
  
  return { matches, hint };
}

function addProposition(propositions: Proposition[], text: string, vCount: number, sCount: number) {
  let id = `${vCount}${String.fromCharCode(97 + sCount)}`;
  let cleanText = text.trim();
  
  const { matches, hint } = findConnectives(cleanText);
  
  propositions.push({
    id,
    text: cleanText,
    originalText: cleanText,
    hint,
    connectiveMatch: matches.length > 0 ? matches[0] : undefined,
    connectiveMatches: matches
  });
}
