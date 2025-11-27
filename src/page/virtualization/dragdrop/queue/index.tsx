'use client';

import React, { useState, useRef, lazy, Suspense } from 'react';

import { QueueDragComponent } from '@/types';
import { useDragDropQueue } from '@/hooks';
import { queueDragComponents } from '@/data';

import DragDropZone from '@/components/playground/shared/DragDropZone';
import StepSelector from '@/components/playground/shared/StepSelector';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';
// Lazy load heavy components
const QueueDragDropOperations = lazy(
  () => import('@/components/playground/dragdrop/opeartion/Queue'),
);
const QueueDragDropVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/Queue'),
);
const StepIndicator = lazy(() => import('@/components/playground/shared/StepIndicator'));
const TutorialModal = lazy(() => import('@/components/tutorial/TutorialModal'));

const DragDropQueue = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropQueue();

  const [draggedItem, setDraggedItem] = useState<QueueDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const visualizationContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: QueueDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    // Mark as external drag - no JSON data means external
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleTouchStart = (e: React.TouchEvent, component: QueueDragComponent) => {
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
        value: ['dequeue', 'front', 'back', 'is_empty', 'size'].includes(draggedItem.type)
          ? null
          : '',
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

  const handleRemoveOperation = (id: number) => {
    removeOperation(id);
    // Reset step selection when removing operations
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
        }, 1500); // Change step every 1.5 seconds for smoother experience
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

  // Auto-scroll to visualization when auto-play starts
  React.useEffect(() => {
    if (isAutoPlaying && visualizationContainerRef.current) {
      const timer = setTimeout(() => {
        visualizationContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 200); // Small delay to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying]);

  const getStepDescription = (operation: {
    type: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
    name: string;
  }) => {
    const descriptions: { [key: string]: string } = {
      enqueue: `เพิ่มข้อมูล ${operation.value} ลงใน queue (FIFO - First In First Out)`,
      dequeue: `ลบข้อมูลออกจาก queue ที่ตำแหน่งหน้า`,
      front: 'ดูข้อมูลที่ตำแหน่งหน้าของ queue โดยไม่ลบออก',
      back: 'ดูข้อมูลที่ตำแหน่งท้ายของ queue โดยไม่ลบออก',
      is_empty: 'ตรวจสอบว่า queue ว่างเปล่าหรือไม่',
      size: 'นับจำนวนข้อมูลใน queue',
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
          count: 0,
          headValue: null as string | null,
          tailValue: null as string | null,
          isEmpty: true,
        },
        currentOperation: undefined,
        dequeuedElement: null as string | null,
      };
    }

    let currentElements: string[] = [];
    let currentStats = {
      length: 0,
      count: 0,
      headValue: null as string | null,
      tailValue: null as string | null,
      isEmpty: true,
    };
    let currentOperation: string | undefined;
    let dequeuedElement: string | null = null;

    // Execute operations up to the selected step
    for (let i = 0; i <= stepIndex; i++) {
      const operation = state.operations[i];
      if (!operation) continue;

      currentOperation = operation.type;

      switch (operation.type) {
        case 'enqueue':
          if (operation.value) {
            currentElements = [...currentElements, operation.value];
          }
          // Reset dequeued element when enqueueing
          if (i === stepIndex) {
            dequeuedElement = null;
          }
          break;
        case 'dequeue':
          if (currentElements.length > 0) {
            // Store the element being dequeued
            dequeuedElement = currentElements[0];
            currentElements = currentElements.slice(1); // Remove from front (FIFO)
          } else {
            dequeuedElement = null;
          }
          break;
        case 'front':
        case 'back':
        case 'is_empty':
        case 'size':
          // These operations don't modify the queue or dequeued element
          break;
      }

      // Update stats
      currentStats = {
        length: currentElements.length,
        count: currentElements.length,
        headValue: currentElements.length > 0 ? currentElements[0] : null, // Front of queue
        tailValue: currentElements.length > 0 ? currentElements[currentElements.length - 1] : null, // Back of queue
        isEmpty: currentElements.length === 0,
      };
    }

    return {
      elements: currentElements,
      stats: currentStats,
      currentOperation,
      dequeuedElement,
    };
  };

  // Get current visualization state based on selected step
  const getCurrentVisualizationState = () => {
    if (selectedStep !== null) {
      return getStepState(selectedStep);
    }
    return {
      elements: state.elements,
      stats: {
        ...state.stats,
        count: state.stats.length,
      },
      currentOperation: undefined,
      dequeuedElement: null as string | null,
    };
  };

  const currentVisualizationState = getCurrentVisualizationState();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="mb-2 text-xl font-bold text-gray-800 md:text-2xl lg:text-2xl dark:text-gray-100">
              Drag & Drop Queue
            </h1>
            <p className="text-sm text-gray-600 md:text-base dark:text-gray-400">
              ลาก operations ไปยัง Drop Zone เพื่อสร้าง queue
            </p>
          </div>
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
        </div>
        <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Left Side - Drag Components */}
        <div className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Suspense
            fallback={
              <div className="h-64 w-full rounded-lg border bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            }
          >
            <QueueDragDropOperations
              dragComponents={queueDragComponents}
              onDragStart={handleDragStart}
              onTouchStart={handleTouchStart}
            />
          </Suspense>
        </div>

        {/* Right Side - Drop Zone */}
        <div className="rounded-lg bg-white p-4 shadow md:p-6 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Drop Zone</h2>
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
            onRemoveOperation={handleRemoveOperation}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
            onReorderOperation={reorderOperation}
          />
        </div>
      </div>

      {/* Visualization */}
      <div ref={visualizationContainerRef} className="relative">
        {/* Step Indicator */}
        {isAutoPlaying && state.operations.length > 0 && selectedStep !== null && (
          <Suspense
            fallback={
              <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                <div className="flex h-6 items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            }
          >
            <StepIndicator
              stepNumber={selectedStep + 1}
              totalSteps={state.operations.length}
              message={getStepDescription(state.operations[selectedStep])}
              isAutoPlaying={isAutoPlaying}
            />
          </Suspense>
        )}

        <Suspense
          fallback={
            <div className="h-64 w-full rounded-lg border bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            </div>
          }
        >
          <QueueDragDropVisualization
            ref={visualizationRef}
            elements={currentVisualizationState.elements}
            stats={currentVisualizationState.stats}
            isRunning={isAutoPlaying}
            currentOperation={currentVisualizationState.currentOperation}
            dequeuedElement={currentVisualizationState.dequeuedElement}
          />
        </Suspense>
      </div>

      <div className="mt-6">
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
      </div>

      {/* Tutorial Modal */}
      <Suspense
        fallback={
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        }
      >
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          playgroundMode="dragdrop"
        />
      </Suspense>
    </div>
  );
};

export default DragDropQueue;
