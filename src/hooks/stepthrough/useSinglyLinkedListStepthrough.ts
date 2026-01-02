import { useMemo } from 'react';
import { useBaseStepthrough } from './useBaseStepthrough';
import {
  SinglyLinkedListData,
  SinglyLinkedListStatsExtended,
  BaseStepthroughState,
  BaseStepthroughService,
  StepthroughStep,
} from '@/types';
import { singlyLinkedListCodeTemplate } from '@/data';

// SinglyLinkedList Stepthrough Service
class SinglyLinkedListStepthroughService
  implements BaseStepthroughService<SinglyLinkedListData, SinglyLinkedListStatsExtended>
{
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): SinglyLinkedListData {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return { nodes: [] };
    }

    const step = steps[stepIndex];

    // First, try to extract nodes from instances field if available
    // The backend sends instances as objects with nodes, count, head, tail
    if (step.state.instances) {
      // Find the first instance that has a 'nodes' array (could be 'mylist', 'self', 'list', etc.)
      for (const [, instanceValue] of Object.entries(step.state.instances)) {
        if (
          instanceValue &&
          typeof instanceValue === 'object' &&
          'nodes' in instanceValue &&
          Array.isArray((instanceValue as { nodes: string[] }).nodes)
        ) {
          const instance = instanceValue as {
            nodes: string[];
            count?: number;
            head?: string | null;
            tail?: string | null;
          };
          return {
            nodes: instance.nodes,
            head: instance.head ?? (instance.nodes.length > 0 ? instance.nodes[0] : undefined),
            tail:
              instance.tail ??
              (instance.nodes.length > 0 ? instance.nodes[instance.nodes.length - 1] : undefined),
            count: instance.count ?? instance.nodes.length,
          };
        }
        // Backward compatibility: if instanceValue is directly an array
        if (Array.isArray(instanceValue)) {
          return { nodes: instanceValue as string[] };
        }
      }
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
  ): SinglyLinkedListStatsExtended {
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

const defaultState: BaseStepthroughState<SinglyLinkedListData, SinglyLinkedListStatsExtended> = {
  code: singlyLinkedListCodeTemplate,
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

const useStepthroughSinglyLinkedList = () => {
  const baseHook = useBaseStepthrough<
    SinglyLinkedListData,
    SinglyLinkedListStatsExtended,
    SinglyLinkedListStepthroughService
  >(defaultState, SinglyLinkedListStepthroughService, 'singlylinkedlist');

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

export { useStepthroughSinglyLinkedList };
