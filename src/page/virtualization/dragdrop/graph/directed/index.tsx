'use client';

import React, {
  useState,
  useRef,
  lazy,
  Suspense,
  useMemo,
  useEffect,
} from 'react';

import { DirectedGraphDragComponent, Operation } from '@/types';
import { useDragDropDirectedGraph } from '@/hooks';
import { directedGraphDragComponents } from '@/data';

import DragDropZone from '@/components/playground/shared/DragDropZone';
import StepSelector from '@/components/playground/shared/StepSelector';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';
import PythonCodeBlock from '@/components/playground/shared/PythonCodeBlock';

// ✅ FIX: opeartion -> operation
const DirectedGraphOperations = lazy(
  () => import('@/components/playground/dragdrop/opeartion/DirectedGraph'),
);
const DirectedGraphVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/DirectedGraph'),
);
const TutorialModal = lazy(() => import('@/components/tutorial/TutorialModal'));

/* =========================
    Types (local helper)
========================= */
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

/* =========================
    Helpers (graph)
========================= */

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

const dfsVisit = (
  start: string,
  adj: Map<string, string[]>,
  visited: Set<string>,
) => {
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
      if (c === 1) return true; // back-edge
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

const isStronglyConnected = (nodes: string[], edges: GraphEdge[]) => {
  if (nodes.length <= 1) return true;

  const adj = buildAdj(nodes, edges);
  const radj = buildReverseAdj(nodes, edges);

  // pick first node
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
const buildGraphFromOperations = (
  ops: Operation[],
  stepIndex: number,
): GraphState => {
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
    // ลบเส้นแรกที่ match (กันลบหมดถ้ามีซ้ำ)
    const idx = edges.findIndex((e) => e.from === from && e.to === to);
    if (idx >= 0) edges.splice(idx, 1);
  };

  const addVertex = (v: string) => {
    if (!v) return;
    vertexSet.add(v);
  };

  const addEdge = (from: string, to: string, weightRaw?: any) => {
    if (!from || !to) return;

    // auto add vertices
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
        const v = normalize(op.value);
        addVertex(v);
        break;
      }

      case 'remove_vertex': {
        const v = normalize(op.value);
        removeVertex(v);
        break;
      }

      case 'add_edge': {
        const from = normalize((op as any).fromVertex);
        const to = normalize((op as any).toVertex);

        // ใน UI ของน้อง "ช่องตัวเลข" มักถูกเก็บใน op.value
        const weightRaw = (op as any).value ?? (op as any).newValue ?? null;
        addEdge(from, to, weightRaw);
        break;
      }

      case 'remove_edge': {
        const from = normalize((op as any).fromVertex);
        const to = normalize((op as any).toVertex);
        removeEdge(from, to);
        break;
      }

      // traversal / shortest_path ไม่เปลี่ยนโครงสร้างกราฟ
      case 'traversal_bfs':
      case 'traversal_dfs':
      case 'shortest_path':
      default:
        break;
    }
  }

  const nodes = Array.from(vertexSet);
  const stats: GraphStats = {
    vertexCount: nodes.length,
    edgeCount: edges.length,
    isStronglyConnected: isStronglyConnected(nodes, edges),
    hasCycle: hasDirectedCycle(nodes, edges),
  };

  return { nodes, edges, stats };
};

const DragDropDirectedGraph = () => {
  const {
    state,
    addOperation,
    updateOperation,
    removeOperation,
    clearAll,
    reorderOperation,
  } = useDragDropDirectedGraph();

  const [draggedItem, setDraggedItem] =
    useState<DirectedGraphDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Drag ================= */

  const handleDragStart = (
    e: React.DragEvent,
    component: DirectedGraphDragComponent,
  ) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // ⭐ สำคัญมาก
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

  /* ================= Step Description ================= */

  const getStepDescription = (op: Operation) => {
    switch (op.type) {
      case 'add_vertex':
        return `เพิ่ม Vertex ${op.value ?? ''}`;
      case 'add_edge':
        return `เพิ่ม Edge จาก ${(op as any).fromVertex ?? '?'} → ${(op as any).toVertex ?? '?'}`;
      case 'remove_vertex':
        return `ลบ Vertex ${op.value ?? ''}`;
      case 'remove_edge':
        return `ลบ Edge จาก ${(op as any).fromVertex ?? '?'} → ${(op as any).toVertex ?? '?'}`;
      case 'traversal_dfs':
        return `DFS เริ่มจาก ${(op as any).startVertex ?? ''}`;
      case 'traversal_bfs':
        return `BFS เริ่มจาก ${(op as any).startVertex ?? ''}`;
      case 'shortest_path':
        return `หาเส้นทางสั้นสุด ${(op as any).startVertex ?? ''} → ${(op as any).endVertex ?? ''}`;
      default:
        return op.name;
    }
  };

  /* ================= ✅ Graph State (FIX Visualization) =================
     ถ้าเลือก step -> ใช้ graph ของ step นั้น
     ถ้าไม่เลือก step -> ใช้ graph ของ "operation สุดท้าย" (เต็มกราฟ)
  ===================================================================== */
  const graphState = useMemo<GraphState>(() => {
    if (!state.operations || state.operations.length === 0) {
      return {
        nodes: [],
        edges: [],
        stats: {
          vertexCount: 0,
          edgeCount: 0,
          isStronglyConnected: true,
          hasCycle: false,
        },
      };
    }

    const stepIndex =
      selectedStep !== null ? selectedStep : state.operations.length - 1;

    return buildGraphFromOperations(state.operations as Operation[], stepIndex);
  }, [state.operations, selectedStep]);

  /* ================= Python Code Generator ================= */

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

    (state.operations as Operation[]).forEach((op) => {
      if (op.type === 'add_vertex' && op.value) {
        lines.push(`g.add_vertex("${op.value}")`);
      }

      if (op.type === 'add_edge' && (op as any).fromVertex && (op as any).toVertex) {
        lines.push(`g.add_edge("${(op as any).fromVertex}", "${(op as any).toVertex}")`);
      }
    });

    lines.push('', 'g.show()');

    return lines.join('\n');
  }, [state.operations]);

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Drag & Drop Directed Graph</h1>
          <p className="text-sm text-gray-500">
            Directed graph visualization + Python code
          </p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          <ExportPNGButton visualizationRef={visualizationRef} />
        </div>
      </div>

      {/* Operations */}
      <div className="mb-6 rounded-xl border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold">Graph Operations</h2>

        <Suspense fallback={null}>
          <DirectedGraphOperations
            dragComponents={directedGraphDragComponents}
            onDragStart={handleDragStart}
          />
        </Suspense>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
            onUpdateOperationValue={(id, value) => updateOperation(id, { value })}
            onUpdateOperationPosition={(id, position) => updateOperation(id, { position })}
            onUpdateOperationNewValue={(id, newValue) => updateOperation(id, { newValue })}
            onReorderOperation={reorderOperation}
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold">Graph Visualization</h2>

          <Suspense fallback={null}>
            <DirectedGraphVisualization
              ref={visualizationRef}
              // ✅ FIX: ส่งกราฟที่คำนวณจาก operations เข้าไป
              nodes={graphState.nodes as any}
              edges={graphState.edges as any}
              stats={{
                ...(state.stats as any),
                // ✅ ทำให้ตัวเลขด้านล่างตรงกับกราฟจริงเสมอ
                vertexCount: graphState.stats.vertexCount,
                edgeCount: graphState.stats.edgeCount,
                isStronglyConnected: graphState.stats.isStronglyConnected,
                hasCycle: graphState.stats.hasCycle,
              }}
              isRunning={isAutoPlaying}
              currentOperation={
                selectedStep !== null
                  ? (state.operations as Operation[])[selectedStep]?.type
                  : undefined
              }
              currentOperationData={
                selectedStep !== null
                  ? (state.operations as Operation[])[selectedStep]
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
        <h2 className="text-sm font-semibold">Generated Python Code</h2>

        <div className="mt-4 rounded-lg">
          <PythonCodeBlock
            code={pythonCode || '# ลาก Add Vertex / Add Edge เพื่อสร้าง Directed Graph'}
          />
        </div>
      </div>

      {/* Tutorial */}
      <Suspense fallback={null}>
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
