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
import { UndirectedGraphDragDropService } from '@/services';
import { useBaseDataStructure } from './useBaseDragDrop';

/* =========================================================
   SERVICE ADAPTER (FIXED VERSION)
========================================================= */
class UndirectedGraphServiceAdapter {
  private service: UndirectedGraphDragDropService;

  constructor(state: BaseState<UndirectedGraphData, UndirectedGraphStatsExtended>) {

    // 🔥 DEEP CLONE เพื่อกัน reference bug
    const graphState: UndirectedGraphState = {
      nodes: state.data.nodes.map(n => ({
        ...n,
        neighbors: [...n.neighbors],
      })),
      edges: state.data.edges.map(e => ({ ...e })),
      operations: [], // 🔥 operations ไม่ให้ service คุม
      stats: { ...state.stats },
    };

    this.service = new UndirectedGraphDragDropService(graphState);
  }

  getState(): BaseState<UndirectedGraphData, UndirectedGraphStatsExtended> {
    const graphState = this.service.getState();

    return {
      data: {
        nodes: graphState.nodes.map(n => ({
          ...n,
          neighbors: [...n.neighbors],
        })),
        edges: graphState.edges.map(e => ({ ...e })),
      },
      operations: [], // 🔥 source of truth อยู่ที่ base hook
      stats: { ...graphState.stats },
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
          return await this.service.addEdge(
            operation.fromVertex,
            operation.toVertex
          );
        }
        break;

      case 'remove_vertex':
        if (operation.value) {
          return await this.service.removeVertex(operation.value);
        }
        break;

      case 'remove_edge':
        if (operation.fromVertex && operation.toVertex) {
          return await this.service.removeEdge(
            operation.fromVertex,
            operation.toVertex
          );
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
          return await this.service.shortestPath(
            operation.startVertex,
            operation.endVertex
          );
        }
        break;

      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }

    return [];
  }
}

/* =========================================================
   DEFAULT STATE
========================================================= */
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

/* =========================================================
   HOOK
========================================================= */
const useDragDropUndirectedGraph = () => {

  const baseHook = useBaseDataStructure<
    UndirectedGraphData,
    UndirectedGraphStatsExtended,
    UndirectedGraphOperation
  >(defaultState, UndirectedGraphServiceAdapter);

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

    state: {
      nodes: baseHook.state.data.nodes,
      edges: baseHook.state.data.edges,
      operations: baseHook.state.operations as UndirectedGraphOperation[],
      stats: { ...baseHook.state.stats },
    },

    updateGraphState,
  };
};

export { useDragDropUndirectedGraph };