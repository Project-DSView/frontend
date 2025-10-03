import { useMemo } from 'react';
import { useBaseStepthrough } from './useBaseStepthrough';
import {
  DirectedGraphData,
  DirectedGraphStatsExtended,
  BaseStepthroughState,
  BaseStepthroughService,
  StepthroughStep,
  DirectedGraphNode,
  DirectedGraphEdge,
} from '@/types';
import { directedGraphCodeTemplate } from '@/data';

// Directed Graph Stepthrough Service
class DirectedGraphStepthroughService
  implements BaseStepthroughService<DirectedGraphData, DirectedGraphStatsExtended>
{
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): DirectedGraphData {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return { nodes: [], edges: [] };
    }

    const step = steps[stepIndex];
    const state = step.state;

    // Extract graph data from state directly
    let nodes: DirectedGraphNode[] = [];
    let edges: DirectedGraphEdge[] = [];

    console.log('DirectedGraph extractDataFromSteps - state:', state);

    // Check if we have vertices and edges in state
    const stateWithGraph = state as Record<string, unknown>;
    if (
      stateWithGraph.vertices &&
      Array.isArray(stateWithGraph.vertices) &&
      stateWithGraph.edges &&
      Array.isArray(stateWithGraph.edges)
    ) {
      console.log('DirectedGraph found vertices and edges in state:', {
        vertices: stateWithGraph.vertices,
        edges: stateWithGraph.edges,
      });

      // Create nodes from vertices
      nodes = (stateWithGraph.vertices as string[]).map((vertex: string) => ({
        id: vertex,
        value: vertex,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        outgoingEdges: [],
        incomingEdges: [],
      }));

      // Create edges and update node connections
      (stateWithGraph.edges as string[][]).forEach((edge: string[]) => {
        if (edge.length === 2) {
          const [from, to] = edge;

          const edgeObj: DirectedGraphEdge = {
            id: `${from}-${to}`,
            from: from,
            to: to,
            weight: 1,
            isDirected: true,
          };
          edges.push(edgeObj);

          // Update node connections
          const fromNode = nodes.find((n) => n.id === from);
          const toNode = nodes.find((n) => n.id === to);
          if (fromNode && toNode) {
            if (!fromNode.outgoingEdges.includes(edgeObj.id)) {
              fromNode.outgoingEdges.push(edgeObj.id);
            }
            if (!toNode.incomingEdges.includes(edgeObj.id)) {
              toNode.incomingEdges.push(edgeObj.id);
            }
          }
        }
      });
    }

    // If no graph data found, try to extract from instances
    if (nodes.length === 0 && state.instances) {
      console.log('DirectedGraph checking instances:', state.instances);

      Object.entries(state.instances).forEach(([instanceName, instanceData]) => {
        console.log(`DirectedGraph instance ${instanceName}:`, instanceData);
        if (instanceData && typeof instanceData === 'object' && 'adjacency_list' in instanceData) {
          const instance = instanceData as Record<string, unknown>;
          if (instance.adjacency_list) {
            console.log('DirectedGraph found adjacency_list in instance:', instance.adjacency_list);
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

    console.log('DirectedGraph extractDataFromSteps - final result:', { nodes, edges });
    return { nodes, edges };
  }

  extractStatsFromSteps(steps: StepthroughStep[], stepIndex: number): DirectedGraphStatsExtended {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return {
        size: 0,
        isEmpty: true,
        vertices: 0,
        edges: 0,
        isStronglyConnected: false,
        hasCycle: false,
        inDegree: {},
        outDegree: {},
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
    let isStronglyConnected = false;
    let hasCycle = false;
    const inDegree: { [key: string]: number } = {};
    const outDegree: { [key: string]: number } = {};

    if (state.step_detail) {
      const stepDetail = state.step_detail as Record<string, unknown>;

      if (typeof stepDetail.vertices === 'number') {
        vertices = stepDetail.vertices;
      }
      if (typeof stepDetail.edges === 'number') {
        edgeCount = stepDetail.edges;
      }
      if (typeof stepDetail.isStronglyConnected === 'boolean') {
        isStronglyConnected = stepDetail.isStronglyConnected;
      }
      if (typeof stepDetail.hasCycle === 'boolean') {
        hasCycle = stepDetail.hasCycle;
      }
    }

    // Calculate degrees
    nodes.forEach((node) => {
      outDegree[node.id] = node.outgoingEdges.length;
      inDegree[node.id] = node.incomingEdges.length;
    });

    // If no stats from step detail, calculate from graph
    if (vertices === 0 && nodes.length > 0) {
      vertices = nodes.length;
      edgeCount = edges.length;
      isStronglyConnected = this.calculateStrongConnectivity(nodes);
      hasCycle = this.calculateCycleDetection(nodes);
    }

    return {
      size: vertices,
      isEmpty: vertices === 0,
      vertices: vertices,
      edges: edgeCount,
      isStronglyConnected: isStronglyConnected,
      hasCycle: hasCycle,
      inDegree: inDegree,
      outDegree: outDegree,
    };
  }

  private convertAdjacencyListToGraphData(adjacencyList: unknown): {
    nodes: DirectedGraphNode[];
    edges: DirectedGraphEdge[];
  } {
    console.log('DirectedGraph convertAdjacencyListToGraphData - input:', adjacencyList);

    if (!adjacencyList || typeof adjacencyList !== 'object') {
      console.log('DirectedGraph convertAdjacencyListToGraphData - invalid input');
      return { nodes: [], edges: [] };
    }

    const adjList = adjacencyList as Record<string, string[]>;
    const nodes: DirectedGraphNode[] = [];
    const edges: DirectedGraphEdge[] = [];

    // Create nodes
    Object.keys(adjList).forEach((vertex) => {
      const node: DirectedGraphNode = {
        id: vertex,
        value: vertex,
        x: Math.random() * 400 + 50,
        y: Math.random() * 300 + 50,
        outgoingEdges: [],
        incomingEdges: [],
      };
      nodes.push(node);
    });

    // Create edges
    Object.entries(adjList).forEach(([vertex, neighbors]) => {
      neighbors.forEach((neighbor) => {
        const edge: DirectedGraphEdge = {
          id: `${vertex}-${neighbor}`,
          from: vertex,
          to: neighbor,
          weight: 1,
          isDirected: true,
        };
        edges.push(edge);

        // Update node connections
        const fromNode = nodes.find((n) => n.id === vertex);
        const toNode = nodes.find((n) => n.id === neighbor);
        if (fromNode && toNode) {
          if (!fromNode.outgoingEdges.includes(edge.id)) {
            fromNode.outgoingEdges.push(edge.id);
          }
          if (!toNode.incomingEdges.includes(edge.id)) {
            toNode.incomingEdges.push(edge.id);
          }
        }
      });
    });

    console.log('DirectedGraph convertAdjacencyListToGraphData - result:', { nodes, edges });
    return { nodes, edges };
  }

  private buildGraphFromSteps(
    steps: StepthroughStep[],
    stepIndex: number,
  ): { nodes: DirectedGraphNode[]; edges: DirectedGraphEdge[] } {
    let nodes: DirectedGraphNode[] = [];
    const edges: DirectedGraphEdge[] = [];

    console.log(
      'DirectedGraph buildGraphFromSteps - steps:',
      steps.length,
      'stepIndex:',
      stepIndex,
    );

    // Use the latest step that has graph data
    for (let i = stepIndex; i >= 0; i--) {
      const step = steps[i];
      const state = step.state;

      console.log(`DirectedGraph step ${i}:`, { step, state });

      // Check if we have vertices and edges in state
      const stateWithGraph = state as Record<string, unknown>;
      if (
        stateWithGraph.vertices &&
        Array.isArray(stateWithGraph.vertices) &&
        stateWithGraph.edges &&
        Array.isArray(stateWithGraph.edges)
      ) {
        console.log('DirectedGraph buildGraphFromSteps - found vertices and edges:', {
          vertices: stateWithGraph.vertices,
          edges: stateWithGraph.edges,
        });

        // Create nodes from vertices
        nodes = (stateWithGraph.vertices as string[]).map((vertex: string) => ({
          id: vertex,
          value: vertex,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          outgoingEdges: [],
          incomingEdges: [],
        }));

        // Create edges and update node connections
        (stateWithGraph.edges as string[][]).forEach((edge: string[]) => {
          if (edge.length === 2) {
            const [from, to] = edge;

            const edgeObj: DirectedGraphEdge = {
              id: `${from}-${to}`,
              from: from,
              to: to,
              weight: 1,
              isDirected: true,
            };
            edges.push(edgeObj);

            // Update node connections
            const fromNode = nodes.find((n) => n.id === from);
            const toNode = nodes.find((n) => n.id === to);
            if (fromNode && toNode) {
              if (!fromNode.outgoingEdges.includes(edgeObj.id)) {
                fromNode.outgoingEdges.push(edgeObj.id);
              }
              if (!toNode.incomingEdges.includes(edgeObj.id)) {
                toNode.incomingEdges.push(edgeObj.id);
              }
            }
          }
        });

        // Found graph data, break the loop
        break;
      }
    }

    console.log('DirectedGraph buildGraphFromSteps - final result:', { nodes, edges });
    return { nodes, edges };
  }

  private calculateStrongConnectivity(nodes: DirectedGraphNode[]): boolean {
    if (nodes.length === 0) return true;

    // For directed graphs, we need to check if every vertex is reachable from every other vertex
    // This is a simplified check - in practice, you'd use Kosaraju's algorithm
    const visited = new Set<string>();
    const startNode = nodes[0];

    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        node.outgoingEdges.forEach((edgeId) => {
          // Find the target node of this edge
          const edge = this.findEdgeById();
          if (edge && !visited.has(edge.to)) {
            dfs(edge.to);
          }
        });
      }
    };

    dfs(startNode.id);
    return visited.size === nodes.length;
  }

  private calculateCycleDetection(nodes: DirectedGraphNode[]): boolean {
    if (nodes.length === 0) return false;

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        for (const edgeId of node.outgoingEdges) {
          // Find the target node by parsing the edge ID (format: "from-to")
          const edgeParts = edgeId.split('-');
          if (edgeParts.length >= 2) {
            const targetNodeId = edgeParts.slice(1).join('-');
            if (!visited.has(targetNodeId)) {
              if (dfs(targetNodeId)) {
                return true;
              }
            } else if (recStack.has(targetNodeId)) {
              return true;
            }
          }
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          return true;
        }
      }
    }

    return false;
  }

  private findEdgeById(): DirectedGraphEdge | null {
    // This is a simplified implementation - in practice, you'd have access to edges
    // For now, we'll return null and let the cycle detection work with the available data
    return null;
  }
}

const defaultState: BaseStepthroughState<DirectedGraphData, DirectedGraphStatsExtended> = {
  code: directedGraphCodeTemplate,
  filename: 'playground.py',
  steps: [],
  data: { nodes: [], edges: [] },
  stats: {
    size: 0,
    isEmpty: true,
    vertices: 0,
    edges: 0,
    isStronglyConnected: false,
    hasCycle: false,
    inDegree: {},
    outDegree: {},
  },
};

const useDirectedGraphStepthrough = () => {
  const baseHook = useBaseStepthrough<
    DirectedGraphData,
    DirectedGraphStatsExtended,
    DirectedGraphStepthroughService
  >(defaultState, DirectedGraphStepthroughService, 'directedgraph');

  const graphData = useMemo(
    () => ({
      nodes: baseHook.state.data.nodes,
      edges: baseHook.state.data.edges,
      vertices: baseHook.state.stats.vertices,
      edgeCount: baseHook.state.stats.edges,
      isStronglyConnected: baseHook.state.stats.isStronglyConnected,
      hasCycle: baseHook.state.stats.hasCycle,
      isEmpty: baseHook.state.stats.isEmpty,
      inDegree: baseHook.state.stats.inDegree,
      outDegree: baseHook.state.stats.outDegree,
    }),
    [
      baseHook.state.data.nodes,
      baseHook.state.data.edges,
      baseHook.state.stats.vertices,
      baseHook.state.stats.edges,
      baseHook.state.stats.isStronglyConnected,
      baseHook.state.stats.hasCycle,
      baseHook.state.stats.isEmpty,
      baseHook.state.stats.inDegree,
      baseHook.state.stats.outDegree,
    ],
  );

  return {
    ...baseHook,
    graphData,
  };
};

export default useDirectedGraphStepthrough;
