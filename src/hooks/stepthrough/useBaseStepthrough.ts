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
  const currentStepIndexRef = useRef<number>(0);

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
      currentStepIndexRef.current = 0;
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

      currentStepIndexRef.current = stepIndex;
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

  // Auto play step with dynamic delay
  const autoPlayNextStep = useCallback(() => {
    const currentIndex = currentStepIndexRef.current;

    // Calculate delay based on current step content
    const currentStep = state.steps[currentIndex];
    const message = currentStep?.state?.message || '';
    let delay = 2000; // Default 2 seconds

    // If it's a traversal step, calculate delay based on actual traversal duration
    if (
      message.includes('traverse') ||
      message.includes('Traverse') ||
      message.includes('BFS') ||
      message.includes('DFS')
    ) {
      // Calculate exact delay based on traversal animation
      // Each node takes 1 second to animate, plus 0.5 second buffer
      const estimatedNodes = Math.max(2, Math.min(8, state.steps.length / 3));
      delay = estimatedNodes * 1000 + 50; // 1 second per node + 0.5 second buffer
    }

    // Schedule step change with calculated delay
    autoPlayIntervalRef.current = setTimeout(() => {
      setState((prev) => {
        if (currentIndex < prev.steps.length - 1) {
          const nextIndex = currentIndex + 1;
          currentStepIndexRef.current = nextIndex;
          setHookState((prevHook) => ({ ...prevHook, currentStepIndex: nextIndex }));

          return {
            ...prev,
            currentStepIndex: nextIndex,
            data: extractDataFromSteps(prev.steps, nextIndex),
          };
        } else {
          // Auto play finished
          autoPlayIntervalRef.current = null;
          setHookState((prevHook) => ({ ...prevHook, isAutoPlaying: false }));
          return prev;
        }
      });

      // Schedule next step if not finished
      if (currentIndex < state.steps.length - 1) {
        autoPlayNextStep();
      }
    }, delay);
  }, [extractDataFromSteps, state.steps]);

  // Toggle auto play
  const toggleAutoPlay = useCallback(() => {
    if (hookState.isAutoPlaying) {
      // Stop auto play
      if (autoPlayIntervalRef.current) {
        clearTimeout(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setHookState((prev) => ({ ...prev, isAutoPlaying: false }));
    } else {
      // Start auto play
      setHookState((prev) => ({ ...prev, isAutoPlaying: true }));
      autoPlayNextStep();
    }
  }, [hookState.isAutoPlaying, autoPlayNextStep]);

  // Reset
  const reset = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearTimeout(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    currentStepIndexRef.current = 0;
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
        clearTimeout(autoPlayIntervalRef.current);
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
