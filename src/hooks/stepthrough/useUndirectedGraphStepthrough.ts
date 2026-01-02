import { useMemo, useState, useEffect, useRef } from 'react';
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

    // Check if we have vertices and edges in state (old format)
    const stateWithGraph = state as Record<string, unknown>;
    if (
      stateWithGraph.vertices &&
      Array.isArray(stateWithGraph.vertices) &&
      stateWithGraph.edges &&
      Array.isArray(stateWithGraph.edges)
    ) {
      // Create nodes from vertices
      nodes = (stateWithGraph.vertices as string[]).map((vertex: string, index: number) => ({
        id: vertex,
        value: vertex,
        x: 100 + (index % 4) * 120,
        y: 100 + Math.floor(index / 4) * 100,
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

    // [NEW] Check for graph data in instances (new backend format)
    if (nodes.length === 0 && state.instances) {
      Object.entries(state.instances).forEach(([, instanceData]) => {
        if (instanceData && typeof instanceData === 'object') {
          const instance = instanceData as Record<string, unknown>;

          // New format: instances[name].graph = { 'A': { 'B': 1 }, ... }
          if (instance.graph && typeof instance.graph === 'object') {
            const graphData = this.convertGraphDictToGraphData(
              instance.graph as Record<string, Record<string, number>>,
            );
            nodes = graphData.nodes;
            edges = graphData.edges;
          }
          // Old format: instances[name].adjacency_list
          else if (instance.adjacency_list) {
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

  // [NEW] Convert graph dict format to nodes/edges
  // Supports both:
  //   - Array format: { 'A': ['B', 'C'], 'B': ['D'] } from template adjacency_list
  //   - Dict format: { 'A': { 'B': 1, 'C': 2 }, 'B': {} } with weights
  private convertGraphDictToGraphData(graphDict: Record<string, unknown>): {
    nodes: UndirectedGraphNode[];
    edges: UndirectedGraphEdge[];
  } {
    if (!graphDict || typeof graphDict !== 'object') {
      return { nodes: [], edges: [] };
    }

    const nodes: UndirectedGraphNode[] = [];
    const edges: UndirectedGraphEdge[] = [];
    const nodeIds = new Set<string>();
    const processedEdges = new Set<string>();

    // First pass: collect all node IDs (including those only mentioned as neighbors)
    Object.keys(graphDict).forEach((vertex) => nodeIds.add(vertex));
    Object.values(graphDict).forEach((neighbors) => {
      if (Array.isArray(neighbors)) {
        // Array format: ['B', 'C']
        neighbors.forEach((neighbor) => {
          if (typeof neighbor === 'string') nodeIds.add(neighbor);
        });
      } else if (neighbors && typeof neighbors === 'object') {
        // Dict format: { 'B': 1, 'C': 2 }
        Object.keys(neighbors as Record<string, unknown>).forEach((neighbor) =>
          nodeIds.add(neighbor),
        );
      }
    });

    // Create nodes with circular layout (looks more like a graph)
    const nodeList = Array.from(nodeIds);
    const centerX = 250;
    const centerY = 200;
    const radius = Math.max(80, nodeList.length * 25); // Radius scales with node count

    nodeList.forEach((vertex, index) => {
      // Position nodes in a circle
      const angle = (2 * Math.PI * index) / nodeList.length - Math.PI / 2; // Start from top
      const node: UndirectedGraphNode = {
        id: vertex,
        value: vertex,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        neighbors: [],
      };
      nodes.push(node);
    });

    // Create edges (undirected - only one edge per pair)
    Object.entries(graphDict).forEach(([vertex, neighbors]) => {
      if (Array.isArray(neighbors)) {
        // Array format: ['B', 'C']
        neighbors.forEach((neighbor) => {
          if (typeof neighbor !== 'string') return;
          // Create edge key to avoid duplicates (undirected)
          const edgeKey = [vertex, neighbor].sort().join('-');

          if (!processedEdges.has(edgeKey)) {
            processedEdges.add(edgeKey);

            const edge: UndirectedGraphEdge = {
              id: edgeKey,
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
      } else if (neighbors && typeof neighbors === 'object') {
        // Dict format: { 'B': 1, 'C': 2 }
        Object.entries(neighbors as Record<string, number>).forEach(([neighbor, weight]) => {
          // Create edge key to avoid duplicates (undirected)
          const edgeKey = [vertex, neighbor].sort().join('-');

          if (!processedEdges.has(edgeKey)) {
            processedEdges.add(edgeKey);

            const edge: UndirectedGraphEdge = {
              id: edgeKey,
              from: vertex,
              to: neighbor,
              weight: typeof weight === 'number' ? weight : 1,
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
      }
    });

    return { nodes, edges };
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
    Object.keys(adjList).forEach((vertex, index) => {
      const node: UndirectedGraphNode = {
        id: vertex,
        value: vertex,
        x: 100 + (index % 4) * 120,
        y: 100 + Math.floor(index / 4) * 100,
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

      // Check instances first (new format)
      if (state.instances) {
        let found = false;
        Object.entries(state.instances).forEach(([, instanceData]) => {
          if (found) return;
          if (instanceData && typeof instanceData === 'object') {
            const instance = instanceData as Record<string, unknown>;
            if (instance.graph && typeof instance.graph === 'object') {
              const graphData = this.convertGraphDictToGraphData(
                instance.graph as Record<string, Record<string, number>>,
              );
              nodes = graphData.nodes;
              edges.push(...graphData.edges);
              found = true;
            }
          }
        });
        if (found) break;
      }

      // Check if we have vertices and edges in state (old format)
      const stateWithGraph = state as Record<string, unknown>;
      if (
        stateWithGraph.vertices &&
        Array.isArray(stateWithGraph.vertices) &&
        stateWithGraph.edges &&
        Array.isArray(stateWithGraph.edges)
      ) {
        // Create nodes from vertices
        nodes = (stateWithGraph.vertices as string[]).map((vertex: string, index: number) => ({
          id: vertex,
          value: vertex,
          x: 100 + (index % 4) * 120,
          y: 100 + Math.floor(index / 4) * 100,
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

  // [NEW] Track previous graph state for detecting insertions
  const previousNodesRef = useRef<Set<string>>(new Set());
  const previousEdgesRef = useRef<Set<string>>(new Set());

  // [NEW] State for animation
  const [insertedVertex, setInsertedVertex] = useState<string | null>(null);
  const [insertedEdge, setInsertedEdge] = useState<string | null>(null);
  const [currentVertex, setCurrentVertex] = useState<string | null>(null);

  // [NEW] Extract current_node from step_detail
  useEffect(() => {
    if (
      baseHook.state.steps.length > 0 &&
      baseHook.state.currentStepIndex < baseHook.state.steps.length
    ) {
      const currentStep = baseHook.state.steps[baseHook.state.currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;

      // Extract current_node from backend
      if (stepDetail?.current_node && typeof stepDetail.current_node === 'string') {
        setCurrentVertex(stepDetail.current_node);
      } else {
        setCurrentVertex(null);
      }
    }
  }, [baseHook.state.steps, baseHook.state.currentStepIndex]);

  // [NEW] Detect newly inserted vertices and edges
  useEffect(() => {
    const currentNodes = new Set(baseHook.state.data.nodes.map((n) => n.id));
    const currentEdges = new Set(baseHook.state.data.edges.map((e) => e.id));

    // Find newly added vertex
    let newVertex: string | null = null;
    currentNodes.forEach((nodeId) => {
      if (!previousNodesRef.current.has(nodeId)) {
        newVertex = nodeId;
      }
    });

    // Find newly added edge
    let newEdge: string | null = null;
    currentEdges.forEach((edgeId) => {
      if (!previousEdgesRef.current.has(edgeId)) {
        newEdge = edgeId;
      }
    });

    // Update state
    if (newVertex) {
      setInsertedVertex(newVertex);
      // Clear after animation
      setTimeout(() => setInsertedVertex(null), 2000);
    }

    if (newEdge) {
      setInsertedEdge(newEdge);
      // Clear after animation
      setTimeout(() => setInsertedEdge(null), 2000);
    }

    // Update refs for next comparison
    previousNodesRef.current = currentNodes;
    previousEdgesRef.current = currentEdges;
  }, [baseHook.state.data.nodes, baseHook.state.data.edges]);

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
    // [NEW] Animation state
    insertedVertex,
    insertedEdge,
    currentVertex,
  };
};

export { useStepthroughUndirectedGraph };
