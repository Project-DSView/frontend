import { useState, useCallback, useEffect } from 'react';
import { executeStepthrough } from '@/api';
import { StepthroughState, StepthroughHookReturn, QueueData } from '@/types';
import { toast } from 'sonner';

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

  // Input state for Python input() function
  const [inputState, setInputState] = useState<{
    waitingForInput: boolean;
    inputPrompt: string | null;
    inputId: number | null;
    inputHistory: Array<{ prompt: string; value: string; inputId: number }>;
    inputValues: string[];
    collectingInputs: boolean;
  }>({
    waitingForInput: false,
    inputPrompt: null,
    inputId: null,
    inputHistory: [],
    inputValues: [],
    collectingInputs: false,
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
    // Check if code contains input() - if so, collect inputs first
    const hasInput = /input\s*\(/.test(state.code);
    const inputCount = hasInput ? (state.code.match(/input\s*\(/g) || []).length : 0;

    // Always show dialog if we need inputs but don't have enough
    if (hasInput && inputState.inputValues.length < inputCount) {
      // Show toast notification to inform user
      toast.info('กรุณาใส่ input values สำหรับโค้ด', {
        description: `โค้ดของคุณมี ${inputCount} input() call(s) ที่ต้องกรอกค่า`,
        duration: 3000,
      });

      // Extract all input() prompts from code
      const inputMatches = Array.from(state.code.matchAll(/input\s*\(\s*([^)]*)\s*\)/g));
      const prompts: Array<{ prompt: string; inputId: number }> = [];

      inputMatches.forEach((match, idx) => {
        let prompt = '';
        if (match[1]) {
          const promptStr = match[1].trim();
          // Remove quotes if present
          if (
            (promptStr.startsWith('"') && promptStr.endsWith('"')) ||
            (promptStr.startsWith("'") && promptStr.endsWith("'"))
          ) {
            prompt = promptStr.slice(1, -1);
          } else if (promptStr) {
            prompt = '';
          }
        }
        prompts.push({
          prompt: prompt || `Input ${idx + 1}`,
          inputId: idx,
        });
      });

      // Verification: Ensure we have prompts for ALL inputs found
      while (prompts.length < inputCount) {
        const nextIdx = prompts.length;
        prompts.push({
          prompt: `Input ${nextIdx + 1}`,
          inputId: nextIdx,
        });
      }

      // Start collecting inputs - show all at once
      setInputState({
        waitingForInput: false,
        inputPrompt: prompts[0]?.prompt || null,
        inputId: 0,
        inputValues: [],
        inputHistory: prompts.map((p) => ({
          prompt: p.prompt,
          value: '',
          inputId: p.inputId,
        })),
        collectingInputs: true,
      });
      return; // Wait for inputs to be collected
    }

    // If all inputs collected or no input needed, proceed with execution
    if (!hasInput || inputState.inputValues.length >= inputCount) {
      // Show success toast if inputs were collected
      if (hasInput && inputState.inputValues.length >= inputCount) {
        toast.success('Input values ครบแล้ว กำลังรันโค้ด...', {
          duration: 2000,
        });
      }

      setState((prev) => ({ ...prev, isRunning: true, error: null, currentStepIndex: 0 }));

      try {
        const response = await executeStepthrough({
          code: state.code,
          dataType: 'queue',
          inputValues: inputState.inputValues.length > 0 ? inputState.inputValues : undefined,
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
          complexity: response.complexity,
        }));

        // Reset input values after execution
        setInputState((prev) => ({
          ...prev,
          inputValues: [],
          collectingInputs: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Execution failed',
          isRunning: false,
        }));
      }
    }
  }, [state.code, inputState.inputValues]);

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
    setInputState({
      waitingForInput: false,
      inputPrompt: null,
      inputId: null,
      inputHistory: [],
      inputValues: [],
      collectingInputs: false,
    });
  }, []);

  // Handle input submission - now accepts array of values
  const handleInputSubmit = useCallback(
    (values: string[]) => {
      setInputState((prev) => {
        // All inputs submitted at once
        const inputCount = (state.code.match(/input\s*\(/g) || []).length;

        if (values.length >= inputCount) {
          toast.success('Input values ครบแล้ว', {
            description: 'กำลังรันโค้ด...',
            duration: 2000,
          });

          return {
            ...prev,
            inputValues: values.slice(0, inputCount),
            inputHistory:
              prev.inputHistory?.map((h, idx) => ({
                ...h,
                value: values[idx] || '',
              })) || [],
            waitingForInput: false,
            collectingInputs: false,
            inputPrompt: null,
            inputId: null,
          };
        } else {
          // Not enough inputs
          return prev;
        }
      });
    },
    [state.code],
  );

  // Auto-execute when all inputs are collected
  useEffect(() => {
    if (!inputState.collectingInputs && inputState.inputValues.length > 0 && state.code.trim()) {
      const inputCount = (state.code.match(/input\s*\(/g) || []).length;
      if (inputCount > 0 && inputState.inputValues.length >= inputCount && !state.isRunning) {
        // All inputs collected, trigger execution
        executeCode();
      }
    }
  }, [
    inputState.collectingInputs,
    inputState.inputValues,
    state.code,
    state.isRunning,
    executeCode,
  ]);

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

  return {
    state: {
      ...state,
      inputState,
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
    isLoading: state.isRunning,
    handleInputSubmit,
    handleInputCancel,
  };
};

export { useStepthroughQueue };
