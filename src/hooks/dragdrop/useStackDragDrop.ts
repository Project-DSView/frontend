import { useCallback } from 'react';
import {
  StackState,
  StackOperation,
  StackData,
  StackStatsExtended,
  StackStateExtended,
  BaseState,
} from '@/types';
import { StackService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructureDragDrop';
class StackServiceAdapter {
  private service: StackService;

  constructor(state: BaseState<StackData, StackStatsExtended>) {
    const stackState: StackState = {
      elements: state.data.elements,
      operations: state.operations as StackOperation[],
      stats: {
        length: state.stats.size,
        headValue: state.stats.headValue,
        tailValue: state.stats.tailValue,
        isEmpty: state.stats.isEmpty,
      },
    };
    this.service = new StackService(stackState);
  }

  getState(): BaseState<StackData, StackStatsExtended> {
    const stackState = this.service.getState();
    return {
      data: {
        elements: stackState.elements,
        count: stackState.stats.length,
      },
      operations: stackState.operations,
      stats: {
        size: stackState.stats.length,
        headValue: stackState.stats.headValue,
        tailValue: stackState.stats.tailValue,
        isEmpty: stackState.stats.isEmpty,
      },
    };
  }

  async executeOperation(operation: StackOperation) {
    // Validate operation before executing
    if (operation.type === 'push' && (!operation.value || operation.value.trim() === '')) {
      throw new Error('Push operation requires a value');
    }

    if (operation.type === 'pop' && this.service.getState().stats.isEmpty) {
      throw new Error('Cannot pop from empty stack');
    }

    switch (operation.type) {
      case 'push':
        if (operation.value && operation.value.trim() !== '') {
          return await this.service.push(operation.value);
        }
        break;
      case 'pop':
        return await this.service.pop();
      case 'copyStack':
        // For copyStack, we need to handle multiple stacks
        // This will be handled in the visualization layer
        return [];
      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }
    return [];
  }
}

const defaultState: StackStateExtended = {
  data: {
    elements: [],
    count: 0,
  },
  operations: [],
  stats: {
    size: 0,
    headValue: null,
    tailValue: null,
    isEmpty: true,
  },
};

const useStack = () => {
  const baseHook = useBaseDataStructure<StackData, StackStatsExtended, StackOperation>(
    defaultState,
    StackServiceAdapter,
  );

  const addOperationWithValidation = useCallback(
    (operation: Omit<StackOperation, 'id'>) => {
      // Don't validate immediately when adding - validation happens during execution
      baseHook.addOperation(operation);
    },
    [baseHook],
  );

  return {
    ...baseHook,
    addOperation: addOperationWithValidation,
    reorderOperation: baseHook.reorderOperation,
    state: {
      elements: baseHook.state.data.elements,
      operations: baseHook.state.operations as StackOperation[],
      stats: {
        length: baseHook.state.stats.size,
        headValue: baseHook.state.stats.headValue,
        tailValue: baseHook.state.stats.tailValue,
        isEmpty: baseHook.state.stats.isEmpty,
      },
    },
  };
};

export default useStack;
