import {
  DoublyLinkedListState,
  DoublyLinkedListOperation,
  DoublyLinkedListData,
  DoublyLinkedListStatsExtended,
  DoublyLinkedListStateExtended,
  BaseState,
} from '@/types';
import { DoublyLinkedListService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructure';

class DoublyLinkedListServiceAdapter {
  private service: DoublyLinkedListService;

  constructor(state: BaseState<DoublyLinkedListData, DoublyLinkedListStatsExtended>) {
    const doublyLinkedListState: DoublyLinkedListState = {
      nodes: state.data.nodes,
      operations: state.operations as DoublyLinkedListOperation[],
      stats: {
        length: state.stats.size,
        headValue: state.stats.headValue,
        tailValue: state.stats.tailValue,
        isEmpty: state.stats.isEmpty,
      },
    };
    this.service = new DoublyLinkedListService(doublyLinkedListState);
  }

  getState(): BaseState<DoublyLinkedListData, DoublyLinkedListStatsExtended> {
    const doublyLinkedListState = this.service.getState();
    return {
      data: { nodes: doublyLinkedListState.nodes },
      operations: doublyLinkedListState.operations,
      stats: {
        size: doublyLinkedListState.stats.length,
        headValue: doublyLinkedListState.stats.headValue,
        tailValue: doublyLinkedListState.stats.tailValue,
        isEmpty: doublyLinkedListState.stats.isEmpty,
      },
    };
  }

  async executeOperation(operation: DoublyLinkedListOperation) {
    switch (operation.type) {
      case 'insert_beginning':
        if (operation.value) {
          return await this.service.insertAtBeginning(operation.value);
        }
        break;
      case 'insert_end':
        if (operation.value) {
          return await this.service.insertAtEnd(operation.value);
        }
        break;
      case 'insert_position':
        if (operation.value && operation.position) {
          return await this.service.insertAtPosition(operation.value, parseInt(operation.position));
        }
        break;
      case 'insert_before_position':
        if (operation.value && operation.position) {
          return await this.service.insertBeforePosition(
            operation.value,
            parseInt(operation.position),
          );
        }
        break;
      case 'delete_beginning':
        return await this.service.deleteFromBeginning();
      case 'delete_end':
        return await this.service.deleteFromEnd();
      case 'delete_value':
        if (operation.value) {
          return await this.service.deleteByValue(operation.value);
        }
        break;
      case 'delete_position':
        if (operation.position) {
          return await this.service.deleteAtPosition(parseInt(operation.position));
        }
        break;
      case 'delete_before_position':
        if (operation.position) {
          return await this.service.deleteBeforePosition(parseInt(operation.position));
        }
        break;
      case 'traverse_forward':
        return await this.service.traverseForward();
      case 'traverse_backward':
        return await this.service.traverseBackward();
      case 'update_value':
        if (operation.value && operation.newValue) {
          return await this.service.updateByValue(operation.value, operation.newValue);
        }
        break;
      case 'update_position':
        if (operation.position && operation.newValue) {
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

const defaultState: DoublyLinkedListStateExtended = {
  data: { nodes: [] },
  operations: [],
  stats: {
    size: 0,
    headValue: null,
    tailValue: null,
    isEmpty: true,
  },
};

const useDoublyLinkedList = () => {
  const baseHook = useBaseDataStructure<
    DoublyLinkedListData,
    DoublyLinkedListStatsExtended,
    DoublyLinkedListOperation
  >(defaultState, DoublyLinkedListServiceAdapter);

  return {
    ...baseHook,
    reorderOperation: baseHook.reorderOperation,
    state: {
      nodes: baseHook.state.data.nodes,
      operations: baseHook.state.operations as DoublyLinkedListOperation[],
      stats: {
        length: baseHook.state.stats.size,
        headValue: baseHook.state.stats.headValue,
        tailValue: baseHook.state.stats.tailValue,
        isEmpty: baseHook.state.stats.isEmpty,
      },
    },
  };
};

export default useDoublyLinkedList;
