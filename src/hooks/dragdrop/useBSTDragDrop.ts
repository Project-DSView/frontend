import { useCallback } from 'react';
import {
  BSTState,
  BSTOperation,
  BSTNode,
  BSTStats,
  BSTData,
  BSTStatsExtended,
  BSTStateExtended,
  BaseState,
} from '@/types';
import { BSTService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructureDragDrop';

// BST Service Adapter
class BSTServiceAdapter {
  private service: BSTService;

  constructor(state: BaseState<BSTData, BSTStatsExtended>) {
    const bstState: BSTState = {
      root: state.data.root,
      operations: state.operations as BSTOperation[],
      stats: {
        size: state.stats.size,
        height: state.stats.height,
        isEmpty: state.stats.isEmpty,
      },
    };
    this.service = new BSTService(bstState);
  }

  getState(): BaseState<BSTData, BSTStatsExtended> {
    const bstState = this.service.getState();
    return {
      data: { root: bstState.root },
      operations: bstState.operations,
      stats: {
        size: bstState.stats.size,
        height: bstState.stats.height,
        isEmpty: bstState.stats.isEmpty,
      },
    };
  }

  async executeOperation(operation: BSTOperation) {
    switch (operation.type) {
      case 'insert':
        if (operation.value) {
          return await this.service.insert(operation.value);
        }
        break;
      case 'delete':
        if (operation.value) {
          return await this.service.delete(operation.value);
        }
        break;
      case 'traverse_inorder':
        return await this.service.traverseInorder();
      case 'traverse_preorder':
        return await this.service.traversePreorder();
      case 'traverse_postorder':
        return await this.service.traversePostorder();
      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }
    return [];
  }
}

const defaultState: BSTStateExtended = {
  data: { root: null },
  operations: [],
  stats: {
    size: 0,
    height: 0,
    isEmpty: true,
  },
};

const useBST = () => {
  const baseHook = useBaseDataStructure<BSTData, BSTStatsExtended, BSTOperation>(
    defaultState,
    BSTServiceAdapter,
  );

  // BST-specific methods
  const updateBSTState = useCallback(
    (newRoot: BSTNode | null, newStats: BSTStats) => {
      try {
        baseHook.updateDataState(
          { root: newRoot },
          {
            size: newStats.size,
            height: newStats.height,
            isEmpty: newStats.isEmpty,
          },
        );
      } catch (error) {
        console.error('Error updating BST state:', error);
      }
    },
    [baseHook],
  );

  return {
    ...baseHook,
    reorderOperation: baseHook.reorderOperation,
    state: {
      root: baseHook.state.data.root,
      operations: baseHook.state.operations as BSTOperation[],
      stats: {
        size: baseHook.state.stats.size,
        height: baseHook.state.stats.height,
        isEmpty: baseHook.state.stats.isEmpty,
      },
    },
    updateBSTState,
  };
};

export default useBST;
