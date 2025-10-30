import React, { forwardRef, useState, useEffect, useCallback } from 'react';

import { DirectedGraphVisualizationProps, DirectedGraphNode, DirectedGraphEdge } from '@/types';

import GraphNode from '../../shared/GraphNode';
import GraphEdge from '../../shared/GraphEdge';
import ZoomableContainer from '../../shared/ZoomableContainer';

const DirectedGraphDragDropVisualization = forwardRef<
  HTMLDivElement,
  DirectedGraphVisualizationProps
>(
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

    // Simple animation when isRunning is true (fallback) - show latest added node
    useEffect(() => {
      if (isRunning && !isAnimating && nodes.length > 0) {
        setIsAnimating(true);
        // Highlight the most recently added node (last in array)
        setHighlightedNodes([nodes[nodes.length - 1].value]);
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
            // Only follow outgoing edges for directed graph
            const outgoingEdges = edges.filter((edge) => edge.from === node.id);
            outgoingEdges.forEach((edge) => {
              const neighbor = nodes.find((n) => n.id === edge.to);
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
              // Only follow outgoing edges for directed graph
              const outgoingEdges = edges.filter((edge) => edge.from === node.id);
              outgoingEdges.forEach((edge) => {
                const neighbor = nodes.find((n) => n.id === edge.to);
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
      [nodes, edges],
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
      (node: DirectedGraphNode): React.ReactNode => {
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
            node={{
              ...node,
              neighbors: [...node.outgoingEdges, ...node.incomingEdges], // Convert to neighbors for compatibility
            }}
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

    // Render edge between two nodes (with arrow for directed)
    const renderEdge = useCallback(
      (edge: DirectedGraphEdge): React.ReactNode => {
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
        className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Directed Graph Visualization
          </h2>
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-500" />
              <span>Running...</span>
            </div>
          )}
        </div>

        {/* Current Step Display */}
        {currentStep && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Current Step:
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">{currentStep}</div>
          </div>
        )}

        {/* Graph Visualization */}
        <ZoomableContainer
          className="min-h-[400px] rounded-lg bg-gray-50 dark:bg-gray-900"
          minZoom={0.3}
          maxZoom={2}
          initialZoom={1}
          enablePan={true}
          enableWheelZoom={true}
          enableKeyboardZoom={true}
          showControls={true}
        >
          {nodes.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <div className="text-lg font-medium">Empty Graph</div>
                <div className="text-sm">ลาก operations มาสร้าง Graph</div>
              </div>
            </div>
          ) : (
            <div className="relative h-full min-h-[400px] w-full p-6">
              {/* Render edges first (behind nodes) */}
              {edges.map(renderEdge)}

              {/* Render nodes */}
              {nodes.map(renderNode)}
            </div>
          )}
        </ZoomableContainer>

        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats.vertices}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Vertices</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.edges}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Edges</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats.isStronglyConnected ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Strongly Connected</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {stats.hasCycle ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Has Cycle</div>
          </div>
        </div>

        {/* In/Out Degree Display */}
        {Object.keys(stats.inDegree).length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                In-Degree
              </div>
              <div className="space-y-1">
                {Object.entries(stats.inDegree).map(([nodeId, degree]) => {
                  const node = nodes.find((n) => n.id === nodeId);
                  return (
                    <div
                      key={nodeId}
                      className="flex justify-between text-xs text-gray-700 dark:text-gray-300"
                    >
                      <span>{node?.value || nodeId}:</span>
                      <span className="font-bold">{degree}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                Out-Degree
              </div>
              <div className="space-y-1">
                {Object.entries(stats.outDegree).map(([nodeId, degree]) => {
                  const node = nodes.find((n) => n.id === nodeId);
                  return (
                    <div
                      key={nodeId}
                      className="flex justify-between text-xs text-gray-700 dark:text-gray-300"
                    >
                      <span>{node?.value || nodeId}:</span>
                      <span className="font-bold">{degree}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Traversal Order Display */}
        {traversalOrder.length > 0 && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/30">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Traversal Order:
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              {traversalOrder.map((value, index) => (
                <span
                  key={index}
                  className={`mx-1 inline-block rounded px-2 py-1 transition-all duration-300 ${
                    isTraversing && index === traverseIndex
                      ? 'scale-110 bg-green-200 font-bold text-green-800 dark:bg-green-700 dark:text-green-100'
                      : index < traverseIndex
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
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
          <div className="mt-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/30">
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Shortest Path:
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              {shortestPath.join(' → ')}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full border border-green-400 bg-green-200 dark:border-green-500 dark:bg-green-700" />
            <span>Traversing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full border border-purple-400 bg-purple-200 dark:border-purple-500 dark:bg-purple-700" />
            <span>Shortest Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full border border-gray-600 bg-white dark:border-gray-400 dark:bg-gray-700" />
            <span>Normal Node</span>
          </div>
        </div>
      </div>
    );
  },
);

DirectedGraphDragDropVisualization.displayName = 'DirectedGraphDragDropVisualization';

export default DirectedGraphDragDropVisualization;
