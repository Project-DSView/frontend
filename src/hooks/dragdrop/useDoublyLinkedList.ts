import { useState, useCallback, useRef } from 'react';
import { DoublyLinkedListState, DoublyLinkedListOperation } from '@/types';
import { DoublyLinkedListService } from '@/services';

const useDoublyLinkedList = (initialState?: Partial<DoublyLinkedListState>) => {
  const [state, setState] = useState<DoublyLinkedListState>({
    nodes: [],
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
  const operationsRef = useRef<DoublyLinkedListOperation[]>([]);

  const addOperation = useCallback((operation: Omit<DoublyLinkedListOperation, 'id'>) => {
    const newOperation: DoublyLinkedListOperation = {
      ...operation,
      id: Date.now(),
    };

    setState((prev) => {
      const newOperations = [...prev.operations, newOperation];
      operationsRef.current = newOperations as DoublyLinkedListOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const updateOperation = useCallback((id: number, updates: Partial<DoublyLinkedListOperation>) => {
    setState((prev) => {
      const newOperations = prev.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op,
      );
      operationsRef.current = newOperations as DoublyLinkedListOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const removeOperation = useCallback((id: number) => {
    setState((prev) => {
      const newOperations = prev.operations.filter((op) => op.id !== id);
      operationsRef.current = newOperations as DoublyLinkedListOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState({
      nodes: [],
      operations: [],
      stats: {
        length: 0,
        headValue: null,
        tailValue: null,
        isEmpty: true,
      },
    });
    operationsRef.current = [];
    setExecutionHistory([]);
    setCurrentStep('');
    setCurrentOperation(undefined);
    setCurrentPosition(0);
    setIsRunning(false);
  }, []);

  const executeOperation = useCallback(
    async (
      operation: DoublyLinkedListOperation,
      currentState: DoublyLinkedListState,
    ): Promise<DoublyLinkedListState> => {
      const service = new DoublyLinkedListService(currentState);
      let steps: Array<{ step: string; description: string; duration: number }> = [];

      // Set current operation for animation
      setCurrentOperation(operation.type);

      try {
        switch (operation.type) {
          case 'insert_beginning':
            if (operation.value) {
              steps = await service.insertAtBeginning(operation.value);
            }
            break;
          case 'insert_end':
            if (operation.value) {
              steps = await service.insertAtEnd(operation.value);
            }
            break;
          default:
            console.warn(`Unknown operation type: ${operation.type}`);
            return currentState;
        }

        // Execute steps with animation
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          setCurrentStep(step.step);
          setExecutionHistory((prev) => [...prev, step.step]);

          // Wait for the step duration
          await new Promise((resolve) => setTimeout(resolve, step.duration));
        }

        // Get updated state from service
        const updatedState = service.getState();
        return updatedState;
      } catch (error) {
        console.error('Error executing operation:', error);
        setExecutionHistory((prev) => [...prev, `Error: ${error}`]);
        return currentState;
      } finally {
        setCurrentOperation(undefined);
        setCurrentStep('');
      }
    },
    [],
  );

  const executeAllOperations = useCallback(async () => {
    if (operationsRef.current.length === 0) {
      setExecutionHistory(['ไม่มี operations ให้ execute']);
      return;
    }

    setIsRunning(true);
    setExecutionHistory([]);
    setCurrentLine(0);

    let currentState = { ...state };

    try {
      for (let i = 0; i < operationsRef.current.length; i++) {
        const operation = operationsRef.current[i];
        setCurrentLine(i + 1);

        // Skip operations without required values
        if (
          (operation.type.includes('insert') ||
            operation.type.includes('delete') ||
            operation.type.includes('search') ||
            operation.type.includes('update')) &&
          !operation.value &&
          !operation.position
        ) {
          setExecutionHistory((prev) => [
            ...prev,
            `ข้าม operation: ${operation.name} - ไม่มีค่าที่จำเป็น`,
          ]);
          continue;
        }

        currentState = await executeOperation(operation, currentState);
      }

      // Update final state
      setState(currentState);
      setExecutionHistory((prev) => [...prev, 'Execution เสร็จสิ้น!']);
    } catch (error) {
      console.error('Error executing operations:', error);
      setExecutionHistory((prev) => [...prev, `Error: ${error}`]);
    } finally {
      setIsRunning(false);
      setCurrentLine(-1);
    }
  }, [state, executeOperation]);

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

export { useDoublyLinkedList };
