import React, { useState } from 'react';
import { Proposition } from '../utils/parser';
import { ChevronDown, Trash2 } from 'lucide-react';

interface TextPanelProps {
  text: string;
  setText: (text: string) => void;
  propositions: Proposition[];
  onAnalyze: (useAI?: boolean) => void;
  isAnalyzing: boolean;
}

export function TextPanel({ text, setText, propositions, onAnalyze, isAnalyzing }: TextPanelProps) {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  return (
    <div className="flex flex-col flex-1 bg-white relative min-h-full">
      <div className="sticky top-0 z-40 flex flex-col shadow-sm">
        <div className="p-4 border-b bg-slate-50/90 flex flex-col gap-3 shrink-0 backdrop-blur">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entrada de Texto</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole o texto bíblico ou digite uma referência (ex: Jo 3:16)..."
                className="w-full h-14 p-2 text-sm border rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none text-slate-700 leading-relaxed shadow-sm"
              />
              <span className="text-[10px] text-slate-400 px-1">Dica: Use "Enter" (quebra de linha) para separar proposições manualmente.</span>
            </div>
            {text && (
              <button
                onClick={() => setText('')}
                className="bg-white border border-slate-200 text-slate-500 px-3 py-2 h-14 rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shrink-0 flex items-center justify-center shadow-sm"
                title="Limpar Texto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onAnalyze(false)}
              disabled={isAnalyzing}
              className="bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 h-14 text-sm rounded font-medium hover:bg-slate-200 disabled:bg-slate-50 transition-colors shrink-0 flex items-center justify-center shadow-sm"
            >
              Analisar
            </button>
            {text.trim().length > 0 && (
              <button
                onClick={() => onAnalyze(true)}
                disabled={isAnalyzing}
                className="bg-indigo-600 text-white px-4 py-2 h-14 text-sm rounded font-medium hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shrink-0 flex items-center justify-center shadow-sm"
              >
                {isAnalyzing ? 'Buscando...' : '✨ IA'}
              </button>
            )}
          </div>
        </div>

        <div className="p-2 border-b bg-slate-50/90 backdrop-blur flex justify-between items-center shrink-0 px-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Painel de Proposições</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            {propositions.length} SEGMENTOS
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 relative pb-96" onClick={() => setActivePopup(null)}>
        {propositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
            <p>O texto segmentado aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-4 font-serif text-lg leading-relaxed">
            {propositions.map((prop) => (
              <div key={prop.id} className="flex gap-4 group border-b border-slate-200 pb-4 last:border-0">
                <span className="text-xs font-mono text-slate-400 w-6 pt-2 shrink-0 select-none">
                  {prop.id}
                </span>
                <div className="flex-1 text-slate-800">
                  {prop.connectiveMatch ? (
                    <span>
                      <span className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopup(activePopup === prop.id ? null : prop.id);
                          }}
                          className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0 rounded text-xs font-bold mr-2 align-middle cursor-help border border-indigo-200 transition-colors hover:bg-indigo-200"
                        >
                          {prop.connectiveMatch.word}
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                        
                        {activePopup === prop.id && (
                          <div 
                            className="absolute z-50 top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 ring-1 ring-slate-900/5 text-left font-sans"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="mb-3 border-b border-slate-100 pb-2">
                              <h3 className="text-xs font-bold uppercase tracking-tight text-slate-500">Relações Possíveis</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {prop.connectiveMatch.relations.map((rel, idx) => (
                                <div key={idx} className="mb-3 last:mb-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    <h4 className="text-xs font-bold uppercase tracking-tight text-slate-700">
                                      {rel.name} ({rel.id})
                                    </h4>
                                  </div>
                                  <div className="text-xs text-slate-500 font-bold mb-1 ml-3.5">
                                    {rel.category}
                                  </div>
                                  <div className="bg-slate-50 rounded p-2 ml-3.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Conjunção de Teste:</span>
                                    <p className="text-xs font-mono italic text-indigo-600 mt-0.5">"{rel.testConjunction}"</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </span>
                      {prop.text.substring(prop.connectiveMatch.word.length)}
                    </span>
                  ) : (
                    <span>{prop.text}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
