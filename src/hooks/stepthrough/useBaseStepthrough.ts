import { useState, useCallback, useRef, useEffect } from 'react';
import {
  StepthroughStep,
  BaseStepthroughState,
  BaseStepthroughHookReturn,
  BaseStepthroughService,
} from '@/types';
import {
  useExecuteStepthrough,
  useStepthroughData,
  useCurrentStepDetails,
  useStepthroughState,
} from '@/query';

const useBaseStepthrough = <TData, TStats, TService extends BaseStepthroughService<TData, TStats>>(
  initialState: BaseStepthroughState<TData, TStats>,
  ServiceClass: new (state: BaseStepthroughState<TData, TStats>) => TService,
  dataType: string,
): BaseStepthroughHookReturn<TData, TStats> => {
  const [state, setState] = useState<BaseStepthroughState<TData, TStats>>(initialState);
  const [hookState, setHookState] = useState({
    isRunning: false,
    isAutoPlaying: false,
    currentStepIndex: 0,
    executionId: null as string | null,
    error: null as string | null,
  });
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract data from steps - to be implemented by specific data structure hooks
  const extractDataFromSteps = useCallback(
    (steps: StepthroughStep[], stepIndex: number): TData => {
      const service = new ServiceClass(initialState);
      return service.extractDataFromSteps(steps, stepIndex);
    },
    [ServiceClass, initialState],
  );

  // TanStack Query mutation for executing code
  const executeMutation = useExecuteStepthrough(dataType);

  // Set up mutation handlers
  useEffect(() => {
    if (executeMutation.isSuccess && executeMutation.data) {
      const response = executeMutation.data;
      setState((prev) => ({
        ...prev,
        steps: response.steps,
        currentStepIndex: 0,
        isRunning: false,
        executionId: response.executionId,
        error: null,
        data: extractDataFromSteps(response.steps, 0),
      }));
      setHookState((prev) => ({
        ...prev,
        isRunning: false,
        currentStepIndex: 0,
        executionId: response.executionId,
        error: null,
      }));
    }
  }, [executeMutation.isSuccess, executeMutation.data, extractDataFromSteps]);

  useEffect(() => {
    if (executeMutation.isError && executeMutation.error) {
      const error = executeMutation.error;
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Failed to execute code',
      }));
      setHookState((prev) => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Failed to execute code',
      }));
    }
  }, [executeMutation.isError, executeMutation.error]);

  // Query for stepthrough data (for DevTools visibility)
  useStepthroughData(
    hookState.executionId,
    state.steps,
    hookState.currentStepIndex,
    hookState.isRunning,
    hookState.error,
    state.data,
  );

  // Query for current step details (always enabled for DevTools)
  useCurrentStepDetails(hookState.currentStepIndex, state.steps, hookState.isAutoPlaying);

  // Query for stepthrough state (always enabled)
  useStepthroughState({ ...state, ...hookState });

  // Set code
  const setCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, code }));
  }, []);

  // Set filename
  const setFilename = useCallback((filename: string) => {
    setState((prev) => ({ ...prev, filename }));
  }, []);

  // Load code from file
  const loadCodeFromFile = useCallback((code: string, filename: string) => {
    setState((prev) => ({ ...prev, code, filename }));
  }, []);

  // Execute code
  const executeCode = useCallback(async () => {
    if (!state.code.trim()) return;

    setState((prev) => ({ ...prev, isRunning: true, error: null }));
    setHookState((prev) => ({ ...prev, isRunning: true, error: null }));
    executeMutation.mutate(state.code);
  }, [state.code, executeMutation]);

  // Set current step
  const setCurrentStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= state.steps.length) return;

      setState((prev) => ({
        ...prev,
        currentStepIndex: stepIndex,
        data: extractDataFromSteps(prev.steps, stepIndex),
      }));
      setHookState((prev) => ({
        ...prev,
        currentStepIndex: stepIndex,
      }));
    },
    [state.steps.length, extractDataFromSteps],
  );

  // Next step
  const nextStep = useCallback(() => {
    if (hookState.currentStepIndex < state.steps.length - 1) {
      setCurrentStep(hookState.currentStepIndex + 1);
    }
  }, [hookState.currentStepIndex, state.steps.length, setCurrentStep]);

  // Previous step
  const previousStep = useCallback(() => {
    if (hookState.currentStepIndex > 0) {
      setCurrentStep(hookState.currentStepIndex - 1);
    }
  }, [hookState.currentStepIndex, setCurrentStep]);

  // Toggle auto play
  const toggleAutoPlay = useCallback(() => {
    if (hookState.isAutoPlaying) {
      // Stop auto play
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setHookState((prev) => ({ ...prev, isAutoPlaying: false }));
    } else {
      // Start auto play
      setHookState((prev) => ({ ...prev, isAutoPlaying: true }));
      autoPlayIntervalRef.current = setInterval(() => {
        setState((prev) => {
          if (hookState.currentStepIndex < prev.steps.length - 1) {
            const nextIndex = hookState.currentStepIndex + 1;
            return {
              ...prev,
              currentStepIndex: nextIndex,
              data: extractDataFromSteps(prev.steps, nextIndex),
            };
          } else {
            // Auto play finished
            if (autoPlayIntervalRef.current) {
              clearInterval(autoPlayIntervalRef.current);
              autoPlayIntervalRef.current = null;
            }
            setHookState((prev) => ({ ...prev, isAutoPlaying: false }));
            return prev;
          }
        });
        setHookState((prev) => {
          if (prev.currentStepIndex < state.steps.length - 1) {
            return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
          } else {
            // Auto play finished
            if (autoPlayIntervalRef.current) {
              clearInterval(autoPlayIntervalRef.current);
              autoPlayIntervalRef.current = null;
            }
            return { ...prev, isAutoPlaying: false };
          }
        });
      }, 2000); // 2 seconds per step
    }
  }, [
    hookState.isAutoPlaying,
    hookState.currentStepIndex,
    state.steps.length,
    extractDataFromSteps,
  ]);

  // Reset
  const reset = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    setState(initialState);
    setHookState({
      isRunning: false,
      isAutoPlaying: false,
      currentStepIndex: 0,
      executionId: null,
      error: null,
    });
  }, [initialState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  return {
    state: {
      ...state,
      currentStepIndex: hookState.currentStepIndex,
      isRunning: hookState.isRunning,
      isAutoPlaying: hookState.isAutoPlaying,
      executionId: hookState.executionId,
      error: hookState.error,
    },
    setCode,
    setFilename,
    loadCodeFromFile,
    executeCode,
    setCurrentStep,
    nextStep,
    previousStep,
    toggleAutoPlay,
    reset,
    isLoading: executeMutation.isPending,
  };
};

export { useBaseStepthrough };
