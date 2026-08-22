import React, { useState } from 'react';
import { SavedAnalysis } from '../types';
import { X, Trash2, Clock, AlertTriangle, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

interface SavedAnalysesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedAnalysis[];
  onLoad: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
  user: User | null;
  onLogin: () => void;
}

export function SavedAnalysesModal({ isOpen, onClose, savedItems, onLoad, onDelete, user, onLogin }: SavedAnalysesModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">Análises Salvas</h2>
          <button onClick={() => { setConfirmDeleteId(null); onClose(); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {!user ? (
            <div className="text-center py-12 text-slate-600 flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 opacity-80" />
              <h3 className="text-lg font-bold mb-2">Login Necessário</h3>
              <p className="mb-6 max-w-sm">
                Você precisa estar conectado com sua conta Google para ver ou salvar análises na nuvem.
              </p>
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-5 h-5" />
                Entrar com Google
              </button>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Nenhuma análise salva ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => !confirmDeleteId && onLoad(item)}
                  onMouseMove={(e) => {
                    if (item.text) {
                      const formattedText = item.text.replace(/\s*(\[\d+\])/g, '\n$1').trim();
                      setTooltip({
                        text: formattedText,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className={`flex flex-col gap-2 p-4 rounded-lg border transition-all ${confirmDeleteId === item.id ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md group cursor-pointer'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold truncate ${confirmDeleteId === item.id ? 'text-red-800' : 'text-slate-800'}`}>{item.title}</h3>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${confirmDeleteId === item.id ? 'text-red-600/70' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(item.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {confirmDeleteId === item.id ? (
                        <div className="flex gap-2 items-center">
                          <span className="text-xs font-semibold text-red-600 mr-2">Excluir?</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                            className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-sm font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); setConfirmDeleteId(null); }}
                            className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded text-sm font-medium transition-colors shadow-sm"
                          >
                            Excluir
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onLoad(item); }}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-sm font-medium transition-colors"
                          >
                            Carregar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
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
