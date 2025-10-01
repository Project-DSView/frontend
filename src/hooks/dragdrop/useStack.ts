import {
  StackState,
  StackOperation,
  StackData,
  StackStatsExtended,
  StackStateExtended,
  BaseState,
} from '@/types';
import { StackService } from '@/services';
import { useBaseDataStructure } from './useBaseDataStructure';
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
      data: { elements: stackState.elements },
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
    switch (operation.type) {
      case 'push':
        if (operation.value) {
          return await this.service.push(operation.value);
        }
        break;
      case 'pop':
        return await this.service.pop();
      default:
        console.warn('Unknown operation type:', operation.type);
        return [];
    }
    return [];
  }
}

const defaultState: StackStateExtended = {
  data: { elements: [] },
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

  return {
    ...baseHook,
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
