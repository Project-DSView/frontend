'use client';

import React, { useState, useRef, lazy, Suspense, useMemo, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import {
  UndirectedGraphDragComponent,
  UndirectedGraphNode,
  UndirectedGraphEdge,
  Operation,
} from '@/types';
import { useDragDropUndirectedGraph } from '@/hooks';
import { undirectedGraphDragComponents, getTutorialSteps, getTutorialStorageKey } from '@/data';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import TutorialOverlay from '@/components/playground/shared/tutorial/TutorialOverlay';

// Lazy load heavy components
const UndirectedGraphDragDropOperations = lazy(
  () => import('@/components/playground/dragdrop/opeartion/UndirectedGraph'),
);
const UndirectedGraphDragDropVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/UndirectedGraph'),
);
const StepIndicator = lazy(() => import('@/components/playground/shared/action/StepIndicator'));
const CopyCodeButton = lazy(
  () => import('@/components/playground/shared/action/CopyCodeButton'),
);
const CodeEditor = lazy(() => import('@/components/editor/CodeEditor'));
const DragDropUndirectedGraph = () => {
  const pathname = usePathname();
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropUndirectedGraph();

  const [draggedItem, setDraggedItem] = useState<UndirectedGraphDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Auto-show tutorial on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getTutorialStorageKey(pathname, 'dragdrop');
      const hasSeenTutorial = localStorage.getItem(storageKey) === 'completed';

      if (!hasSeenTutorial) {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: UndirectedGraphDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    // Mark as external drag - no JSON data means external
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleTouchStart = (e: React.TouchEvent, component: UndirectedGraphDragComponent) => {
    // Don't call preventDefault here as it's a passive event
    setDraggedItem(component);
    // Simulate drop immediately for touch devices
    handleDrop({ preventDefault: () => {} } as React.DragEvent);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (draggedItem) {
      const newOperation = {
        type: draggedItem.type,
        name: draggedItem.name,
        value: ['traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(draggedItem.type)
          ? null
          : '',
        fromVertex: ['add_edge', 'remove_edge'].includes(draggedItem.type) ? '' : null,
        toVertex: ['add_edge', 'remove_edge'].includes(draggedItem.type) ? '' : null,
        startVertex: ['traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(draggedItem.type)
          ? ''
          : null,
        endVertex: ['shortest_path'].includes(draggedItem.type) ? '' : null,
        color: draggedItem.color,
        category: draggedItem.category,
        position: ['add_edge', 'remove_edge'].includes(draggedItem.type) ? '' : null,
        newValue: [
          'add_edge',
          'remove_edge',
          'traversal_dfs',
          'traversal_bfs',
          'shortest_path',
        ].includes(draggedItem.type)
          ? ''
          : null,
      };

      addOperation(newOperation);
      setDraggedItem(null);
    }
  };

  const updateOperationValue = (id: number, value: string) => {
    // Validate value based on operation type
    const operation = state.operations.find((op) => op.id === id);
    if (operation) {
      if (operation.type === 'add_vertex' || operation.type === 'remove_vertex') {
        // Clear any previous errors
      } else if (operation.type === 'shortest_path') {
        // Update endVertex when value changes for shortest path
        updateOperation(id, { value, endVertex: value });
        return;
      }
    }
    updateOperation(id, { value });
  };

  const updateOperationPosition = (id: number, position: string) => {
    // For edge operations, this handles fromVertex
    const operation = state.operations.find((op) => op.id === id);
    if (operation && (operation.type === 'add_edge' || operation.type === 'remove_edge')) {
      // Check for duplicate edge
      if (operation.toVertex && position) {
        if (checkDuplicateEdge(position, operation.toVertex)) {
          toast.error(`Edge ระหว่าง ${position} และ ${operation.toVertex} มีอยู่แล้วในกราฟ`);
          return;
        }
      }

      // Update fromVertex when position changes
      updateOperation(id, { position, fromVertex: position });
    } else {
      updateOperation(id, { position });
    }
  };

  // Check for duplicate edges
  const checkDuplicateEdge = (fromVertex: string, toVertex: string): boolean => {
    if (fromVertex === toVertex) return true; // Self-loop not allowed

    // Check existing edges in current state
    const existingEdge = state.edges.find(
      (edge) =>
        (edge.from === fromVertex && edge.to === toVertex) ||
        (edge.from === toVertex && edge.to === fromVertex),
    );

    return !!existingEdge;
  };

  const updateOperationNewValue = (id: number, newValue: string) => {
    // For edge operations, this handles toVertex
    const operation = state.operations.find((op) => op.id === id);
    if (operation && (operation.type === 'add_edge' || operation.type === 'remove_edge')) {
      // Check for duplicate edge
      if (operation.fromVertex && newValue) {
        if (checkDuplicateEdge(operation.fromVertex, newValue)) {
          toast.error(`Edge ระหว่าง ${operation.fromVertex} และ ${newValue} มีอยู่แล้วในกราฟ`);
          return;
        }
      }

      // Update toVertex when newValue changes
      updateOperation(id, { newValue, toVertex: newValue });
    } else if (
      operation &&
      (operation.type === 'traversal_dfs' || operation.type === 'traversal_bfs')
    ) {
      // Update startVertex when newValue changes
      updateOperation(id, { newValue, startVertex: newValue });
    } else if (operation && operation.type === 'shortest_path') {
      // Update startVertex when newValue changes for shortest path
      updateOperation(id, { newValue, startVertex: newValue });
    } else {
      updateOperation(id, { newValue });
    }
  };

  const handleClearAll = () => {
    clearAll();
    setSelectedStep(null);
  };

  const handleRemoveOperation = (id: number) => {
    removeOperation(id);
    // Reset step selection when removing operations
    setSelectedStep(null);
  };

  const handleStepSelect = (stepIndex: number) => {
    setSelectedStep(stepIndex);
    // Stop auto play when manually selecting a step
    if (isAutoPlaying) {
      handleAutoPlay();
    }
  };

  const handlePrevious = () => {
    if (selectedStep !== null && selectedStep > 0) {
      setSelectedStep(selectedStep - 1);
      // Trigger animation for the previous step
      if (isAutoPlaying) {
        // If auto playing, the animation will be handled by the auto play logic
        return;
      }
      // If manually clicking previous, trigger a brief animation
      setTimeout(() => {
        // This will trigger the visualization animation
      }, 100);
    }
  };

  const handleNext = () => {
    if (selectedStep !== null && selectedStep < state.operations.length - 1) {
      setSelectedStep(selectedStep + 1);
      // Trigger animation for the next step
      if (isAutoPlaying) {
        // If auto playing, the animation will be handled by the auto play logic
        return;
      }
      // If manually clicking next, trigger a brief animation
      setTimeout(() => {
        // This will trigger the visualization animation
      }, 100);
    }
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      // Stop auto play
      setIsAutoPlaying(false);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    } else {
      // Start auto play
      setIsAutoPlaying(true);
      if (state.operations.length > 0) {
        setSelectedStep(0);
        autoPlayIntervalRef.current = setInterval(() => {
          setSelectedStep((prev) => {
            if (prev === null || prev >= state.operations.length - 1) {
              // Auto play finished
              setIsAutoPlaying(false);
              if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
              }
              return prev;
            }
            return prev + 1;
          });
        }, 1500); // Change step every 1.5 seconds for smoother experience
      }
    }
  };

  // Cleanup auto play interval on unmount
  React.useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  // Calculate shortest path using Dijkstra's algorithm
  const calculateShortestPath = (
    nodes: UndirectedGraphNode[],
    edges: UndirectedGraphEdge[],
    start: string,
    end: string,
  ): string[] => {
    if (start === end) return [start];

    // Find start and end nodes by value
    const startNode = nodes.find((n) => n.value === start);
    const endNode = nodes.find((n) => n.value === end);

    if (!startNode || !endNode) return [];

    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const visited = new Set<string>();
    const unvisited = new Set<string>();

    // Initialize distances using node IDs as keys
    nodes.forEach((node) => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });

    let iterations = 0;
    const maxIterations = nodes.length * 2; // Safety check

    while (unvisited.size > 0 && iterations < maxIterations) {
      iterations++;

      // Find node with minimum distance
      let currentNodeId = '';
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currentNodeId = nodeId;
        }
      }

      if (currentNodeId === '' || minDistance === Infinity) break;

      unvisited.delete(currentNodeId);
      visited.add(currentNodeId);

      // Check neighbors
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) break;

      for (const neighborId of currentNode.neighbors) {
        if (visited.has(neighborId)) continue;

        const edge = edges.find(
          (e) =>
            (e.from === currentNodeId && e.to === neighborId) ||
            (e.from === neighborId && e.to === currentNodeId),
        );

        if (!edge) continue;

        const edgeWeight = edge.weight || 1;
        const newDistance = distances[currentNodeId] + edgeWeight;

        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = currentNodeId;
        }
      }
    }

    // Reconstruct path using node values
    const path: string[] = [];
    let currentId = endNode.id;
    let pathIterations = 0;
    const maxPathIterations = nodes.length; // Safety check

    while (currentId !== null && pathIterations < maxPathIterations) {
      pathIterations++;
      const node = nodes.find((n) => n.id === currentId);
      if (node) {
        path.unshift(node.value);
      }
      currentId = previous[currentId] || '';
    }

    return path[0] === start ? path : [];
  };

  const getStepDescription = (operation: {
    type: string;
    value?: string | null;
    fromVertex?: string | null;
    toVertex?: string | null;
    startVertex?: string | null;
    endVertex?: string | null;
    name: string;
  }) => {
    const descriptions: { [key: string]: string } = {
      add_vertex: `เพิ่ม vertex ${operation.value} เข้าไปในกราฟ`,
      add_edge: `เพิ่ม edge เชื่อมระหว่าง ${operation.fromVertex} และ ${operation.toVertex}`,
      remove_vertex: `ลบ vertex ${operation.value} และ edge ที่เชื่อมกับมัน`,
      remove_edge: `ลบ edge ระหว่าง ${operation.fromVertex} และ ${operation.toVertex}`,
      traversal_dfs: `เดินทางผ่านกราฟด้วย DFS เริ่มจาก ${operation.startVertex}`,
      traversal_bfs: `เดินทางผ่านกราฟด้วย BFS เริ่มจาก ${operation.startVertex}`,
      shortest_path: `หาเส้นทางที่สั้นที่สุดจาก ${operation.startVertex} ไป ${operation.endVertex}`,
    };

    return descriptions[operation.type] || `ดำเนินการ ${operation.name}`;
  };

  // Calculate state for selected step
  const getStepState = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= state.operations.length) {
        return {
          nodes: [],
          edges: [],
          stats: {
            size: 0,
            isEmpty: true,
            vertices: 0,
            edges: 0,
            isConnected: true,
            hasCycle: false,
          },
        };
      }

      let currentNodes: UndirectedGraphNode[] = [];
      let currentEdges: UndirectedGraphEdge[] = [];

      // Execute operations up to the selected step
      for (let i = 0; i <= stepIndex; i++) {
        const operation = state.operations[i];
        if (!operation) continue;

        switch (operation.type) {
          case 'add_vertex':
            if (operation.value) {
              const newNode: UndirectedGraphNode = {
                id: `${operation.value}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                value: operation.value,
                x: Math.random() * 400 + 50,
                y: Math.random() * 300 + 50,
                neighbors: [],
              };
              currentNodes.push(newNode);
            }
            break;
          case 'add_edge':
            if (operation.fromVertex && operation.toVertex) {
              const fromNode = currentNodes.find((n) => n.value === operation.fromVertex);
              const toNode = currentNodes.find((n) => n.value === operation.toVertex);
              if (fromNode && toNode) {
                const newEdge: UndirectedGraphEdge = {
                  id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                  from: fromNode.id,
                  to: toNode.id,
                  weight: operation.value ? parseInt(operation.value, 10) : undefined,
                };
                currentEdges.push(newEdge);
                fromNode.neighbors.push(toNode.id);
                toNode.neighbors.push(fromNode.id);
              }
            }
            break;
          case 'remove_vertex':
            if (operation.value) {
              const nodeToRemove = currentNodes.find((n) => n.value === operation.value);
              if (nodeToRemove) {
                currentNodes = currentNodes.filter((n) => n.id !== nodeToRemove.id);
                currentEdges = currentEdges.filter(
                  (e) => e.from !== nodeToRemove.id && e.to !== nodeToRemove.id,
                );
              }
            }
            break;
          case 'remove_edge':
            if (operation.fromVertex && operation.toVertex) {
              const fromNode = currentNodes.find((n) => n.value === operation.fromVertex);
              const toNode = currentNodes.find((n) => n.value === operation.toVertex);
              if (fromNode && toNode) {
                currentEdges = currentEdges.filter(
                  (e) =>
                    !(e.from === fromNode.id && e.to === toNode.id) &&
                    !(e.from === toNode.id && e.to === fromNode.id),
                );
                fromNode.neighbors = fromNode.neighbors.filter((n) => n !== toNode.id);
                toNode.neighbors = toNode.neighbors.filter((n) => n !== fromNode.id);
              }
            }
            break;
          case 'shortest_path':
            // Shortest path calculation will be handled in useEffect
            break;
        }
      }

      // Calculate stats
      const currentStats = {
        size: currentNodes.length,
        isEmpty: currentNodes.length === 0,
        vertices: currentNodes.length,
        edges: currentEdges.length,
        isConnected: currentNodes.length <= 1 || currentEdges.length >= currentNodes.length - 1,
        hasCycle: currentEdges.length >= currentNodes.length && currentNodes.length >= 3,
      };

      return { nodes: currentNodes, edges: currentEdges, stats: currentStats };
    },
    [state.operations],
  );

  // Get current visualization state based on selected step
  const currentVisualizationState = useMemo(() => {
    if (selectedStep !== null) {
      return getStepState(selectedStep);
    }
    return { nodes: state.nodes, edges: state.edges, stats: state.stats };
  }, [selectedStep, getStepState, state.nodes, state.edges, state.stats]);

  // Calculate shortest path using useMemo with stable dependencies
  const shortestPath = useMemo(() => {
    if (selectedStep !== null) {
      const operation = state.operations[selectedStep];
      if (operation?.type === 'shortest_path' && operation.startVertex && operation.endVertex) {
        // Get current state directly instead of using currentVisualizationState
        const currentState =
          selectedStep !== null
            ? getStepState(selectedStep)
            : { nodes: state.nodes, edges: state.edges, stats: state.stats };
        const { nodes, edges } = currentState;
        const path = calculateShortestPath(
          nodes,
          edges,
          operation.startVertex,
          operation.endVertex,
        );

        if (path.length > 0) {
          return path;
        }
      }
    }
    return [];
  }, [selectedStep, state.operations, state.nodes, state.edges, state.stats, getStepState]);

  /* ================= Python Code Generator ================= */

  const pythonCode = useMemo(() => {
    const lines: string[] = [
      'class UndirectedGraph:',
      '    def __init__(self):',
      '        self.graph = {}',
      '',
      '    def add_vertex(self, v):',
      '        if v not in self.graph:',
      '            self.graph[v] = []',
      '',
      '    def add_edge(self, u, v):',
      '        self.add_vertex(u)',
      '        self.add_vertex(v)',
      '        self.graph[u].append(v)',
      '        self.graph[v].append(u)',
      '',
      '    def show(self):',
      '        for v in self.graph:',
      '            print(v, "->", self.graph[v])',
      '',
      'g = UndirectedGraph()',
      '',
    ];

    state.operations.forEach((op) => {
      if (op.type === 'add_vertex' && op.value) {
        lines.push(`g.add_vertex("${op.value}")`);
      }

      if (op.type === 'add_edge' && op.fromVertex && op.toVertex) {
        lines.push(`g.add_edge("${op.fromVertex}", "${op.toVertex}")`);
      }
    });

    lines.push('', 'g.show()');

    return lines.join('\\n');
  }, [state.operations]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="mb-2 text-xl font-bold text-gray-800 md:text-2xl lg:text-2xl">
              Drag & Drop Undirected Graph
            </h1>
            <p className="text-sm text-gray-600 md:text-base">
              เลือกประเภท operation จาก dropdown แล้วลาก operations ไปยัง Drop Zone
            </p>
          </div>
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
        </div>
        <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Side - Drag Components */}
        <div className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Suspense
            fallback={
              <div className="h-64 w-full rounded-lg border bg-gray-50">
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            }
          >
            <UndirectedGraphDragDropOperations
              dragComponents={undirectedGraphDragComponents}
              onDragStart={handleDragStart}
              onTouchStart={handleTouchStart}
            />
          </Suspense>
        </div>

        {/* Right Side - Drop Zone */}
        <div className="rounded-lg bg-white p-4 shadow md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Drop Zone</h2>
            <div className="space-x-2">
              <button
                onClick={handleClearAll}
                className="bg-neutral hover:bg-neutral/50 rounded px-4 py-2 text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <DragDropZone
            operations={state.operations as Operation[]}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveOperation={handleRemoveOperation}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
            onReorderOperation={reorderOperation}
          />
        </div>
      </div>

      {/* Visualization */}
      <div className="relative">
        {/* Step Indicator */}
        {isAutoPlaying && state.operations.length > 0 && selectedStep !== null && (
          <Suspense
            fallback={
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <div className="flex h-6 items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            }
          >
            <StepIndicator
              stepNumber={selectedStep + 1}
              totalSteps={state.operations.length}
              message={getStepDescription(state.operations[selectedStep])}
              isAutoPlaying={isAutoPlaying}
            />
          </Suspense>
        )}

        <Suspense
          fallback={
            <div className="h-64 w-full rounded-lg border bg-gray-50">
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            </div>
          }
        >
          <UndirectedGraphDragDropVisualization
            ref={visualizationRef}
            nodes={currentVisualizationState.nodes}
            edges={currentVisualizationState.edges}
            stats={currentVisualizationState.stats}
            isRunning={isAutoPlaying}
            currentOperation={
              selectedStep !== null ? state.operations[selectedStep]?.type : undefined
            }
            selectedStep={
              selectedStep !== null &&
              (state.operations[selectedStep]?.type === 'traversal_dfs' ||
                state.operations[selectedStep]?.type === 'traversal_bfs' ||
                state.operations[selectedStep]?.type === 'shortest_path')
                ? selectedStep
                : null
            }
            currentOperationData={
              selectedStep !== null ? state.operations[selectedStep] : undefined
            }
            shortestPath={shortestPath}
          />
        </Suspense>
      </div>

      <div className="mt-6">
        {/* Step Selection */}
        <StepSelector
          operations={state.operations as Operation[]}
          selectedStep={selectedStep}
          onStepSelect={handleStepSelect}
          getStepDescription={getStepDescription}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onAutoPlay={handleAutoPlay}
          isAutoPlaying={isAutoPlaying}
        />
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        steps={getTutorialSteps('dragdrop')}
        storageKey={getTutorialStorageKey(pathname, 'dragdrop')}
      />

      {/* Python Code */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Generated Python Code</h2>
          <Suspense fallback={null}>
            <CopyCodeButton code={pythonCode} />
          </Suspense>
        </div>

        <div className="mt-4 rounded-lg">
          <Suspense fallback={<div>Loading editor...</div>}>
            <CodeEditor
              code={pythonCode}
              disabled
              height="400px"
              onCodeChange={() => {}}
            />
          </Suspense>
        </div>
      </div>
  </div>
);
};


export default DragDropUndirectedGraph;
