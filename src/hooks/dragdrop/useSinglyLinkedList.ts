import { useCallback } from 'react';
import {
  SinglyLinkedListState,
  SinglyLinkedListOperation,
  SinglyLinkedListData,
  SinglyLinkedListStatsExtended,
  SinglyLinkedListStateExtended,
  BaseState,
} from '@/types';
import { SinglyLinkedListService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructure';

// SinglyLinkedList Service Adapter
class SinglyLinkedListServiceAdapter {
  private service: SinglyLinkedListService;

  constructor(state: BaseState<SinglyLinkedListData, SinglyLinkedListStatsExtended>) {
    const singlyLinkedListState: SinglyLinkedListState = {
      nodes: state.data.nodes,
      operations: state.operations as SinglyLinkedListOperation[],
      stats: {
        length: state.stats.size,
        headValue: state.stats.headValue,
        tailValue: state.stats.tailValue,
        isEmpty: state.stats.isEmpty,
      },
    };
    this.service = new SinglyLinkedListService(singlyLinkedListState);
  }

  getState(): BaseState<SinglyLinkedListData, SinglyLinkedListStatsExtended> {
    const singlyLinkedListState = this.service.getState();
    return {
      data: { nodes: singlyLinkedListState.nodes },
      operations: singlyLinkedListState.operations,
      stats: {
        size: singlyLinkedListState.stats.length,
        headValue: singlyLinkedListState.stats.headValue,
        tailValue: singlyLinkedListState.stats.tailValue,
        isEmpty: singlyLinkedListState.stats.isEmpty,
      },
    };
  }

  async executeOperation(operation: SinglyLinkedListOperation) {
    // Validate operation before executing
    if (
      (operation.type === 'insert_beginning' ||
        operation.type === 'insert_end' ||
        operation.type === 'insert_position') &&
      (!operation.value || operation.value.trim() === '')
    ) {
      throw new Error(`${operation.type} operation requires a value`);
    }

    if (
      operation.type === 'insert_position' &&
      (!operation.position || parseInt(operation.position) < 0)
    ) {
      throw new Error('Insert position must be a valid non-negative number');
    }

    if (
      operation.type === 'delete_position' &&
      (!operation.position || parseInt(operation.position) < 0)
    ) {
      throw new Error('Delete position must be a valid non-negative number');
    }

    // Check if trying to delete from empty list
    if (
      (operation.type === 'delete_beginning' ||
        operation.type === 'delete_end' ||
        operation.type === 'delete_value') &&
      this.service.getState().stats.isEmpty
    ) {
      throw new Error('Cannot delete from empty linked list');
    }

    switch (operation.type) {
      case 'insert_beginning':
        if (operation.value && operation.value.trim() !== '') {
          return await this.service.insertAtBeginning(operation.value);
        }
        break;
      case 'insert_end':
        if (operation.value && operation.value.trim() !== '') {
          return await this.service.insertAtEnd(operation.value);
        }
        break;
      case 'insert_position':
        if (operation.value && operation.value.trim() !== '' && operation.position) {
          return await this.service.insertAtPosition(operation.value, parseInt(operation.position));
        }
        break;
      case 'delete_beginning':
        return await this.service.deleteFromBeginning();
      case 'delete_end':
        return await this.service.deleteFromEnd();
      case 'delete_value':
        if (operation.value && operation.value.trim() !== '') {
          return await this.service.deleteByValue(operation.value);
        }
        break;
      case 'delete_position':
        if (operation.position) {
          return await this.service.deleteAtPosition(parseInt(operation.position));
        }
        break;
      case 'traverse':
        return await this.service.traverse();
      case 'update_value':
        if (
          operation.value &&
          operation.value.trim() !== '' &&
          operation.newValue &&
          operation.newValue.trim() !== ''
        ) {
          return await this.service.updateByValue(operation.value, operation.newValue);
        }
        break;
      case 'update_position':
        if (operation.position && operation.newValue && operation.newValue.trim() !== '') {
          return await this.service.updateByPosition(
            parseInt(operation.position),
            operation.newValue,
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

const defaultState: SinglyLinkedListStateExtended = {
  data: { nodes: [] },
  operations: [],
  stats: {
    size: 0,
    headValue: null,
    tailValue: null,
    isEmpty: true,
  },
};

const useSinglyLinkedList = () => {
  const baseHook = useBaseDataStructure<
    SinglyLinkedListData,
    SinglyLinkedListStatsExtended,
    SinglyLinkedListOperation
  >(defaultState, SinglyLinkedListServiceAdapter);

  const addOperationWithValidation = useCallback(
    (operation: Omit<SinglyLinkedListOperation, 'id'>) => {
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
      nodes: baseHook.state.data.nodes,
      operations: baseHook.state.operations as SinglyLinkedListOperation[],
      stats: {
        length: baseHook.state.stats.size,
        headValue: baseHook.state.stats.headValue,
        tailValue: baseHook.state.stats.tailValue,
        isEmpty: baseHook.state.stats.isEmpty,
      },
    },
  };
};

export default useSinglyLinkedList;
