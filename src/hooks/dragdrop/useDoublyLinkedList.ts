import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Cleanup effect for memory management
  useEffect(() => {
    return () => {
      // Cleanup operations ref
      operationsRef.current = [];
      // Reset state to prevent memory leaks
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
    };
  }, []);

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
    setCurrentLine(-1);
    setCurrentStep('');
    setExecutionHistory([]);
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
          case 'insert_position':
            if (operation.value && operation.position) {
              steps = await service.insertAtPosition(operation.value, parseInt(operation.position));
            }
            break;
          case 'insert_before_position':
            if (operation.value && operation.position) {
              steps = await service.insertBeforePosition(
                operation.value,
                parseInt(operation.position),
              );
            }
            break;
          case 'delete_beginning':
            steps = await service.deleteFromBeginning();
            break;
          case 'delete_end':
            steps = await service.deleteFromEnd();
            break;
          case 'delete_value':
            if (operation.value) {
              steps = await service.deleteByValue(operation.value);
            }
            break;
          case 'delete_position':
            if (operation.position) {
              steps = await service.deleteAtPosition(parseInt(operation.position));
            }
            break;
          case 'delete_before_position':
            if (operation.position) {
              steps = await service.deleteBeforePosition(parseInt(operation.position));
            }
            break;
          case 'traverse_forward':
            steps = await service.traverseForward();
            break;
          case 'traverse_backward':
            steps = await service.traverseBackward();
            break;
          case 'search_value':
            if (operation.value) {
              steps = await service.searchByValue(operation.value);
            }
            break;
          case 'search_position':
            if (operation.position) {
              steps = await service.searchByPosition(parseInt(operation.position));
            }
            break;
          case 'update_value':
            if (operation.value && operation.newValue) {
              steps = await service.updateByValue(operation.value, operation.newValue);
            }
            break;
          case 'update_position':
            if (operation.position && operation.newValue) {
              steps = await service.updateByPosition(
                parseInt(operation.position),
                operation.newValue,
              );
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
          setExecutionHistory((prev) => [...prev, step.description]);

          // Update current position for traversal operations
          if (operation.type === 'traverse_forward' && step.step.includes('อ่านค่า')) {
            const match = step.step.match(/ค่า (.+)/);
            if (match) {
              const value = match[1];
              const index = currentState.nodes.indexOf(value);
              if (index >= 0) {
                setCurrentPosition(index);
              }
            }
          }

          if (operation.type === 'traverse_backward' && step.step.includes('อ่านค่า')) {
            const match = step.step.match(/ค่า (.+)/);
            if (match) {
              const value = match[1];
              const index = currentState.nodes.indexOf(value);
              if (index >= 0) {
                setCurrentPosition(currentState.nodes.length - 1 - index);
              }
            }
          }

          // Update state after each step to show visualization
          const currentServiceState = service.getState();
          setState((prev) => ({
            ...prev,
            nodes: currentServiceState.nodes,
            stats: currentServiceState.stats,
          }));

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
    if (isRunning) return;

    // Reset everything first
    setIsRunning(true);
    setExecutionHistory([]);
    setCurrentLine(-1);
    setCurrentStep('กำลัง Reset Doubly Linked List...');
    setCurrentOperation(undefined);
    setCurrentPosition(0);

    // Reset state to initial state before executing
    setState((prev) => ({
      ...prev,
      nodes: [],
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
      let currentState: DoublyLinkedListState = {
        nodes: [],
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

      // Update the main state with final result
      setState((prev) => ({
        ...prev,
        nodes: currentState.nodes,
        stats: currentState.stats,
      }));

      setExecutionHistory((prev) => [...prev, 'การ Execute เสร็จสิ้น']);
    } catch (error) {
      console.error('Error executing operations:', error);
      setExecutionHistory((prev) => [...prev, `Error: ${error}`]);
    } finally {
      setIsRunning(false);
      setCurrentLine(-1);
      setCurrentStep('');
      setCurrentOperation(undefined);
    }
  }, [executeOperation, isRunning]);

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

export default useDoublyLinkedList;
