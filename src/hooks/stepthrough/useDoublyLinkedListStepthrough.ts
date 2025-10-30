import { useMemo } from 'react';
import { useBaseStepthrough } from './useBaseStepthrough';
import {
  DoublyLinkedListData,
  DoublyLinkedListStatsExtended,
  BaseStepthroughState,
  BaseStepthroughService,
  StepthroughStep,
} from '@/types';
import { doublyLinkedListCodeTemplate } from '@/data';

// DoublyLinkedList Stepthrough Service
class DoublyLinkedListStepthroughService
  implements BaseStepthroughService<DoublyLinkedListData, DoublyLinkedListStatsExtended>
{
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): DoublyLinkedListData {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return { nodes: [] };
    }

    const step = steps[stepIndex];

    // First, try to extract nodes from instances field if available
    if (
      step.state.instances &&
      step.state.instances.mylist &&
      Array.isArray(step.state.instances.mylist)
    ) {
      return { nodes: step.state.instances.mylist };
    }

    // If instances not available, build from step_detail and operation data
    let nodes: string[] = [];

    // Build nodes by simulating the operations up to current step
    for (let i = 0; i <= stepIndex; i++) {
      const currentStep = steps[i];
      const stepDetail = currentStep.state.step_detail;

      if (stepDetail && stepDetail.operation) {
        const operation = stepDetail.operation;

        if (operation === 'instantiate') {
          // Initialize empty list
          nodes = [];
        } else if (operation === 'method_call') {
          const methodName = stepDetail.method_name;
          const parameters = stepDetail.parameters || '';

          if (methodName === 'insertFront') {
            // Extract value from parameters (e.g., "Tony")
            const valueMatch = parameters.match(/['"]([^'"]+)['"]/);
            if (valueMatch) {
              const value = valueMatch[1];
              nodes.unshift(value);
            }
          } else if (methodName === 'insertLast') {
            // Extract value from parameters
            const valueMatch = parameters.match(/['"]([^'"]+)['"]/);
            if (valueMatch) {
              const value = valueMatch[1];
              nodes.push(value);
            }
          } else if (methodName === 'insertBefore') {
            // Extract both values from parameters (e.g., "John", "Ako")
            const paramMatch = parameters.match(/['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/);
            if (paramMatch) {
              const targetNode = paramMatch[1]; // Node to insert before
              const newValue = paramMatch[2]; // Value to insert
              const targetIndex = nodes.indexOf(targetNode);
              if (targetIndex > -1) {
                nodes.splice(targetIndex, 0, newValue);
              } else {
                nodes.unshift(newValue); // Default to beginning if target not found
              }
            }
          } else if (methodName === 'insertAfter') {
            // Extract both values from parameters (e.g., "John", "Ako")
            const paramMatch = parameters.match(/['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/);
            if (paramMatch) {
              const targetNode = paramMatch[1]; // Node to insert after
              const newValue = paramMatch[2]; // Value to insert
              const targetIndex = nodes.indexOf(targetNode);
              if (targetIndex > -1) {
                nodes.splice(targetIndex + 1, 0, newValue);
              } else {
                nodes.push(newValue); // Default to end if target not found
              }
            }
          } else if (methodName === 'delete') {
            // Extract value from parameters
            const valueMatch = parameters.match(/['"]([^'"]+)['"]/);
            if (valueMatch) {
              const value = valueMatch[1];
              const index = nodes.indexOf(value);
              if (index > -1) {
                nodes.splice(index, 1);
              }
            }
          }
        }
      }
    }

    return { nodes };
  }

  extractStatsFromSteps(
    steps: StepthroughStep[],
    stepIndex: number,
  ): DoublyLinkedListStatsExtended {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return {
        size: 0,
        headValue: null,
        tailValue: null,
        isEmpty: true,
      };
    }

    const step = steps[stepIndex];
    const message = step.state.message || '';

    // Extract count from message
    const countMatch = message.match(/count:\s*(\d+)/);
    const count = countMatch ? parseInt(countMatch[1]) : 0;

    // Get nodes to determine head and tail
    const data = this.extractDataFromSteps(steps, stepIndex);
    const nodes = data.nodes;

    return {
      size: count || nodes.length,
      headValue: nodes.length > 0 ? nodes[0] : null,
      tailValue: nodes.length > 0 ? nodes[nodes.length - 1] : null,
      isEmpty: nodes.length === 0,
    };
  }
}

const defaultState: BaseStepthroughState<DoublyLinkedListData, DoublyLinkedListStatsExtended> = {
  code: doublyLinkedListCodeTemplate,
  filename: 'playground.py',
  steps: [],
  data: { nodes: [] },
  stats: {
    size: 0,
    headValue: null,
    tailValue: null,
    isEmpty: true,
  },
};

const useDoublyLinkedListStepthrough = () => {
  const baseHook = useBaseStepthrough<
    DoublyLinkedListData,
    DoublyLinkedListStatsExtended,
    DoublyLinkedListStepthroughService
  >(defaultState, DoublyLinkedListStepthroughService, 'doublylinkedlist');

  const linkedListData = useMemo(
    () => ({
      nodes: baseHook.state.data.nodes,
      head: baseHook.state.stats.headValue,
      tail: baseHook.state.stats.tailValue,
      count: baseHook.state.stats.size,
    }),
    [
      baseHook.state.data.nodes,
      baseHook.state.stats.headValue,
      baseHook.state.stats.tailValue,
      baseHook.state.stats.size,
    ],
  );

  return {
    ...baseHook,
    linkedListData,
  };
};

export default useDoublyLinkedListStepthrough;
