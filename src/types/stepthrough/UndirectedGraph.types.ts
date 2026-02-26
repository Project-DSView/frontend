interface UndirectedGraphData {
  nodes: Array<{
    id: string;
    value: string;
    x: number;
    y: number;
    neighbors: string[];
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    weight?: number;
  }>;
}

export type { UndirectedGraphData };
