import React, { forwardRef, useMemo, useState, useEffect, memo, useCallback } from 'react';

import {
  UndirectedGraphNode,
  UndirectedGraphEdge,
  ViewMode,
  UndirectedGraphVisualizationProps,
} from '@/types';
import { generateHashMemoryAddress } from '@/lib';

import StepIndicator from '@/components/playground/shared/action/StepIndicator';
import ConsoleOutput from '@/components/playground/stepthrough/ConsoleOutput';
import PerformanceAnalysisPanel from '@/components/playground/shared/PerformancePanel/PerformanceAnalysisPanel';
import MemoryAddress from '@/components/playground/shared/common/MemoryAddress';
import VisualizationViewControls from '@/components/playground/shared/common/VisualizationViewControls';
import VariableStatePanel from '@/components/playground/stepthrough/VariableStatePanel';
import CommonPitfallsWarning from '@/components/playground/stepthrough/CommonPitfallsWarning';
import PitfallPopup from '@/components/playground/stepthrough/PitfallPopup';

const UndirectedGraphStepthroughVisualization = forwardRef<
  HTMLDivElement,
  UndirectedGraphVisualizationProps
>(
  (
    {
      steps,
      currentStepIndex,
      data,
      isRunning,
      error,
      complexity,
      insertedVertex,
      insertedEdge,
      currentVertex,
    },
    ref,
  ) => {
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('technical');
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
    const [searchPath] = useState<string[]>([]);
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);
    const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>(
      {},
    );
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showMemoryAddress, setShowMemoryAddress] = useState(false);
    const [showVariablePanel, setShowVariablePanel] = useState(true);
    const [isPitfallPopupOpen, setIsPitfallPopupOpen] = useState(false);

    // Extract warnings from current step
    const currentWarnings =
      steps.length > 0 && currentStepIndex < steps.length
        ? (
            steps[currentStepIndex].state?.step_detail as {
              warnings?: Array<{
                type: string;
                severity: 'info' | 'warning' | 'error';
                message: string;
                tip: string;
              }>;
            }
          )?.warnings || []
        : [];

    // Memory address generation via utility

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

    // Handle transition animation when step changes
    useEffect(() => {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }, [currentStepIndex]);

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

    // Memoized node component with enhanced highlighting
    const NodeComponent = memo<{
      node: UndirectedGraphNode;
      isHighlighted: boolean;
      isInSearchPath: boolean;
      isTraverseSelected: boolean;
      isCurrentlyTraversing: boolean;
      isInserted: boolean;
      isCurrent: boolean;
      isRunning: boolean;
      isTransitioning: boolean;
      onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
    }>(
      ({
        node,
        isHighlighted,
        isInSearchPath,
        isTraverseSelected,
        isCurrentlyTraversing,
        isInserted,
        isCurrent,
        isRunning,
        isTransitioning,
        onMouseDown,
      }) => {
        const position = nodePositions[node.id] || { x: node.x, y: node.y };

        // Determine node style based on state
        const getNodeStyle = () => {
          // Newly inserted node - Gold/Yellow with bounce animation
          if (isInserted) {
            return 'scale-110 animate-bounce border-yellow-400 bg-yellow-200 text-yellow-800 shadow-lg ring-4 ring-yellow-300';
          }
          // Current node being processed - Orange
          if (isCurrent) {
            return 'scale-110 animate-pulse border-orange-400 bg-orange-200 text-orange-800 shadow-lg ring-4 ring-orange-300';
          }
          // Legacy highlighted
          if (isHighlighted) {
            return 'scale-110 animate-bounce border-yellow-400 bg-yellow-200 text-yellow-800 shadow-lg';
          }
          // In search path
          if (isInSearchPath) {
            return 'scale-105 animate-pulse border-blue-400 bg-blue-200 text-blue-800 shadow-md';
          }
          // Traversal animation
          if (isTraverseSelected || isCurrentlyTraversing) {
            return 'scale-110 animate-bounce border-green-400 bg-green-200 text-green-800 shadow-lg';
          }
          // Default
          return 'border-gray-600 bg-white text-gray-800 hover:scale-105 hover:shadow-md dark:border-gray-300 dark:bg-gray-700 dark:text-gray-100';
        };

        return (
          <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 transform cursor-move transition-all duration-700 ease-in-out ${
              isTransitioning ? 'animate-pulse' : ''
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onMouseDown={(e) => onMouseDown(e, node.id)}
          >
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-700 ease-in-out ${getNodeStyle()} ${isRunning ? 'animate-pulse' : ''} ${isTransitioning ? 'animate-pulse' : ''} ${
                draggedNode === node.id ? 'z-10' : ''
              }`}
            >
              {node.value}
              {/* Ping indicator for inserted node */}
              {isInserted && (
                <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-yellow-400" />
              )}
              {/* Ping indicator for current node */}
              {isCurrent && !isInserted && (
                <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-orange-400" />
              )}
              {isHighlighted && !isInserted && !isCurrent && (
                <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-yellow-400" />
              )}
              {(isTraverseSelected || isCurrentlyTraversing) && (
                <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-green-400" />
              )}
              {isTransitioning && (
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-blue-300" />
              )}
            </div>

            {/* Memory Address */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <MemoryAddress
                address={generateHashMemoryAddress(node.value)}
                isVisible={showMemoryAddress}
              />
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
        const isInserted = insertedVertex === node.id;
        const isCurrent = currentVertex === node.id || currentVertex === node.value;

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
            isInserted={isInserted}
            isCurrent={isCurrent}
            isRunning={isRunning ?? false}
            isTransitioning={isTransitioning}
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
        isTransitioning,
        insertedVertex,
        currentVertex,
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
          highlightedEdges.includes(edge.id) ||
          highlightedEdges.includes(`${edge.to}-${edge.from}`) ||
          insertedEdge === edge.id;

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
            className={`pointer-events-none absolute transition-all duration-500 ${
              insertedEdge === edge.id ? 'animate-pulse' : ''
            }`}
            style={{
              left: `${fromPosition.x}px`,
              top: `${fromPosition.y}px`,
              width: `${length}px`,
              height: isHighlighted ? '3px' : '2px',
              backgroundColor: isHighlighted ? '#f59e0b' : '#374151',
              transformOrigin: '0 50%',
              transform: `rotate(${angle}deg)`,
              boxShadow: isHighlighted ? '0 0 8px rgba(245, 158, 11, 0.5)' : 'none',
            }}
          />
        );
      },
      [data.nodes, highlightedEdges, nodePositions, insertedEdge],
    );

    return (
      <div
        ref={ref}
        className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        suppressHydrationWarning
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Undirected Graph Visualization
          </h2>
          <div className="flex items-center gap-3">
            {/* Variable Panel Toggle */}
            <button
              onClick={() => setShowVariablePanel(!showVariablePanel)}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                showVariablePanel
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
              title="Toggle Variable State Panel"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Variables
            </button>
            {isRunning && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
                <span>Running...</span>
              </div>
            )}
            <VisualizationViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showMemoryAddress={showMemoryAddress}
              onToggleMemoryAddress={setShowMemoryAddress}
            />
            {/* Common Errors Button */}
            <button
              onClick={() => setIsPitfallPopupOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
              title="ดูข้อผิดพลาดที่พบบ่อย"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Common Errors
            </button>
          </div>
        </div>

        {/* Pitfall Warnings - Show if any */}
        {currentWarnings.length > 0 && (
          <div className="mb-4">
            <CommonPitfallsWarning warnings={currentWarnings} />
          </div>
        )}

        {/* Current Step Info */}
        {currentStep && !error && (
          <div className="bg-info/10 mb-4 rounded-lg p-3 dark:bg-blue-900/30">
            <div className="text-info/90 text-sm font-medium dark:text-blue-200">
              Step {currentStep.stepNumber}: {currentStep.state.message}
            </div>
          </div>
        )}

        {/* Main Content - Flex layout with Variable Panel */}
        <div className="flex gap-4">
          {/* Left Side - Variable State Panel */}
          {showVariablePanel && (
            <div className="flex-shrink-0">
              <VariableStatePanel
                steps={steps}
                currentStepIndex={currentStepIndex}
                nodes={data.nodes.map((n) => n.value)}
              />
            </div>
          )}

          {/* Right Side - Graph Visualization */}
          <div className="min-w-0 flex-1">
            {viewMode === 'analogy' ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
                <div className="max-w-md">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Analogy View Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We are working on adding conceptual analogies for Undirected Graphs. Please
                    switch back to Technical View for now.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative mb-6 min-h-[400px] overflow-auto rounded-lg bg-gray-50 dark:bg-gray-800">
                {/* Step Indicator */}
                {isRunning && steps.length > 0 && (
                  <StepIndicator
                    stepNumber={currentStepIndex + 1}
                    totalSteps={steps.length}
                    message={steps[currentStepIndex]?.state?.message}
                    isAutoPlaying={isRunning}
                  />
                )}

                {data.nodes.length > 0 ? (
                  <div className="relative h-full min-h-[400px] w-full">
                    {/* Render edges first (behind nodes) */}
                    {data.edges.map(renderEdge)}

                    {/* Render nodes */}
                    {data.nodes.map(renderNode)}
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <div className="text-lg font-medium">Empty Graph</div>
                      <div className="text-sm">Run your code to see graph visualization</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {data.nodes.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Vertices</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {data.edges.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Edges</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {data.nodes.length === 0 ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Empty</div>
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

        {/* Console Output */}
        <ConsoleOutput steps={steps} currentStepIndex={currentStepIndex} />

        {/* Big O Analysis */}
        <PerformanceAnalysisPanel
          steps={steps}
          currentStepIndex={currentStepIndex}
          complexity={complexity}
        />

        {/* Color Legend */}
        <section className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-gray-600 bg-white dark:border-gray-300 dark:bg-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Node ปกติ</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-yellow-400 bg-yellow-200 dark:border-yellow-500 dark:bg-yellow-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">Inserted (Active)</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-orange-400 bg-orange-200 dark:border-orange-500 dark:bg-orange-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">Current</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-green-400 bg-green-200 dark:border-green-500 dark:bg-green-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">Traversing</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-blue-400 bg-blue-200 dark:border-blue-500 dark:bg-blue-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">In Path</span>
          </div>
        </section>

        {/* Pitfall Popup */}
        <PitfallPopup isOpen={isPitfallPopupOpen} onClose={() => setIsPitfallPopupOpen(false)} />
      </div>
    );
  },
);

UndirectedGraphStepthroughVisualization.displayName = 'UndirectedGraphStepthroughVisualization';

export default UndirectedGraphStepthroughVisualization;
