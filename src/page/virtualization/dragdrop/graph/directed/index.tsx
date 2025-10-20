'use client';

import React, { useState, useRef, lazy, Suspense, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import {
  DirectedGraphDragComponent,
  DirectedGraphNode,
  DirectedGraphEdge,
  Operation,
} from '@/types';
import { useDirectedGraphDragDrop } from '@/hooks';
import { directedGraphDragComponents } from '@/data';

import DragDropZone from '@/components/playground/shared/DragDropZone';
import StepSelector from '@/components/playground/shared/StepSelector';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';
// Lazy load heavy components
const DirectedGraphDragDropOperations = lazy(
  () => import('@/components/playground/dragdrop/opeartion/DirectedGraph'),
);
const DirectedGraphDragDropVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/DirectedGraph'),
);
const StepIndicator = lazy(() => import('@/components/playground/shared/StepIndicator'));
const TutorialModal = lazy(() => import('@/components/tutorial/TutorialModal'));

const DragDropDirectedGraph = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDirectedGraphDragDrop();

  const [draggedItem, setDraggedItem] = useState<DirectedGraphDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: DirectedGraphDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    // Mark as external drag - no JSON data means external
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleTouchStart = (e: React.TouchEvent, component: DirectedGraphDragComponent) => {
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
          toast.error(`Edge จาก ${position} ไป ${operation.toVertex} มีอยู่แล้วในกราฟ`);
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
      (edge) => edge.from === fromVertex && edge.to === toVertex,
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
          toast.error(`Edge จาก ${operation.fromVertex} ไป ${newValue} มีอยู่แล้วในกราฟ`);
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
    }
  };

  const handleNext = () => {
    if (selectedStep !== null && selectedStep < state.operations.length - 1) {
      setSelectedStep(selectedStep + 1);
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
    nodes: DirectedGraphNode[],
    edges: DirectedGraphEdge[],
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

      // Check outgoing neighbors only for directed graph
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) break;

      const outgoingEdges = edges.filter((edge) => edge.from === currentNodeId);
      for (const edge of outgoingEdges) {
        if (visited.has(edge.to)) continue;

        const edgeWeight = edge.weight || 1;
        const newDistance = distances[currentNodeId] + edgeWeight;

        if (newDistance < distances[edge.to]) {
          distances[edge.to] = newDistance;
          previous[edge.to] = currentNodeId;
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
      add_edge: `เพิ่ม edge จาก ${operation.fromVertex} ไป ${operation.toVertex}`,
      remove_vertex: `ลบ vertex ${operation.value} และ edge ที่เชื่อมกับมัน`,
      remove_edge: `ลบ edge จาก ${operation.fromVertex} ไป ${operation.toVertex}`,
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
            isStronglyConnected: true,
            hasCycle: false,
            inDegree: {},
            outDegree: {},
          },
        };
      }

      let currentNodes: DirectedGraphNode[] = [];
      let currentEdges: DirectedGraphEdge[] = [];

      // Execute operations up to the selected step
      for (let i = 0; i <= stepIndex; i++) {
        const operation = state.operations[i];
        if (!operation) continue;

        switch (operation.type) {
          case 'add_vertex':
            if (operation.value) {
              const newNode: DirectedGraphNode = {
                id: operation.value,
                value: operation.value,
                x: Math.random() * 400 + 50,
                y: Math.random() * 300 + 50,
                outgoingEdges: [],
                incomingEdges: [],
              };
              currentNodes.push(newNode);
            }
            break;
          case 'add_edge':
            if (operation.fromVertex && operation.toVertex) {
              const fromNode = currentNodes.find((n) => n.id === operation.fromVertex);
              const toNode = currentNodes.find((n) => n.id === operation.toVertex);
              if (fromNode && toNode) {
                const newEdge: DirectedGraphEdge = {
                  id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  from: operation.fromVertex,
                  to: operation.toVertex,
                  weight: operation.value ? parseInt(operation.value, 10) : undefined,
                  isDirected: true,
                };
                currentEdges.push(newEdge);
                fromNode.outgoingEdges.push(newEdge.id);
                toNode.incomingEdges.push(newEdge.id);
              }
            }
            break;
          case 'remove_vertex':
            if (operation.value) {
              currentNodes = currentNodes.filter((n) => n.id !== operation.value);
              currentEdges = currentEdges.filter(
                (e) => e.from !== operation.value && e.to !== operation.value,
              );
            }
            break;
          case 'remove_edge':
            if (operation.fromVertex && operation.toVertex) {
              currentEdges = currentEdges.filter(
                (e) => !(e.from === operation.fromVertex && e.to === operation.toVertex),
              );
              const fromNode = currentNodes.find((n) => n.id === operation.fromVertex);
              const toNode = currentNodes.find((n) => n.id === operation.toVertex);
              if (fromNode)
                fromNode.outgoingEdges = fromNode.outgoingEdges.filter(
                  (e) => e !== operation.toVertex,
                );
              if (toNode)
                toNode.incomingEdges = toNode.incomingEdges.filter(
                  (e) => e !== operation.fromVertex,
                );
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
        isStronglyConnected: currentNodes.length <= 1,
        hasCycle: currentEdges.length >= currentNodes.length && currentNodes.length >= 3,
        inDegree: {},
        outDegree: {},
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="mb-2 text-xl font-bold text-gray-800 md:text-2xl lg:text-2xl">
              Drag & Drop Directed Graph
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
            <DirectedGraphDragDropOperations
              dragComponents={directedGraphDragComponents}
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
          <DirectedGraphDragDropVisualization
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

      {/* Tutorial Modal */}
      <Suspense
        fallback={
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        }
      >
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          playgroundMode="dragdrop"
        />
      </Suspense>
    </div>
  );
};

export default DragDropDirectedGraph;
