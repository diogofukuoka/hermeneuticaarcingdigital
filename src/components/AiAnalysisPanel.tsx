import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Loader2, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Type,
  RotateCw,
  BookOpen
} from 'lucide-react';

interface AiAnalysisPanelProps {
  content: string | null;
  isLoading: boolean;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  passageTitle?: string;
  onRegenerate?: () => void;
}

export function AiAnalysisPanel({ 
  content, 
  isLoading, 
  onClose, 
  isMaximized = false, 
  onToggleMaximize,
  passageTitle,
  onRegenerate
}: AiAnalysisPanelProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'sm') return 'base';
      if (prev === 'base') return 'lg';
      return 'sm';
    });
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs sm:text-xs leading-normal';
      case 'lg':
        return 'text-base sm:text-lg leading-relaxed';
      case 'base':
      default:
        return 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-white border-l border-slate-200 overflow-hidden select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-200 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="font-semibold text-xs sm:text-sm text-indigo-950 truncate">
                Análise Exegética IA
              </h2>
              {passageTitle && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100/90 text-indigo-800 border border-indigo-200/60 truncate max-w-[160px] sm:max-w-[240px]">
                  {passageTitle}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block truncate">
              Segmentação proposicional, conectivos, árvore de arcos e homilética
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Regenerate / Refresh button */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              title={`Atualizar / Regenerar Análise Exegética IA para ${passageTitle || 'esta passagem'}`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="text-[10px] hidden md:inline">
                {content ? 'Atualizar IA' : 'Gerar IA'}
              </span>
            </button>
          )}

          {content && !isLoading && (
            <>
              {/* Font size toggle */}
              <button
                onClick={cycleFontSize}
                className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-md text-xs font-medium transition-colors"
                title={`Alterar tamanho da fonte (Atual: ${fontSize.toUpperCase()})`}
              >
                <Type className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">{fontSize}</span>
              </button>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-md text-xs font-medium transition-colors"
                title="Copiar análise completa"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Copiar</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Maximize / Restore */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className={`p-1.5 rounded-md transition-colors ${
                isMaximized 
                  ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' 
                  : 'text-slate-600 hover:text-indigo-700 hover:bg-slate-100'
              }`}
              title={isMaximized ? "Restaurar visão dividida" : "Maximizar análise (tela cheia)"}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Close */}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/80 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
              title="Fechar painel de análise"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Scrollable Content with total visibility and word-wrap adaptability */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 custom-scrollbar min-w-0 w-full bg-slate-50/30">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] h-full text-slate-500 space-y-3 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              A IA está processando a hermenêutica {passageTitle ? `de ${passageTitle}` : 'do texto'}...
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              Segmentando proposições, analisando conectivos, construindo a árvore de arcos recursiva e o esboço homilético.
            </p>
          </div>
        ) : !content ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] h-full text-slate-500 space-y-4 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="font-bold text-base text-slate-800">
                {passageTitle ? `Análise Exegética IA para ${passageTitle}` : 'Nenhuma Análise IA gerada para esta passagem'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clique no botão abaixo para gerar com o Gemini a segmentação exegética de proposições, conectivos sintáticos e a árvore de arcos com correspondência exata para esta passagem.
              </p>
            </div>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar Análise Exegética IA</span>
              </button>
            )}
          </div>
        ) : (
          <div className={`w-full min-w-0 break-words ${getFontSizeClass()} text-slate-800 space-y-3 max-w-none`}>
            {passageTitle && (
              <div className="mb-4 pb-2.5 border-b border-indigo-100 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60">
                  Referência: {passageTitle}
                </span>
                <span className="text-[11px] text-slate-400">
                  Método Arcing Hermenêutico
                </span>
              </div>
            )}
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-lg sm:text-xl font-bold text-indigo-950 mt-5 mb-2.5 pb-1.5 border-b border-indigo-200/70 break-words" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-base sm:text-lg font-bold text-indigo-900 mt-5 mb-2 pb-1 border-b border-indigo-100 break-words" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-sm sm:text-base font-semibold text-indigo-800 mt-4 mb-1.5 break-words" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-xs sm:text-sm font-semibold text-indigo-900 mt-3 mb-1 break-words uppercase tracking-wide" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="leading-relaxed text-slate-800 my-2.5 break-words" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 sm:pl-6 my-2 space-y-1.5 text-slate-800" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 sm:pl-6 my-2 space-y-1.5 text-slate-800" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed break-words text-slate-800" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-indigo-950" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic text-slate-800" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/70 pl-3.5 pr-3 py-2 my-3 rounded-r-lg text-indigo-950 italic text-xs sm:text-sm break-words shadow-xs" {...props} />
                ),
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className?.includes('language-');
                  if (isInline) {
                    return (
                      <code className="bg-indigo-50/90 text-indigo-800 px-1.5 py-0.5 rounded font-mono text-[11px] sm:text-xs font-semibold border border-indigo-200/60 break-words whitespace-pre-wrap" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block font-mono text-xs whitespace-pre-wrap break-words" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ node, ...props }) => (
                  <div className="w-full my-3 overflow-x-auto rounded-xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono shadow-sm border border-slate-800 custom-scrollbar">
                    <pre className="whitespace-pre-wrap break-words" {...props} />
                  </div>
                ),
                table: ({ node, ...props }) => (
                  <div className="w-full my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs divide-y divide-slate-200" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-slate-100/90 text-slate-800 font-semibold uppercase tracking-wider text-[11px]" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-800 whitespace-nowrap bg-slate-100 border-b border-slate-200" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-slate-100 bg-white" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-indigo-50/30 transition-colors" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-3 py-2 text-slate-700 align-top leading-normal break-words" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-5 border-slate-200" {...props} />
                ),
              }}
            >
              {content}
            </Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
