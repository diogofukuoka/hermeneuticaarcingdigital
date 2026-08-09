import React, { useState } from 'react';
import { X, BookOpen, Search } from 'lucide-react';
import { relations } from '../utils/relations';

interface RelationsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RelationsGuide({ isOpen, onClose }: RelationsGuideProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Group relations by category
  const categories = Array.from(new Set(relations.map(r => r.category)));

  const filteredCategories = categories.map(category => {
    return {
      name: category,
      items: relations.filter(r => 
        r.category === category && 
        (r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         r.connectives.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
         r.id.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    };
  }).filter(c => c.items.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Guia de Relações Lógicas</h2>
              <p className="text-xs text-slate-500">Consulta de conectivos e conjunções do Método Arcing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b bg-white shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por relação, sigla ou conectivo (ex: porque, Inferência, Inf)..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhuma relação encontrada para "{searchTerm}".
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map(category => (
                <div key={category.name} className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map(rel => (
                      <div key={rel.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
                              {rel.id}
                            </span>
                            <h4 className="font-semibold text-slate-800">{rel.name}</h4>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          {rel.description}
                        </p>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Conjunção Teste</span>
                            <span className="inline-block bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-medium border border-emerald-200">
                              {rel.testConjunction}
                            </span>
                          </div>
                          
                          <div>
                            <span className="block text-xs font-semibold text-slate-400 uppercase mb-1">Conectivos Comuns</span>
                            <div className="flex flex-wrap gap-1.5">
                              {rel.connectives.map(c => (
                                <span key={c} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
