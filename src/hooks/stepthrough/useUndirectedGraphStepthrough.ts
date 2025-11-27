import { useMemo } from 'react';
import { useBaseStepthrough } from './useBaseStepthrough';
import {
  UndirectedGraphData,
  UndirectedGraphStats,
  BaseStepthroughState,
  BaseStepthroughService,
  StepthroughStep,
  UndirectedGraphNode,
  UndirectedGraphEdge,
} from '@/types';
import { undirectedGraphCodeTemplate } from '@/data';
class UndirectedGraphStepthroughService
  implements BaseStepthroughService<UndirectedGraphData, UndirectedGraphStats>
{
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): UndirectedGraphData {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return { nodes: [], edges: [] };
    }

    const step = steps[stepIndex];
    const state = step.state;

    // Extract graph data from state directly
    let nodes: UndirectedGraphNode[] = [];
    let edges: UndirectedGraphEdge[] = [];

    // Check if we have vertices and edges in state
    const stateWithGraph = state as Record<string, unknown>;
    if (
      stateWithGraph.vertices &&
      Array.isArray(stateWithGraph.vertices) &&
      stateWithGraph.edges &&
      Array.isArray(stateWithGraph.edges)
    ) {
      // Create nodes from vertices
      nodes = (stateWithGraph.vertices as string[]).map((vertex: string) => ({
        id: vertex,
        value: vertex,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        neighbors: [],
      }));

      // Create edges and update neighbors
      const processedEdges = new Set<string>();
      (stateWithGraph.edges as string[][]).forEach((edge: string[]) => {
        if (edge.length === 2) {
          const [from, to] = edge;
          const edgeKey = [from, to].sort().join('-');

          if (!processedEdges.has(edgeKey)) {
            processedEdges.add(edgeKey);

            const edgeObj: UndirectedGraphEdge = {
              id: `${from}-${to}`,
              from: from,
              to: to,
              weight: 1,
            };
            edges.push(edgeObj);

            // Update neighbors
            const fromNode = nodes.find((n) => n.id === from);
            const toNode = nodes.find((n) => n.id === to);
            if (fromNode && toNode) {
              if (!fromNode.neighbors.includes(to)) {
                fromNode.neighbors.push(to);
              }
              if (!toNode.neighbors.includes(from)) {
                toNode.neighbors.push(from);
              }
            }
          }
        }
      });
    }

    // If no graph data found, try to extract from instances
    if (nodes.length === 0 && state.instances) {
      Object.entries(state.instances).forEach(([, instanceData]) => {
        if (instanceData && typeof instanceData === 'object' && 'adjacency_list' in instanceData) {
          const instance = instanceData as Record<string, unknown>;
          if (instance.adjacency_list) {
            const graphData = this.convertAdjacencyListToGraphData(instance.adjacency_list);
            nodes = graphData.nodes;
            edges = graphData.edges;
          }
        }
      });
    }

    // If still no graph data, build from all steps up to current step
    if (nodes.length === 0) {
      const graphData = this.buildGraphFromSteps(steps, stepIndex);
      nodes = graphData.nodes;
      edges = graphData.edges;
    }

    return { nodes, edges };
  }

  extractStatsFromSteps(steps: StepthroughStep[], stepIndex: number): UndirectedGraphStats {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return {
        size: 0,
        isEmpty: true,
        vertices: 0,
        edges: 0,
        isConnected: true,
        hasCycle: false,
      };
    }

    const step = steps[stepIndex];
    const state = step.state;

    // Get graph data to determine stats
    const data = this.extractDataFromSteps(steps, stepIndex);
    const nodes = data.nodes;
    const edges = data.edges;

    // Extract stats from step detail if available
    let vertices = nodes.length;
    let edgeCount = edges.length;
    let isConnected = true;
    let hasCycle = false;

    if (state.step_detail) {
      const stepDetail = state.step_detail as Record<string, unknown>;

      if (typeof stepDetail.vertices === 'number') {
        vertices = stepDetail.vertices;
      }
      if (typeof stepDetail.edges === 'number') {
        edgeCount = stepDetail.edges;
      }
      if (typeof stepDetail.isConnected === 'boolean') {
        isConnected = stepDetail.isConnected;
      }
      if (typeof stepDetail.hasCycle === 'boolean') {
        hasCycle = stepDetail.hasCycle;
      }
    }

    // If no stats from step detail, calculate from graph
    if (vertices === 0 && nodes.length > 0) {
      vertices = nodes.length;
      edgeCount = edges.length;
      isConnected = this.calculateConnectivity(nodes);
      hasCycle = this.calculateCycleDetection(nodes);
    }

    return {
      size: vertices,
      isEmpty: vertices === 0,
      vertices: vertices,
      edges: edgeCount,
      isConnected: isConnected,
      hasCycle: hasCycle,
    };
  }

  private convertAdjacencyListToGraphData(adjacencyList: unknown): {
    nodes: UndirectedGraphNode[];
    edges: UndirectedGraphEdge[];
  } {
    if (!adjacencyList || typeof adjacencyList !== 'object') {
      return { nodes: [], edges: [] };
    }

    const adjList = adjacencyList as Record<string, string[]>;
    const nodes: UndirectedGraphNode[] = [];
    const edges: UndirectedGraphEdge[] = [];
    const processedEdges = new Set<string>();

    // Create nodes
    Object.keys(adjList).forEach((vertex) => {
      const node: UndirectedGraphNode = {
        id: vertex,
        value: vertex,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        neighbors: [],
      };
      nodes.push(node);
    });

    // Create edges
    Object.entries(adjList).forEach(([vertex, neighbors]) => {
      neighbors.forEach((neighbor) => {
        // Create edge key to avoid duplicates
        const edgeKey = [vertex, neighbor].sort().join('-');
        if (!processedEdges.has(edgeKey)) {
          processedEdges.add(edgeKey);

          const edge: UndirectedGraphEdge = {
            id: `${vertex}-${neighbor}`,
            from: vertex,
            to: neighbor,
            weight: 1,
          };
          edges.push(edge);

          // Update neighbors
          const fromNode = nodes.find((n) => n.id === vertex);
          const toNode = nodes.find((n) => n.id === neighbor);
          if (fromNode && toNode) {
            if (!fromNode.neighbors.includes(neighbor)) {
              fromNode.neighbors.push(neighbor);
            }
            if (!toNode.neighbors.includes(vertex)) {
              toNode.neighbors.push(vertex);
            }
          }
        }
      });
    });

    return { nodes, edges };
  }

  private buildGraphFromSteps(
    steps: StepthroughStep[],
    stepIndex: number,
  ): { nodes: UndirectedGraphNode[]; edges: UndirectedGraphEdge[] } {
    let nodes: UndirectedGraphNode[] = [];
    const edges: UndirectedGraphEdge[] = [];

    // Use the latest step that has graph data
    for (let i = stepIndex; i >= 0; i--) {
      const step = steps[i];
      const state = step.state;

      // Check if we have vertices and edges in state
      const stateWithGraph = state as Record<string, unknown>;
      if (
        stateWithGraph.vertices &&
        Array.isArray(stateWithGraph.vertices) &&
        stateWithGraph.edges &&
        Array.isArray(stateWithGraph.edges)
      ) {
        // Create nodes from vertices
        nodes = (stateWithGraph.vertices as string[]).map((vertex: string) => ({
          id: vertex,
          value: vertex,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          neighbors: [],
        }));

        // Create edges and update neighbors
        const processedEdges = new Set<string>();
        (stateWithGraph.edges as string[][]).forEach((edge: string[]) => {
          if (edge.length === 2) {
            const [from, to] = edge;
            const edgeKey = [from, to].sort().join('-');

            if (!processedEdges.has(edgeKey)) {
              processedEdges.add(edgeKey);

              const edgeObj: UndirectedGraphEdge = {
                id: `${from}-${to}`,
                from: from,
                to: to,
                weight: 1,
              };
              edges.push(edgeObj);

              // Update neighbors
              const fromNode = nodes.find((n) => n.id === from);
              const toNode = nodes.find((n) => n.id === to);
              if (fromNode && toNode) {
                if (!fromNode.neighbors.includes(to)) {
                  fromNode.neighbors.push(to);
                }
                if (!toNode.neighbors.includes(from)) {
                  toNode.neighbors.push(from);
                }
              }
            }
          }
        });

        // Found graph data, break the loop
        break;
      }
    }

    return { nodes, edges };
  }

  private calculateConnectivity(nodes: UndirectedGraphNode[]): boolean {
    if (nodes.length === 0) return true;

    const visited = new Set<string>();
    const startNode = nodes[0];

    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        node.neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            dfs(neighborId);
          }
        });
      }
    };

    dfs(startNode.id);
    return visited.size === nodes.length;
  }

  private calculateCycleDetection(nodes: UndirectedGraphNode[]): boolean {
    if (nodes.length === 0) return false;

    const visited = new Set<string>();

    const dfs = (nodeId: string, parentId: string | null): boolean => {
      visited.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        for (const neighborId of node.neighbors) {
          if (!visited.has(neighborId)) {
            if (dfs(neighborId, nodeId)) {
              return true;
            }
          } else if (neighborId !== parentId) {
            return true;
          }
        }
      }
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id, null)) {
          return true;
        }
      }
    }

    return false;
  }
}

const defaultState: BaseStepthroughState<UndirectedGraphData, UndirectedGraphStats> = {
  code: undirectedGraphCodeTemplate,
  filename: 'playground.py',
  steps: [],
  data: { nodes: [], edges: [] },
  stats: {
    size: 0,
    isEmpty: true,
    vertices: 0,
    edges: 0,
    isConnected: true,
    hasCycle: false,
  },
};

const useStepthroughUndirectedGraph = () => {
  const baseHook = useBaseStepthrough<
    UndirectedGraphData,
    UndirectedGraphStats,
    UndirectedGraphStepthroughService
  >(defaultState, UndirectedGraphStepthroughService, 'undirectedgraph');

  const graphData = useMemo(
    () => ({
      nodes: baseHook.state.data.nodes,
      edges: baseHook.state.data.edges,
      vertices: baseHook.state.stats.vertices,
      edgeCount: baseHook.state.stats.edges,
      isConnected: baseHook.state.stats.isConnected,
      hasCycle: baseHook.state.stats.hasCycle,
      isEmpty: baseHook.state.stats.isEmpty,
    }),
    [
      baseHook.state.data.nodes,
      baseHook.state.data.edges,
      baseHook.state.stats.vertices,
      baseHook.state.stats.edges,
      baseHook.state.stats.isConnected,
      baseHook.state.stats.hasCycle,
      baseHook.state.stats.isEmpty,
    ],
  );

  return {
    ...baseHook,
    graphData,
  };
};

export { useStepthroughUndirectedGraph };
