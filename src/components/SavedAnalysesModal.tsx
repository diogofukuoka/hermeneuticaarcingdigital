import React, { useState, useMemo } from 'react';
import { SavedAnalysis } from '../types';
import { X, Trash2, Clock, AlertTriangle, LogIn, Info, Search, Plus, Copy, CheckCircle2, ArrowUpDown, FileText, GitBranch, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';

interface SavedAnalysesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedAnalysis[];
  onLoad: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (item: SavedAnalysis) => void;
  onNew?: () => void;
  user: User | null;
  onLogin: () => void;
}

export function SavedAnalysesModal({ 
  isOpen, 
  onClose, 
  savedItems, 
  onLoad, 
  onDelete, 
  onDuplicate,
  onNew,
  user, 
  onLogin 
}: SavedAnalysesModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'oldest'>('recent');

  const filteredItems = useMemo(() => {
    let result = [...savedItems];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.text && item.text.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
    } else if (sortBy === 'az') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [savedItems, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[88vh] overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">Análises Salvas na Nuvem</h2>
            {user && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                {savedItems.length} {savedItems.length === 1 ? 'análise' : 'análises'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onNew && (
              <button 
                onClick={() => {
                  setConfirmDeleteId(null);
                  setTooltip(null);
                  onNew();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Análise</span>
              </button>
            )}
            <button 
              onClick={() => { setConfirmDeleteId(null); setTooltip(null); onClose(); }} 
              className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search & Sort Bar (only if user logged in and has items) */}
        {user && savedItems.length > 0 && (
          <div className="p-3 border-b bg-white flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por livro, versículo ou palavra-chave..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recent">Mais recentes</option>
                <option value="az">Ordem A - Z</option>
                <option value="oldest">Mais antigas</option>
              </select>
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
          {!user ? (
            <div className="text-center py-12 text-slate-600 flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 opacity-80" />
              <h3 className="text-lg font-bold mb-2">Login Necessário</h3>
              <p className="mb-6 max-w-sm text-sm text-slate-500">
                Você precisa estar conectado com sua conta Google para salvar e sincronizar infinitas análises de versículos na nuvem.
              </p>
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
              >
                <LogIn className="w-5 h-5" />
                Entrar com Google
              </button>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Nenhuma análise salva ainda</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Escolha uma passagem ou digite o texto bíblico, faça a diagramação e clique em "Salvar Nuvem".
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">Nenhuma análise encontrada para "{searchQuery}".</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-indigo-600 font-medium hover:underline"
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredItems.map(item => {
                const propCount = item.propositions?.length || 0;
                const arcCount = item.arcNodes?.length || 0;
                const hasAi = !!item.aiAnalysisText;

                return (
                  <div 
                    key={item.id} 
                    onClick={() => { setTooltip(null); if (!confirmDeleteId) onLoad(item); }}
                    className={`flex flex-col gap-2 p-3 sm:p-4 rounded-xl border transition-all ${
                      confirmDeleteId === item.id 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white group cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold text-sm sm:text-base truncate ${confirmDeleteId === item.id ? 'text-red-800' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                            {item.title}
                          </h3>
                          {item.text && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const formattedText = item.text.replace(/\s*(\[\d+\])/g, '\n$1').trim();
                                if (tooltip?.text === formattedText) {
                                  setTooltip(null);
                                } else {
                                  setTooltip({
                                    text: formattedText,
                                    x: e.clientX,
                                    y: e.clientY
                                  });
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors shrink-0"
                              title="Ver versículos formatados"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Badges / metadata */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <div className={`flex items-center gap-1 text-[11px] ${confirmDeleteId === item.id ? 'text-red-600/70' : 'text-slate-400'}`}>
                            <Clock className="w-3 h-3" />
                            {new Date(item.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </div>

                          {propCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <FileText className="w-2.5 h-2.5" />
                              {propCount} {propCount === 1 ? 'proposição' : 'proposições'}
                            </span>
                          )}

                          {arcCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                              <GitBranch className="w-2.5 h-2.5" />
                              {arcCount} {arcCount === 1 ? 'arco' : 'arcos'}
                            </span>
                          )}

                          {hasAi && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                              <Sparkles className="w-2.5 h-2.5" />
                              IA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 items-center shrink-0">
                        {confirmDeleteId === item.id ? (
                          <div className="flex gap-1.5 items-center">
                            <span className="text-xs font-semibold text-red-600 mr-1 hidden sm:inline">Excluir?</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              className="px-2.5 py-1 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete(item.id); setConfirmDeleteId(null); }}
                              className="px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-xs font-medium transition-colors shadow-sm"
                            >
                              Excluir
                            </button>
                          </div>
                        ) : (
                          <>
                            {onDuplicate && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  onDuplicate(item); 
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Duplicar como nova análise"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); onLoad(item); }}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Carregar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir da nuvem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        {user && savedItems.length > 0 && (
          <div className="px-4 py-2.5 border-t bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
            <span>
              Exibindo <strong>{filteredItems.length}</strong> de <strong>{savedItems.length}</strong> análises salvas
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Sincronizado na nuvem (Firestore)
            </span>
          </div>
        )}
      </div>
      
      {/* Floating biblical text tooltip */}
      {tooltip && (
        <div 
          className="fixed z-[200] max-w-sm w-max bg-slate-900 text-slate-100 text-xs p-3 rounded-lg shadow-2xl pointer-events-none border border-slate-700/50"
          style={{ 
            left: Math.min(tooltip.x + 16, window.innerWidth - 320), 
            top: Math.min(tooltip.y + 16, window.innerHeight - 150) 
          }}
        >
          <div className="line-clamp-[10] leading-relaxed whitespace-pre-wrap">{tooltip.text}</div>
        </div>
      )}
    </div>
  );
}
