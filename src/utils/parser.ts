import { sortedConnectives, connectiveMap, Relation } from './relations';

export interface Proposition {
  id: string;
  text: string;
  originalText: string;
  hint?: string;
  connectiveMatch?: {
    word: string;
    index: number;
    relations: Relation[];
  };
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

function addProposition(propositions: Proposition[], text: string, vCount: number, sCount: number) {
  let id = `${vCount}${String.fromCharCode(97 + sCount)}`;
  let connMatch = undefined;
  let cleanText = text.trim();
  let lowerText = cleanText.toLowerCase();
  
  for (const conn of sortedConnectives) {
    const escapedConn = conn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(^|\\s|\\b(?<!-))(' + escapedConn + ')(?!-)(?:\\b|\\s|[,.;:?!]|$)', 'i');
    const match = lowerText.match(regex);
    
    if (match) {
      const matchIndex = match.index! + match[1].length;
      const matchWord = match[2];
      let relations = connectiveMap.get(conn)!;
      connMatch = {
        word: cleanText.substring(matchIndex, matchIndex + matchWord.length),
        index: matchIndex,
        relations
      };
      break;
    }
  }
  
  let hint = undefined;
  if (connMatch && connMatch.relations.length > 0) {
    const rel = connMatch.relations[0];
    hint = `Dica de análise gramatical:\n\nA palavra '${connMatch.word}' geralmente introduz uma relação de ${rel.name} (${rel.category}).\n\nTente agrupar esta proposição com a(s) proposição(ões) anterior(es) que formam a ação ou declaração principal à qual este conectivo se refere.`;
  }
  
  propositions.push({
    id,
    text: cleanText,
    originalText: cleanText,
    hint,
    connectiveMatch: connMatch
  });
}
