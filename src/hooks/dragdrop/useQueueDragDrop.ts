import { useCallback } from 'react';
import {
  QueueState,
  QueueOperation,
  QueueData,
  QueueStatsExtended,
  QueueStateExtended,
  BaseState,
} from '@/types';
import { QueueDragDropService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructureDragDrop';

class QueueServiceAdapter {
  private service: QueueDragDropService;

  constructor(state: BaseState<QueueData, QueueStatsExtended>) {
    const queueState: QueueState = {
      elements: state.data.elements,
      operations: state.operations as QueueOperation[],
      stats: {
        length: state.stats.size,
        headValue: state.stats.frontValue,
        tailValue: state.stats.backValue,
        isEmpty: state.stats.isEmpty,
      },
    };
    this.service = new QueueDragDropService(queueState);
  }

  getState(): BaseState<QueueData, QueueStatsExtended> {
    const queueState = this.service.getState();
    return {
      data: {
        elements: queueState.elements,
        count: queueState.stats.length,
      },
      operations: queueState.operations,
      stats: {
        size: queueState.stats.length,
        frontValue: queueState.stats.headValue,
        backValue: queueState.stats.tailValue,
        isEmpty: queueState.stats.isEmpty,
      },
    };
  }

  async executeOperation(operation: QueueOperation) {
    if (operation.type === 'enqueue' && (!operation.value || operation.value.trim() === '')) {
      throw new Error('Enqueue operation requires a value');
    }

    if (operation.type === 'dequeue' && this.service.getState().stats.isEmpty) {
      throw new Error('Cannot dequeue from empty queue');
    }

    switch (operation.type) {
      case 'enqueue':
        if (operation.value && operation.value.trim() !== '') {
          return await this.service.enqueue(operation.value);
        }
        break;
      case 'dequeue':
        return await this.service.dequeue();
      case 'front':
      case 'back':
      case 'is_empty':
      case 'size':
        // Read-only operations - return empty steps array
        return [];
      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }
    return [];
  }
}

const defaultState: QueueStateExtended = {
  data: {
    elements: [],
    count: 0,
  },
  operations: [],
  stats: {
    size: 0,
    frontValue: null,
    backValue: null,
    isEmpty: true,
  },
};

const useDragDropQueue = () => {
  const baseHook = useBaseDataStructure<QueueData, QueueStatsExtended, QueueOperation>(
    defaultState,
    QueueServiceAdapter,
  );

  const addOperationWithValidation = useCallback(
    (operation: Omit<QueueOperation, 'id'>) => {
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
      operations: baseHook.state.operations as QueueOperation[],
      stats: {
        length: baseHook.state.stats.size,
        headValue: baseHook.state.stats.frontValue,
        tailValue: baseHook.state.stats.backValue,
        isEmpty: baseHook.state.stats.isEmpty,
      },
    },
  };
};

export { useDragDropQueue };
