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
      Object.entries(state.instances).forEach(([instanceName, instanceData]) => {
        if (instanceData && typeof instanceData === 'object' && 'data' in instanceData) {
          const instance = instanceData as StackInstanceData;
          if (Array.isArray(instance.data)) {
            const stackData = instance.data.map((item: unknown) => String(item));
            allStacks[instanceName] = {
              data: stackData,
              size: instance.size || stackData.length,
              isEmpty: instance.isEmpty || stackData.length === 0,
              top: instance.top
                ? String(instance.top)
                : stackData.length > 0
                  ? stackData[stackData.length - 1]
                  : null,
            };

            // Use the first stack as primary elements for backward compatibility
            if (elements.length === 0) {
              elements = stackData;
            }
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
