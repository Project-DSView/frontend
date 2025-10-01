import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseState,
  BaseStats,
  BaseOperation,
  BaseHookState,
  BaseHookReturn,
  BaseDataStructureService,
} from '@/types';

const useBaseDataStructure = <TData, TStats extends BaseStats, TOperation extends BaseOperation>(
  initialState: BaseState<TData, TStats>,
  ServiceClass: new (
    state: BaseState<TData, TStats>,
  ) => BaseDataStructureService<TData, TStats, TOperation>,
): BaseHookReturn<TData, TStats, TOperation> => {
  const [state, setState] = useState<BaseState<TData, TStats>>(initialState);
  const [hookState, setHookState] = useState<BaseHookState>({
    isRunning: false,
    currentLine: -1,
    currentStep: '',
    executionHistory: [],
    currentOperation: undefined,
    highlightedNodes: [],
    searchPath: [],
    currentPosition: 0,
  });

  const operationsRef = useRef<TOperation[]>([]);

  // Cleanup effect for memory management
  useEffect(() => {
    return () => {
      operationsRef.current = [];
      // Don't call setState in cleanup to avoid infinite re-renders
    };
  }, []);

  const addOperation = useCallback((operation: Omit<TOperation, 'id'>) => {
    const newOperation: TOperation = {
      ...operation,
      id: Date.now(),
    } as TOperation;

    setState((prev) => {
      const newOperations = [...prev.operations, newOperation];
      operationsRef.current = newOperations as TOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const updateOperation = useCallback((id: number, updates: Partial<TOperation>) => {
    setState((prev) => {
      const newOperations = prev.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op,
      ) as TOperation[];
      operationsRef.current = newOperations;
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const removeOperation = useCallback((id: number) => {
    setState((prev) => {
      const newOperations = prev.operations.filter((op) => op.id !== id) as TOperation[];
      operationsRef.current = newOperations;
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const clearOperations = useCallback(() => {
    setState((prev) => {
      operationsRef.current = [];
      return {
        ...prev,
        operations: [],
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(initialState);
    operationsRef.current = [];
    setHookState({
      isRunning: false,
      currentLine: -1,
      currentStep: '',
      executionHistory: [],
      currentOperation: undefined,
      highlightedNodes: [],
      searchPath: [],
      currentPosition: 0,
    });
  }, [initialState]);

  const updateDataState = useCallback((newData: TData, newStats: TStats) => {
    setState((prev) => ({
      ...prev,
      data: newData,
      stats: newStats,
    }));
  }, []);

  const setCurrentLine = useCallback((line: number) => {
    setHookState((prev) => ({ ...prev, currentLine: line }));
  }, []);

  const setCurrentStep = useCallback((step: string) => {
    setHookState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const executeOperation = useCallback(
    async (
      operation: TOperation,
      currentState: BaseState<TData, TStats>,
    ): Promise<BaseState<TData, TStats>> => {
      const service = new ServiceClass(currentState);

      setHookState((prev) => ({ ...prev, currentOperation: operation.type }));

      try {
        const steps = await service.executeOperation(operation);

        // Execute steps with animation
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          setHookState((prev) => ({
            ...prev,
            currentStep: step.step,
            currentLine: i,
            executionHistory: [...prev.executionHistory, step.description],
          }));

          // Update highlighted nodes
          if (step.nodeValue) {
            setHookState((prev) => ({ ...prev, highlightedNodes: [step.nodeValue!] }));
          }
          if (step.path) {
            setHookState((prev) => ({ ...prev, searchPath: step.path! }));
          }

          // Update state after each step
          const currentServiceState = service.getState();
          setState((prev) => ({
            ...prev,
            data: currentServiceState.data,
            stats: currentServiceState.stats,
          }));

          await new Promise((resolve) => setTimeout(resolve, step.duration));
        }

        // Get final updated state from service
        const newServiceState = service.getState();
        return newServiceState;
      } catch (error) {
        console.error('Error executing operation:', error);
        setHookState((prev) => ({
          ...prev,
          executionHistory: [...prev.executionHistory, `Error: ${error}`],
        }));
        return currentState;
      } finally {
        setHookState((prev) => ({
          ...prev,
          currentOperation: undefined,
          highlightedNodes: [],
          searchPath: [],
        }));
      }
    },
    [ServiceClass],
  );

  const executeAllOperations = useCallback(async () => {
    if (hookState.isRunning) return;

    setHookState((prev) => ({
      ...prev,
      isRunning: true,
      executionHistory: [],
      currentLine: -1,
      currentStep: 'กำลัง Reset...',
      currentOperation: undefined,
      highlightedNodes: [],
      searchPath: [],
      currentPosition: 0,
    }));

    // Reset state to initial state before executing
    setState(initialState);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setHookState((prev) => ({ ...prev, currentStep: 'เริ่มการ Execute Operations...' }));
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      let currentState: BaseState<TData, TStats> = {
        ...initialState,
        operations: operationsRef.current,
      };

      for (const operation of operationsRef.current) {
        currentState = await executeOperation(operation, currentState);
      }

      setState((prev) => ({
        ...prev,
        data: currentState.data,
        stats: currentState.stats,
      }));

      setHookState((prev) => ({
        ...prev,
        executionHistory: [...prev.executionHistory, 'การ Execute เสร็จสิ้น'],
      }));
    } catch (error) {
      console.error('Error executing operations:', error);
      setHookState((prev) => ({
        ...prev,
        executionHistory: [...prev.executionHistory, `Error: ${error}`],
      }));
    } finally {
      setHookState((prev) => ({
        ...prev,
        isRunning: false,
        currentLine: -1,
        currentStep: '',
        currentOperation: undefined,
        highlightedNodes: [],
        searchPath: [],
      }));
    }
  }, [executeOperation, hookState.isRunning, initialState]);

  return {
    state,
    isRunning: hookState.isRunning,
    currentLine: hookState.currentLine,
    currentStep: hookState.currentStep,
    executionHistory: hookState.executionHistory,
    currentOperation: hookState.currentOperation,
    highlightedNodes: hookState.highlightedNodes,
    searchPath: hookState.searchPath,
    currentPosition: hookState.currentPosition,
    addOperation,
    updateOperation,
    removeOperation,
    clearOperations,
    clearAll,
    executeOperation,
    executeAllOperations,
    updateDataState,
    setCurrentLine,
    setCurrentStep,
  };
};

export { useBaseDataStructure };
