const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add ArcNode and AITreePanel imports
code = code.replace("import { CanvasPanel } from './components/CanvasPanel';", "import { CanvasPanel } from './components/CanvasPanel';\nimport { AITreePanel } from './components/AITreePanel';\nimport { ArcNode } from './types';");

// Add arcTree and showAIPanel state
code = code.replace("const [currentId, setCurrentId] = useState<string | null>(null);", "const [currentId, setCurrentId] = useState<string | null>(null);\n  const [arcTree, setArcTree] = useState<ArcNode | null>(null);\n  const [showAIPanel, setShowAIPanel] = useState(false);");

// Update handleNew
code = code.replace("setPropositions([]);", "setPropositions([]);\n    setArcTree(null);\n    setShowAIPanel(false);");

// Update handleAnalyze signature and logic
code = code.replace("const handleAnalyze = async () => {", "const handleAnalyze = async (useAI: boolean = false) => {");

// Update analyze logic for API call and states
const oldAnalyzeTry = `    let parsed: Proposition[] = [];
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse })
      });
      if (response.ok) {
        parsed = await response.json();
      } else {
        throw new Error("API parsing failed");
      }
    } catch (e) {
      console.warn("Falling back to local parsing:", e);
      parsed = parseText(textToParse);
    }
    setPropositions(parsed);
    setIsAnalyzing(false);`;

const newAnalyzeTry = `    let parsed: Proposition[] = [];
    try {
      const response = await fetch(useAI ? '/api/parse' : '/api/parse', { // Assuming useAI changes behavior if needed, currently both hit /api/parse which returns propositions and tree
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse })
      });
      if (response.ok) {
        const data = await response.json();
        // Check if data is array (old format) or object (new format)
        if (Array.isArray(data)) {
           parsed = data;
        } else if (data.propositions) {
           parsed = data.propositions;
           if (useAI && data.tree) {
             setArcTree(data.tree);
             setShowAIPanel(true);
           }
        }
      } else {
        throw new Error("API parsing failed");
      }
    } catch (e) {
      console.warn("Falling back to local parsing:", e);
      parsed = parseText(textToParse);
    }
    setPropositions(parsed);
    setIsAnalyzing(false);`;

code = code.replace(oldAnalyzeTry, newAnalyzeTry);

// Update section in render
const oldCanvasSection = `<section className="w-full sm:w-1/2 bg-white flex flex-col relative shrink-0">
              <CanvasPanel strokes={strokes} setStrokes={handleSetStrokes} />
            </section>`;

const newCanvasSection = `<section className="w-full sm:w-1/2 bg-white flex flex-col relative shrink-0">
              {showAIPanel && arcTree ? (
                <AITreePanel tree={arcTree} onClose={() => setShowAIPanel(false)} />
              ) : (
                <CanvasPanel strokes={strokes} setStrokes={handleSetStrokes} />
              )}
            </section>`;

code = code.replace(oldCanvasSection, newCanvasSection);

fs.writeFileSync('src/App.tsx', code);
