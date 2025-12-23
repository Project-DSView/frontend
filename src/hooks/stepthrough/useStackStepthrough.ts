import { useMemo } from 'react';
import { useBaseStepthrough } from './useBaseStepthrough';
import {
  StackData,
  StackStatsExtended,
  BaseStepthroughState,
  BaseStepthroughService,
  StepthroughStep,
  StackInstanceData,
  StackStepDetail,
} from '@/types';
import { stackCodeTemplate } from '@/data';

// Stack Stepthrough Service
class StackStepthroughService implements BaseStepthroughService<StackData, StackStatsExtended> {
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): StackData {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return { elements: [], count: 0 };
    }

    const step = steps[stepIndex];
    const state = step.state;

    // Extract all stack instances dynamically
    const allStacks: {
      [stackName: string]: { data: string[]; size: number; isEmpty: boolean; top: string | null };
    } = {};
    let elements: string[] = [];

    if (state.instances) {
      // Look for all stack instances in the state
      // Look for all stack instances in the state
      Object.entries(state.instances).forEach(([instanceName, instanceData]) => {
        console.log(`🔍 Processing instance: ${instanceName}`, instanceData);
        let stackData: string[] | null = null;

        // Case 1: ArrayStack instance (has .data property)
        if (instanceData && typeof instanceData === 'object' && 'data' in instanceData) {
          const instance = instanceData as StackInstanceData;
          if (Array.isArray(instance.data)) {
            stackData = instance.data.map((item: unknown) => String(item));
          }
        }
        // Case 2: Plain list (is an array)
        else if (Array.isArray(instanceData)) {
          stackData = instanceData.map((item: unknown) => String(item));
        }

        if (stackData) {
          allStacks[instanceName] = {
            data: stackData,
            size: stackData.length, // Default to length if size not available
            isEmpty: stackData.length === 0,
            top: stackData.length > 0 ? stackData[stackData.length - 1] : null,
          };

          // Try to extract extra properties if available (for ArrayStack)
          if (instanceData && typeof instanceData === 'object' && !Array.isArray(instanceData)) {
            const instance = instanceData as Record<string, unknown>;
            if (typeof instance.size === 'number') allStacks[instanceName].size = instance.size;
            if (typeof instance.isEmpty === 'boolean')
              allStacks[instanceName].isEmpty = instance.isEmpty;
            if (instance.top !== undefined) allStacks[instanceName].top = String(instance.top);
          }

          // Use the first stack as primary elements for backward compatibility
          // Prioritize 's1' or 'stack' or 'main' if available, otherwise just use the first one found
          if (
            elements.length === 0 ||
            instanceName === 's1' ||
            instanceName === 'main' ||
            instanceName === 'stack'
          ) {
            elements = stackData;
          }
        }
      });
    }

    // If no elements found, try to extract from step detail
    if (elements.length === 0 && state.step_detail) {
      const stepDetail = state.step_detail as StackStepDetail;

      // Check for push operations
      if (stepDetail.operation === 'push' && stepDetail.after_data) {
        elements = stepDetail.after_data.map((item: unknown) => String(item));
      }
      // Check for pop operations
      else if (stepDetail.operation === 'pop' && stepDetail.after_data) {
        elements = stepDetail.after_data.map((item: unknown) => String(item));
      }
      // Check for printStack operations
      else if (stepDetail.operation === 'printStack' && stepDetail.value) {
        elements = stepDetail.value.map((item: unknown) => String(item));
      }
    }

    // If still no elements, build from all steps up to current step
    if (elements.length === 0) {
      for (let i = 0; i <= stepIndex; i++) {
        const currentStep = steps[i];
        const currentState = currentStep.state;

        // Check for push operations in step detail
        if (currentState.step_detail?.operation === 'push') {
          const stepDetail = currentState.step_detail as StackStepDetail;
          if (stepDetail.after_data && Array.isArray(stepDetail.after_data)) {
            elements = stepDetail.after_data.map((item: unknown) => String(item));
          }
        }
        // Check for pop operations
        else if (currentState.step_detail?.operation === 'pop') {
          const stepDetail = currentState.step_detail as StackStepDetail;
          if (stepDetail.after_data && Array.isArray(stepDetail.after_data)) {
            elements = stepDetail.after_data.map((item: unknown) => String(item));
          }
        }
      }
    }

    // Fallback: Check print_output if elements are still empty
    if (elements.length === 0 && state.print_output && Array.isArray(state.print_output)) {
      for (const outputLine of state.print_output) {
        if (
          typeof outputLine === 'string' &&
          outputLine.trim().startsWith('[') &&
          outputLine.trim().endsWith(']')
        ) {
          try {
            // Replace single quotes with double quotes for valid JSON parsing if needed
            const jsonString = outputLine.replace(/'/g, '"');
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) {
              elements = parsed.map((item: unknown) => String(item));
              // Break after finding the first valid list representation in print output
              break;
            }
          } catch {
            console.warn('Failed to parse stack from print output:', outputLine);
          }
        }
      }
    }

    return {
      elements,
      count: elements.length,
      allStacks: Object.keys(allStacks).length > 0 ? allStacks : undefined,
    };
  }

  extractStatsFromSteps(steps: StepthroughStep[], stepIndex: number): StackStatsExtended {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return {
        size: 0,
        headValue: null,
        tailValue: null,
        isEmpty: true,
      };
    }

    const step = steps[stepIndex];
    const state = step.state;

    // Get elements to determine stats
    const data = this.extractDataFromSteps(steps, stepIndex);
    const elements = data.elements;

    // Extract size from step detail if available
    let size = elements.length;
    const stepDetail = state.step_detail as StackStepDetail;
    if (stepDetail?.size !== undefined) {
      size = stepDetail.size;
    }

    return {
      size: size,
      headValue: elements.length > 0 ? elements[elements.length - 1] : null, // Top of stack
      tailValue: elements.length > 0 ? elements[0] : null, // Bottom of stack
      isEmpty: elements.length === 0,
    };
  }
}

const defaultState: BaseStepthroughState<StackData, StackStatsExtended> = {
  code: stackCodeTemplate,
  filename: 'playground.py',
  steps: [],
  data: { elements: [], count: 0, allStacks: undefined },
  stats: {
    size: 0,
    headValue: null,
    tailValue: null,
    isEmpty: true,
  },
};

const useStepthroughStack = () => {
  const baseHook = useBaseStepthrough<StackData, StackStatsExtended, StackStepthroughService>(
    defaultState,
    StackStepthroughService,
    'stack',
  );

  const stackData = useMemo(
    () => ({
      elements: baseHook.state.data.elements,
      allStacks: baseHook.state.data.allStacks,
      head: baseHook.state.stats.headValue,
      tail: baseHook.state.stats.tailValue,
      count: baseHook.state.stats.size,
    }),
    [
      baseHook.state.data.elements,
      baseHook.state.data.allStacks,
      baseHook.state.stats.headValue,
      baseHook.state.stats.tailValue,
      baseHook.state.stats.size,
    ],
  );

  return {
    ...baseHook,
    stackData,
  };
};

export { useStepthroughStack };
