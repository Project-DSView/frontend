'use client';

import React, { useState, useRef, lazy, Suspense } from 'react';
import { BSTDragComponent, BSTNode } from '@/types';
import { useBST } from '@/hooks';
import { bstDragComponents } from '@/data';
import DragDropZone from '@/components/DataStructures/shared/DragDropZone';
import StepSelector from '@/components/DataStructures/shared/StepSelector';

// Lazy load heavy components
const BSTOperations = lazy(() => import('@/components/DataStructures/bst/BSTOperations'));
const BSTVisualization = lazy(() => import('@/components/DataStructures/bst/BSTVisualization'));

const DragDropBST = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, updateBSTState } =
    useBST();

  const [draggedItem, setDraggedItem] = useState<BSTDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: BSTDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTouchStart = (e: React.TouchEvent, component: BSTDragComponent) => {
    e.preventDefault();
    setDraggedItem(component);
    // Simulate drop immediately for touch devices
    handleDrop({ preventDefault: () => {} } as React.DragEvent);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (draggedItem) {
      const newOperation = {
        type: draggedItem.type,
        name: draggedItem.name,
        value: [
          'traverse_inorder',
          'traverse_preorder',
          'traverse_postorder',
          'find_min',
          'find_max',
        ].includes(draggedItem.type)
          ? null
          : '',
        color: draggedItem.color,
        category: draggedItem.category,
        position: null,
        newValue: null,
      };

      addOperation(newOperation);

      // If it's an insert operation, set a placeholder value
      if (draggedItem.type === 'insert') {
        // Set a placeholder value that will trigger the input field
        setTimeout(() => {
          const operation = state.operations.find((op) => op.type === 'insert' && !op.value);
          if (operation) {
            updateOperation(operation.id, { value: '' });
          }
        }, 100);
      }

      setDraggedItem(null);
    }
  };

  // Simple BST insert function
  const insertNode = React.useCallback((root: BSTNode | null, value: string): BSTNode => {
    if (!root) {
      return {
        value,
        left: null,
        right: null,
        id: Math.random().toString(36).substr(2, 9),
      };
    }

    // Convert to numbers for comparison
    const numValue = parseFloat(value);
    const numRootValue = parseFloat(root.value);

    if (numValue < numRootValue) {
      root.left = insertNode(root.left, value);
    } else if (numValue > numRootValue) {
      root.right = insertNode(root.right, value);
    }

    return root;
  }, []);

  // BST delete function
  const deleteNode = React.useCallback((root: BSTNode | null, value: string): BSTNode | null => {
    if (!root) return null;

    const numValue = parseFloat(value);
    const numRootValue = parseFloat(root.value);

    if (numValue < numRootValue) {
      root.left = deleteNode(root.left, value);
    } else if (numValue > numRootValue) {
      root.right = deleteNode(root.right, value);
    } else {
      // Node to be deleted found
      if (!root.left) return root.right;
      if (!root.right) return root.left;

      // Node with two children: get the inorder successor
      let temp = root.right;
      while (temp.left) {
        temp = temp.left;
      }

      // Copy the inorder successor's content to this node
      root.value = temp.value;

      // Delete the inorder successor
      root.right = deleteNode(root.right, temp.value);
    }

    return root;
  }, []);

  // Calculate BST stats
  const calculateStats = (root: BSTNode | null) => {
    const getSize = (node: BSTNode | null): number => {
      if (!node) return 0;
      return 1 + getSize(node.left) + getSize(node.right);
    };

    const getHeight = (node: BSTNode | null): number => {
      if (!node) return 0;
      return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    };

    const findMinValue = (node: BSTNode | null): string | null => {
      if (!node) return null;
      while (node.left) {
        node = node.left;
      }
      return node.value;
    };

    const findMaxValue = (node: BSTNode | null): string | null => {
      if (!node) return null;
      while (node.right) {
        node = node.right;
      }
      return node.value;
    };

    return {
      size: getSize(root),
      height: getHeight(root),
      minValue: findMinValue(root),
      maxValue: findMaxValue(root),
      isEmpty: !root,
    };
  };

  const updateOperationValue = async (id: number, value: string) => {
    // Validate that value is a number for insert operations
    const operation = state.operations.find((op) => op.id === id);
    if (operation && operation.type === 'insert' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setErrorMessage('กรุณาใส่ตัวเลขเท่านั้น');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Clear error message
      setErrorMessage('');
    }

    // Update the operation value
    updateOperation(id, { value });
  };

  // Function to execute all operations and rebuild the BST
  const executeAllOperations = React.useCallback(() => {
    let currentRoot: BSTNode | null = null;

    // Execute all operations in order
    state.operations.forEach((op) => {
      if (op.value) {
        const numValue = parseFloat(op.value);
        if (!isNaN(numValue)) {
          if (op.type === 'insert') {
            currentRoot = insertNode(currentRoot, numValue.toString());
          } else if (op.type === 'delete') {
            currentRoot = deleteNode(currentRoot, numValue.toString());
          }
        }
      }
    });

    const newStats = calculateStats(currentRoot);
    updateBSTState(currentRoot, newStats);
  }, [state.operations, updateBSTState, insertNode, deleteNode]);

  const updateOperationPosition = (_id: number, _position: string) => {
    // BST doesn't use position, but keeping for compatibility
  };

  const updateOperationNewValue = (_id: number, _newValue: string) => {
    // BST doesn't use newValue, but keeping for compatibility
  };

  const handleClearAll = () => {
    clearAll();
    setSelectedStep(null);
  };

  const handleStepSelect = (stepIndex: number) => {
    setSelectedStep(stepIndex);
    // Stop auto play when manually selecting a step
    if (isAutoPlaying) {
      handleAutoPlay();
    }
  };

  const handlePrevious = () => {
    if (selectedStep !== null && selectedStep > 0) {
      setSelectedStep(selectedStep - 1);
    }
  };

  const handleNext = () => {
    if (selectedStep !== null && selectedStep < state.operations.length - 1) {
      setSelectedStep(selectedStep + 1);
    }
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      // Stop auto play
      setIsAutoPlaying(false);
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    } else {
      // Start auto play
      setIsAutoPlaying(true);
      if (state.operations.length > 0) {
        setSelectedStep(0);
        autoPlayIntervalRef.current = setInterval(() => {
          setSelectedStep((prev) => {
            if (prev === null || prev >= state.operations.length - 1) {
              // Auto play finished
              setIsAutoPlaying(false);
              if (autoPlayIntervalRef.current) {
                clearInterval(autoPlayIntervalRef.current);
                autoPlayIntervalRef.current = null;
              }
              return prev;
            }
            return prev + 1;
          });
        }, 2000); // Change step every 2 seconds
      }
    }
  };

  // Cleanup auto play interval on unmount
  React.useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  // Execute all operations when operations change
  React.useEffect(() => {
    executeAllOperations();
  }, [executeAllOperations]);

  const getStepDescription = (operation: { type: string; value?: string | null; name: string }) => {
    const descriptions: { [key: string]: string } = {
      insert: `เพิ่มข้อมูล ${operation.value} ใน Binary Search Tree`,
      delete: `ลบข้อมูล ${operation.value} จาก Binary Search Tree`,
      search: `ค้นหาข้อมูล ${operation.value} ใน Binary Search Tree`,
      traverse_inorder: 'เดินทางผ่าน BST แบบ Inorder (Left → Root → Right)',
      traverse_preorder: 'เดินทางผ่าน BST แบบ Preorder (Root → Left → Right)',
      traverse_postorder: 'เดินทางผ่าน BST แบบ Postorder (Left → Right → Root)',
      find_min: 'หาค่าที่น้อยที่สุดใน BST',
      find_max: 'หาค่าที่มากที่สุดใน BST',
    };

    return descriptions[operation.type] || `ดำเนินการ ${operation.name}`;
  };

  // Calculate state for selected step
  const getStepState = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= state.operations.length) {
      return {
        root: null,
        stats: {
          size: 0,
          height: 0,
          minValue: null,
          maxValue: null,
          isEmpty: true,
        },
      };
    }

    // Build BST up to the selected step
    let stepRoot: BSTNode | null = null;

    for (let i = 0; i <= stepIndex; i++) {
      const operation = state.operations[i];
      if (operation.value) {
        const numValue = parseFloat(operation.value);
        if (!isNaN(numValue)) {
          if (operation.type === 'insert') {
            stepRoot = insertNode(stepRoot, numValue.toString());
          } else if (operation.type === 'delete') {
            stepRoot = deleteNode(stepRoot, numValue.toString());
          }
        }
      }
    }

    const stepStats = calculateStats(stepRoot);
    return {
      root: stepRoot,
      stats: stepStats,
    };
  };

  // Get current visualization state based on selected step
  const getCurrentVisualizationState = () => {
    if (selectedStep !== null) {
      return getStepState(selectedStep);
    }
    return { root: state.root, stats: state.stats };
  };

  const currentVisualizationState = getCurrentVisualizationState();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Drag & Drop Binary Search Tree</h1>
          <p className="text-gray-600">
            เลือกประเภท operation จาก dropdown แล้วลาก operations ไปยัง Drop Zone
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-red-700">{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side - Drag Components */}
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
              Loading operations...
            </div>
          }
        >
          <BSTOperations
            dragComponents={bstDragComponents}
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
          />
        </Suspense>

        {/* Right Side - Drop Zone */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Drop Zone</h2>
            <div className="space-x-2">
              <button
                onClick={handleClearAll}
                className="bg-neutral hover:bg-neutral/50 rounded px-4 py-2 text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <DragDropZone
            operations={state.operations}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveOperation={removeOperation}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
          />
        </div>
      </div>

      {/* Step Selection */}
      <StepSelector
        operations={state.operations}
        selectedStep={selectedStep}
        onStepSelect={handleStepSelect}
        getStepDescription={getStepDescription}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onAutoPlay={handleAutoPlay}
        isAutoPlaying={isAutoPlaying}
      />

      {/* Visualization */}
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
            Loading visualization...
          </div>
        }
      >
        <BSTVisualization
          ref={visualizationRef}
          root={currentVisualizationState.root}
          stats={currentVisualizationState.stats}
          currentOperation={
            selectedStep !== null ? state.operations[selectedStep]?.type : undefined
          }
          selectedStep={
            selectedStep !== null && state.operations[selectedStep]?.type.includes('traverse')
              ? selectedStep
              : null
          }
        />
      </Suspense>
    </div>
  );
};

export default DragDropBST;
