import {
  DirectedGraphOperation,
  DirectedGraphData,
  DirectedGraphStatsExtended,
  DirectedGraphStateExtended,
} from '@/types';
import { DirectedGraphDragDropService } from '@/services';
import { useBaseDataStructure } from './useBaseDragDrop';

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

const useDragDropDirectedGraph = () => {
  const baseHook = useBaseDataStructure<
    DirectedGraphData,
    DirectedGraphStatsExtended,
    DirectedGraphOperation
  >(defaultState, DirectedGraphDragDropService);

  return {
    ...baseHook,
    state: {
      nodes: baseHook.state.data.nodes,
      edges: baseHook.state.data.edges,
      operations: baseHook.state.operations as DirectedGraphOperation[],
      stats: baseHook.state.stats,
    },
  };
};

export { useDragDropDirectedGraph };
