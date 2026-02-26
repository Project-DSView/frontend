'use client';

import React, { useState, useRef, Suspense, useMemo, useEffect } from 'react';

import {
  DirectedGraphDragComponent,
  Operation,
  DirectedGraphOperation,
  DirectedGraphNode,
  DirectedGraphEdge,
} from '@/types';
import { useDragDropDirectedGraph } from '@/hooks';
import { directedGraphDragComponents, getTutorialSteps, getTutorialStorageKey } from '@/data';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import TutorialOverlay from '@/components/playground/shared/tutorial/TutorialOverlay';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';

const DirectedGraphVisualization = React.lazy(
  () => import('@/components/playground/dragdrop/visualization/DirectedGraph'),
);
const CodeEditor = React.lazy(() => import('@/components/editor/CodeEditor'));

type GraphEdge = {
  from: string;
  to: string;
  weight?: number | null;
};

type GraphStats = {
  vertexCount: number;
  edgeCount: number;
  isStronglyConnected: boolean;
  hasCycle: boolean;
};

type GraphState = {
  nodes: string[];
  edges: GraphEdge[];
  stats: GraphStats;
};

// Build adjacency list
const buildAdj = (nodes: string[], edges: GraphEdge[]) => {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n, []));
  edges.forEach((e) => {
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from)!.push(e.to);
  });
  return adj;
};

// Reverse adjacency (for SCC)
const buildReverseAdj = (nodes: string[], edges: GraphEdge[]) => {
  const radj = new Map<string, string[]>();
  nodes.forEach((n) => radj.set(n, []));
  edges.forEach((e) => {
    if (!radj.has(e.to)) radj.set(e.to, []);
    if (!radj.has(e.from)) radj.set(e.from, []);
    radj.get(e.to)!.push(e.from);
  });
  return radj;
};

const dfsVisit = (start: string, adj: Map<string, string[]>, visited: Set<string>) => {
  const stack = [start];
  visited.add(start);
  while (stack.length) {
    const u = stack.pop()!;
    const nxt = adj.get(u) ?? [];
    for (const v of nxt) {
      if (!visited.has(v)) {
        visited.add(v);
        stack.push(v);
      }
    }
  }
};

const hasDirectedCycle = (nodes: string[], edges: GraphEdge[]) => {
  const adj = buildAdj(nodes, edges);
  const color = new Map<string, 0 | 1 | 2>(); // 0=unvisited,1=visiting,2=done
  nodes.forEach((n) => color.set(n, 0));

  const dfs = (u: string): boolean => {
    color.set(u, 1);
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? 0;
      if (c === 1) return true;
      if (c === 0 && dfs(v)) return true;
    }
    color.set(u, 2);
    return false;
  };

  for (const n of nodes) {
    if ((color.get(n) ?? 0) === 0) {
      if (dfs(n)) return true;
    }
  }
  return false;
};

const isStronglyConnectedFn = (nodes: string[], edges: GraphEdge[]) => {
  if (nodes.length <= 1) return true;

  const adj = buildAdj(nodes, edges);
  const radj = buildReverseAdj(nodes, edges);

  const start = nodes[0];

  const vis1 = new Set<string>();
  dfsVisit(start, adj, vis1);
  if (vis1.size !== nodes.length) return false;

  const vis2 = new Set<string>();
  dfsVisit(start, radj, vis2);
  if (vis2.size !== nodes.length) return false;

  return true;
};

// Apply operations up to stepIndex (inclusive). stepIndex = -1 => empty
const buildGraphFromOperations = (ops: DirectedGraphOperation[], stepIndex: number): GraphState => {
  const vertexSet = new Set<string>();
  let edges: GraphEdge[] = [];

  const normalize = (s?: string | null) => (s ?? '').trim();

  const removeVertex = (v: string) => {
    if (!v) return;
    vertexSet.delete(v);
    edges = edges.filter((e) => e.from !== v && e.to !== v);
  };

  const removeEdge = (from: string, to: string) => {
    if (!from || !to) return;
    const idx = edges.findIndex((e) => e.from === from && e.to === to);
    if (idx >= 0) edges.splice(idx, 1);
  };

  const addVertex = (v: string) => {
    if (!v) return;
    vertexSet.add(v);
  };

  const addEdge = (from: string, to: string, weightRaw?: string | number | null) => {
    if (!from || !to) return;

    addVertex(from);
    addVertex(to);

    const w =
      weightRaw === null || weightRaw === undefined || `${weightRaw}`.trim() === ''
        ? null
        : Number.isNaN(Number(weightRaw))
          ? null
          : Number(weightRaw);

    edges.push({ from, to, weight: w });
  };

  for (let i = 0; i <= stepIndex; i++) {
    const op = ops[i];
    if (!op) continue;

    switch (op.type) {
      case 'add_vertex': {
        addVertex(normalize(op.value));
        break;
      }
      case 'remove_vertex': {
        removeVertex(normalize(op.value));
        break;
      }
      case 'add_edge': {
        const from = normalize(op.fromVertex);
        const to = normalize(op.toVertex);
        const weightRaw = op.value ?? op.newValue ?? null;
        addEdge(from, to, weightRaw);
        break;
      }
      case 'remove_edge': {
        removeEdge(normalize(op.fromVertex), normalize(op.toVertex));
        break;
      }
      default:
        break;
    }
  }

  const nodes = Array.from(vertexSet);
  const stats: GraphStats = {
    vertexCount: nodes.length,
    edgeCount: edges.length,
    isStronglyConnected: isStronglyConnectedFn(nodes, edges),
    hasCycle: hasDirectedCycle(nodes, edges),
  };

  return { nodes, edges, stats };
};

const DragDropDirectedGraph = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropDirectedGraph();

  const [draggedItem, setDraggedItem] = useState<DirectedGraphDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Drag ================= */

  const handleDragStart = (e: React.DragEvent, component: DirectedGraphDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    addOperation({
      type: draggedItem.type,
      name: draggedItem.name,
      value: '',
      position: null,
      newValue: null,
      fromVertex: null,
      toVertex: null,
      startVertex: null,
      endVertex: null,
      color: draggedItem.color,
      category: draggedItem.category,
    });

    setDraggedItem(null);
  };

  /* ================= Auto Play ================= */

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    if (state.operations.length === 0) return;

    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        if (prev === null || prev >= state.operations.length - 1) {
          setIsAutoPlaying(false);
          if (autoPlayRef.current) clearInterval(autoPlayRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  /* ================= Update helpers ================= */

  const updateOperationValue = (id: number, value: string) => updateOperation(id, { value });
  const updateOperationPosition = (id: number, position: string) =>
    updateOperation(id, { position });
  const updateOperationNewValue = (id: number, newValue: string) =>
    updateOperation(id, { newValue });

  /* ================= Step Description ================= */

  const getStepDescription = (op: Operation) => {
    const dOp = op as DirectedGraphOperation;
    switch (op.type) {
      case 'add_vertex':
        return `เพิ่ม Vertex ${op.value ?? ''}`;
      case 'add_edge':
        return `เพิ่ม Edge จาก ${dOp.fromVertex ?? '?'} → ${dOp.toVertex ?? '?'}`;
      case 'remove_vertex':
        return `ลบ Vertex ${op.value ?? ''}`;
      case 'remove_edge':
        return `ลบ Edge จาก ${dOp.fromVertex ?? '?'} → ${dOp.toVertex ?? '?'}`;
      case 'traversal_dfs':
        return `DFS เริ่มจาก ${dOp.startVertex ?? ''}`;
      case 'traversal_bfs':
        return `BFS เริ่มจาก ${dOp.startVertex ?? ''}`;
      case 'shortest_path':
        return `หาเส้นทางสั้นสุด ${dOp.startVertex ?? ''} → ${dOp.endVertex ?? ''}`;
      default:
        return op.name;
    }
  };

  /* ================= Graph State (for visualization) ================= */

  const graphState = useMemo<GraphState>(() => {
    if (!state.operations || state.operations.length === 0) {
      return {
        nodes: [],
        edges: [],
        stats: { vertexCount: 0, edgeCount: 0, isStronglyConnected: true, hasCycle: false },
      };
    }
    const stepIndex = selectedStep !== null ? selectedStep : state.operations.length - 1;
    return buildGraphFromOperations(state.operations as DirectedGraphOperation[], stepIndex);
  }, [state.operations, selectedStep]);

  const pythonCode = useMemo(() => {
    const lines: string[] = [
      'class DirectedGraph:',
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
      '',
      '    def show(self):',
      '        for v in self.graph:',
      '            print(v, "->", self.graph[v])',
      '',
      'g = DirectedGraph()',
      '',
    ];

    (state.operations as DirectedGraphOperation[]).forEach((op) => {
      if (op.type === 'add_vertex' && op.value) lines.push(`g.add_vertex("${op.value}")`);
      if (op.type === 'add_edge' && op.fromVertex && op.toVertex) {
        lines.push(`g.add_edge("${op.fromVertex}", "${op.toVertex}")`);
      }
    });

    lines.push('', 'g.show()');
    return lines.join('\n');
  }, [state.operations]);

  /* ================= Visualization Data Transform ================= */

  const visualizationData = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = graphState;

    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};
    rawNodes.forEach((n) => {
      inDegree[n] = 0;
      outDegree[n] = 0;
    });

    const edges: DirectedGraphEdge[] = rawEdges.map((e, i) => {
      const edgeId = `e-${e.from}-${e.to}-${i}`;
      outDegree[e.from] = (outDegree[e.from] || 0) + 1;
      inDegree[e.to] = (inDegree[e.to] || 0) + 1;

      return {
        id: edgeId,
        from: e.from,
        to: e.to,
        weight: e.weight ?? undefined,
        isDirected: true,
      };
    });

    // circle layout
    const centerX = 400;
    const centerY = 240; // ✅ ลดลงนิดให้สมดุล
    const radius = 180;
    const angleStep = rawNodes.length > 0 ? (2 * Math.PI) / rawNodes.length : 0;

    const nodes: DirectedGraphNode[] = rawNodes.map((nodeId, i) => {
      const angle = i * angleStep;
      return {
        id: nodeId,
        value: nodeId,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        outgoingEdges: edges.filter((x) => x.from === nodeId).map((x) => x.id),
        incomingEdges: edges.filter((x) => x.to === nodeId).map((x) => x.id),
      };
    });

    return { nodes, edges, inDegree, outDegree };
  }, [graphState]);

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Drag & Drop Directed Graph</h1>
          <p className="text-sm text-gray-500">คลิก operation เพื่อสร้าง BST + Python code</p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          <ExportPNGButton visualizationRef={visualizationRef} />
        </div>
      </div>

      {/* ✅ Graph Operations (เหมือนในรูป: แถบเล็ก + ปุ่ม pill) */}
      <div className="mb-4 rounded-lg border bg-white p-3">
        <h2 className="text-sm font-semibold text-gray-800">Graph Operations</h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {directedGraphDragComponents.map((op) => (
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

      {/* Main */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Drop Zone */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button
              onClick={() => {
                clearAll();
                setSelectedStep(null);
              }}
              className="text-sm text-red-600"
            >
              Clear
            </button>
          </div>

          <DragDropZone
            operations={state.operations as Operation[]}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onRemoveOperation={removeOperation}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
            onReorderOperation={reorderOperation}
          />
        </div>

        {/* Visualization */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold">Graph Visualization</h2>

          <Suspense fallback={null}>
            <DirectedGraphVisualization
              ref={visualizationRef}
              nodes={visualizationData.nodes}
              edges={visualizationData.edges}
              stats={{
                vertices: graphState.stats.vertexCount,
                edges: graphState.stats.edgeCount,
                isStronglyConnected: graphState.stats.isStronglyConnected,
                hasCycle: graphState.stats.hasCycle,
                size: graphState.stats.vertexCount,
                isEmpty: graphState.stats.vertexCount === 0,
                inDegree: visualizationData.inDegree,
                outDegree: visualizationData.outDegree,
              }}
              isRunning={isAutoPlaying}
              currentOperation={
                selectedStep !== null
                  ? (state.operations as unknown as DirectedGraphOperation[])[selectedStep]?.type
                  : undefined
              }
              currentOperationData={
                selectedStep !== null
                  ? (state.operations as unknown as DirectedGraphOperation[])[selectedStep]
                  : undefined
              }
            />
          </Suspense>
        </div>
      </div>

      {/* Step Control */}
      <div className="mt-6">
        <StepSelector
          operations={state.operations as Operation[]}
          selectedStep={selectedStep}
          onStepSelect={setSelectedStep}
          onAutoPlay={handleAutoPlay}
          isAutoPlaying={isAutoPlaying}
          getStepDescription={getStepDescription}
        />
      </div>

      {/* Python Code */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Generated Python Code</h2>
          <CopyCodeButton code={pythonCode} />
        </div>

        <div className="mt-4 rounded-lg">
          <Suspense fallback={null}>
            <CodeEditor code={pythonCode} disabled height="400px" onCodeChange={() => {}} />
          </Suspense>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        steps={getTutorialSteps('dragdrop')}
        storageKey={getTutorialStorageKey(
          typeof window !== 'undefined'
            ? window.location.pathname
            : '/virtualization/dragdrop/graph/directed',
          'dragdrop',
        )}
      />
    </div>
  );
};

export default DragDropDirectedGraph;
