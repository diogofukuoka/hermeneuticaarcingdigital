/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TextPanel } from './components/TextPanel';
import { CanvasPanel } from './components/CanvasPanel';
import { Proposition, parseText } from './utils/parser';
import { fetchBibleText } from './utils/api';

export default function App() {
  const [text, setText] = useState('');
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    let textToParse = text;
    
    // Check if it's a reference and fetch
    if (text.trim().length > 0 && text.length < 50) {
      const fetchedText = await fetchBibleText(text);
      if (fetchedText) {
        textToParse = fetchedText;
        setText(fetchedText);
      }
    }
    
    const parsed = parseText(textToParse);
    setPropositions(parsed);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
            <span className="font-bold text-sm italic">A</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-800 uppercase text-xs">
            Hermenêutica Digital <span className="font-light opacity-50 ml-2">| Método Arcing</span>
          </h1>
        </div>
        <div className="flex gap-2">
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex lg:flex-row flex-col relative w-full items-stretch min-h-full">
            <section className="w-full lg:w-1/2 border-r bg-white flex flex-col shrink-0">
              <TextPanel
                text={text}
                setText={setText}
                propositions={propositions}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            </section>
            <section className="w-full lg:w-1/2 bg-white flex flex-col relative shrink-0">
              <CanvasPanel />
            </section>
          </div>
        </div>
      </main>

      <footer className="h-8 bg-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-400 shrink-0 hidden lg:flex z-50">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Stylus Conectado (S-Pen)
          </span>
          <span>Resolução do Canvas: Automática</span>
        </div>
        <div className="flex gap-4">
          <span className="font-mono">UTC-3 | PROD_v1.0.4</span>
        </div>
      </footer>
    </div>
  );
}


