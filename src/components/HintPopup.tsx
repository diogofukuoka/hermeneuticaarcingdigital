import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface HintPopupProps {
  hint: string;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function HintPopup({ hint, anchorEl, onClose }: HintPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl) {
      const anchorRect = anchorEl.getBoundingClientRect();
      setCoords({ top: anchorRect.bottom + 8, left: anchorRect.left });
    }
  }, [anchorEl]);

  if (!anchorEl || coords.top === 0) return null;

  return createPortal(
    <div 
      ref={ref}
      className="fixed z-[100] w-80 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col"
      style={{ top: coords.top, left: coords.left }}
      onClick={e => e.stopPropagation()}
    >
      <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-indigo-700">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Dica de Arqueamento</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-indigo-100 rounded text-indigo-500 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
        {hint || "Nenhuma dica disponível para esta proposição."}
      </div>
    </div>,
    document.body
  );
}
