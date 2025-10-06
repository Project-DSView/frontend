interface UndirectedGraphNodeData {
  id: string;
  value: string;
  x: number;
  y: number;
  neighbors: string[]; // Array of node IDs that this node is connected to
  isHighlighted?: boolean;
}

interface UndirectedGraphEdgeData {
  id: string;
  from: string; // Node ID
  to: string; // Node ID
  weight?: number;
}

interface UndirectedGraphData {
  nodes: UndirectedGraphNodeData[];
  edges: UndirectedGraphEdgeData[];
  vertices: number;
  edgeCount: number;
  isConnected: boolean;
  hasCycle: boolean;

  // For dynamic multiple graphs support
  allGraphs?: {
    [graphName: string]: {
      data: {
        nodes: UndirectedGraphNodeData[];
        edges: UndirectedGraphEdgeData[];
      };
      vertices: number;
      edgeCount: number;
      isConnected: boolean;
      hasCycle: boolean;
    };
  };

  currentOperation?:
    | 'add_vertex'
    | 'add_edge'
    | 'remove_vertex'
    | 'remove_edge'
    | 'traversal_dfs'
    | 'traversal_bfs'
    | 'shortest_path'
    | 'normal';
  currentTraversal?: 'dfs' | 'bfs';
  traversalResults?: {
    dfs: string[];
    bfs: string[];
  };
}

interface UndirectedGraphStats {
  vertices: number;
  edgeCount: number;
  isConnected: boolean;
  hasCycle: boolean;
}

interface UndirectedGraphRealtimeVisualizationProps {
  data: UndirectedGraphData;
  isExecuting: boolean;
  error: string | null;
  securityStatus: SecurityStatus;
  updateNodePosition?: (nodeId: string, x: number, y: number) => void;
  getNodePositions?: () => { [key: string]: { x: number; y: number } };
}

interface ParsedCode {
  operations: Operation[];
  isValid: boolean;
  errors: string[];
}

interface Operation {
  type:
    | 'add_vertex'
    | 'add_edge'
    | 'remove_vertex'
    | 'remove_edge'
    | 'traversal_dfs'
    | 'traversal_bfs'
    | 'shortest_path';
  parameters: string[];
  graphVariable?: string;
  fromVertex?: string;
  toVertex?: string;
  startVertex?: string;
  endVertex?: string;
}

interface SecurityStatus {
  isSafe: boolean;
  violations: string[];
  warnings: string[];
}

export type {
  UndirectedGraphNodeData,
  UndirectedGraphEdgeData,
  UndirectedGraphData,
  UndirectedGraphStats,
  UndirectedGraphRealtimeVisualizationProps,
  ParsedCode,
  Operation,
  SecurityStatus,
};
