import React, { forwardRef, useState, useEffect, useCallback } from 'react';

import {
  UndirectedGraphVisualizationProps,
  UndirectedGraphNode,
  UndirectedGraphEdge,
} from '@/types';

import GraphNode from '../../shared/GraphNode';
import GraphEdge from '../../shared/GraphEdge';

const UndirectedGraphVisualization = forwardRef<HTMLDivElement, UndirectedGraphVisualizationProps>(
  (
    {
      nodes,
      edges,
      stats,
      isRunning,
      currentStep,
      searchPath = [],
      shortestPath = [],
      currentOperation,
      selectedStep,
      currentOperationData,
    },
    ref,
  ) => {
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);
    const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>(
      {},
    );
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle operations animation
    useEffect(() => {
      if (
        isRunning &&
        currentOperation &&
        (currentOperation === 'add_vertex' ||
          currentOperation === 'add_edge' ||
          currentOperation === 'remove_vertex' ||
          currentOperation === 'remove_edge')
      ) {
        setIsAnimating(true);
        // Highlight the most recently added/modified node or edge
        if (currentOperationData) {
          if (currentOperation === 'add_vertex' || currentOperation === 'remove_vertex') {
            setHighlightedNodes([currentOperationData.value || '']);
          } else if (currentOperation === 'add_edge' || currentOperation === 'remove_edge') {
            setHighlightedEdges([String(currentOperationData.id || '')]);
          }
        }
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodes([]);
          setHighlightedEdges([]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, currentOperation, currentOperationData]);

    // Simple animation when isRunning is true (fallback)
    useEffect(() => {
      if (isRunning && !isAnimating && nodes.length > 0) {
        setIsAnimating(true);
        setHighlightedNodes([nodes[0].value]); // Highlight first node
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodes([]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, isAnimating, nodes]);

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

    // Generate traversal order based on current operation
    const generateTraversalOrder = useCallback(
      (startValue: string, type: string): string[] => {
        if (!startValue || nodes.length === 0) return [];

        const result: string[] = [];
        const visited = new Set<string>();

        const dfs = (nodeValue: string) => {
          if (visited.has(nodeValue)) return;

          visited.add(nodeValue);
          result.push(nodeValue);

          const node = nodes.find((n) => n.value === nodeValue);
          if (node) {
            node.neighbors.forEach((neighborId) => {
              const neighbor = nodes.find((n) => n.id === neighborId);
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

            const node = nodes.find((n) => n.value === currentValue);
            if (node) {
              node.neighbors.forEach((neighborId) => {
                const neighbor = nodes.find((n) => n.id === neighborId);
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
      [nodes],
    );

    // Handle traverse animation
    useEffect(() => {
      if (
        selectedStep !== null &&
        selectedStep !== undefined &&
        currentOperation &&
        (currentOperation.includes('traversal_dfs') || currentOperation.includes('traversal_bfs'))
      ) {
        // Extract start vertex from operation data or use first node
        const startVertex =
          currentOperationData?.startVertex || (nodes.length > 0 ? nodes[0].value : '');
        const order = generateTraversalOrder(startVertex, currentOperation);
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
    }, [
      selectedStep,
      currentOperation,
      nodes,
      generateTraversalOrder,
      currentOperationData?.startVertex,
    ]);

    const renderNode = useCallback(
      (node: UndirectedGraphNode): React.ReactNode => {
        const isHighlighted = highlightedNodes.includes(node.value);
        const isInSearchPath = searchPath.includes(node.value);

        // Check if this node should be animated during traversal
        const isTraverseSelected = Boolean(
          selectedStep !== null &&
            selectedStep !== undefined &&
            currentOperation &&
            (currentOperation.includes('traversal_dfs') ||
              currentOperation.includes('traversal_bfs')) &&
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
          <GraphNode
            key={node.id}
            node={node}
            isHighlighted={isHighlighted}
            isInSearchPath={isInSearchPath}
            isTraverseSelected={isTraverseSelected}
            isCurrentlyTraversing={isCurrentlyTraversing}
            isRunning={isRunning ?? false}
            isAnimating={isAnimating}
            onMouseDown={handleMouseDown}
            position={nodePositions[node.id]}
            isDragging={draggedNode === node.id}
          />
        );
      },
      [
        highlightedNodes,
        searchPath,
        selectedStep,
        currentOperation,
        isTraversing,
        traverseIndex,
        traversalOrder,
        isRunning,
        isAnimating,
        handleMouseDown,
        nodePositions,
        draggedNode,
      ],
    );

    // Render edge between two nodes
    const renderEdge = useCallback(
      (edge: UndirectedGraphEdge): React.ReactNode => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);

        if (!fromNode || !toNode) return null;

        const isHighlighted = highlightedEdges.includes(edge.id);

        // Use dragged positions if available, otherwise use original positions
        const fromPosition = nodePositions[fromNode.id] || { x: fromNode.x, y: fromNode.y };
        const toPosition = nodePositions[toNode.id] || { x: toNode.x, y: toNode.y };

        // Create nodes with updated positions for GraphEdge
        const fromNodeWithPosition = { ...fromNode, x: fromPosition.x, y: fromPosition.y };
        const toNodeWithPosition = { ...toNode, x: toPosition.x, y: toPosition.y };

        return (
          <GraphEdge
            key={edge.id}
            edge={edge}
            fromNode={fromNodeWithPosition}
            toNode={toNodeWithPosition}
            isHighlighted={isHighlighted}
          />
        );
      },
      [nodes, highlightedEdges, nodePositions],
    );

    return (
      <div
        ref={ref}
        className="rounded-lg bg-white p-6 shadow"
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

        {/* Current Step Display */}
        {currentStep && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3">
            <div className="text-sm font-medium text-blue-800">Current Step:</div>
            <div className="text-sm text-blue-700">{currentStep}</div>
          </div>
        )}

        {/* Graph Visualization */}
        <div className="relative mb-6 min-h-[400px] overflow-auto rounded-lg bg-gray-50">
          {nodes.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-lg font-medium">Empty Graph</div>
                <div className="text-sm">ลาก operations มาสร้าง Graph</div>
              </div>
            </div>
          ) : (
            <div className="relative h-full min-h-[400px] w-full">
              {/* Render edges first (behind nodes) */}
              {edges.map(renderEdge)}

              {/* Render nodes */}
              {nodes.map(renderNode)}
            </div>
          )}
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.vertices}</div>
            <div className="text-xs text-gray-600">Vertices</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.edges}</div>
            <div className="text-xs text-gray-600">Edges</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {stats.isConnected ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-gray-600">Connected</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.hasCycle ? 'Yes' : 'No'}</div>
            <div className="text-xs text-gray-600">Has Cycle</div>
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

        {/* Shortest Path Display */}
        {shortestPath.length > 0 && (
          <div className="mt-4 rounded-lg bg-purple-50 p-3">
            <div className="text-sm font-medium text-purple-800">Shortest Path:</div>
            <div className="text-sm text-purple-700">{shortestPath.join(' → ')}</div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full border border-green-400 bg-green-200" />
            <span>Traversing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full border border-purple-400 bg-purple-200" />
            <span>Shortest Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full border border-gray-600 bg-white" />
            <span>Normal Node</span>
          </div>
        </div>
      </div>
    );
  },
);

UndirectedGraphVisualization.displayName = 'UndirectedGraphVisualization';

export default UndirectedGraphVisualization;
