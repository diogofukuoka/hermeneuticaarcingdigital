import React from 'react';
import { ArcNode } from '../types';

interface AITreePanelProps {
  tree: ArcNode;
  onClose: () => void;
}

export function AITreePanel({ tree, onClose }: AITreePanelProps) {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative overflow-hidden">
      <div className="p-2 border-b bg-white flex justify-between items-center shrink-0 px-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
          ✨ Visualização de Arcos (IA)
        </span>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-800 underline">
          Voltar para Desenho
        </button>
      </div>
      <div className="flex-1 overflow-auto p-8 flex items-start">
        <div className="flex bg-white p-6 shadow-sm rounded-xl border border-slate-200 min-w-max">
           <ArcNodeRenderer node={tree} />
        </div>
      </div>
    </div>
  );
}

function ArcNodeRenderer({ node }: { node: ArcNode }) {
  if (node.type === 'proposition') {
    return (
      <div className="flex items-center gap-2 p-2 min-w-[200px] max-w-[400px]">
        <span className="text-xs font-mono text-slate-400 font-bold shrink-0">{node.id}</span>
        <span className="text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">{node.text}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-row relative items-stretch">
      <div className="flex flex-col justify-around py-1 pr-4">
        {node.children?.map((child, i) => (
          <div key={i} className="flex relative">
            <ArcNodeRenderer node={child} />
          </div>
        ))}
      </div>
      <div className="flex flex-row items-center border-r-2 border-y-2 border-indigo-400 rounded-r-lg mr-2 my-2 relative opacity-80 min-w-[16px] shrink-0">
         <div className="absolute top-1/2 -translate-y-1/2 left-full pl-2 whitespace-nowrap">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex flex-col items-center">
              <span>{node.relationId}</span>
              {node.relationName && <span className="text-[8px] font-medium opacity-70">{node.relationName}</span>}
            </span>
         </div>
      </div>
      {/* Add spacing so the label doesn't overlap the next depth level */}
      <div className="w-24 shrink-0"></div>
    </div>
  );
}
