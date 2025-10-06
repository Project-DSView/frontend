interface DirectedGraphNodeData {
  id: string;
  value: string;
  x: number;
  y: number;
  outgoingEdges: string[];
  incomingEdges: string[];
  isHighlighted?: boolean;
}

interface DirectedGraphEdgeData {
  id: string;
  from: string;
  to: string;
  weight?: number;
  isDirected: true;
}

interface DirectedGraphStats {
  vertices: number;
  edgeCount: number;
  isStronglyConnected: boolean;
  hasCycle: boolean;
  inDegree: { [nodeId: string]: number };
  outDegree: { [nodeId: string]: number };
}

interface DirectedGraphData extends DirectedGraphStats {
  nodes: DirectedGraphNodeData[];
  edges: DirectedGraphEdgeData[];
  currentOperation?: string;
  currentTraversal?: string;
  traversalResults?: {
    dfs: string[];
    bfs: string[];
    topological: string[];
  };
  shortestPath?: string[];
  allGraphs?: {
    [graphName: string]: {
      data: { nodes: DirectedGraphNodeData[]; edges: DirectedGraphEdgeData[] };
      vertices: number;
      edgeCount: number;
      isStronglyConnected: boolean;
      hasCycle: boolean;
      inDegree: { [nodeId: string]: number };
      outDegree: { [nodeId: string]: number };
    };
  };
}

interface GraphData {
  data: { nodes: DirectedGraphNodeData[]; edges: DirectedGraphEdgeData[] };
  vertices: number;
  edgeCount: number;
  isStronglyConnected: boolean;
  hasCycle: boolean;
  inDegree: { [nodeId: string]: number };
  outDegree: { [nodeId: string]: number };
}

interface SecurityStatus {
  isSafe: boolean;
  violations: string[];
}

interface ParsedCode {
  operations: Operation[];
  graphVariables: string[];
  isValid: boolean;
  errors: string[];
}

interface Operation {
  type: string;
  parameters: string[];
  graphVariable?: string;
  fromVertex?: string;
  toVertex?: string;
  startVertex?: string;
}

interface DirectedGraphRealtimeProps {
  data: DirectedGraphData;
  isExecuting?: boolean;
  error: string | null;
  securityStatus: SecurityStatus;
  updateNodePosition?: (nodeId: string, x: number, y: number) => void;
  getNodePositions?: () => { [key: string]: { x: number; y: number } };
}

export type {
  DirectedGraphNodeData,
  DirectedGraphEdgeData,
  DirectedGraphStats,
  DirectedGraphData,
  GraphData,
  SecurityStatus,
  ParsedCode,
  Operation,
  DirectedGraphRealtimeProps,
};
