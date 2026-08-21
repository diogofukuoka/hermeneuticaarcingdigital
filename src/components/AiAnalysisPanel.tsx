import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Sparkles, X } from 'lucide-react';

interface AiAnalysisPanelProps {
  content: string | null;
  isLoading: boolean;
  onClose?: () => void;
}

export function AiAnalysisPanel({ content, isLoading, onClose }: AiAnalysisPanelProps) {
  if (content === null && !isLoading) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-indigo-50/50 shrink-0">
        <div className="flex items-center gap-2 text-indigo-700">
          <Sparkles className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Análise Exegética IA</h2>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">A IA está processando a hermenêutica do texto...</p>
          </div>
        ) : (
          <div className="markdown-body prose prose-sm prose-slate max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600 prose-table:min-w-full overflow-x-auto">
            <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
