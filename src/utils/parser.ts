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

  // Split by major punctuation and newlines. 
  // (?<=[.;:?])\s+ splits after punctuation followed by space.
  let rawSegments = cleaned.split(/(?<=[.;:?])\s+|\n+/);
  
  let propositions: Proposition[] = [];
  let verseCounter = 1;
  let subCounter = 0;

  for (const segment of rawSegments) {
    if (!segment.trim()) continue;
    
    // Split by commas to check if parts start with connectives
    let parts = segment.split(/(?<=,)\s+/);
    
    let currentPropText = parts[0];
    
    for (let i = 1; i < parts.length; i++) {
      let part = parts[i];
      let hasConnective = false;
      
      let lowerPart = part.toLowerCase();
      for (const conn of sortedConnectives) {
        // Must match word boundary to avoid partial word matches
        // For special characters like "?", word boundary \b doesn't work, so handle carefully.
        const escapedConn = conn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('^(' + escapedConn + ')(?:\\b|\\s|[,.;:?!]|$)', 'i');
        
        if (regex.test(lowerPart)) {
          hasConnective = true;
          break;
        }
      }
      
      if (hasConnective) {
        addProposition(propositions, currentPropText, verseCounter, subCounter);
        subCounter++;
        currentPropText = part;
      } else {
        currentPropText += ' ' + part;
      }
    }
    
    addProposition(propositions, currentPropText, verseCounter, subCounter);
    verseCounter++;
    subCounter = 0;
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
