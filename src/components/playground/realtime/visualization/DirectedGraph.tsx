'use client';

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import {
  RealtimeDirectedGraphData,
  RealtimeDirectedGraphNodeData,
  RealtimeDirectedGraphEdgeData,
  DirectedGraphRealtimeProps,
  GraphData,
} from '@/types';
import GraphNode from '../../shared/GraphNode';
import GraphEdge from '../../shared/GraphEdge';
import ZoomableContainer from '../../shared/ZoomableContainer';

const DirectedGraphRealtimeVisualization = forwardRef<HTMLDivElement, DirectedGraphRealtimeProps>(
  (
    { data, isExecuting = false, error, securityStatus, updateNodePosition, getNodePositions },
    ref,
  ) => {
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>(
      {},
    );
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);
    const [traversalOrder, setTraversalOrder] = useState<string[]>([]);

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

          const node = data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.value === nodeValue);
          if (node) {
            // Only follow outgoing edges for directed graph
            const outgoingEdges = data.edges.filter(
              (edge: RealtimeDirectedGraphEdgeData) => edge.from === node.id,
            );
            outgoingEdges.forEach((edge: RealtimeDirectedGraphEdgeData) => {
              const neighbor = data.nodes.find(
                (n: RealtimeDirectedGraphNodeData) => n.id === edge.to,
              );
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

            const node = data.nodes.find(
              (n: RealtimeDirectedGraphNodeData) => n.value === currentValue,
            );
            if (node) {
              // Only follow outgoing edges for directed graph
              const outgoingEdges = data.edges.filter(
                (edge: RealtimeDirectedGraphEdgeData) => edge.from === node.id,
              );
              outgoingEdges.forEach((edge: RealtimeDirectedGraphEdgeData) => {
                const neighbor = data.nodes.find(
                  (n: RealtimeDirectedGraphNodeData) => n.id === edge.to,
                );
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
      [data.nodes, data.edges],
    );

    // Handle traverse animation
    useEffect(() => {
      if (
        data.currentOperation &&
        (data.currentOperation.includes('traversal_dfs') ||
          data.currentOperation.includes('traversal_bfs'))
      ) {
        // Extract start vertex from traversal results or use first node
        const startVertex =
          data.traversalResults?.dfs?.[0] ||
          data.traversalResults?.bfs?.[0] ||
          (data.nodes.length > 0 ? data.nodes[0].value : '');
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
    }, [data.currentOperation, data.traversalResults, data.nodes, generateTraversalOrder]);

    // Check if we need to show multiple graphs
    const showMultipleGraphs = data.allGraphs && Object.keys(data.allGraphs).length > 0;

    // Render a single graph
    const renderSingleGraph = (graphData: RealtimeDirectedGraphData, graphName: string) => {
      if (graphData.nodes.length === 0) {
        return (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-lg font-semibold">Graph is Empty</div>
              <div className="text-sm">Add vertices and edges using operations</div>
            </div>
          </div>
        );
      }

      const renderNode = (node: RealtimeDirectedGraphNodeData): React.ReactNode => {
        const isHighlighted = node.isHighlighted || false;
        const isInSearchPath = data.shortestPath?.includes(node.value) || false;

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
            node={{
              ...node,
              neighbors: [...node.outgoingEdges, ...node.incomingEdges], // Convert to neighbors for compatibility
            }}
            isHighlighted={isHighlighted}
            isInSearchPath={isInSearchPath}
            isTraverseSelected={isTraverseSelected}
            isCurrentlyTraversing={isCurrentlyTraversing}
            isRunning={isExecuting || false}
            onMouseDown={handleMouseDown}
            position={position}
            isDragging={draggedNode === node.id}
          />
        );
      };

      // Render edge between two nodes (with arrow for directed)
      const renderEdge = (edge: RealtimeDirectedGraphEdgeData): React.ReactNode => {
        const fromNode = graphData.nodes.find(
          (n: RealtimeDirectedGraphNodeData) => n.id === edge.from,
        );
        const toNode = graphData.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === edge.to);

        if (!fromNode || !toNode) return null;

        const isHighlighted =
          data.shortestPath?.includes(fromNode.value) &&
          data.shortestPath?.includes(toNode.value) &&
          data.shortestPath?.indexOf(fromNode.value) ===
            data.shortestPath?.indexOf(toNode.value) - 1;

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
            isHighlighted={isHighlighted || false}
            allEdges={graphData.edges}
          />
        );
      };

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">{graphName}</h3>
          <ZoomableContainer 
            className="min-h-[400px] rounded-lg bg-gray-50" 
            minZoom={0.3} 
            maxZoom={2}
            initialZoom={1}
            enablePan={true}
            enableWheelZoom={true}
            enableKeyboardZoom={true}
            showControls={true}
          >
            <div className="flex h-full min-h-[400px] items-center justify-center p-8">
              <div className="relative h-full min-h-[400px] w-full">
                {/* Render edges first (behind nodes) */}
                {graphData.edges.map((edge: RealtimeDirectedGraphEdgeData) => renderEdge(edge))}

                {/* Render nodes */}
                {graphData.nodes.map(renderNode)}
              </div>
            </div>
          </ZoomableContainer>
        </div>
      );
    };

    // Error display
    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      );
    }

    // Security violations
    if (!securityStatus.isSafe) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold">Security Violations</div>
            <div className="text-sm">
              {securityStatus.violations.map((violation: string, index: number) => (
                <div key={index}>{violation}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="h-full w-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {showMultipleGraphs ? (
          <div className="space-y-6">
            <div className="grid gap-6">
              {data.allGraphs &&
                Object.entries(data.allGraphs)
                  .filter(([, graphData]) => (graphData as GraphData).vertices > 0)
                  .map(([graphName, graphData]) => (
                    <div key={graphName} className="rounded-lg border bg-white p-4">
                      {renderSingleGraph(
                        {
                          ...data,
                          nodes: (graphData as GraphData).data.nodes,
                          edges: (graphData as GraphData).data.edges,
                          vertices: (graphData as GraphData).vertices,
                          edgeCount: (graphData as GraphData).edgeCount,
                          isStronglyConnected: (graphData as GraphData).isStronglyConnected,
                          hasCycle: (graphData as GraphData).hasCycle,
                          inDegree: (graphData as GraphData).inDegree,
                          outDegree: (graphData as GraphData).outDegree,
                        },
                        `Graph ${graphName}`,
                      )}

                      {/* Graph Information */}
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <h5 className="mb-2 font-medium text-gray-700">
                          Graph {graphName} Information
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Vertices:</span>
                            <span className="ml-2 text-gray-800">
                              {(graphData as GraphData).vertices}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Edges:</span>
                            <span className="ml-2 text-gray-800">
                              {(graphData as GraphData).edgeCount}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Strongly Connected:</span>
                            <span className="ml-2 text-gray-800">
                              {(graphData as GraphData).isStronglyConnected ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Has Cycle:</span>
                            <span className="ml-2 text-gray-800">
                              {(graphData as GraphData).hasCycle ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSingleGraph(data, 'Directed Graph')}

            {/* Graph Information */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold text-gray-700">Graph Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Vertices:</span>
                  <span className="ml-2 text-gray-800">{data.vertices}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Edges:</span>
                  <span className="ml-2 text-gray-800">{data.edgeCount}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Strongly Connected:</span>
                  <span className="ml-2 text-gray-800">
                    {data.isStronglyConnected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Has Cycle:</span>
                  <span className="ml-2 text-gray-800">{data.hasCycle ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Operation:</span>
                  <span className="ml-2 text-gray-800">{data.currentOperation || 'None'}</span>
                </div>
                {data.currentTraversal && (
                  <div>
                    <span className="font-medium text-gray-600">Traversal Mode:</span>
                    <span className="ml-2 text-gray-800 capitalize">{data.currentTraversal}</span>
                  </div>
                )}
              </div>

              {/* Traversal Results */}
              {data.traversalResults && (
                <div className="mt-3 space-y-2">
                  {data.traversalResults.dfs.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">DFS Result:</span>
                      <div className="mt-1 text-gray-800">
                        {data.traversalResults.dfs.join(' → ')}
                      </div>
                    </div>
                  )}
                  {data.traversalResults.bfs.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">BFS Result:</span>
                      <div className="mt-1 text-gray-800">
                        {data.traversalResults.bfs.join(' → ')}
                      </div>
                    </div>
                  )}
                  {data.traversalResults.topological.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Topological Sort:</span>
                      <div className="mt-1 text-gray-800">
                        {data.traversalResults.topological.join(' → ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shortest Path */}
              {data.shortestPath && data.shortestPath.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-gray-600">Shortest Path:</span>
                  <div className="mt-1 text-gray-800">{data.shortestPath.join(' → ')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

DirectedGraphRealtimeVisualization.displayName = 'DirectedGraphRealtimeVisualization';

export default DirectedGraphRealtimeVisualization;
