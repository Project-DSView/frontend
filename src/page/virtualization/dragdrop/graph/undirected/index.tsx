'use client';

import React, { useState, useRef, lazy, Suspense, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  UndirectedGraphDragComponent,
  UndirectedGraphNode,
  UndirectedGraphEdge,
  Operation,
} from '@/types';
import { useUndirectedGraphDragDrop } from '@/hooks';
import { undirectedGraphDragComponents } from '@/data';
import DragDropZone from '@/components/virtualization/shared/DragDropZone';
import StepSelector from '@/components/virtualization/shared/StepSelector';
import ExportPNGButton from '@/components/virtualization/shared/ExportPNGButton';

// Lazy load heavy components
const UndirectedGraphDragDropOperations = lazy(
  () => import('@/components/virtualization/dragdrop/graph/undirected/UndirectedGraphOperations'),
);
const UndirectedGraphDragDropVisualization = lazy(
  () =>
    import('@/components/virtualization/dragdrop/graph/undirected/UndirectedGraphVisualization'),
);

const DragDropUndirectedGraph = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll } =
    useUndirectedGraphDragDrop();

  const [draggedItem, setDraggedItem] = useState<UndirectedGraphDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading] = useState(false);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: UndirectedGraphDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
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
        }, 2000); // Change step every 2 seconds
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
                id: operation.value,
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
              const fromNode = currentNodes.find((n) => n.id === operation.fromVertex);
              const toNode = currentNodes.find((n) => n.id === operation.toVertex);
              if (fromNode && toNode) {
                const newEdge: UndirectedGraphEdge = {
                  id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  from: operation.fromVertex,
                  to: operation.toVertex,
                  weight: operation.value ? parseInt(operation.value, 10) : undefined,
                };
                currentEdges.push(newEdge);
                fromNode.neighbors.push(operation.toVertex);
                toNode.neighbors.push(operation.fromVertex);
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
                (e) =>
                  !(e.from === operation.fromVertex && e.to === operation.toVertex) &&
                  !(e.from === operation.toVertex && e.to === operation.fromVertex),
              );
              const fromNode = currentNodes.find((n) => n.id === operation.fromVertex);
              const toNode = currentNodes.find((n) => n.id === operation.toVertex);
              if (fromNode)
                fromNode.neighbors = fromNode.neighbors.filter((n) => n !== operation.toVertex);
              if (toNode)
                toNode.neighbors = toNode.neighbors.filter((n) => n !== operation.fromVertex);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Drag & Drop Undirected Graph</h1>
          <p className="text-gray-600">
            เลือกประเภท operation จาก dropdown แล้วลาก operations ไปยัง Drop Zone
          </p>
        </div>
        <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side - Drag Components */}
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
              Loading operations...
            </div>
          }
        >
          <UndirectedGraphDragDropOperations
            dragComponents={undirectedGraphDragComponents}
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
          />
        </Suspense>

        {/* Right Side - Drop Zone */}
        <div className="rounded-lg bg-white p-6 shadow">
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
            onRemoveOperation={removeOperation}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
          />
        </div>
      </div>

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

      {/* Visualization */}
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
            Loading visualization...
          </div>
        }
      >
        <UndirectedGraphDragDropVisualization
          ref={visualizationRef}
          nodes={currentVisualizationState.nodes}
          edges={currentVisualizationState.edges}
          stats={currentVisualizationState.stats}
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
          currentOperationData={selectedStep !== null ? state.operations[selectedStep] : undefined}
          shortestPath={shortestPath}
        />
      </Suspense>
    </div>
  );
};

export default DragDropUndirectedGraph;
