import { useState, useCallback, useRef, useEffect } from 'react';
import { StackState, StackOperation } from '@/types';
import { StackService } from '@/services';
import { delay, addToExecutionHistory } from '@/lib';

const useStack = (initialState?: Partial<StackState>) => {
  const [state, setState] = useState<StackState>({
    elements: [],
    operations: [],
    stats: {
      length: 0,
      headValue: null,
      tailValue: null,
      isEmpty: true,
    },
    ...initialState,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [currentStep, setCurrentStep] = useState('');
  const [executionHistory, setExecutionHistory] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<string | undefined>(undefined);
  const [currentPosition, setCurrentPosition] = useState(0);
  const operationsRef = useRef<StackOperation[]>([]);

  // Cleanup effect for memory management
  useEffect(() => {
    return () => {
      // Cleanup operations ref
      operationsRef.current = [];
      // Reset state to prevent memory leaks
      setState({
        elements: [],
        operations: [],
        stats: {
          length: 0,
          headValue: null,
          tailValue: null,
          isEmpty: true,
        },
      });
    };
  }, []);

  const addOperation = useCallback((operation: Omit<StackOperation, 'id'>) => {
    const newOperation: StackOperation = {
      ...operation,
      id: Date.now(),
    };

    setState((prev: StackState) => {
      const newOperations = [...prev.operations, newOperation];
      operationsRef.current = newOperations as StackOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const updateOperation = useCallback((id: number, updates: Partial<StackOperation>) => {
    setState((prev: StackState) => {
      const newOperations = (prev.operations as StackOperation[]).map((op: StackOperation) =>
        op.id === id ? { ...op, ...updates } : op,
      );
      operationsRef.current = newOperations;
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const removeOperation = useCallback((id: number) => {
    setState((prev: StackState) => {
      const newOperations = (prev.operations as StackOperation[]).filter(
        (op: StackOperation) => op.id !== id,
      );
      operationsRef.current = newOperations;
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    // Reset everything
    setState({
      elements: [],
      operations: [],
      stats: {
        length: 0,
        headValue: null,
        tailValue: null,
        isEmpty: true,
      },
    });
    operationsRef.current = [];
    setCurrentLine(-1);
    setCurrentStep('');
    setExecutionHistory([]);
    setCurrentOperation(undefined);
    setCurrentPosition(0);
    setIsRunning(false);
  }, []);

  const executeOperation = useCallback(
    async (operation: StackOperation, currentState: StackState): Promise<StackState> => {
      const service = new StackService(currentState);
      let steps: Array<{ step: string; description: string; duration: number }> = [];

      // Set current operation for animation
      setCurrentOperation(operation.type);

      try {
        switch (operation.type) {
          case 'push':
            if (operation.value) {
              steps = await service.push(operation.value);
            }
            break;
          case 'pop':
            steps = await service.pop();
            break;
          case 'peek':
            steps = await service.peek();
            break;
          case 'is_empty':
            steps = await service.isEmpty();
            break;
          case 'size':
            steps = await service.size();
            break;
          default:
            console.warn(`Unknown operation type: ${operation.type}`);
            return currentState;
        }

        // Execute steps with animation
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          setCurrentStep(step.step);
          setCurrentLine(i);
          setExecutionHistory((prev) => addToExecutionHistory(prev, step.step));

          // Update state after each step to show visualization
          const currentServiceState = service.getState();
          setState((prev) => ({
            ...prev,
            elements: currentServiceState.elements,
            stats: currentServiceState.stats,
          }));

          // Wait for the step duration
          await delay(step.duration);
        }

        // Get updated state from service
        const updatedState = service.getState();
        return updatedState;
      } catch (error) {
        console.error('Error executing operation:', error);
        setExecutionHistory((prev) =>
          addToExecutionHistory(
            prev,
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ),
        );
        return currentState;
      } finally {
        setCurrentOperation(undefined);
        setCurrentStep('');
        setCurrentLine(-1);
      }
    },
    [],
  );

  const executeAllOperations = useCallback(async () => {
    if (isRunning) return;

    // Reset everything first
    setIsRunning(true);
    setExecutionHistory([]);
    setCurrentLine(-1);
    setCurrentStep('กำลัง Reset Stack...');
    setCurrentOperation(undefined);
    setCurrentPosition(0);

    // Reset state to initial state before executing
    setState((prev) => ({
      ...prev,
      elements: [],
      stats: {
        length: 0,
        headValue: null,
        tailValue: null,
        isEmpty: true,
      },
    }));

    // Wait longer to ensure state is reset and visualization updates
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Clear reset message and start execution
    setCurrentStep('เริ่มการ Execute Operations...');
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      // Create initial state for execution
      let currentState: StackState = {
        elements: [],
        operations: operationsRef.current,
        stats: {
          length: 0,
          headValue: null,
          tailValue: null,
          isEmpty: true,
        },
      };

      // Use operationsRef.current to get the latest operations
      for (const operation of operationsRef.current) {
        currentState = await executeOperation(operation, currentState);
      }

      setState(currentState);
      setExecutionHistory((prev) =>
        addToExecutionHistory(prev, 'All operations completed successfully!'),
      );
    } catch (error) {
      console.error('Error executing operations:', error);
      setExecutionHistory((prev) =>
        addToExecutionHistory(
          prev,
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, executeOperation]);

  return {
    state,
    isRunning,
    currentLine,
    currentStep,
    executionHistory,
    currentOperation,
    currentPosition,
    addOperation,
    updateOperation,
    removeOperation,
    clearAll,
    executeAllOperations,
  };
};

export default useStack;
