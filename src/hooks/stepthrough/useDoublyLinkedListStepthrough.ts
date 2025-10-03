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
    const message = step.state.message || '';

    // Extract nodes from message (e.g., "-> Mika -> Ako -> Yaoyao -> Saori")
    const nodeMatch = message.match(/->\s*([^->]+(?:\s*->\s*[^->]+)*)/);
    let nodes: string[] = [];

    if (nodeMatch) {
      nodes = nodeMatch[1]
        .split('->')
        .map((node: string) => node.trim())
        .filter((node: string) => node.length > 0);
    }

    // If no nodes found in current step, build from all steps up to current step
    if (nodes.length === 0) {
      // Look for all insert operations from the beginning up to current step
      for (let i = 0; i <= stepIndex; i++) {
        const currentStep = steps[i];
        const currentMessage = currentStep.state.message || '';

        // Check for insert operations
        if (
          currentMessage.includes('Inserted') ||
          currentMessage.includes('insertFront') ||
          currentMessage.includes('insertLast') ||
          currentMessage.includes('insertBefore')
        ) {
          // Extract value from insert message
          const insertMatch = currentMessage.match(/['"]([^'"]+)['"]/);
          if (insertMatch) {
            const value = insertMatch[1];
            // Add to nodes if not already present
            if (!nodes.includes(value)) {
              // Check if it's insertFront or insertLast
              if (currentMessage.includes('insertFront') || currentMessage.includes('at front')) {
                nodes.unshift(value); // Add to beginning for insertFront
              } else if (
                currentMessage.includes('insertLast') ||
                currentMessage.includes('at end')
              ) {
                nodes.push(value); // Add to end for insertLast
              } else if (currentMessage.includes('insertBefore')) {
                // Extract target node from insertBefore message
                const beforeMatch = currentMessage.match(/before\s+['"]([^'"]+)['"]/);
                if (beforeMatch) {
                  const targetNode = beforeMatch[1];
                  const targetIndex = nodes.indexOf(targetNode);
                  if (targetIndex > -1) {
                    nodes.splice(targetIndex, 0, value); // Insert before target node
                  } else {
                    nodes.unshift(value); // Default to beginning if target not found
                  }
                } else {
                  nodes.unshift(value); // Default to beginning
                }
              } else {
                nodes.unshift(value); // Default to beginning
              }
            }
          }
        }

        // Check for delete operations
        if (currentMessage.includes('Deleted') || currentMessage.includes('delete')) {
          // Extract value from delete message
          const deleteMatch = currentMessage.match(/['"]([^'"]+)['"]/);
          if (deleteMatch) {
            const value = deleteMatch[1];
            // Remove from nodes if present
            const index = nodes.indexOf(value);
            if (index > -1) {
              nodes.splice(index, 1);
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
