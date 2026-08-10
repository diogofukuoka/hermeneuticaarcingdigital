/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArcingBoard } from './components/ArcingBoard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RelationsGuide } from './components/RelationsGuide';
import { SavedAnalysesModal } from './components/SavedAnalysesModal';
import { Proposition, parseText } from './utils/parser';
import { fetchBibleText } from './utils/api';
import { BookOpen, Save, FolderOpen, FilePlus2 } from 'lucide-react';
import { SavedAnalysis, ArcNodeData } from './types';
import { db } from './utils/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('Análise sem título');
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [arcNodes, setArcNodes] = useState<ArcNodeData[]>([]);
  const [savedItems, setSavedItems] = useState<SavedAnalysis[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Sync the list of saved analyses automatically from Firestore
  useEffect(() => {
    const colRef = collection(db, 'analyses');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items: SavedAnalysis[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || 'Sem título',
          text: data.text || '',
          propositions: data.propositions ? JSON.parse(data.propositions) : undefined,
          arcNodes: data.arcNodes ? JSON.parse(data.arcNodes) : undefined,
          updatedAt: data.updatedAt || 0
        });
      });
      // Sort by recently updated
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      setSavedItems(items);
    }, (error) => {
      console.error("Error fetching analyses:", error);
    });

    return () => unsubscribe();
  }, []);

  // Sync current active document if someone else edits it
  useEffect(() => {
    if (!currentId) return;
    const docRef = doc(db, 'analyses', currentId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.metadata.hasPendingWrites) return; // Ignore our own local updates
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.title !== undefined) setTitle(data.title);
        if (data.text !== undefined) {
          setText(data.text);
        }
        if (data.propositions !== undefined) {
          try {
            setPropositions(JSON.parse(data.propositions));
          } catch (e) {}
        } else if (data.text !== undefined) {
          setPropositions(parseText(data.text));
        }
        if (data.arcNodes !== undefined) {
          try {
            setArcNodes(JSON.parse(data.arcNodes));
          } catch (e) {}
        }
      }
    });
    return () => unsubscribe();
  }, [currentId]);

  const updateRemote = useCallback((updates: Partial<SavedAnalysis>, id: string | null = currentId) => {
    if (!id) return;
    const docRef = doc(db, 'analyses', id);
    setDoc(docRef, { ...updates, updatedAt: Date.now() }, { merge: true }).catch(console.error);
  }, [currentId]);

  const handleSetText = (val: string) => {
    setText(val);
    if (currentId) updateRemote({ text: val });
  };

  const handleSetArcNodes = (valOrFn: any) => {
    setArcNodes(prev => {
      const nextNodes = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      if (currentId) updateRemote({ arcNodes: JSON.stringify(nextNodes) } as any);
      return nextNodes;
    });
  };

  const handleSave = () => {
    if (!text.trim() && arcNodes.length === 0) return;
    
    let newTitle = title;
    if (newTitle === 'Análise sem título' && text.trim()) {
      newTitle = text.trim().split('\n')[0].substring(0, 50);
      if (newTitle.length === 50) newTitle += '...';
      setTitle(newTitle);
    }

    const idToSave = currentId || crypto.randomUUID();
    
    // Write to Firestore (creates or updates)
    const docRef = doc(db, 'analyses', idToSave);
    setDoc(docRef, {
      title: newTitle,
      text: text,
      propositions: JSON.stringify(propositions),
      arcNodes: JSON.stringify(arcNodes),
      updatedAt: Date.now()
    }, { merge: true }).then(() => {
      if (!currentId) {
        setCurrentId(idToSave);
        alert('Nova análise salva com sucesso!');
      }
    }).catch(console.error);
  };

  const handleLoad = (item: SavedAnalysis) => {
    setCurrentId(item.id);
    setTitle(item.title);
    setText(item.text || '');
    setArcNodes(item.arcNodes || []);
    setPropositions(item.propositions || parseText(item.text || ''));
    setIsSavedModalOpen(false);
    setTimeout(() => {
      document.getElementById('board-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'analyses', id));
      if (currentId === id) {
        handleNew();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleNew = () => {
    setCurrentId(null);
    setTitle('Análise sem título');
    setText('');
    setArcNodes([]);
    setPropositions([]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    let textToParse = text;
    let newTitle = title;
    
    // Check if it's a reference and fetch
    if (text.trim().length > 0 && text.length < 50) {
      const fetchedText = await fetchBibleText(text);
      if (fetchedText) {
        newTitle = text.trim();
        setTitle(newTitle);
        textToParse = fetchedText;
        setText(fetchedText); // Set without triggering immediate auto-save
        if (currentId) updateRemote({ text: fetchedText, title: newTitle });
      }
    } else if (text.trim().length > 0 && title === 'Análise sem título') {
      newTitle = text.trim().split('\n')[0].substring(0, 50);
      if (newTitle.length === 50) newTitle += '...';
      setTitle(newTitle);
      if (currentId) updateRemote({ title: newTitle });
    }
    
    let parsed: Proposition[] = [];
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse })
      });
      if (response.ok) {
        parsed = await response.json();
      } else if (response.status === 429) {
        alert("O limite de uso gratuito da API Gemini foi atingido. O aplicativo fará o parse localmente, o que pode ser menos preciso.");
        throw new Error("Quota exceeded");
      } else {
        throw new Error("API parsing failed");
      }
    } catch (e) {
      console.warn("Falling back to local parsing:", e);
      parsed = parseText(textToParse);
    }
    setPropositions(parsed);
    if (currentId) updateRemote({ text: textToParse, propositions: JSON.stringify(parsed) as any, title: newTitle });
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white">
            <span className="font-bold text-sm italic">A</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-800 uppercase text-xs hidden md:block">
            Hermenêutica Digital <span className="font-light opacity-50 ml-2">| Método Arcing</span>
          </h1>
          {title !== 'Análise sem título' && (
             <span className="md:ml-4 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded max-w-[200px] truncate">
               {title}
             </span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleNew}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            title="Nova Análise"
          >
            <FilePlus2 className="w-4 h-4" />
            <span className="hidden sm:inline">Nova</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{currentId ? 'Salvo Auto' : 'Salvar Nuvem'}</span>
          </button>
          <button 
            onClick={() => setIsSavedModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Salvos ({savedItems.length})</span>
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

      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Text Input Section */}
        <div className="bg-white border-b px-6 py-4 flex flex-col sm:flex-row gap-4 shrink-0 shadow-sm z-10">
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => handleSetText(e.target.value)}
              placeholder="Cole o texto bíblico ou digite uma referência (ex: Jo 3:16) e pressione Enter para quebrar linhas manualmente..."
              className="w-full h-16 p-3 text-sm border border-slate-200 rounded-lg bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-slate-700 leading-relaxed shadow-inner transition-all"
            />
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0 justify-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="bg-indigo-600 text-white px-6 py-2 text-sm rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center h-10"
            >
              {isAnalyzing ? 'Analisando...' : 'Analisar Texto'}
            </button>
            {text && (
              <button
                onClick={() => handleSetText('')}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-2 text-sm rounded-lg font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center h-10"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Board Section */}
        <div id="board-section" className="flex-1 overflow-y-auto bg-slate-50 relative">
          <ErrorBoundary>
            <ArcingBoard propositions={propositions} nodes={arcNodes} setNodes={handleSetArcNodes} />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="h-8 bg-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-400 shrink-0 hidden sm:flex z-50">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Nuvem Sincronizada Automática
          </span>
          <span>{currentId ? 'Editando análise salva' : 'Rascunho local'}</span>
        </div>
        <div className="flex gap-4">
          <span className="font-mono">UTC-3 | PROD_v1.0.6</span>
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
