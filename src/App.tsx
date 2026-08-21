/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArcingBoard } from './components/ArcingBoard';
import { bibleBooks } from './utils/bible';
import { NumberPicker } from './components/NumberPicker';
import { bibleBooks as _ignore } from './utils/bible';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RelationsGuide } from './components/RelationsGuide';
import { SavedAnalysesModal } from './components/SavedAnalysesModal';
import { AiAnalysisPanel } from './components/AiAnalysisPanel';
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
  const [selectedBook, setSelectedBook] = useState('Gênesis');
  const [selectedChapter, setSelectedChapter] = useState('1');
  const [selectedStartVerse, setSelectedStartVerse] = useState('');
  const [selectedEndVerse, setSelectedEndVerse] = useState('');
  const [savedItems, setSavedItems] = useState<SavedAnalysis[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);
  const [isAnalyzingFull, setIsAnalyzingFull] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(850);
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 350 && newWidth < window.innerWidth - 300) {
        setAiPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  const [activePicker, setActivePicker] = useState<'chapter' | 'startVerse' | 'endVerse' | null>(null);
  
  const chapterBtnRef = React.useRef<HTMLButtonElement>(null);
  const startVerseBtnRef = React.useRef<HTMLButtonElement>(null);
  const endVerseBtnRef = React.useRef<HTMLButtonElement>(null);
  
  const currentBookData = bibleBooks.find(b => b.name === selectedBook);
  const maxChapters = currentBookData?.chapters || 150;
  const maxVerses = 176; // Psalm 119 has 176 verses


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
          aiAnalysisText: data.aiAnalysisText,
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

  const handleSetPropositions = (valOrFn: any) => {
    setPropositions(prev => {
      const nextProps = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      if (currentId) updateRemote({ propositions: JSON.stringify(nextProps) } as any);
      return nextProps;
    });
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
      aiAnalysisText: aiAnalysisText,
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
    if (item.aiAnalysisText) {
      setAiAnalysisText(item.aiAnalysisText);
      setShowAiPanel(true);
    } else {
      setAiAnalysisText(null);
      setShowAiPanel(false);
    }
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
    setAiAnalysisText(null);
    setShowAiPanel(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    const refString = `${selectedBook} ${selectedChapter}${selectedStartVerse ? ':' + selectedStartVerse : ''}${selectedStartVerse && selectedEndVerse && selectedEndVerse !== selectedStartVerse ? '-' + selectedEndVerse : ''}`;
    
    let textToParse = text;
    let newTitle = title;
    
    const fetchedText = await fetchBibleText(refString);
    if (fetchedText) {
      newTitle = refString;
      setTitle(newTitle);
      textToParse = fetchedText;
      setText(fetchedText); 
      if (currentId) updateRemote({ text: fetchedText, title: newTitle });
    } else {
      alert("Referência não encontrada. Verifique se o livro, capítulo e versículos estão corretos.");
      setIsAnalyzing(false);
      return;
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
    
    // Async call for Full Analysis
    setAiAnalysisText(null);
    setIsAnalyzingFull(true);
    setShowAiPanel(true);
    
    fetch('/api/full-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToParse })
    })
    .then(async res => {
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      setAiAnalysisText(""); // clear and get ready for chunks
      setIsAnalyzingFull(false); // remove the loading spinner immediately
      
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (currentId) updateRemote({ aiAnalysisText: fullText });
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setAiAnalysisText(prev => (prev || "") + chunk);
      }
    })
    .catch(err => {
      console.error("Failed to fetch full analysis:", err);
      setAiAnalysisText("Erro ao processar análise avançada com a IA.");
      setIsAnalyzingFull(false);
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg shadow-sm flex items-center justify-center text-white ring-1 ring-indigo-900/10">
            <span className="font-serif font-bold text-[22px] leading-none drop-shadow-sm pb-0.5">ב</span>
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
        <div className="bg-white border-b px-4 py-3 flex flex-col sm:flex-row items-center gap-3 shrink-0 shadow-sm z-10 text-sm">
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 font-medium"
            >
              {bibleBooks.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Cap:</span>
              <button
                ref={chapterBtnRef}
                onClick={() => setActivePicker('chapter')}
                className="w-12 h-8 px-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center transition-colors"
              >
                {selectedChapter || '-'}
              </button>
              {activePicker === 'chapter' && (
                <NumberPicker 
                  title="Selecionar Capítulo"
                  value={selectedChapter}
                  onChange={setSelectedChapter}
                  max={maxChapters}
                  anchorEl={chapterBtnRef.current}
                  onClose={() => setActivePicker(null)}
                />
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium ml-2">Vers:</span>
              <button
                ref={startVerseBtnRef}
                onClick={() => setActivePicker('startVerse')}
                className="w-12 h-8 px-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center transition-colors"
              >
                {selectedStartVerse || '-'}
              </button>
              {activePicker === 'startVerse' && (
                <NumberPicker 
                  title="Versículo Inicial"
                  value={selectedStartVerse}
                  onChange={setSelectedStartVerse}
                  max={maxVerses}
                  allowEmpty
                  anchorEl={startVerseBtnRef.current}
                  onClose={() => setActivePicker(null)}
                />
              )}
              <span className="text-slate-400">-</span>
              <button
                ref={endVerseBtnRef}
                onClick={() => setActivePicker('endVerse')}
                className="w-12 h-8 px-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center transition-colors"
              >
                {selectedEndVerse || '-'}
              </button>
              {activePicker === 'endVerse' && (
                <NumberPicker 
                  title="Versículo Final"
                  value={selectedEndVerse}
                  onChange={setSelectedEndVerse}
                  max={maxVerses}
                  allowEmpty
                  anchorEl={endVerseBtnRef.current}
                  onClose={() => setActivePicker(null)}
                />
              )}
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedChapter}
              className="bg-indigo-600 text-white px-5 py-1.5 text-sm rounded-lg font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center whitespace-nowrap"
            >
              {isAnalyzing ? 'Carregando...' : 'Carregar e Analisar'}
            </button>
            {propositions.length > 0 && (
              <button
                onClick={() => {
                  setPropositions([]);
                  setArcNodes([]);
                  handleSetText('');
                  setSelectedBook('Gênesis');
                  setSelectedChapter('1');
                  setSelectedStartVerse('');
                  setSelectedEndVerse('');
                  setShowAiPanel(false);
                  setAiAnalysisText(null);
                }}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 text-sm rounded-lg font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex-1 sm:flex-none flex items-center justify-center whitespace-nowrap"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Board Section */}
        <div id="board-section" className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50 relative overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 relative">
            <ErrorBoundary>
              <ArcingBoard propositions={propositions} setPropositions={handleSetPropositions} nodes={arcNodes} setNodes={handleSetArcNodes} />
            </ErrorBoundary>
          </div>
          {showAiPanel && (propositions.length > 0 || isAnalyzingFull) && (
            <div 
              className="w-full h-1/2 lg:h-full border-t lg:border-t-0 lg:border-l border-slate-200 bg-white shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-40 relative flex flex-col"
              style={{ '--ai-panel-w': `${aiPanelWidth}px` } as React.CSSProperties}
            >
              <style>{ `@media (min-width: 1024px) { .ai-panel-dynamic { width: var(--ai-panel-w); } }` }</style>
              <div className="ai-panel-dynamic flex-1 h-full flex flex-col w-full min-w-0">
                {/* Drag Handle */}
                <div 
                  className="hidden lg:block absolute left-0 top-0 bottom-0 w-3 -ml-1.5 cursor-col-resize hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors z-50"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    isDragging.current = true;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                  }}
                />
                <AiAnalysisPanel 
                  content={aiAnalysisText} 
                  isLoading={isAnalyzingFull} 
                  onClose={() => setShowAiPanel(false)}
                />
              </div>
            </div>
          )}
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
