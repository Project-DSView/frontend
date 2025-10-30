'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';

import {
  RealtimeUndirectedGraphData,
  RealtimeUndirectedGraphNodeData,
  RealtimeUndirectedGraphEdgeData,
  UndirectedGraphRealtimeVisualizationProps,
} from '@/types';

import GraphNode from '../../shared/GraphNode';
import GraphEdge from '../../shared/GraphEdge';

const UndirectedGraphRealtimeVisualization = forwardRef<
  HTMLDivElement,
  UndirectedGraphRealtimeVisualizationProps
>(({ data, isExecuting, updateNodePosition, getNodePositions }, ref) => {
  const [traverseIndex, setTraverseIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>(
    {},
  );

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

        if (updateNodePosition) {
          updateNodePosition(draggedNode, x, y);
        }
        setNodePositions((prev) => ({
          ...prev,
          [draggedNode]: { x, y },
        }));
      }
    },
    [draggedNode, updateNodePosition],
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Generate traversal order based on current operation
  const generateTraversalOrder = useCallback(
    (startValue: string, type: string): string[] => {
      if (!startValue || data.nodes.length === 0) return [];

      const result: string[] = [];
      const visited = new Set<string>();

      const dfs = (nodeValue: string) => {
        if (visited.has(nodeValue)) return;

        visited.add(nodeValue);
        result.push(nodeValue);

        const node = data.nodes.find((n) => n.value === nodeValue);
        if (node) {
          node.neighbors.forEach((neighborId) => {
            const neighbor = data.nodes.find((n) => n.id === neighborId);
            if (neighbor && !visited.has(neighbor.value)) {
              dfs(neighbor.value);
            }
          });
        }
      };

      const bfs = (startValue: string) => {
        const queue: string[] = [startValue];
        visited.add(startValue);

        while (queue.length > 0) {
          const currentValue = queue.shift()!;
          result.push(currentValue);

          const node = data.nodes.find((n) => n.value === currentValue);
          if (node) {
            node.neighbors.forEach((neighborId) => {
              const neighbor = data.nodes.find((n) => n.id === neighborId);
              if (neighbor && !visited.has(neighbor.value)) {
                visited.add(neighbor.value);
                queue.push(neighbor.value);
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
    if (
      data.currentOperation &&
      (data.currentOperation.includes('traversal_dfs') ||
        data.currentOperation.includes('traversal_bfs'))
    ) {
      // Extract start vertex from operation data or use first node
      const startVertex = data.nodes.length > 0 ? data.nodes[0].value : '';
      const order = generateTraversalOrder(startVertex, data.currentOperation);
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
  }, [data.currentOperation, data.nodes, generateTraversalOrder]);

  const renderNode = useCallback(
    (node: RealtimeUndirectedGraphNodeData): React.ReactNode => {
      const isHighlighted = node.isHighlighted || false;

      // Check if this node should be animated during traversal
      const isTraverseSelected = Boolean(
        data.currentOperation &&
          (data.currentOperation.includes('traversal_dfs') ||
            data.currentOperation.includes('traversal_bfs')) &&
          isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      const isCurrentlyTraversing = Boolean(
        isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      // Use dragged positions if available, otherwise use original positions

      // Get position from service or local state
      const servicePositions = getNodePositions ? getNodePositions() : {};
      const position = servicePositions[node.id] ||
        nodePositions[node.id] || { x: node.x, y: node.y };

      return (
        <GraphNode
          key={node.id}
          node={node}
          isHighlighted={isHighlighted}
          isInSearchPath={false}
          isTraverseSelected={isTraverseSelected}
          isCurrentlyTraversing={isCurrentlyTraversing}
          isRunning={isExecuting}
          onMouseDown={handleMouseDown}
          position={position}
          isDragging={draggedNode === node.id}
        />
      );
    },
    [
      data.currentOperation,
      isTraversing,
      traverseIndex,
      traversalOrder,
      isExecuting,
      handleMouseDown,
      nodePositions,
      draggedNode,
      getNodePositions,
    ],
  );

  // Render edge between two nodes
  const renderEdge = useCallback(
    (edge: RealtimeUndirectedGraphEdgeData): React.ReactNode => {
      const fromNode = data.nodes.find((n) => n.id === edge.from);
      const toNode = data.nodes.find((n) => n.id === edge.to);

      if (!fromNode || !toNode) return null;

      // Use dragged positions if available, otherwise use original positions
      const servicePositions = getNodePositions ? getNodePositions() : {};
      const fromPosition = servicePositions[fromNode.id] ||
        nodePositions[fromNode.id] || { x: fromNode.x, y: fromNode.y };
      const toPosition = servicePositions[toNode.id] ||
        nodePositions[toNode.id] || { x: toNode.x, y: toNode.y };

      return (
        <GraphEdge
          key={edge.id}
          edge={edge}
          fromNode={{
            ...fromNode,
            x: fromPosition.x,
            y: fromPosition.y,
          }}
          toNode={{
            ...toNode,
            x: toPosition.x,
            y: toPosition.y,
          }}
          isHighlighted={false}
        />
      );
    },
    [data.nodes, nodePositions, getNodePositions],
  );

  // Check if we need to show multiple graphs
  const showMultipleGraphs = data.allGraphs && Object.keys(data.allGraphs).length > 0;

  type AllGraphs = NonNullable<RealtimeUndirectedGraphData['allGraphs']>;
  const allGraphsEntries = Object.entries((data.allGraphs ?? {}) as AllGraphs) as Array<
    [string, AllGraphs[string]]
  >;

  // Render a single graph with a title
  const renderSingleGraph = (graphData: RealtimeUndirectedGraphData, graphName: string) => {
    if (graphData.nodes.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-lg font-semibold">Graph is Empty</div>
            <div className="text-sm">Add vertices and edges using operations</div>
          </div>
        </div>
      );
    }

    const renderNodeLocal = (node: RealtimeUndirectedGraphNodeData): React.ReactNode => {
      const isHighlighted = node.isHighlighted || false;

      const isTraverseSelected = Boolean(
        data.currentOperation &&
          (data.currentOperation.includes('traversal_dfs') ||
            data.currentOperation.includes('traversal_bfs')) &&
          isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      const isCurrentlyTraversing = Boolean(
        isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      const servicePositions = getNodePositions ? getNodePositions() : {};
      const position = servicePositions[node.id] ||
        nodePositions[node.id] || { x: node.x, y: node.y };

      return (
        <GraphNode
          key={node.id}
          node={node}
          isHighlighted={isHighlighted}
          isInSearchPath={false}
          isTraverseSelected={isTraverseSelected}
          isCurrentlyTraversing={isCurrentlyTraversing}
          isRunning={isExecuting}
          onMouseDown={handleMouseDown}
          position={position}
          isDragging={draggedNode === node.id}
        />
      );
    };

    const renderEdgeLocal = (edge: RealtimeUndirectedGraphEdgeData): React.ReactNode => {
      const fromNode = graphData.nodes.find((n) => n.id === edge.from);
      const toNode = graphData.nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return null;

      const servicePositions = getNodePositions ? getNodePositions() : {};
      const fromPosition = servicePositions[fromNode.id] ||
        nodePositions[fromNode.id] || { x: fromNode.x, y: fromNode.y };
      const toPosition = servicePositions[toNode.id] ||
        nodePositions[toNode.id] || { x: toNode.x, y: toNode.y };

      return (
        <GraphEdge
          key={edge.id}
          edge={edge}
          fromNode={{
            ...fromNode,
            x: fromPosition.x,
            y: fromPosition.y,
          }}
          toNode={{
            ...toNode,
            x: toPosition.x,
            y: toPosition.y,
          }}
          isHighlighted={false}
        />
      );
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{graphName}</h3>
        <div className="relative min-h-[400px] overflow-auto rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex h-full min-h-[400px] items-center justify-center p-8">
            <div className="relative h-full min-h-[400px] w-full">
              {graphData.edges.map((edge) => renderEdgeLocal(edge))}
              {graphData.nodes.map(renderNodeLocal)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="mb-4 flex items-center justify-between">
        {isExecuting && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <span>Running...</span>
          </div>
        )}
      </div>

      {/* Error Display */}

      {showMultipleGraphs ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {allGraphsEntries
              .filter(([, g]) => g.vertices > 0)
              .map(([graphName, g]) => (
                <div
                  key={graphName}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  {renderSingleGraph(
                    {
                      ...data,
                      nodes: g.data.nodes,
                      edges: g.data.edges,
                      vertices: g.vertices,
                      edgeCount: g.edgeCount,
                      isConnected: g.isConnected,
                      hasCycle: g.hasCycle,
                    } as RealtimeUndirectedGraphData,
                    `Graph ${graphName}`,
                  )}

                  {/* Graph Information */}
                  <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                      Graph {graphName} Information
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Vertices:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{g.vertices}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Edges:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{g.edgeCount}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Connected:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
                          {g.isConnected ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Has Cycle:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
                          {g.hasCycle ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <>
          {/* Graph Visualization */}
          <div className="relative mb-6 min-h-[400px] overflow-auto rounded-lg bg-gray-50 dark:bg-gray-800">
            {data.nodes.length === 0 ? (
              <div className="flex h-96 items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <div className="text-lg font-medium">Empty Graph</div>
                  <div className="text-sm">เขียนโค้ดเพื่อสร้างกราฟ</div>
                </div>
              </div>
            ) : (
              <div className="relative h-full min-h-[400px] w-full">
                {data.edges.map(renderEdge)}
                {data.nodes.map(renderNode)}
              </div>
            )}
          </div>

          {/* Graph Information */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Graph myGraph Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Vertices:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{data.vertices}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Edges:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{data.edgeCount}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Connected:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {data.isConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Has Cycle:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {data.hasCycle ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Current Operation:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {data.currentOperation || 'None'}
                </span>
              </div>
              {data.currentTraversal && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Traversal Mode:
                  </span>
                  <span className="ml-2 text-gray-800 capitalize dark:text-gray-200">
                    {data.currentTraversal}
                  </span>
                </div>
              )}
            </div>

            {/* Traversal Results */}
            {data.traversalResults && (
              <div className="mt-3 space-y-2">
                {data.traversalResults.dfs && data.traversalResults.dfs.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      DFS Result:
                    </span>
                    <div className="mt-1 text-gray-800 dark:text-gray-200">
                      {data.traversalResults.dfs.join(' → ')}
                    </div>
                  </div>
                )}
                {data.traversalResults.bfs && data.traversalResults.bfs.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      BFS Result:
                    </span>
                    <div className="mt-1 text-gray-800 dark:text-gray-200">
                      {data.traversalResults.bfs.join(' → ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

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
    </div>
  );
});

UndirectedGraphRealtimeVisualization.displayName = 'UndirectedGraphRealtimeVisualization';

export default UndirectedGraphRealtimeVisualization;
