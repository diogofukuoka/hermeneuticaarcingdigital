import React, { useRef, useEffect, useState } from 'react';
import { Undo2, Trash2, Pen } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export function CanvasPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  const [color, setColor] = useState<string>('#0f172a');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = [
    { name: 'Preto', value: '#0f172a' },
    { name: 'Azul', value: '#4f46e5' },
    { name: 'Vermelho', value: '#dc2626' }
  ];

  const widths = [
    { name: 'Fino', value: 2 },
    { name: 'Médio', value: 4 },
    { name: 'Grosso', value: 8 }
  ];

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Only resize if the dimensions actually changed to avoid clearing the canvas unnecessarily
    if (canvas.width === Math.floor(rect.width * dpr) && canvas.height === Math.floor(rect.height * dpr)) {
      return;
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    redrawAll();
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    observer.observe(container);
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    redrawAll();
  }, [strokes, currentStroke]);

  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    const drawStroke = (stroke: Stroke) => {
      if (stroke.points.length === 0) return;
      
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    };

    strokes.forEach(drawStroke);
    if (currentStroke) {
      drawStroke(currentStroke);
    }
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 1
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.target.setPointerCapture(e.pointerId);
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStroke({
      points: [coords],
      color,
      width: lineWidth
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, coords]
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.target.releasePointerCapture(e.pointerId);
    setIsDrawing(false);
    
    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (window.confirm('Limpar o quadro inteiro?')) {
      setStrokes([]);
    }
  };

  const cycleLineWidth = () => {
    const currentIndex = widths.findIndex(w => w.value === lineWidth);
    const nextIndex = (currentIndex + 1) % widths.length;
    setLineWidth(widths[nextIndex].value);
  };

  return (
    <div className="relative w-full flex-1 min-h-full bg-white flex flex-col">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
      
      <div className="sticky top-0 p-4 border-b bg-slate-50/90 backdrop-blur flex justify-between items-center z-30 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quadro de Arcos (Stylus Canvas)</span>
        <div className="flex gap-1">
          {colors.map(c => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-3.5 h-3.5 rounded-full border-2 shadow-sm transition-transform ${color === c.value ? 'border-white scale-125 ring-1 ring-slate-400' : 'border-white hover:scale-110'}`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 relative cursor-crosshair" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full touch-none z-10"
        />
      </div>

      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-slate-200 flex flex-col gap-2">
          <button 
            onClick={handleUndo} 
            disabled={strokes.length === 0} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors" 
            title="Desfazer"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          
          <div className="h-px bg-slate-200 mx-2"></div>
          
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Pen className="w-5 h-5" />
          </div>
          
          <button 
            onClick={cycleLineWidth}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 font-bold text-xs"
            title="Espessura"
          >
            {lineWidth}px
          </button>
          
          <div className="h-px bg-slate-200 mx-2"></div>
          
          <button 
            onClick={handleClear} 
            disabled={strokes.length === 0} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 text-red-600 disabled:opacity-50 transition-colors" 
            title="Limpar Quadro"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
