import { useCallback } from 'react';
import {
  StackState,
  StackOperation,
  StackData,
  StackStatsExtended,
  StackStateExtended,
  BaseState,
} from '@/types';

import { StackDragDropService } from '@/services';
import { useBaseDataStructure } from './useBaseDragDrop';

class StackServiceAdapter {
  private service: StackDragDropService;

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

    this.service = new StackDragDropService(stackState);
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
    if (operation.type === 'push') {
      const hasTargetStack =
        typeof operation.targetStack === 'string' &&
        operation.targetStack.trim() !== '';
      const hasValue =
        typeof operation.value === 'string' && operation.value.trim() !== '';

      if (!hasTargetStack || !hasValue) {
        return [];
      }
    }

    if (operation.type === 'pop') {
      const hasTargetStack =
        typeof operation.targetStack === 'string' &&
        operation.targetStack.trim() !== '';

      if (!hasTargetStack) {
        return [];
      }

      if (this.service.getState().stats.isEmpty) {
        throw new Error('Cannot pop from empty stack');
      }
    }

    if (operation.type === 'copyStack') {
      const hasSourceStack =
        typeof operation.sourceStack === 'string' &&
        operation.sourceStack.trim() !== '';
      const hasTargetStack =
        typeof operation.targetStack === 'string' &&
        operation.targetStack.trim() !== '';

      if (!hasSourceStack || !hasTargetStack) {
        return [];
      }
    }

    switch (operation.type) {
      case 'push':
        return await this.service.push(operation.value as string);

      case 'pop':
        return await this.service.pop();

      case 'copyStack':
        // handled in visualization / higher-level logic
        return [];

      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }
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

const useDragDropStack = () => {
  const baseHook = useBaseDataStructure<
    StackData,
    StackStatsExtended,
    StackOperation
  >(defaultState, StackServiceAdapter);

  const addOperationWithValidation = useCallback(
    (operation: Omit<StackOperation, 'id'>) => {
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

export { useDragDropStack };