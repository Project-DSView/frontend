import React, { forwardRef, useMemo, useState, useEffect, memo, useCallback } from 'react';
import {
  StepthroughVisualizationProps,
  UndirectedGraphData,
  UndirectedGraphNode,
  UndirectedGraphEdge,
} from '@/types';

const UndirectedGraphStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<UndirectedGraphData>
>(({ steps, currentStepIndex, data, isRunning, error }, ref) => {
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  const [searchPath] = useState<string[]>([]);
  const [traverseIndex, setTraverseIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>(
    {},
  );

  // Extract current step information
  const currentStep = useMemo(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      return steps[currentStepIndex];
    }
    return null;
  }, [steps, currentStepIndex]);

  const currentMessage = useMemo(() => {
    return currentStep?.state?.message || '';
  }, [currentStep]);

  // Generate traversal order based on current step
  const generateTraversalOrder = useCallback(
    (startValue: string, type: string): string[] => {
      if (!startValue || data.nodes.length === 0) return [];

      const result: string[] = [];
      const visited = new Set<string>();

      const dfs = (vertex: string) => {
        if (visited.has(vertex)) return;
        visited.add(vertex);
        result.push(vertex);

        const node = data.nodes.find((n) => n.id === vertex);
        if (node) {
          node.neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor)) {
              dfs(neighbor);
            }
          });
        }
      };

      const bfs = (vertex: string) => {
        const queue: string[] = [vertex];
        visited.add(vertex);

        while (queue.length > 0) {
          const current = queue.shift()!;
          result.push(current);

          const node = data.nodes.find((n) => n.id === current);
          if (node) {
            node.neighbors.forEach((neighbor) => {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            });
          }
        }
      };

      switch (type) {
        case 'traversal_dfs':
          dfs(startValue);
          break;
        case 'traversal_bfs':
          bfs(startValue);
          break;
        default:
          return [];
      }

      return result;
    },
    [data.nodes],
  );

  // Handle traverse animation
  useEffect(() => {
    if (currentMessage.includes('BFS') || currentMessage.includes('DFS')) {
      // Extract start vertex from message or use first node
      const startVertex = data.nodes.length > 0 ? data.nodes[0].value : '';
      const operationType = currentMessage.includes('BFS') ? 'traversal_bfs' : 'traversal_dfs';
      const order = generateTraversalOrder(startVertex, operationType);
      setTraversalOrder(order);
      setIsTraversing(true);
      setTraverseIndex(0);

      // Start animation from first node
      const interval = setInterval(() => {
        setTraverseIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= order.length) {
            // Animation finished, stop traversing
            setIsTraversing(false);
            clearInterval(interval);
            return prev; // Keep at last node
          }
          return nextIndex;
        });
      }, 1000); // Move to next node every 1 second

      return () => clearInterval(interval);
    } else {
      // Reset when not traversing
      setIsTraversing(false);
      setTraverseIndex(0);
      setTraversalOrder([]);
    }
  }, [currentMessage, data.nodes, generateTraversalOrder]);

  // Handle operation-specific highlighting
  useEffect(() => {
    if (currentMessage.includes('add_vertex') || currentMessage.includes('Vertex')) {
      // Extract vertex name from message
      const vertexMatch = currentMessage.match(/'([^']+)'/);
      if (vertexMatch) {
        setHighlightedNodes([vertexMatch[1]]);
      }
    } else if (currentMessage.includes('add_edge') || currentMessage.includes('Edge')) {
      // Extract edge vertices from message
      const edgeMatch = currentMessage.match(/'([^']+)'.*?'([^']+)'/);
      if (edgeMatch) {
        setHighlightedNodes([edgeMatch[1], edgeMatch[2]]);
        setHighlightedEdges([`${edgeMatch[1]}-${edgeMatch[2]}`]);
      }
    } else if (currentMessage.includes('remove')) {
      setHighlightedNodes([]);
      setHighlightedEdges([]);
    } else {
      setHighlightedNodes([]);
      setHighlightedEdges([]);
    }
  }, [currentMessage]);

  // Handle drag events
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDraggedNode(nodeId);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggedNode) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodePositions((prev) => ({
          ...prev,
          [draggedNode]: { x, y },
        }));
      }
    },
    [draggedNode],
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Memoized node component
  const NodeComponent = memo<{
    node: UndirectedGraphNode;
    isHighlighted: boolean;
    isInSearchPath: boolean;
    isTraverseSelected: boolean;
    isCurrentlyTraversing: boolean;
    isRunning: boolean;
    onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  }>(
    ({
      node,
      isHighlighted,
      isInSearchPath,
      isTraverseSelected,
      isCurrentlyTraversing,
      isRunning,
      onMouseDown,
    }) => {
      const position = nodePositions[node.id] || { x: node.x, y: node.y };

      return (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transform cursor-move"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseDown={(e) => onMouseDown(e, node.id)}
        >
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500 ${
              isHighlighted
                ? 'scale-110 border-yellow-400 bg-yellow-200 text-yellow-800 shadow-lg'
                : isInSearchPath
                  ? 'scale-105 border-blue-400 bg-blue-200 text-blue-800 shadow-md'
                  : isTraverseSelected || isCurrentlyTraversing
                    ? 'scale-110 border-green-400 bg-green-200 text-green-800 shadow-lg'
                    : 'border-gray-600 bg-white text-gray-800 hover:shadow-md'
            } ${isRunning ? 'animate-pulse' : ''} ${draggedNode === node.id ? 'z-10' : ''}`}
          >
            {node.value}
            {isHighlighted && (
              <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-yellow-400" />
            )}
            {(isTraverseSelected || isCurrentlyTraversing) && (
              <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-green-400" />
            )}
          </div>
        </div>
      );
    },
  );

  NodeComponent.displayName = 'NodeComponent';

  const renderNode = useCallback(
    (node: UndirectedGraphNode): React.ReactNode => {
      const isHighlighted = highlightedNodes.includes(node.value);
      const isInSearchPath = searchPath.includes(node.value);

      // Check if this node should be animated during traversal
      const isTraverseSelected = Boolean(
        isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      const isCurrentlyTraversing = Boolean(
        isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      return (
        <NodeComponent
          key={node.id}
          node={node}
          isHighlighted={isHighlighted}
          isInSearchPath={isInSearchPath}
          isTraverseSelected={isTraverseSelected}
          isCurrentlyTraversing={isCurrentlyTraversing}
          isRunning={isRunning ?? false}
          onMouseDown={handleMouseDown}
        />
      );
    },
    [
      highlightedNodes,
      searchPath,
      isTraversing,
      traverseIndex,
      traversalOrder,
      isRunning,
      NodeComponent,
      handleMouseDown,
    ],
  );

  const renderEdge = useCallback(
    (edge: UndirectedGraphEdge): React.ReactNode => {
      const fromNode = data.nodes.find((n) => n.id === edge.from);
      const toNode = data.nodes.find((n) => n.id === edge.to);

      if (!fromNode || !toNode) return null;

      const isHighlighted =
        highlightedEdges.includes(edge.id) || highlightedEdges.includes(`${edge.to}-${edge.from}`);

      // Use dragged positions if available, otherwise use original positions
      const fromPosition = nodePositions[fromNode.id] || { x: fromNode.x, y: fromNode.y };
      const toPosition = nodePositions[toNode.id] || { x: toNode.x, y: toNode.y };

      // Calculate edge position
      const deltaX = toPosition.x - fromPosition.x;
      const deltaY = toPosition.y - fromPosition.y;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      return (
        <div
          key={edge.id}
          className="pointer-events-none absolute"
          style={{
            left: `${fromPosition.x}px`,
            top: `${fromPosition.y}px`,
            width: `${length}px`,
            height: '2px',
            backgroundColor: isHighlighted ? '#f59e0b' : '#374151',
            transformOrigin: '0 50%',
            transform: `rotate(${angle}deg)`,
            transition: 'all 0.3s ease',
          }}
        />
      );
    },
    [data.nodes, highlightedEdges, nodePositions],
  );

  return (
    <div
      ref={ref}
      className="rounded-lg bg-white p-6 shadow"
      suppressHydrationWarning
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Undirected Graph Visualization</h2>
        {isRunning && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <span>Running...</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <h3 className="text-xs font-medium text-red-800">Error</h3>
              <div className="mt-1 text-xs text-red-700">
                <p className="font-mono whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Step Info */}
      {currentStep && !error && (
        <div className="bg-info/10 mb-4 rounded-lg p-3">
          <div className="text-info/90 text-sm font-medium">
            Step {currentStep.stepNumber}: {currentStep.state.message}
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="relative mb-6 min-h-[400px] overflow-auto rounded-lg bg-gray-50">
        {data.nodes.length > 0 ? (
          <div className="relative h-full min-h-[400px] w-full">
            {/* Render edges first (behind nodes) */}
            {data.edges.map(renderEdge)}

            {/* Render nodes */}
            {data.nodes.map(renderNode)}
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-lg font-medium">Empty Graph</div>
              <div className="text-sm">Run your code to see graph visualization</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">{data.nodes.length}</div>
          <div className="text-xs text-gray-600">Vertices</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">{data.edges.length}</div>
          <div className="text-xs text-gray-600">Edges</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {data.nodes.length === 0 ? 'Yes' : 'No'}
          </div>
          <div className="text-xs text-gray-600">Empty</div>
        </div>
      </div>

      {/* Traversal Order Display */}
      {traversalOrder.length > 0 && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <div className="text-sm font-medium text-green-800">Traversal Order:</div>
          <div className="text-sm text-green-700">
            {traversalOrder.map((value, index) => (
              <span
                key={index}
                className={`mx-1 inline-block rounded px-2 py-1 transition-all duration-300 ${
                  isTraversing && index === traverseIndex
                    ? 'scale-110 bg-green-200 font-bold text-green-800'
                    : index < traverseIndex
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-yellow-400 bg-yellow-200" />
          <span>Highlighted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-green-400 bg-green-200" />
          <span>Traversing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-gray-600 bg-white" />
          <span>Normal Node</span>
        </div>
      </div>
    </div>
  );
});

UndirectedGraphStepthroughVisualization.displayName = 'UndirectedGraphStepthroughVisualization';

export default UndirectedGraphStepthroughVisualization;
