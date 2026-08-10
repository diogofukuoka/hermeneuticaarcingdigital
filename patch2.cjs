const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("strokes: JSON.stringify(strokes),", "strokes: JSON.stringify(strokes),\n      arcTree: arcTree ? JSON.stringify(arcTree) : null,");

code = code.replace("setStrokes(item.strokes || []);", "setStrokes(item.strokes || []);\n    if ((item as any).arcTree) {\n      try {\n        setArcTree(JSON.parse((item as any).arcTree));\n        setShowAIPanel(true);\n      } catch(e) {}\n    } else {\n      setArcTree(null);\n      setShowAIPanel(false);\n    }");

fs.writeFileSync('src/App.tsx', code);
