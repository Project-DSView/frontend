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

// Lazy load heavy components (เหมือน Directed)
const UndirectedGraphDragDropVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/UndirectedGraph'),
);
const StepIndicator = lazy(() => import('@/components/playground/shared/action/StepIndicator'));
const CopyCodeButton = lazy(() => import('@/components/playground/shared/action/CopyCodeButton'));
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
        const timer = setTimeout(() => setIsTutorialOpen(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Drag ================= */

  const handleDragStart = (e: React.DragEvent, component: UndirectedGraphDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'external');
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

    if (!draggedItem) return;

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
      newValue: ['add_edge', 'remove_edge', 'traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(
        draggedItem.type,
      )
        ? ''
        : null,
    };

    addOperation(newOperation);
    setDraggedItem(null);
  };

  /* ================= Update helpers ================= */

  const updateOperationValue = (id: number, value: string) => {
    const operation = state.operations.find((op) => op.id === id);
    if (operation?.type === 'shortest_path') {
      updateOperation(id, { value, endVertex: value });
      return;
    }
    updateOperation(id, { value });
  };

  const checkDuplicateEdge = (fromVertex: string, toVertex: string): boolean => {
    if (fromVertex === toVertex) return true;

    const existingEdge = state.edges.find(
      (edge) =>
        (edge.from === fromVertex && edge.to === toVertex) ||
        (edge.from === toVertex && edge.to === fromVertex),
    );

    return !!existingEdge;
  };

  const updateOperationPosition = (id: number, position: string) => {
    const operation = state.operations.find((op) => op.id === id);

    if (operation && (operation.type === 'add_edge' || operation.type === 'remove_edge')) {
      if (operation.toVertex && position) {
        if (checkDuplicateEdge(position, operation.toVertex)) {
          toast.error(`Edge ระหว่าง ${position} และ ${operation.toVertex} มีอยู่แล้วในกราฟ`);
          return;
        }
      }
      updateOperation(id, { position, fromVertex: position });
    } else {
      updateOperation(id, { position });
    }
  };

  const updateOperationNewValue = (id: number, newValue: string) => {
    const operation = state.operations.find((op) => op.id === id);

    if (operation && (operation.type === 'add_edge' || operation.type === 'remove_edge')) {
      if (operation.fromVertex && newValue) {
        if (checkDuplicateEdge(operation.fromVertex, newValue)) {
          toast.error(`Edge ระหว่าง ${operation.fromVertex} และ ${newValue} มีอยู่แล้วในกราฟ`);
          return;
        }
      }
      updateOperation(id, { newValue, toVertex: newValue });
    } else if (operation && (operation.type === 'traversal_dfs' || operation.type === 'traversal_bfs')) {
      updateOperation(id, { newValue, startVertex: newValue });
    } else if (operation && operation.type === 'shortest_path') {
      updateOperation(id, { newValue, startVertex: newValue });
    } else {
      updateOperation(id, { newValue });
    }
  };

  /* ================= Controls ================= */

  const handleClearAll = () => {
    clearAll();
    setSelectedStep(null);
  };

  const handleRemoveOperation = (id: number) => {
    removeOperation(id);
    setSelectedStep(null);
  };

  const handleStepSelect = (stepIndex: number) => {
    setSelectedStep(stepIndex);
    if (isAutoPlaying) handleAutoPlay();
  };

  const handlePrevious = () => {
    if (selectedStep !== null && selectedStep > 0) setSelectedStep(selectedStep - 1);
  };

  const handleNext = () => {
    if (selectedStep !== null && selectedStep < state.operations.length - 1)
      setSelectedStep(selectedStep + 1);
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      return;
    }

    if (state.operations.length === 0) return;

    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayIntervalRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        if (prev === null || prev >= state.operations.length - 1) {
          setIsAutoPlaying(false);
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, []);

  /* ================= Shortest path (Dijkstra) ================= */

  const calculateShortestPath = (
    nodes: UndirectedGraphNode[],
    edges: UndirectedGraphEdge[],
    start: string,
    end: string,
  ): string[] => {
    if (start === end) return [start];

    const startNode = nodes.find((n) => n.value === start);
    const endNode = nodes.find((n) => n.value === end);
    if (!startNode || !endNode) return [];

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();
    const unvisited = new Set<string>();

    nodes.forEach((node) => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });

    let iterations = 0;
    const maxIterations = nodes.length * 2;

    while (unvisited.size > 0 && iterations < maxIterations) {
      iterations++;

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

    const path: string[] = [];
    let currentId = endNode.id;
    let pathIterations = 0;

    while (currentId && pathIterations < nodes.length) {
      pathIterations++;
      const node = nodes.find((n) => n.id === currentId);
      if (node) path.unshift(node.value);
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
    const descriptions: Record<string, string> = {
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

  /* ================= Step state ================= */

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

          default:
            break;
        }
      }

      const stats = {
        size: currentNodes.length,
        isEmpty: currentNodes.length === 0,
        vertices: currentNodes.length,
        edges: currentEdges.length,
        isConnected: currentNodes.length <= 1 || currentEdges.length >= currentNodes.length - 1,
        hasCycle: currentEdges.length >= currentNodes.length && currentNodes.length >= 3,
      };

      return { nodes: currentNodes, edges: currentEdges, stats };
    },
    [state.operations],
  );

  const currentVisualizationState = useMemo(() => {
    if (selectedStep !== null) return getStepState(selectedStep);
    return { nodes: state.nodes, edges: state.edges, stats: state.stats };
  }, [selectedStep, getStepState, state.nodes, state.edges, state.stats]);

  const shortestPath = useMemo(() => {
    if (selectedStep !== null) {
      const op = state.operations[selectedStep];
      if (op?.type === 'shortest_path' && op.startVertex && op.endVertex) {
        const currentState = getStepState(selectedStep);
        return calculateShortestPath(currentState.nodes, currentState.edges, op.startVertex, op.endVertex);
      }
    }
    return [];
  }, [selectedStep, state.operations, getStepState]);

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
      if (op.type === 'add_vertex' && op.value) lines.push(`g.add_vertex("${op.value}")`);
      if (op.type === 'add_edge' && op.fromVertex && op.toVertex) {
        lines.push(`g.add_edge("${op.fromVertex}", "${op.toVertex}")`);
      }
    });

    lines.push('', 'g.show()');
    return lines.join('\n');
  }, [state.operations]);

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header (เหมือน Directed) */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Drag & Drop Undirected Graph</h1>
          <p className="text-sm text-gray-500">Undirected graph visualization + Python code</p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
        </div>
      </div>

      {/* ✅ Graph Operations (เหมือน Directed: แถบเล็ก + ปุ่ม pill) */}
      <div className="mb-4 rounded-lg border bg-white p-3">
        <h2 className="text-sm font-semibold text-gray-800">Graph Operations</h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {undirectedGraphDragComponents.map((op) => (
            <button
              key={op.type}
              draggable
              onDragStart={(e) => handleDragStart(e, op)}
              className="rounded-full border px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100"
              title={op.description}
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main (เหมือน Directed) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Drop Zone */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-sm text-red-600">
              Clear
            </button>
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

        {/* Visualization */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">Graph Visualization</h2>

          {/* Step Indicator (เหมือนเดิม) */}
          {isAutoPlaying && state.operations.length > 0 && selectedStep !== null && (
            <Suspense fallback={null}>
              <StepIndicator
                stepNumber={selectedStep + 1}
                totalSteps={state.operations.length}
                message={getStepDescription(state.operations[selectedStep])}
                isAutoPlaying={isAutoPlaying}
              />
            </Suspense>
          )}

          <Suspense fallback={null}>
            <UndirectedGraphDragDropVisualization
              ref={visualizationRef}
              nodes={currentVisualizationState.nodes}
              edges={currentVisualizationState.edges}
              stats={currentVisualizationState.stats}
              isRunning={isAutoPlaying}
              currentOperation={selectedStep !== null ? state.operations[selectedStep]?.type : undefined}
              selectedStep={
                selectedStep !== null &&
                ['traversal_dfs', 'traversal_bfs', 'shortest_path'].includes(
                  state.operations[selectedStep]?.type,
                )
                  ? selectedStep
                  : null
              }
              currentOperationData={selectedStep !== null ? state.operations[selectedStep] : undefined}
              shortestPath={shortestPath}
            />
          </Suspense>
        </div>
      </div>

      {/* Step Control */}
      <div className="mt-6">
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
          <Suspense fallback={null}>
            <CodeEditor code={pythonCode} disabled height="400px" onCodeChange={() => {}} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DragDropUndirectedGraph;
