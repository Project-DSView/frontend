import { Operation } from './common.types';
import { BaseStats, BaseState } from './base.types';

interface DirectedGraphNode {
  id: string;
  value: string;
  x: number;
  y: number;
  outgoingEdges: string[]; // Array of edge IDs that this node points to
  incomingEdges: string[]; // Array of edge IDs that point to this node
}

interface DirectedGraphEdge {
  id: string;
  from: string; // Node ID
  to: string; // Node ID
  weight?: number;
  isDirected: true;
}

interface DirectedGraphStats extends BaseStats {
  vertices: number;
  edges: number;
  isStronglyConnected: boolean;
  hasCycle: boolean;
  inDegree: { [key: string]: number };
  outDegree: { [key: string]: number };
}

interface DirectedGraphOperation extends Operation {
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

interface DirectedGraphDragComponent {
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

interface DirectedGraphState {
  nodes: DirectedGraphNode[];
  edges: DirectedGraphEdge[];
  operations: DirectedGraphOperation[];
  stats: DirectedGraphStats;
}

interface DirectedGraphExecutionStep {
  step: string;
  description: string;
  duration: number;
  nodeValue?: string;
  path?: string[];
  highlightedNodes?: string[];
  highlightedEdges?: string[];
}

interface DirectedGraphOperationsProps {
  dragComponents: DirectedGraphDragComponent[];
  onDragStart: (e: React.DragEvent, component: DirectedGraphDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: DirectedGraphDragComponent) => void;
}

interface DirectedGraphVisualizationProps {
  nodes: DirectedGraphNode[];
  edges: DirectedGraphEdge[];
  stats: DirectedGraphStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  selectedStep?: number | null;
  highlightedNodes?: string[];
  highlightedEdges?: string[];
  searchPath?: string[];
  shortestPath?: string[];
  shortestPathEdges?: string[];
  currentOperationData?: DirectedGraphOperation;
}

interface PositionedDirectedGraphNode extends DirectedGraphNode {
  level: number;
}

interface DirectedGraphData {
  nodes: DirectedGraphNode[];
  edges: DirectedGraphEdge[];
}

interface DirectedGraphStatsExtended extends BaseStats {
  vertices: number;
  edges: number;
  isStronglyConnected: boolean;
  hasCycle: boolean;
  inDegree: { [key: string]: number };
  outDegree: { [key: string]: number };
}

interface DirectedGraphStateExtended
  extends BaseState<DirectedGraphData, DirectedGraphStatsExtended> {
  data: DirectedGraphData;
  stats: DirectedGraphStatsExtended;
}

export type {
  DirectedGraphNode,
  DirectedGraphEdge,
  DirectedGraphStats,
  DirectedGraphOperation,
  DirectedGraphDragComponent,
  DirectedGraphState,
  DirectedGraphExecutionStep,
  DirectedGraphOperationsProps,
  DirectedGraphVisualizationProps,
  PositionedDirectedGraphNode,
  DirectedGraphData,
  DirectedGraphStatsExtended,
  DirectedGraphStateExtended,
};
