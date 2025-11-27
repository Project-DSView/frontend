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
      isStronglyConnected = false; // Simplified for now
      hasCycle = false; // Simplified for now
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
    if (!adjacencyList || typeof adjacencyList !== 'object') {
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

    return { nodes, edges };
  }

  private buildGraphFromSteps(
    steps: StepthroughStep[],
    stepIndex: number,
  ): { nodes: DirectedGraphNode[]; edges: DirectedGraphEdge[] } {
    let nodes: DirectedGraphNode[] = [];
    const edges: DirectedGraphEdge[] = [];

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

    return { nodes, edges };
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

const useStepthroughDirectedGraph = () => {
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

export { useStepthroughDirectedGraph };
