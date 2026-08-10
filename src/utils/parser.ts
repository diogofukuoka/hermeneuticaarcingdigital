import { sortedConnectives, connectiveMap, Relation } from './relations';

export interface Proposition {
  id: string;
  text: string;
  originalText: string;
  connectiveMatch?: {
    word: string;
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
    const regex = new RegExp('^(' + escapedConn + ')(?:\\b|\\s|[,.;:?!]|$)', 'i');
    const match = lowerText.match(regex);
    
    if (match) {
      const matchLen = match[1].length;
      let relations = connectiveMap.get(conn)!;
      connMatch = {
        word: cleanText.substring(0, matchLen),
        relations
      };
      break;
    }
  }
  
  propositions.push({
    id,
    text: cleanText,
    originalText: cleanText,
    connectiveMatch: connMatch
  });
}
