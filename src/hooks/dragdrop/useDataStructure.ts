import { useState, useCallback, useRef } from 'react';
import {
  SinglyLinkedListState,
  SinglyLinkedListOperation,
} from '@/types';
import { SinglyLinkedListService } from '@/services';

const useDataStructure = (initialState?: Partial<SinglyLinkedListState>) => {
  const [state, setState] = useState<SinglyLinkedListState>({
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
  const operationsRef = useRef<SinglyLinkedListOperation[]>([]);

  const addOperation = useCallback((operation: Omit<SinglyLinkedListOperation, 'id'>) => {
    const newOperation: SinglyLinkedListOperation = {
      ...operation,
      id: Date.now(),
    };

    setState((prev) => {
      const newOperations = [...prev.operations, newOperation];
      operationsRef.current = newOperations as SinglyLinkedListOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const updateOperation = useCallback((id: number, updates: Partial<SinglyLinkedListOperation>) => {
    setState((prev) => {
      const newOperations = prev.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op,
      );
      operationsRef.current = newOperations as SinglyLinkedListOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const removeOperation = useCallback((id: number) => {
    setState((prev) => {
      const newOperations = prev.operations.filter((op) => op.id !== id);
      operationsRef.current = newOperations as SinglyLinkedListOperation[];
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
    setIsRunning(false);
  }, []);

  const executeOperation = useCallback(
    async (operation: SinglyLinkedListOperation, currentState: SinglyLinkedListState): Promise<SinglyLinkedListState> => {
      const service = new SinglyLinkedListService(currentState);
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
              steps = await service.insertAtPosition(
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
          case 'traverse':
            steps = await service.traverse();
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
              steps = await service.updateByValue(
                operation.value,
                operation.newValue,
              );
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
            console.warn('Unknown operation type:', operation.type);
            return currentState;
        }

        // Execute steps
        for (const step of steps) {
          setCurrentStep(step.step);
          setExecutionHistory((prev) => [...prev, step.description]);
          
          // Update current position for traversal operations
          if (operation.type === 'traverse' && step.step.includes('อ่านค่า')) {
            const match = step.step.match(/ค่า (.+)/);
            if (match) {
              const value = match[1];
              const index = currentState.nodes.indexOf(value);
              if (index >= 0) {
                setCurrentPosition(index);
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
          
          await new Promise((resolve) => setTimeout(resolve, step.duration));
        }

        // Get final updated state from service
        const newServiceState = service.getState();
        return {
          ...currentState,
          nodes: newServiceState.nodes,
          stats: newServiceState.stats,
        };
      } catch (error) {
        console.error('Error executing operation:', error);
        setExecutionHistory((prev) => [...prev, `Error: ${error}`]);
        return currentState; // Return current state on error
      } finally {
        // Clear current operation when done
        setCurrentOperation(undefined);
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
    setCurrentStep('กำลัง Reset Singly Linked List...');
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
      let currentState: SinglyLinkedListState = {
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
    clearOperations,
    clearAll,
    executeOperation,
    executeAllOperations,
    setCurrentLine,
    setCurrentStep,
  };
};

export default useDataStructure;
