import { useCallback } from 'react';
import { 
  DirectedGraphState, 
  DirectedGraphOperation, 
  DirectedGraphNode, 
  DirectedGraphEdge, 
  DirectedGraphStats, 
  DirectedGraphData, 
  DirectedGraphStatsExtended, 
  DirectedGraphStateExtended, 
  BaseState 
} from '@/types';
import { DirectedGraphService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructure';

// DirectedGraph Service Adapter
class DirectedGraphServiceAdapter {
  private service: DirectedGraphService;

  constructor(state: BaseState<DirectedGraphData, DirectedGraphStatsExtended>) {
    const graphState: DirectedGraphState = {
      nodes: state.data.nodes,
      edges: state.data.edges,
      operations: state.operations as DirectedGraphOperation[],
      stats: {
        size: state.stats.size,
        isEmpty: state.stats.isEmpty,
        vertices: state.stats.vertices,
        edges: state.stats.edges,
        isStronglyConnected: state.stats.isStronglyConnected,
        hasCycle: state.stats.hasCycle,
        inDegree: state.stats.inDegree,
        outDegree: state.stats.outDegree,
      },
    };
    this.service = new DirectedGraphService(graphState);
  }

  getState(): BaseState<DirectedGraphData, DirectedGraphStatsExtended> {
    const graphState = this.service.getState();
    return {
      data: { 
        nodes: graphState.nodes, 
        edges: graphState.edges 
      },
      operations: graphState.operations,
      stats: {
        size: graphState.stats.size,
        isEmpty: graphState.stats.isEmpty,
        vertices: graphState.stats.vertices,
        edges: graphState.stats.edges,
        isStronglyConnected: graphState.stats.isStronglyConnected,
        hasCycle: graphState.stats.hasCycle,
        inDegree: graphState.stats.inDegree,
        outDegree: graphState.stats.outDegree,
      },
    };
  }

  async executeOperation(operation: DirectedGraphOperation) {
    switch (operation.type) {
      case 'add_vertex':
        if (operation.value) {
          return await this.service.addVertex(operation.value);
        }
        break;
      case 'add_edge':
        if (operation.fromVertex && operation.toVertex) {
          return await this.service.addEdge(operation.fromVertex, operation.toVertex);
        }
        break;
      case 'remove_vertex':
        if (operation.value) {
          return await this.service.removeVertex(operation.value);
        }
        break;
      case 'remove_edge':
        if (operation.fromVertex && operation.toVertex) {
          return await this.service.removeEdge(operation.fromVertex, operation.toVertex);
        }
        break;
      case 'traversal_dfs':
        if (operation.startVertex) {
          return await this.service.traversalDFS(operation.startVertex);
        }
        break;
      case 'traversal_bfs':
        if (operation.startVertex) {
          return await this.service.traversalBFS(operation.startVertex);
        }
        break;
      case 'shortest_path':
        if (operation.startVertex && operation.endVertex) {
          return await this.service.shortestPath(operation.startVertex, operation.endVertex);
        }
        break;
      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }
    return [];
  }
}

const defaultState: DirectedGraphStateExtended = {
  data: {
    nodes: [],
    edges: [],
  },
  operations: [],
  stats: {
    size: 0,
    isEmpty: true,
    vertices: 0,
    edges: 0,
    isStronglyConnected: true,
    hasCycle: false,
    inDegree: {},
    outDegree: {},
  },
};

const useDirectedGraph = () => {
  const baseHook = useBaseDataStructure<DirectedGraphData, DirectedGraphStatsExtended, DirectedGraphOperation>(
    defaultState,
    DirectedGraphServiceAdapter
  );

  // Graph-specific methods
  const updateGraphState = useCallback((newNodes: DirectedGraphNode[], newEdges: DirectedGraphEdge[], newStats: DirectedGraphStats) => {
    baseHook.updateDataState(
      { nodes: newNodes, edges: newEdges },
      {
        size: newStats.size,
        isEmpty: newStats.isEmpty,
        vertices: newStats.vertices,
        edges: newStats.edges,
        isStronglyConnected: newStats.isStronglyConnected,
        hasCycle: newStats.hasCycle,
        inDegree: newStats.inDegree,
        outDegree: newStats.outDegree,
      }
    );
  }, [baseHook]);

  return {
    ...baseHook,
    state: {
      nodes: baseHook.state.data.nodes,
      edges: baseHook.state.data.edges,
      operations: baseHook.state.operations as DirectedGraphOperation[],
      stats: {
        size: baseHook.state.stats.size,
        isEmpty: baseHook.state.stats.isEmpty,
        vertices: baseHook.state.stats.vertices,
        edges: baseHook.state.stats.edges,
        isStronglyConnected: baseHook.state.stats.isStronglyConnected,
        hasCycle: baseHook.state.stats.hasCycle,
        inDegree: baseHook.state.stats.inDegree,
        outDegree: baseHook.state.stats.outDegree,
      },
    },
    updateGraphState,
  };
};

export default useDirectedGraph;
