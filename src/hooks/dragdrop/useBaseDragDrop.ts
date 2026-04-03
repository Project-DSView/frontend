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
  const cloneStatePart = <T,>(value: T): T => {
    if (typeof globalThis.structuredClone === 'function') {
      return globalThis.structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value)) as T;
  };

  const buildFreshInitialState = useCallback(
    (): BaseState<TData, TStats> => ({
      data: cloneStatePart(initialState.data),
      operations: [],
      stats: cloneStatePart(initialState.stats),
    }),
    [initialState],
  );

  const [state, setState] = useState<BaseState<TData, TStats>>(() => buildFreshInitialState());
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
  const [error, setError] = useState<string | null>(null);

  const operationsRef = useRef<TOperation[]>([]);

  const shouldSanitizeNumberField = useCallback((opType: string) => {
    return ![
      'add_vertex',
      'remove_vertex',
      'add_edge',
      'remove_edge',
      'traversal_dfs',
      'traversal_bfs',
      'shortest_path',
      'insert',
      'delete',
      'search',
    ].includes(opType);
  }, []);

  useEffect(() => {
    return () => {
      operationsRef.current = [];
    };
  }, []);

  const isOperationReadyForRealtimeExecution = useCallback((operation: TOperation) => {
    const op = operation as TOperation & {
      value?: string | null;
      position?: string | null;
      newValue?: string | null;
      sourceStack?: string | null;
      targetStack?: string | null;
    };

    if (op.type === 'push') {
      return !!op.value?.trim() && !!op.targetStack?.trim();
    }

    if (op.type === 'pop') {
      return !!op.targetStack?.trim();
    }

    if (op.type === 'copyStack') {
      return !!op.sourceStack?.trim() && !!op.targetStack?.trim();
    }

    return true;
  }, []);

  const rebuildStateFromOperations = useCallback(
    async (operations: TOperation[]): Promise<BaseState<TData, TStats>> => {
      const currentState: BaseState<TData, TStats> = {
        ...buildFreshInitialState(),
        operations,
      };

      const service = new ServiceClass(currentState);

      for (const operation of operations) {
        if (!isOperationReadyForRealtimeExecution(operation)) continue;
        await service.executeOperation(operation);
      }

      const rebuilt = service.getState();

      return {
        ...rebuilt,
        operations,
      };
    },
    [ServiceClass, buildFreshInitialState, isOperationReadyForRealtimeExecution],
  );

  const addOperation = useCallback(
    async (operation: Omit<TOperation, 'id'>) => {
      try {
        setError(null);

        const newOperation: TOperation = {
          ...operation,
          id: Date.now(),
        } as TOperation;

        const newOperations = [...operationsRef.current, newOperation];
        operationsRef.current = newOperations;

        setState((prev) => ({
          ...prev,
          operations: newOperations,
        }));

        if (!isOperationReadyForRealtimeExecution(newOperation)) {
          return;
        }

        const rebuiltState = await rebuildStateFromOperations(newOperations);

        setState(rebuiltState);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add operation';
        setError(errorMessage);
        console.error('Error adding operation:', error);
      }
    },
    [isOperationReadyForRealtimeExecution, rebuildStateFromOperations],
  );

  const updateOperation = useCallback(
    async (id: number, updates: Partial<TOperation>) => {
      try {
        setError(null);

const sanitizeNumber = (val?: string | null) => {
  if (!val) return val;
  const clean = val.replace(/[^0-9]/g, '');
  return clean.replace(/^0+(?!$)/, '');
};

const newOperations = operationsRef.current.map((op) => {
  if (op.id !== id) return op;

  const sanitizedUpdates = { ...updates } as Partial<TOperation>;

  // 🔥 sanitize เฉพาะ field ที่เป็น number
  if (sanitizedUpdates.value !== undefined && shouldSanitizeNumberField(op.type)) {
    sanitizedUpdates.value = sanitizeNumber(sanitizedUpdates.value);
  }

  if (sanitizedUpdates.position !== undefined && shouldSanitizeNumberField(op.type)) {
    sanitizedUpdates.position = sanitizeNumber(sanitizedUpdates.position);
  }

  if (sanitizedUpdates.newValue !== undefined && shouldSanitizeNumberField(op.type)) {
    sanitizedUpdates.newValue = sanitizeNumber(sanitizedUpdates.newValue);
  }

  return {
    ...op,
    ...sanitizedUpdates,
  } as TOperation;
});

        operationsRef.current = newOperations;

        const rebuiltState = await rebuildStateFromOperations(newOperations);
        setState(rebuiltState);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update operation';
        setError(errorMessage);
        console.error('Error updating operation:', error);
      }
    },
    [rebuildStateFromOperations, shouldSanitizeNumberField],
  );

  const removeOperation = useCallback(
    async (id: number) => {
      try {
        setError(null);

        const newOperations = operationsRef.current.filter((op) => op.id !== id) as TOperation[];
        operationsRef.current = newOperations;

        const rebuiltState = await rebuildStateFromOperations(newOperations);
        setState(rebuiltState);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove operation';
        setError(errorMessage);
        console.error('Error removing operation:', error);
      }
    },
    [rebuildStateFromOperations],
  );

  const clearOperations = useCallback(() => {
    try {
      setError(null);
      operationsRef.current = [];
      const freshInitialState = buildFreshInitialState();
      setState((prev) => ({
        ...initialState,
        data: freshInitialState.data,
        operations: [],
        stats: freshInitialState.stats,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear operations';
      setError(errorMessage);
      console.error('Error clearing operations:', error);
    }
  }, [buildFreshInitialState, initialState]);

  const clearAll = useCallback(() => {
    try {
      setError(null);
      operationsRef.current = [];
      setState(buildFreshInitialState());
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear all';
      setError(errorMessage);
      console.error('Error clearing all:', error);
    }
  }, [buildFreshInitialState]);

  const reorderOperation = useCallback(
    async (fromIndex: number, toIndex: number) => {
      try {
        setError(null);

        const newOperations = [...operationsRef.current];
        const [removed] = newOperations.splice(fromIndex, 1);
        newOperations.splice(toIndex, 0, removed);
        operationsRef.current = newOperations as TOperation[];

        const rebuiltState = await rebuildStateFromOperations(newOperations as TOperation[]);
        setState(rebuiltState);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to reorder operation';
        setError(errorMessage);
        console.error('Error reordering operation:', error);
      }
    },
    [rebuildStateFromOperations],
  );

  const updateDataState = useCallback((newData: TData, newStats: TStats) => {
    try {
      setError(null);
      setState((prev) => ({
        ...prev,
        data: newData,
        stats: newStats,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update data state';
      setError(errorMessage);
      console.error('Error updating data state:', error);
    }
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

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];

          setHookState((prev) => ({
            ...prev,
            currentStep: step.step,
            currentLine: i,
            executionHistory: [...prev.executionHistory, step.description],
          }));

          if (step.nodeValue) {
            setHookState((prev) => ({ ...prev, highlightedNodes: [step.nodeValue!] }));
          }

          if (step.path) {
            setHookState((prev) => ({ ...prev, searchPath: step.path! }));
          }

          const currentServiceState = service.getState();
          setState((prev) => ({
            ...prev,
            data: currentServiceState.data,
            stats: currentServiceState.stats,
          }));

          await new Promise((resolve) => setTimeout(resolve, step.duration));
        }

        const newServiceState = service.getState();
        return newServiceState;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error executing operation:', error);
        setError(errorMessage);
        setHookState((prev) => ({
          ...prev,
          executionHistory: [...prev.executionHistory, `Error: ${errorMessage}`],
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error executing operations:', error);
      setError(errorMessage);
      setHookState((prev) => ({
        ...prev,
        executionHistory: [...prev.executionHistory, `Error: ${errorMessage}`],
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
    error,
    addOperation,
    updateOperation,
    removeOperation,
    clearOperations,
    clearAll,
    reorderOperation,
    executeOperation,
    executeAllOperations,
    updateDataState,
    setCurrentLine,
    setCurrentStep,
  };
};

export { useBaseDataStructure };