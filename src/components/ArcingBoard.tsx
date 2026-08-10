import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Proposition } from '../utils/parser';
import { ArcNodeData } from '../types';
import { Plus, Trash2, SplitSquareHorizontal, ChevronDown, X } from 'lucide-react';
import { relations } from '../utils/relations';
import { HintPopup } from './HintPopup';

const groupedRelations = relations.reduce((acc, rel) => {
  if (!acc[rel.category]) acc[rel.category] = [];
  acc[rel.category].push(rel);
  return acc;
}, {} as Record<string, typeof relations[0][]>);

function ConnectivePopup({ connectiveMatch, anchorEl }: { connectiveMatch: any, anchorEl: HTMLElement | null }) {
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
      className="fixed z-[100] w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-left font-normal cursor-default flex flex-col gap-3"
      style={{ top: coords.top, left: coords.left }}
      onClick={e => e.stopPropagation()}
    >
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relações Possíveis</div>
      <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {connectiveMatch.relations.map((apiRel: any) => {
          const r = relations.find(fullRel => fullRel.id === apiRel.id) || apiRel;
          return (
            <div key={r.id} className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                 <span className="font-bold text-slate-700 text-sm">{r.name}</span>
                 <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded font-bold">{r.id}</span>
              </div>
              {r.description && (
                <div className="text-xs text-slate-500 leading-relaxed">{r.description}</div>
              )}
              {r.connectives && (
                <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                   <span className="font-semibold text-slate-500">Conectivos:</span> {r.connectives.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}

function RelationPicker({ onSelect, onClose }: { onSelect: (id: string) => void, onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('400px');

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - 20;
      setMaxHeight(`${Math.max(200, availableHeight)}px`);
    }
  }, []);

  return (
    <div 
      ref={ref}
      className="absolute left-full top-0 ml-4 z-[100] w-80 bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden"
      style={{ maxHeight }}
      onClick={e => e.stopPropagation()}
    >
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Selecione a Relação</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="overflow-y-auto p-2">
        {Object.entries(groupedRelations).map(([category, rels]) => (
          <div key={category} className="mb-4 last:mb-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2">
              {category}
            </div>
            <div className="flex flex-col gap-0.5">
              {rels.map(rel => (
                <button
                  key={rel.id}
                  onClick={() => onSelect(rel.id)}
                  className="text-left px-2 py-2 hover:bg-indigo-50 rounded-md group flex items-start gap-3 transition-colors"
                >
                  <span className="font-bold text-indigo-600 text-xs w-10 shrink-0 mt-0.5">{rel.id}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-800">{rel.name}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{rel.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ArcingBoardProps {
  propositions: Proposition[];
  nodes: ArcNodeData[];
  setNodes: React.Dispatch<React.SetStateAction<ArcNodeData[]>>;
}

const getNodeDepth = (node: ArcNodeData): number => {
  if (node.type === 'leaf') return 0;
  if (!node.children || node.children.length === 0) return 1;
  return Math.max(...node.children.map(getNodeDepth)) + 1;
};

const ArcNodeComponent: React.FC<{ 
  node: ArcNodeData, 
  onUngroup: (id:string)=>void, 
  onRelationChange: (id:string, rel:string)=>void,
  activePopup: string | null,
  setActivePopup: (id: string | null) => void,
  leafWidth: number,
  propositions: Proposition[],
  selectedBoundary: number | null,
  onBoundaryClick: (index: number) => void
}> = ({ 
  node, 
  onUngroup, 
  onRelationChange,
  activePopup,
  setActivePopup,
  leafWidth,
  propositions,
  selectedBoundary,
  onBoundaryClick
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const connectiveRef = useRef<HTMLSpanElement>(null);

  const isPopupActiveInSubtree = (n: ArcNodeData): boolean => {
    if (activePopup === n.id || activePopup === `conn-${n.proposition?.id}` || activePopup === `hint-${n.proposition?.id}`) return true;
    if (n.children) {
      return n.children.some(child => isPopupActiveInSubtree(child));
    }
    return false;
  };
  const hasActivePopup = isPopupActiveInSubtree(node);
  
  if (node.type === 'leaf') {
    const prop = node.proposition;
    if (!prop) return null;
    const propIndex = propositions.findIndex(p => p.id === prop.id);
    const isLast = propIndex === propositions.length - 1;
    return (
      <div className={`flex items-stretch -mb-px ${hasActivePopup ? 'relative z-50' : ''}`}>
        <div 
          ref={anchorRef}
          onClick={(e) => {
            e.stopPropagation();
            setActivePopup(activePopup === `hint-${prop.id}` ? null : `hint-${prop.id}`);
          }}
          className={`relative border border-slate-200 bg-white p-3 flex items-start shrink-0 transition-all duration-300 cursor-pointer hover:bg-slate-50 ${activePopup === 'conn-' + prop.id || activePopup === 'hint-' + prop.id ? 'z-50 ring-2 ring-indigo-500/20' : 'z-10'}`}
          style={{ width: leafWidth }}
        >
          {activePopup === `hint-${prop.id}` && (
            <HintPopup
              hint={prop.hint || (prop.connectiveMatch ? `Dica: A palavra '${prop.connectiveMatch.word}' geralmente introduz a relação de ${prop.connectiveMatch.relations[0]?.name}.` : '')}
              anchorEl={anchorRef.current}
              onClose={() => setActivePopup(null)}
            />
          )}
          <span className="text-xs font-mono font-bold text-amber-500 mr-3 mt-0.5 shrink-0 select-none">
            {prop.id}
          </span>
          <div className="text-slate-700 font-sans text-sm leading-relaxed flex-1">
            {prop.connectiveMatch ? (
              (() => {
                const word = prop.connectiveMatch.word;
                const idx = prop.connectiveMatch.index !== undefined 
                              ? prop.connectiveMatch.index 
                              : prop.text.toLowerCase().indexOf(word.toLowerCase());
                if (idx === -1) return <span>{prop.text}</span>;
                
                const before = prop.text.substring(0, idx);
                const exactWord = prop.text.substring(idx, idx + word.length);
                const after = prop.text.substring(idx + word.length);
                
                return (
                  <span>
                    {before}
                    <span 
                      ref={connectiveRef}
                      className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5 cursor-pointer relative transition-colors hover:bg-indigo-100"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActivePopup(activePopup === `conn-${prop.id}` ? null : `conn-${prop.id}`); 
                      }}
                    >
                      {exactWord}
                      
                      {activePopup === `conn-${prop.id}` && (
                        <ConnectivePopup 
                          connectiveMatch={prop.connectiveMatch} 
                          anchorEl={connectiveRef.current} 
                        />
                      )}
                    </span>
                    {after}
                  </span>
                );
              })()
            ) : (
              <span>{prop.text}</span>
            )}
          </div>
          
          {/* Top Boundary Circle */}
          <button
            onClick={(e) => { e.stopPropagation(); onBoundaryClick(propIndex); }}
            className={`absolute -top-[6px] w-[13px] h-[13px] rounded-full border-[2.5px] bg-white z-30 transition-all cursor-pointer hover:scale-125
              ${selectedBoundary === propIndex ? 'border-indigo-600 scale-125 shadow-md' : 'border-slate-800'}`}
            style={{ right: -6.5 }}
            title="Selecionar ponto para agrupar"
          />
          
          {/* Bottom Boundary Circle (only for last proposition) */}
          {isLast && (
            <button
              onClick={(e) => { e.stopPropagation(); onBoundaryClick(propIndex + 1); }}
              className={`absolute -bottom-[6px] w-[13px] h-[13px] rounded-full border-[2.5px] bg-white z-30 transition-all cursor-pointer hover:scale-125
                ${selectedBoundary === propIndex + 1 ? 'border-indigo-600 scale-125 shadow-md' : 'border-slate-800'}`}
              style={{ right: -6.5 }}
              title="Selecionar ponto para agrupar"
            />
          )}
        </div>
      </div>
    );
  }

  const childDepth = node.children && node.children.length > 0 
    ? Math.max(...node.children.map(getNodeDepth)) 
    : 0;
  const extraWidth = childDepth * 40;

  // Group node
  return (
    <div className={`flex items-stretch -mb-px relative group/arc ${hasActivePopup ? 'z-50' : ''}`}>
      <div className="flex items-stretch relative shrink-0">
        <div className="flex flex-col items-stretch justify-center relative w-full gap-1">
          {node.children?.map((child) => (
            <ArcNodeComponent 
              key={child.id} 
              node={child} 
              onUngroup={onUngroup} 
              onRelationChange={onRelationChange} 
              activePopup={activePopup}
              setActivePopup={setActivePopup}
              leafWidth={leafWidth}
              propositions={propositions}
              selectedBoundary={selectedBoundary}
              onBoundaryClick={onBoundaryClick}
            />
          ))}
        </div>
        
        {/* The Arc Graphic */}
        <div className="relative flex flex-col justify-center items-center w-[40px] shrink-0 group/arc-graphic">
          {/* SVG Arc spanning the height */}
          <div 
            className="absolute inset-y-0 flex items-center"
            style={{ left: -extraWidth, width: extraWidth + 40 }}
          >
             <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path 
                  d="M 0 0 C 133.3 0, 133.3 100, 0 100" 
                  fill="none" 
                  stroke="#94a3b8" 
                  strokeWidth="1.5" 
                  vectorEffect="non-scaling-stroke" 
                />
             </svg>
          </div>
          
          {/* Relation Circle(s) */}
          <div ref={anchorRef} className="relative z-10 flex flex-col items-center justify-center gap-2 translate-x-1/2">
            {node.relation ? (() => {
               const relData = relations.find(r => r.id === node.relation);
               return (
                 <div className="relative group/rel-btn">
                   <button
                     onClick={(e) => { e.stopPropagation(); setActivePopup(node.id); }}
                     className="bg-white border-2 border-slate-300 text-[10px] font-bold text-slate-700 min-w-[32px] h-8 px-1.5 rounded-full flex items-center justify-center shadow-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors whitespace-nowrap"
                   >
                     {node.relation}
                   </button>
                   {relData && (
                     <div className="absolute z-50 top-1/2 left-full ml-2 -translate-y-1/2 w-56 bg-slate-800 text-white p-3 rounded-lg shadow-xl text-xs opacity-0 invisible group-hover/rel-btn:opacity-100 group-hover/rel-btn:visible transition-all pointer-events-none text-left font-sans">
                       <div className="font-bold text-[11px] uppercase tracking-wider text-amber-400 mb-1">{relData.name}</div>
                       <div className="text-slate-200 leading-relaxed">{relData.description}</div>
                       <div className="absolute top-1/2 right-full -mt-[5px] border-[5px] border-transparent border-r-slate-800"></div>
                     </div>
                   )}
                 </div>
               );
            })() : (
               <button
                 onClick={(e) => { e.stopPropagation(); setActivePopup(node.id); }}
                 className="bg-white border-2 border-slate-300 text-slate-400 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:border-indigo-400 hover:text-indigo-600 border-dashed transition-colors"
                 title="Adicionar relação"
               >
                 <Plus className="w-3 h-3" />
               </button>
            )}
            
            {activePopup === node.id && (
               <RelationPicker 
                 onSelect={(relId) => { onRelationChange(node.id, relId); setActivePopup(null); }}
                 onClose={() => setActivePopup(null)}
               />
            )}
          </div>
          
          <button 
             onClick={() => onUngroup(node.id)}
             className="absolute -bottom-2 opacity-0 group-hover/arc-graphic:opacity-100 transition-opacity text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded p-1 shadow-sm z-20"
             title="Desagrupar"
           >
             <SplitSquareHorizontal className="w-3 h-3" />
           </button>
        </div>
      </div>
    </div>
  );
}

export function ArcingBoard({ propositions, nodes, setNodes }: ArcingBoardProps) {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [leafWidth, setLeafWidth] = useState<number>(400);
  const [selectedBoundary, setSelectedBoundary] = useState<number | null>(null);

  useEffect(() => {
    if (propositions.length === 0) return;
    
    // Use a short timeout to let the DOM render the invisible elements
    const timer = setTimeout(() => {
      let maxWidth = 300;
      propositions.forEach(p => {
        const el = document.getElementById(`measure-${p.id}`);
        if (el) {
          maxWidth = Math.max(maxWidth, el.getBoundingClientRect().width);
        }
      });
      setLeafWidth(Math.min(800, Math.ceil(maxWidth) + 16)); // max 800px width, add a small buffer
    }, 50);
    return () => clearTimeout(timer);
  }, [propositions]);

  useEffect(() => {
    // Only reset if we don't have nodes or the proposition count changed drastically
    // For a robust app, we'd persist the arc tree and map it to new propositions.
    if (nodes.length === 0 || propositions.length !== getLeafCount(nodes)) {
      setNodes(propositions.map(p => ({
        id: p.id,
        type: 'leaf',
        proposition: p
      })));
    }
  }, [propositions]);

  const getLeafCount = (list: ArcNodeData[]): number => {
    let count = 0;
    for (const n of list) {
      if (n.type === 'leaf') count++;
      else if (n.children) count += getLeafCount(n.children);
    }
    return count;
  };

  const handleBoundaryClick = (index: number) => {
    if (selectedBoundary === null) {
      setSelectedBoundary(index);
    } else {
      if (selectedBoundary === index) {
        setSelectedBoundary(null); // Deselect
      } else {
        const startIdx = Math.min(selectedBoundary, index);
        const endIdx = Math.max(selectedBoundary, index);
        
        const attemptGroup = (nodesList: ArcNodeData[], startB: number, endB: number, currentOffset: number): { success: boolean, nodes: ArcNodeData[] } => {
          let currentPropIdx = currentOffset;
          let startIndexInNodes = -1;
          let endIndexInNodes = -1;

          for (let i = 0; i < nodesList.length; i++) {
            const node = nodesList[i];
            const leafCount = getLeafCount([node]);
            
            if (currentPropIdx === startB) {
              startIndexInNodes = i;
            }
            
            const isExactMatch = (currentPropIdx === startB && currentPropIdx + leafCount === endB);
            const isInside = (currentPropIdx <= startB && currentPropIdx + leafCount >= endB);
            
            if (isInside && !isExactMatch) {
              if (node.type === 'group' && node.children) {
                const result = attemptGroup(node.children, startB, endB, currentPropIdx);
                if (result.success) {
                  const newNodes = [...nodesList];
                  newNodes[i] = { ...node, children: result.nodes };
                  return { success: true, nodes: newNodes };
                }
              }
            }

            currentPropIdx += leafCount;
            
            if (currentPropIdx === endB) {
              endIndexInNodes = i;
            }
          }

          if (startIndexInNodes !== -1 && endIndexInNodes !== -1 && endIndexInNodes >= startIndexInNodes) {
            const newNodes = [...nodesList];
            const nodesToGroup = newNodes.slice(startIndexInNodes, endIndexInNodes + 1);
            const grouped: ArcNodeData = {
              id: `group-${nodesToGroup[0].id}-${nodesToGroup[nodesToGroup.length - 1].id}-${Date.now()}`,
              type: 'group',
              children: nodesToGroup,
              relation: ''
            };
            newNodes.splice(startIndexInNodes, endIndexInNodes - startIndexInNodes + 1, grouped);
            return { success: true, nodes: newNodes };
          }

          return { success: false, nodes: nodesList };
        };

        setNodes(prev => {
          const result = attemptGroup(prev, startIdx, endIdx, 0);
          if (result.success) {
            return result.nodes;
          } else {
            console.warn("Invalid grouping range (arcs cannot cross)");
            return prev;
          }
        });
        
        setSelectedBoundary(null);
      }
    }
  };

  const handleUngroup = (nodeId: string) => {
    const ungroupList = (list: ArcNodeData[]): ArcNodeData[] => {
      let result: ArcNodeData[] = [];
      for (const node of list) {
        if (node.id === nodeId && node.type === 'group' && node.children) {
          result.push(...node.children);
        } else if (node.type === 'group' && node.children) {
          result.push({
            ...node,
            children: ungroupList(node.children)
          });
        } else {
          result.push(node);
        }
      }
      return result;
    };
    setNodes(prev => ungroupList(prev));
  };
  
  const handleRelationChange = (nodeId: string, rel: string) => {
    const updateRel = (list: ArcNodeData[]): ArcNodeData[] => {
      return list.map(n => {
        if (n.id === nodeId) return { ...n, relation: rel };
        if (n.type === 'group' && n.children) return { ...n, children: updateRel(n.children) };
        return n;
      });
    };
    setNodes(prev => updateRel(prev));
  };

  return (
    <div className="flex flex-col flex-1 relative overflow-auto bg-slate-100">
      {/* Invisible measurer to determine optimal leaf width */}
      <div className="absolute top-0 left-0 invisible pointer-events-none opacity-0 z-[-1] overflow-hidden h-0 flex flex-col">
        {propositions.map(p => (
          <div key={p.id} id={`measure-${p.id}`} className="inline-flex items-start p-3 text-sm font-sans w-max whitespace-nowrap">
            <span className="text-xs font-mono font-bold text-amber-500 mr-3 mt-0.5 shrink-0 select-none">{p.id}</span>
            <div className="text-slate-700 font-sans text-sm leading-relaxed">
              <span>{p.text}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky top-0 z-40 p-4 border-b bg-slate-50/90 backdrop-blur shrink-0 flex justify-between items-center shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quadro de Arcos</span>
        {nodes.length > 0 && (
          <span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
            {nodes.length} Blocos Restantes
          </span>
        )}
      </div>
      
      <div className={`flex-1 p-8 min-w-max pb-64 ${selectedBoundary !== null ? 'cursor-crosshair' : ''}`} onClick={() => setActivePopup(null)}>
        {nodes.length === 0 ? (
           <div className="text-slate-400 text-sm text-center mt-20">
             Segmentos aparecerão aqui para serem arqueados.
           </div>
        ) : (
           <div className="flex flex-col items-start gap-1 relative w-max pr-8">
             {/* Vertical line connecting boundaries */}
             <div 
               className="absolute top-0 bottom-0 w-px bg-slate-200 z-0" 
               style={{ left: leafWidth }}
             ></div>
             {nodes.map((node, i) => {
               const isPopupActiveInSubtree = (n: ArcNodeData): boolean => {
                 if (activePopup === n.id || activePopup === `conn-${n.proposition?.id}`) return true;
                 if (n.children) {
                   return n.children.some(child => isPopupActiveInSubtree(child));
                 }
                 return false;
               };
               const hasActivePopup = isPopupActiveInSubtree(node);
               return (
               <div key={node.id} className={`relative flex group/node ${hasActivePopup ? 'z-50' : 'z-10'}`}>
                 <ArcNodeComponent 
                   node={node} 
                   onUngroup={handleUngroup}
                   onRelationChange={handleRelationChange}
                   activePopup={activePopup}
                   setActivePopup={setActivePopup}
                   leafWidth={leafWidth}
                   propositions={propositions}
                   selectedBoundary={selectedBoundary}
                   onBoundaryClick={handleBoundaryClick}
                 />
               </div>
             )})}
           </div>
        )}
      </div>
    </div>
  );
}
