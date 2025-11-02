import { useCallback } from 'react';
import {
  UndirectedGraphState,
  UndirectedGraphOperation,
  UndirectedGraphNode,
  UndirectedGraphEdge,
  UndirectedGraphStats,
  UndirectedGraphData,
  UndirectedGraphStatsExtended,
  UndirectedGraphStateExtended,
  BaseState,
} from '@/types';
import { UndirectedGraphService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructureDragDrop';

// UndirectedGraph Service Adapter
class UndirectedGraphServiceAdapter {
  private service: UndirectedGraphService;

  constructor(state: BaseState<UndirectedGraphData, UndirectedGraphStatsExtended>) {
    const graphState: UndirectedGraphState = {
      nodes: state.data.nodes,
      edges: state.data.edges,
      operations: state.operations as UndirectedGraphOperation[],
      stats: {
        size: state.stats.size,
        isEmpty: state.stats.isEmpty,
        vertices: state.stats.vertices,
        edges: state.stats.edges,
        isConnected: state.stats.isConnected,
        hasCycle: state.stats.hasCycle,
      },
    };
    this.service = new UndirectedGraphService(graphState);
  }

  getState(): BaseState<UndirectedGraphData, UndirectedGraphStatsExtended> {
    const graphState = this.service.getState();
    return {
      data: {
        nodes: graphState.nodes,
        edges: graphState.edges,
      },
      operations: graphState.operations,
      stats: {
        size: graphState.stats.size,
        isEmpty: graphState.stats.isEmpty,
        vertices: graphState.stats.vertices,
        edges: graphState.stats.edges,
        isConnected: graphState.stats.isConnected,
        hasCycle: graphState.stats.hasCycle,
      },
    };
  }

  async executeOperation(operation: UndirectedGraphOperation) {
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

const defaultState: UndirectedGraphStateExtended = {
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
    isConnected: true,
    hasCycle: false,
  },
};

const useUndirectedGraph = () => {
  const baseHook = useBaseDataStructure<
    UndirectedGraphData,
    UndirectedGraphStatsExtended,
    UndirectedGraphOperation
  >(defaultState, UndirectedGraphServiceAdapter);

  // Graph-specific methods
  const updateGraphState = useCallback(
    (
      newNodes: UndirectedGraphNode[],
      newEdges: UndirectedGraphEdge[],
      newStats: UndirectedGraphStats,
    ) => {
      baseHook.updateDataState(
        { nodes: newNodes, edges: newEdges },
        {
          size: newStats.size,
          isEmpty: newStats.isEmpty,
          vertices: newStats.vertices,
          edges: newStats.edges,
          isConnected: newStats.isConnected,
          hasCycle: newStats.hasCycle,
        },
      );
    },
    [baseHook],
  );

  return {
    ...baseHook,
    reorderOperation: baseHook.reorderOperation,
    state: {
      nodes: baseHook.state.data.nodes,
      edges: baseHook.state.data.edges,
      operations: baseHook.state.operations as UndirectedGraphOperation[],
      stats: {
        size: baseHook.state.stats.size,
        isEmpty: baseHook.state.stats.isEmpty,
        vertices: baseHook.state.stats.vertices,
        edges: baseHook.state.stats.edges,
        isConnected: baseHook.state.stats.isConnected,
        hasCycle: baseHook.state.stats.hasCycle,
      },
    },
    updateGraphState,
  };
};

export default useUndirectedGraph;
