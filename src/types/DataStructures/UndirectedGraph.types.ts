import { Operation } from '../common.types';
import { BaseStats, BaseState } from './base.types';

interface UndirectedGraphNode {
  id: string;
  value: string;
  x: number;
  y: number;
  neighbors: string[]; // Array of node IDs that this node is connected to
}

interface UndirectedGraphEdge {
  id: string;
  from: string; // Node ID
  to: string; // Node ID
  weight?: number;
}

interface UndirectedGraphStats extends BaseStats {
  vertices: number;
  edges: number;
  isConnected: boolean;
  hasCycle: boolean;
}

interface UndirectedGraphOperation extends Operation {
  id: number;
  type:
    | 'add_vertex'
    | 'add_edge'
    | 'remove_vertex'
    | 'remove_edge'
    | 'traversal_dfs'
    | 'traversal_bfs'
    | 'shortest_path';
  value: string | null;
  position: string | null;
  newValue: string | null;
  fromVertex?: string | null;
  toVertex?: string | null;
  startVertex?: string | null;
  endVertex?: string | null;
}

interface UndirectedGraphDragComponent {
  id: string;
  name: string;
  color: string;
  category: 'insertion' | 'deletion' | 'traversal';
  type:
    | 'add_vertex'
    | 'add_edge'
    | 'remove_vertex'
    | 'remove_edge'
    | 'traversal_dfs'
    | 'traversal_bfs'
    | 'shortest_path';
  description: string;
}

interface UndirectedGraphState {
  nodes: UndirectedGraphNode[];
  edges: UndirectedGraphEdge[];
  operations: UndirectedGraphOperation[];
  stats: UndirectedGraphStats;
}

interface UndirectedGraphExecutionStep {
  step: string;
  description: string;
  duration: number;
  nodeValue?: string;
  path?: string[];
  highlightedNodes?: string[];
  highlightedEdges?: string[];
}

interface UndirectedGraphCodeTemplate {
  addVertex: string;
  addEdge: string;
  removeVertex: string;
  removeEdge: string;
  traversal: string;
  shortestPath: string;
}

interface UndirectedGraphOperationsProps {
  dragComponents: UndirectedGraphDragComponent[];
  onDragStart: (e: React.DragEvent, component: UndirectedGraphDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: UndirectedGraphDragComponent) => void;
}

interface UndirectedGraphVisualizationProps {
  nodes: UndirectedGraphNode[];
  edges: UndirectedGraphEdge[];
  stats: UndirectedGraphStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  selectedStep?: number | null;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  searchPath?: string[];
  shortestPath?: string[];
  shortestPathEdges?: string[];
  currentOperationData?: UndirectedGraphOperation;
}

interface PositionedUndirectedGraphNode extends UndirectedGraphNode {
  level: number;
}

interface UndirectedGraphData {
  nodes: UndirectedGraphNode[];
  edges: UndirectedGraphEdge[];
}

interface UndirectedGraphStatsExtended extends BaseStats {
  vertices: number;
  edges: number;
  isConnected: boolean;
  hasCycle: boolean;
}

interface UndirectedGraphStateExtended extends BaseState<UndirectedGraphData, UndirectedGraphStatsExtended> {
  data: UndirectedGraphData;
  stats: UndirectedGraphStatsExtended;
}

export type {
  UndirectedGraphNode,
  UndirectedGraphEdge,
  UndirectedGraphStats,
  UndirectedGraphOperation,
  UndirectedGraphDragComponent,
  UndirectedGraphState,
  UndirectedGraphExecutionStep,
  UndirectedGraphCodeTemplate,
  UndirectedGraphOperationsProps,
  UndirectedGraphVisualizationProps,
  PositionedUndirectedGraphNode,
  UndirectedGraphData,
  UndirectedGraphStatsExtended,
  UndirectedGraphStateExtended,
};
