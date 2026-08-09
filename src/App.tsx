/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TextPanel } from './components/TextPanel';
import { CanvasPanel } from './components/CanvasPanel';
import { RelationsGuide } from './components/RelationsGuide';
import { SavedAnalysesModal } from './components/SavedAnalysesModal';
import { Proposition, parseText } from './utils/parser';
import { fetchBibleText } from './utils/api';
import { BookOpen, Save, FolderOpen } from 'lucide-react';
import { Stroke, SavedAnalysis } from './types';

export default function App() {
  const [text, setText] = useState('');
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [savedItems, setSavedItems] = useState<SavedAnalysis[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hermeneutica_saved_analyses');
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved items', e);
      }
    }
  }, []);

  const saveToLocalStorage = (items: SavedAnalysis[]) => {
    setSavedItems(items);
    localStorage.setItem('hermeneutica_saved_analyses', JSON.stringify(items));
  };

  const handleSave = () => {
    if (!text.trim() && strokes.length === 0) return;
    
    let title = 'Análise sem título';
    if (text.trim()) {
      title = text.trim().split('\n')[0].substring(0, 50);
      if (title.length === 50) title += '...';
    }

    const newItem: SavedAnalysis = {
      id: currentId || crypto.randomUUID(),
      title,
      text,
      strokes,
      updatedAt: Date.now(),
    };

    let newItems;
    if (currentId) {
      newItems = savedItems.map(item => item.id === currentId ? newItem : item);
    } else {
      newItems = [newItem, ...savedItems];
      setCurrentId(newItem.id);
    }
    
    saveToLocalStorage(newItems);
    alert('Análise salva com sucesso!');
  };

  const handleLoad = (item: SavedAnalysis) => {
    setText(item.text);
    setStrokes(item.strokes);
    setCurrentId(item.id);
    setPropositions(parseText(item.text));
    setIsSavedModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta análise salva?')) {
      saveToLocalStorage(savedItems.filter(item => item.id !== id));
      if (currentId === id) {
        setCurrentId(null);
      }
    }
  };

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
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
          <button 
            onClick={() => setIsSavedModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Salvos</span>
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guia de Relações</span>
          </button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="flex sm:flex-row flex-col relative w-full items-stretch min-h-full">
            <section className="w-full sm:w-1/2 border-r bg-white flex flex-col shrink-0">
              <TextPanel
                text={text}
                setText={setText}
                propositions={propositions}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            </section>
            <section className="w-full sm:w-1/2 bg-white flex flex-col relative shrink-0">
              <CanvasPanel strokes={strokes} setStrokes={setStrokes} />
            </section>
          </div>
        </div>
      </main>
      <footer className="h-8 bg-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-400 shrink-0 hidden sm:flex z-50">
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
      
      <RelationsGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <SavedAnalysesModal 
        isOpen={isSavedModalOpen} 
        onClose={() => setIsSavedModalOpen(false)} 
        savedItems={savedItems}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />
    </div>
  );
}


