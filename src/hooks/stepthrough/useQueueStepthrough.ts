import { useState, useCallback } from 'react';
import { executeStepthrough } from '@/api';
import { StepthroughState, StepthroughHookReturn, QueueData } from '@/types';

const useStepthroughQueue = (initialCode: string = ''): StepthroughHookReturn<QueueData> => {
  const [state, setState] = useState<StepthroughState<QueueData>>({
    code: initialCode,
    filename: 'playground.py',
    steps: [],
    currentStepIndex: 0,
    isRunning: false,
    isAutoPlaying: false,
    executionId: null,
    error: null,
    data: {
      elements: [],
      count: 0,
    },
  });

  const setCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, code }));
  }, []);

  const setFilename = useCallback((filename: string) => {
    setState((prev) => ({ ...prev, filename }));
  }, []);

  const loadCodeFromFile = useCallback((code: string, filename: string) => {
    setState((prev) => ({ ...prev, code, filename }));
  }, []);

  const executeCode = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, error: null, currentStepIndex: 0 }));

    try {
      const response = await executeStepthrough({
        code: state.code,
        dataType: 'queue',
      });

      // Extract queue data from first step
      const firstStep = response.steps[0];
      let initialQueueData: QueueData = {
        elements: [],
        count: 0,
      };

      if (firstStep?.state?.instances) {
        const instanceEntries = Object.entries(firstStep.state.instances);
        if (instanceEntries.length > 0) {
          const firstInstance = instanceEntries[0][1] as Record<string, unknown>;
          if (firstInstance?.data && Array.isArray(firstInstance.data)) {
            initialQueueData = {
              elements: firstInstance.data.map((item) => String(item)),
              count: firstInstance.data.length,
            };
          }
        }
      }

      setState((prev) => ({
        ...prev,
        steps: response.steps,
        currentStepIndex: 0,
        executionId: response.executionId,
        isRunning: false,
        data: initialQueueData,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Execution failed',
        isRunning: false,
      }));
    }
  }, [state.code]);

  const setCurrentStep = useCallback((stepIndex: number) => {
    setState((prev) => {
      if (stepIndex >= 0 && stepIndex < prev.steps.length) {
        const step = prev.steps[stepIndex];
        let queueData: QueueData = prev.data;

        // Extract queue data from step state
        if (step?.state?.instances) {
          const instanceEntries = Object.entries(step.state.instances);
          if (instanceEntries.length > 0) {
            const firstInstance = instanceEntries[0][1] as Record<string, unknown>;
            if (firstInstance?.data && Array.isArray(firstInstance.data)) {
              queueData = {
                elements: firstInstance.data.map((item) => String(item)),
                count: firstInstance.data.length,
              };
            }
          }
        }

        return {
          ...prev,
          currentStepIndex: stepIndex,
          data: queueData,
        };
      }
      return prev;
    });
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex < prev.steps.length - 1) {
        const newIndex = prev.currentStepIndex + 1;
        const step = prev.steps[newIndex];
        let queueData: QueueData = prev.data;

        if (step?.state?.instances) {
          const instanceEntries = Object.entries(step.state.instances);
          if (instanceEntries.length > 0) {
            const firstInstance = instanceEntries[0][1] as Record<string, unknown>;
            if (firstInstance?.data && Array.isArray(firstInstance.data)) {
              queueData = {
                elements: firstInstance.data.map((item) => String(item)),
                count: firstInstance.data.length,
              };
            }
          }
        }

        return {
          ...prev,
          currentStepIndex: newIndex,
          data: queueData,
        };
      }
      return prev;
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex > 0) {
        const newIndex = prev.currentStepIndex - 1;
        const step = prev.steps[newIndex];
        let queueData: QueueData = prev.data;

        if (step?.state?.instances) {
          const instanceEntries = Object.entries(step.state.instances);
          if (instanceEntries.length > 0) {
            const firstInstance = instanceEntries[0][1] as Record<string, unknown>;
            if (firstInstance?.data && Array.isArray(firstInstance.data)) {
              queueData = {
                elements: firstInstance.data.map((item) => String(item)),
                count: firstInstance.data.length,
              };
            }
          }
        }

        return {
          ...prev,
          currentStepIndex: newIndex,
          data: queueData,
        };
      }
      return prev;
    });
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState((prev) => ({ ...prev, isAutoPlaying: !prev.isAutoPlaying }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      steps: [],
      currentStepIndex: 0,
      isRunning: false,
      isAutoPlaying: false,
      executionId: null,
      error: null,
      data: {
        elements: [],
        count: 0,
      },
    }));
  }, []);

  return {
    state,
    setCode,
    setFilename,
    loadCodeFromFile,
    executeCode,
    setCurrentStep,
    nextStep,
    previousStep,
    toggleAutoPlay,
    reset,
    isLoading: state.isRunning,
  };
};

export { useStepthroughQueue };
