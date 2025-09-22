'use client';

import React, { useState, useRef, lazy, Suspense } from 'react';
import { StackDragComponent } from '@/types';
import { useStack } from '@/hooks';
import { stackDragComponents } from '@/data';
import DragDropZone from '@/components/DataStructures/shared/DragDropZone';
import StepSelector from '@/components/DataStructures/shared/StepSelector';

// Lazy load heavy components
const StackOperations = lazy(() => import('@/components/DataStructures/stack/StackOperations'));
const StackVisualization = lazy(
  () => import('@/components/DataStructures/stack/StackVisualization'),
);

const DragDropStack = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll } = useStack();

  const [draggedItem, setDraggedItem] = useState<StackDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: StackDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTouchStart = (e: React.TouchEvent, component: StackDragComponent) => {
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
        value: ['pop', 'peek', 'is_empty', 'size'].includes(draggedItem.type) ? null : '',
        position: null,
        newValue: null,
        color: draggedItem.color,
        category: draggedItem.category,
      };

      addOperation(newOperation);
      setDraggedItem(null);
    }
  };

  const updateOperationValue = (id: number, value: string) => {
    updateOperation(id, { value });
  };

  const updateOperationPosition = (id: number, position: string) => {
    updateOperation(id, { position });
  };

  const updateOperationNewValue = (id: number, newValue: string) => {
    updateOperation(id, { newValue });
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

  const getStepDescription = (operation: {
    type: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
    name: string;
  }) => {
    const descriptions: { [key: string]: string } = {
      push: `เพิ่มข้อมูล ${operation.value} ลงใน stack (LIFO - Last In First Out)`,
      pop: 'ลบข้อมูลออกจาก stack ที่ตำแหน่งบนสุด',
      peek: 'ดูข้อมูลที่ตำแหน่งบนสุดของ stack โดยไม่ลบออก',
      is_empty: 'ตรวจสอบว่า stack ว่างเปล่าหรือไม่',
      size: 'นับจำนวนข้อมูลใน stack',
    };

    return descriptions[operation.type] || `ดำเนินการ ${operation.name}`;
  };

  // Calculate state for selected step
  const getStepState = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= state.operations.length) {
      return {
        elements: [],
        stats: {
          length: 0,
          headValue: null as string | null,
          tailValue: null as string | null,
          isEmpty: true,
        },
      };
    }

    let currentElements: string[] = [];
    let currentStats = {
      length: 0,
      headValue: null as string | null,
      tailValue: null as string | null,
      isEmpty: true,
    };

    // Execute operations up to the selected step
    for (let i = 0; i <= stepIndex; i++) {
      const operation = state.operations[i];
      if (!operation) continue;

      switch (operation.type) {
        case 'push':
          if (operation.value) {
            currentElements = [...currentElements, operation.value];
          }
          break;
        case 'pop':
          if (currentElements.length > 0) {
            currentElements = currentElements.slice(0, -1);
          }
          break;
        case 'peek':
        case 'is_empty':
        case 'size':
          // These operations don't modify the stack
          break;
      }

      // Update stats
      currentStats = {
        length: currentElements.length,
        headValue: currentElements.length > 0 ? currentElements[currentElements.length - 1] : null, // Top of stack
        tailValue: currentElements.length > 0 ? currentElements[0] : null, // Bottom of stack
        isEmpty: currentElements.length === 0,
      };
    }

    return { elements: currentElements, stats: currentStats };
  };

  // Get current visualization state based on selected step
  const getCurrentVisualizationState = () => {
    if (selectedStep !== null) {
      return getStepState(selectedStep);
    }
    return { elements: state.elements, stats: state.stats };
  };

  const currentVisualizationState = getCurrentVisualizationState();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Drag & Drop Stack</h1>
          <p className="text-gray-600">
            เลือกประเภท operation จาก dropdown แล้วลาก operations ไปยัง Drop Zone
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side - Drag Components */}
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
              Loading operations...
            </div>
          }
        >
          <StackOperations
            dragComponents={stackDragComponents}
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
        <StackVisualization
          ref={visualizationRef}
          elements={currentVisualizationState.elements}
          stats={currentVisualizationState.stats}
        />
      </Suspense>
    </div>
  );
};

export default DragDropStack;
