import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NumberPickerProps {
  value: string;
  onChange: (val: string) => void;
  max: number;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  title: string;
  allowEmpty?: boolean;
}

export function NumberPicker({ value, onChange, max, anchorEl, onClose, title, allowEmpty }: NumberPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl) {
      const anchorRect = anchorEl.getBoundingClientRect();
      let top = anchorRect.bottom + 8;
      // Keep it inside screen
      if (top + 300 > window.innerHeight) {
        top = anchorRect.top - 308; // 300 is rough height
      }
      setCoords({ top, left: anchorRect.left });
    }
  }, [anchorEl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onClose]);

  if (!anchorEl || coords.top === 0) return null;

  const numbers = Array.from({ length: max }, (_, i) => i + 1);

  return createPortal(
    <div 
      ref={ref}
      className="fixed z-[150] w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3 flex flex-col"
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {allowEmpty && (
          <button 
            onClick={() => { onChange(''); onClose(); }}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors"
          >
            Limpar
          </button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
        {numbers.map(num => (
          <button
            key={num}
            onClick={() => { onChange(num.toString()); onClose(); }}
            className={`aspect-square flex items-center justify-center text-xs font-medium rounded-md transition-colors ${
              value === num.toString() 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
