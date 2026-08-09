import React from 'react';
import { SavedAnalysis } from '../types';
import { X, Trash2, Clock } from 'lucide-react';

interface SavedAnalysesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedAnalysis[];
  onLoad: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
}

export function SavedAnalysesModal({ isOpen, onClose, savedItems, onLoad, onDelete }: SavedAnalysesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">Análises Salvas</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {savedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Nenhuma análise salva ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{item.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onLoad(item)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-sm font-medium transition-colors"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
