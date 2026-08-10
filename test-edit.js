const fs = require('fs');
let content = fs.readFileSync('src/components/ArcingBoard.tsx', 'utf-8');

const replacement = `  const handleBoundaryClick = (index: number) => {
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
              id: \`group-\${nodesToGroup[0].id}-\${nodesToGroup[nodesToGroup.length - 1].id}-\${Date.now()}\`,
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
  };`;

// Just checking if we can replace the old function.
// the old function goes from `  const handleBoundaryClick = (index: number) => {`
// to `        setSelectedBoundary(null);\n      }\n    }\n  };\n`

