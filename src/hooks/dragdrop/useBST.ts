import { useState, useCallback, useRef, useEffect } from 'react';
import { BSTState, BSTOperation, BSTNode, BSTStats } from '@/types';
import { BSTService } from '@/services';

const useBST = (initialState?: Partial<BSTState>) => {
  const [state, setState] = useState<BSTState>({
    root: null,
    operations: [],
    stats: {
      size: 0,
      height: 0,
      minValue: null,
      maxValue: null,
      isEmpty: true,
    },
    ...initialState,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [currentStep, setCurrentStep] = useState('');
  const [executionHistory, setExecutionHistory] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<string | undefined>(undefined);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const operationsRef = useRef<BSTOperation[]>([]);

  // Cleanup effect for memory management
  useEffect(() => {
    return () => {
      operationsRef.current = [];
      setState({
        root: null,
        operations: [],
        stats: {
          size: 0,
          height: 0,
          minValue: null,
          maxValue: null,
          isEmpty: true,
        },
      });
    };
  }, []);

  const addOperation = useCallback((operation: Omit<BSTOperation, 'id'>) => {
    const newOperation: BSTOperation = {
      ...operation,
      id: Date.now(),
    };

    setState((prev) => {
      const newOperations = [...prev.operations, newOperation];
      operationsRef.current = newOperations as BSTOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const updateOperation = useCallback((id: number, updates: Partial<BSTOperation>) => {
    setState((prev) => {
      const newOperations = prev.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op,
      );
      operationsRef.current = newOperations as BSTOperation[];
      return {
        ...prev,
        operations: newOperations,
      };
    });
  }, []);

  const removeOperation = useCallback((id: number) => {
    setState((prev) => {
      const newOperations = prev.operations.filter((op) => op.id !== id);
      operationsRef.current = newOperations as BSTOperation[];
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
      root: null,
      operations: [],
      stats: {
        size: 0,
        height: 0,
        minValue: null,
        maxValue: null,
        isEmpty: true,
      },
    });
    operationsRef.current = [];
    setCurrentLine(-1);
    setCurrentStep('');
    setExecutionHistory([]);
    setIsRunning(false);
    setHighlightedNodes([]);
    setSearchPath([]);
  }, []);

  const updateBSTState = useCallback((newRoot: BSTNode | null, newStats: BSTStats) => {
    setState((prev) => ({
      ...prev,
      root: newRoot,
      stats: newStats,
    }));
  }, []);

  const executeOperation = useCallback(
    async (operation: BSTOperation, currentState: BSTState): Promise<BSTState> => {
      const service = new BSTService(currentState);
      let steps: Array<{
        step: string;
        description: string;
        duration: number;
        nodeValue?: string;
        path?: string[];
      }> = [];

      setCurrentOperation(operation.type);

      try {
        switch (operation.type) {
          case 'insert':
            if (operation.value) {
              steps = await service.insert(operation.value);
            }
            break;
          case 'delete':
            if (operation.value) {
              steps = await service.delete(operation.value);
            }
            break;
          case 'search':
            if (operation.value) {
              steps = await service.search(operation.value);
            }
            break;
          case 'traverse_inorder':
            steps = await service.traverseInorder();
            break;
          case 'traverse_preorder':
            steps = await service.traversePreorder();
            break;
          case 'traverse_postorder':
            steps = await service.traversePostorder();
            break;
          case 'find_min':
            steps = await service.findMin();
            break;
          case 'find_max':
            steps = await service.findMax();
            break;
          default:
            console.warn('Unknown operation type:', operation.type);
            return currentState;
        }

        // Execute steps
        for (const step of steps) {
          setCurrentStep(step.step);
          setExecutionHistory((prev) => [...prev, step.description]);

          // Update highlighted nodes and search path
          if (step.nodeValue) {
            setHighlightedNodes([step.nodeValue]);
          }
          if (step.path) {
            setSearchPath(step.path);
          }

          // Update state after each step
          const currentServiceState = service.getState();
          setState((prev) => ({
            ...prev,
            root: currentServiceState.root,
            stats: currentServiceState.stats,
          }));

          await new Promise((resolve) => setTimeout(resolve, step.duration));
        }

        // Get final updated state from service
        const newServiceState = service.getState();
        return {
          ...currentState,
          root: newServiceState.root,
          stats: newServiceState.stats,
        };
      } catch (error) {
        console.error('Error executing operation:', error);
        setExecutionHistory((prev) => [...prev, `Error: ${error}`]);
        return currentState;
      } finally {
        setCurrentOperation(undefined);
        setHighlightedNodes([]);
        setSearchPath([]);
      }
    },
    [],
  );

  const executeAllOperations = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setExecutionHistory([]);
    setCurrentLine(-1);
    setCurrentStep('กำลัง Reset Binary Search Tree...');
    setCurrentOperation(undefined);
    setHighlightedNodes([]);
    setSearchPath([]);

    // Reset state to initial state before executing
    setState((prev) => ({
      ...prev,
      root: null,
      stats: {
        size: 0,
        height: 0,
        minValue: null,
        maxValue: null,
        isEmpty: true,
      },
    }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    setCurrentStep('เริ่มการ Execute Operations...');
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      let currentState: BSTState = {
        root: null,
        operations: operationsRef.current,
        stats: {
          size: 0,
          height: 0,
          minValue: null,
          maxValue: null,
          isEmpty: true,
        },
      };

      for (const operation of operationsRef.current) {
        currentState = await executeOperation(operation, currentState);
      }

      setState((prev) => ({
        ...prev,
        root: currentState.root,
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
      setHighlightedNodes([]);
      setSearchPath([]);
    }
  }, [executeOperation, isRunning]);

  return {
    state,
    isRunning,
    currentLine,
    currentStep,
    executionHistory,
    currentOperation,
    highlightedNodes,
    searchPath,
    addOperation,
    updateOperation,
    removeOperation,
    clearOperations,
    clearAll,
    executeOperation,
    executeAllOperations,
    updateBSTState,
    setCurrentLine,
    setCurrentStep,
  };
};

export default useBST;
