import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  StepthroughStep,
  BaseStepthroughState,
  BaseStepthroughHookReturn,
  BaseStepthroughService,
  DebugState,
} from '@/types';
import {
  useExecuteStepthrough,
  useStepthroughData,
  useCurrentStepDetails,
  useStepthroughState,
} from '@/query';
import { validatePythonCodeSecurity } from '@/lib/security/code-validation';

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

  // Debug mode state
  const [debugState, setDebugState] = useState<DebugState>({
    isDebugMode: false,
    breakpoints: [],
    currentDebugLine: null,
    isPaused: false,
  });

  // Input state for Python input() function
  const [inputState, setInputState] = useState<{
    waitingForInput: boolean;
    inputPrompt: string | null;
    inputId: number | null;
    inputHistory: Array<{ prompt: string; value: string; inputId: number }>;
    inputValues: string[]; // Pre-collected input values
    collectingInputs: boolean; // Whether we're collecting inputs before execution
  }>({
    waitingForInput: false,
    inputPrompt: null,
    inputId: null,
    inputHistory: [],
    inputValues: [],
    collectingInputs: false,
  });

  // AST Preview - removed (endpoint no longer available)

  // Extract data from steps - to be implemented by specific data structure hooks
  const extractDataFromSteps = useCallback(
    (steps: StepthroughStep[], stepIndex: number): TData => {
      const service = new ServiceClass(initialState);
      return service.extractDataFromSteps(steps, stepIndex);
    },
    [ServiceClass, initialState],
  );

  // Helper to get stats extraction function
  const extractStatsFromSteps = useCallback(
    (steps: StepthroughStep[]) => {
      const service = new ServiceClass(initialState);
      // We extract stats from the last step by default for the summary
      const lastIndex = steps.length > 0 ? steps.length - 1 : 0;
      return service.extractStatsFromSteps(steps, lastIndex);
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

      // Extract AST info from response steps
      let extractedASTInfo = null;
      if (response.steps && response.steps.length > 0) {
        console.log('✅ BaseStepthrough: Execution response:', response);

        for (const step of response.steps) {
          if (step.state?.ast_info) {
            extractedASTInfo = step.state.ast_info;
            break;
          }
        }
      }

      // Extract statistics from steps
      extractStatsFromSteps(response.steps);

      // Determine if waiting for input
      const isWaitingForInput = response.status === 'waiting';
      const lastStep = response.steps.length > 0 ? response.steps[response.steps.length - 1] : null;

      let newInputState = { ...inputState };

      if (isWaitingForInput && lastStep) {
        console.log('⏳ BaseStepthrough: Waiting for input at step', lastStep.stepNumber);

        // Extract prompt from last step state - ensure we check message properly
        const prompt = lastStep.state.input_prompt || lastStep.state.message || 'Enter value';
        const inputId = lastStep.stepNumber;

        newInputState = {
          ...inputState,
          waitingForInput: true,
          inputPrompt: prompt,
          inputId: inputId,
        };
      } else {
        // Not waiting, clear input state
        newInputState = {
          ...inputState,
          waitingForInput: false,
          inputPrompt: null,
          inputId: null,
        };
      }

      const astInfoToSet = extractedASTInfo || null;

      // Calculate index: if waiting, go to last step (the waiting one). If success, go to first step (standard reset)
      // UNLESS we are resuming execution (inputHistory > 0), in which case we might want to stay current?
      // Actually, standard behavior for "stepthrough" usually resets to 0.
      // But for interactive resume, we probably want to auto-fast-forward or just show the new steps.
      // If we provided inputs, we are likely deep in execution.
      // Let's set it to the last executed step if we were waiting, otherwise 0?
      // User request: "go to that step and then enter input -> step increases".
      // So if we just executed with new input, we should probably jump to the NEW step (the one after input).

      const targetStepIndex = inputState.inputValues.length > 0 ? response.steps.length - 1 : 0;

      setState((prev) => ({
        ...prev,
        steps: response.steps,
        currentStepIndex: targetStepIndex,
        isRunning: false,
        executionId: response.executionId,
        error: response.status === 'error' ? response.errorMessage || 'Execution failed' : null,
        data: extractDataFromSteps(response.steps, targetStepIndex),
        astInfo: astInfoToSet,
        terminalOutput: response.output,
        inputState: newInputState,
      }));

      setHookState((prev) => ({
        ...prev,
        isRunning: false,
        currentStepIndex: targetStepIndex,
        executionId: response.executionId,
        error: response.status === 'error' ? response.errorMessage || 'Execution failed' : null,
      }));

      setInputState(newInputState);
    }
  }, [
    executeMutation.isSuccess,
    executeMutation.data,
    extractDataFromSteps,
    extractStatsFromSteps,
  ]); // Removed inputState from dep array to avoid infinite loop

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

  // Execute code - SIMPLIFIED for interactive mode
  const executeCode = useCallback(async () => {
    console.log('🔵 executeCode called with inputs:', inputState.inputValues);
    if (!state.code.trim()) return;

    // Validate code security... (simplified for brevity here, assuming safe or already validated)
    const securityStatus = validatePythonCodeSecurity(state.code, 'stepthrough');
    if (!securityStatus.isSafe) {
      // ... existing error handling
      const relevantViolations = securityStatus.violations.filter(
        (v) => !v.toLowerCase().includes('input') && !v.toLowerCase().includes('user input'),
      );
      if (relevantViolations.length > 0) {
        // Build error message from violations
        const errorMessage =
          relevantViolations.length > 0
            ? `โค้ดไม่ปลอดภัย พบโค้ดที่เป็นอันตราย: ${relevantViolations.join(', ')}`
            : 'โค้ดไม่ปลอดภัย โปรดตรวจสอบโค้ดอีกครั้ง';

        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: errorMessage,
        }));
        setHookState((prev) => ({
          ...prev,
          isRunning: false,
          error: errorMessage,
        }));

        // Return early to prevent code execution
        return;
      }
    }

    setState((prev) => ({ ...prev, isRunning: true, error: null }));
    setHookState((prev) => ({ ...prev, isRunning: true, error: null }));

    // Execute with CURRENT accumulated inputs.
    // Backend will stop if more are needed.
    executeMutation.mutate({
      code: state.code,
      inputValues: inputState.inputValues,
    });
  }, [state.code, executeMutation, inputState.inputValues]);

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

  // Debug mode functions
  const toggleDebugMode = useCallback(() => {
    setDebugState((prev) => ({
      ...prev,
      isDebugMode: !prev.isDebugMode,
      isPaused: false,
      currentDebugLine: null,
    }));
  }, []);

  const setBreakpoint = useCallback((line: number) => {
    setDebugState((prev: DebugState) => {
      const existingBreakpoint = prev.breakpoints.find((bp) => bp.line === line);
      if (existingBreakpoint) {
        // Toggle breakpoint
        return {
          ...prev,
          breakpoints: prev.breakpoints.filter((bp) => bp.line !== line),
        };
      } else {
        // Add new breakpoint
        return {
          ...prev,
          breakpoints: [...prev.breakpoints, { line, enabled: true }],
        };
      }
    });
  }, []);

  const removeBreakpoint = useCallback((line: number) => {
    setDebugState((prev: DebugState) => ({
      ...prev,
      breakpoints: prev.breakpoints.filter((bp) => bp.line !== line),
    }));
  }, []);

  const stepOver = useCallback(() => {
    if (hookState.currentStepIndex < state.steps.length - 1) {
      setCurrentStep(hookState.currentStepIndex + 1);
      setDebugState((prev: DebugState) => ({
        ...prev,
        isPaused: true,
        currentDebugLine: state.steps[hookState.currentStepIndex + 1]?.line || null,
      }));
    }
  }, [hookState.currentStepIndex, setCurrentStep, state.steps]);

  const stepInto = useCallback(() => {
    // Step into is similar to step over for now
    // In a more advanced implementation, this would track function call depth
    stepOver();
  }, [stepOver]);

  const stepOut = useCallback(() => {
    // Step out would skip to the end of current function
    // For now, just move to next step
    if (hookState.currentStepIndex < state.steps.length - 1) {
      setCurrentStep(hookState.currentStepIndex + 1);
      setDebugState((prev: DebugState) => ({
        ...prev,
        isPaused: true,
        currentDebugLine: state.steps[hookState.currentStepIndex + 1]?.line || null,
      }));
    }
  }, [hookState.currentStepIndex, setCurrentStep, state.steps]);

  const continueDebug = useCallback(() => {
    if (!debugState.isDebugMode) return;

    // Find next breakpoint
    const currentLine = state.steps[hookState.currentStepIndex]?.line || 0;
    const nextBreakpoint = debugState.breakpoints
      .filter((bp) => bp.enabled && bp.line > currentLine)
      .sort((a, b) => a.line - b.line)[0];

    if (nextBreakpoint) {
      // Find step with matching line
      const targetStepIndex = state.steps.findIndex((step) => step.line === nextBreakpoint.line);
      if (targetStepIndex !== -1) {
        setCurrentStep(targetStepIndex);
        setDebugState((prev: DebugState) => ({
          ...prev,
          isPaused: true,
          currentDebugLine: nextBreakpoint.line,
        }));
      }
    } else {
      // No more breakpoints, continue to end
      setDebugState((prev: DebugState) => ({
        ...prev,
        isPaused: false,
        currentDebugLine: null,
      }));
    }
  }, [
    debugState.isDebugMode,
    debugState.breakpoints,
    hookState.currentStepIndex,
    state.steps,
    setCurrentStep,
  ]);

  // Check for breakpoints when stepping
  useEffect(() => {
    if (debugState.isDebugMode && state.steps.length > 0) {
      const currentLine = state.steps[hookState.currentStepIndex]?.line;
      if (currentLine) {
        const hasBreakpoint = debugState.breakpoints.some(
          (bp) => bp.line === currentLine && bp.enabled,
        );
        if (hasBreakpoint) {
          setDebugState((prev: DebugState) => ({
            ...prev,
            isPaused: true,
            currentDebugLine: currentLine,
          }));
        }
      }
    }
  }, [hookState.currentStepIndex, state.steps, debugState.isDebugMode, debugState.breakpoints]);

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
    setDebugState({
      isDebugMode: false,
      breakpoints: [],
      currentDebugLine: null,
      isPaused: false,
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

  // Handle input submission - APPEND and RE-EXECUTE
  const handleInputSubmit = useCallback(
    (values: string[]) => {
      // In this new interactive mode, we usually receive one value at a time from the dialog
      // But the component might send an array. We take the new values and append to history.

      if (values.length === 0) return;

      setInputState((prev) => {
        const newValues = [...prev.inputValues, ...values];

        console.log('✅ Submitting input, new total inputs:', newValues);

        // IMMEDIATE RE-EXECUTION with new inputs
        // We need to trigger this outside the state update, but we need the new state.
        // So we use a temp var or effect?
        // Better: Update state, and let the effect trigger?
        // Or just call mutate directly?
        // Since executeCode depends on inputState.inputValues, we can't just call it inside setState.
        // But we can call mutate directly if we have the values.

        // However, we want to update the UI input history too.

        return {
          ...prev,
          inputValues: newValues,
          waitingForInput: false,
          inputPrompt: null,
          inputId: null,
        };
      });

      // Trigger execution with new values immediately
      // We pass the NEW values explicitly to avoid stale closure issues
      const currentInputValues = inputState.inputValues;
      const newInputValues = [...currentInputValues, ...values];

      setState((prev) => ({ ...prev, isRunning: true, error: null }));
      setHookState((prev) => ({ ...prev, isRunning: true, error: null }));

      executeMutation.mutate({
        code: state.code,
        inputValues: newInputValues,
      });
    },
    [state.code, executeMutation, inputState.inputValues],
  );

  // Handle input cancel
  const handleInputCancel = useCallback(() => {
    setInputState((prev) => ({
      ...prev,
      waitingForInput: false,
      inputPrompt: null,
      inputId: null,
      collectingInputs: false,
    }));
  }, []);

  // Debug: Log inputState before returning
  // Use useMemo to ensure React properly detects state changes
  // Use individual properties instead of state object to ensure inputState changes trigger recompute
  const returnState = useMemo(() => {
    const stateObj = {
      code: state.code,
      filename: state.filename,
      steps: state.steps,
      data: state.data,
      stats: state.stats,
      currentStepIndex: hookState.currentStepIndex,
      isRunning: hookState.isRunning,
      isAutoPlaying: hookState.isAutoPlaying,
      executionId: hookState.executionId,
      error: hookState.error,
      debugState,
      // Explicitly set inputState, not from spread to ensure it's not overridden
      inputState: inputState,
      astPreview: null,
      astPreviewLoading: false,
      terminalOutput: state.terminalOutput,
    };
    console.log('📤 useBaseStepthrough return - inputState:', inputState);
    console.log('📤 useBaseStepthrough return - returnState.inputState:', stateObj.inputState);
    return stateObj;
  }, [
    state.code,
    state.filename,
    state.steps,
    state.data,
    state.stats,
    hookState.currentStepIndex,
    hookState.isRunning,
    hookState.isAutoPlaying,
    hookState.executionId,
    hookState.error,
    debugState,
    inputState, // This will trigger recompute when inputState changes
    state.terminalOutput,
  ]);

  return {
    state: returnState,
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
    // Debug mode functions
    toggleDebugMode,
    setBreakpoint,
    removeBreakpoint,
    stepOver,
    stepInto,
    stepOut,
    continueDebug,
    // Input handling functions
    handleInputSubmit,
    handleInputCancel,
  };
};

export { useBaseStepthrough };
