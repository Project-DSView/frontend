interface DirectedGraphData {
  nodes: Array<{
    id: string;
    value: string;
    x: number;
    y: number;
    outgoingEdges: string[];
    incomingEdges: string[];
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    weight?: number;
    isDirected: true;
  }>;
}

export type { DirectedGraphData };
