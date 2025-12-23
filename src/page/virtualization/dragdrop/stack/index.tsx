'use client';

import React, { useState, useRef, lazy, Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { StackDragComponent } from '@/types';
import { useDragDropStack } from '@/hooks';
import { stackDragComponents } from '@/data';

import DragDropZone from '@/components/playground/shared/DragDropZone';
import StepSelector from '@/components/playground/shared/StepSelector';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';
import TutorialOverlay from '@/components/playground/tutorial/TutorialOverlay';
import { stackTutorialSteps } from '@/data/components/stack-tutorial.data';
import { getTutorialStorageKey } from '@/data/components/tutorial-overlay.data';
// Lazy load heavy components
const StackDragDropOperations = lazy(
  () => import('@/components/playground/dragdrop/opeartion/Stack'),
);
const StackDragDropVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/Stack'),
);
const StepIndicator = lazy(() => import('@/components/playground/shared/StepIndicator'));

const DragDropStack = () => {
  const pathname = usePathname();
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropStack();

  const [draggedItem, setDraggedItem] = useState<StackDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const visualizationContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-show tutorial on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getTutorialStorageKey(pathname, 'dragdrop');
      const hasSeenTutorial = localStorage.getItem(storageKey) === 'completed';

      if (!hasSeenTutorial) {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  const handleDragStart = (e: React.DragEvent, component: StackDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    // Mark as external drag - no JSON data means external
    e.dataTransfer.setData('text/plain', 'external');
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
        sourceStack: 'main',
        targetStack: 'main',
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

  const updateOperationSourceStack = (id: number, sourceStack: string) => {
    updateOperation(id, { sourceStack });
  };

  const updateOperationTargetStack = (id: number, targetStack: string) => {
    updateOperation(id, { targetStack });
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
    sourceStack?: string | null;
    targetStack?: string | null;
    name: string;
  }) => {
    const descriptions: { [key: string]: string } = {
      push: `เพิ่มข้อมูล ${operation.value} ลงใน ${operation.targetStack || 'stack'} (LIFO - Last In First Out)`,
      pop: `ลบข้อมูลออกจาก ${operation.targetStack || 'stack'} ที่ตำแหน่งบนสุด`,
      peek: 'ดูข้อมูลที่ตำแหน่งบนสุดของ stack โดยไม่ลบออก',
      is_empty: 'ตรวจสอบว่า stack ว่างเปล่าหรือไม่',
      size: 'นับจำนวนข้อมูลใน stack',
      copyStack: `คัดลอกข้อมูลจาก ${operation.sourceStack || 'source stack'} ไปยัง ${operation.targetStack || 'target stack'}`,
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
        stacks: undefined,
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
    let stacks: { s1: string[]; s2: string[] } | undefined;
    let mainStack: string[] = [];
    let stackS1: string[] = [];
    let stackS2: string[] = [];

    // Execute operations up to the selected step
    for (let i = 0; i <= stepIndex; i++) {
      const operation = state.operations[i];
      if (!operation) continue;

      currentOperation = operation.type;

      switch (operation.type) {
        case 'push':
          if (operation.value && operation.targetStack) {
            // Add to the appropriate stack based on targetStack selection
            if (operation.targetStack === 'main') {
              mainStack = [...mainStack, operation.value];
              currentElements = mainStack; // Main stack is the primary display
            } else if (operation.targetStack === 's1') {
              stackS1 = [...stackS1, operation.value];
            } else if (operation.targetStack === 's2') {
              stackS2 = [...stackS2, operation.value];
            }

            // Update stacks object to show multiple stacks when using s1 or s2
            stacks = {
              s1: stackS1,
              s2: stackS2,
            };
          }
          break;
        case 'pop':
          if (operation.targetStack) {
            // Pop from the appropriate stack based on targetStack selection
            if (operation.targetStack === 'main') {
              if (mainStack.length > 0) {
                mainStack = mainStack.slice(0, -1);
                currentElements = mainStack; // Main stack is the primary display
              }
            } else if (operation.targetStack === 's1') {
              if (stackS1.length > 0) {
                stackS1 = stackS1.slice(0, -1);
              }
            } else if (operation.targetStack === 's2') {
              if (stackS2.length > 0) {
                stackS2 = stackS2.slice(0, -1);
              }
            }

            // Update stacks object to show multiple stacks when using s1 or s2
            stacks = {
              s1: stackS1,
              s2: stackS2,
            };
          }
          break;
        case 'copyStack':
          // Simulate copyStack operation
          if (operation.sourceStack && operation.targetStack) {
            let sourceElements: string[] = [];

            // Get source elements based on sourceStack selection
            if (operation.sourceStack === 'main') {
              sourceElements = [...mainStack];
            } else if (operation.sourceStack === 's1') {
              sourceElements = [...stackS1];
            } else if (operation.sourceStack === 's2') {
              sourceElements = [...stackS2];
            }

            // Copy to target stack
            if (operation.targetStack === 'main') {
              mainStack = [...sourceElements];
              currentElements = mainStack;
            } else if (operation.targetStack === 's1') {
              stackS1 = [...sourceElements];
            } else if (operation.targetStack === 's2') {
              stackS2 = [...sourceElements];
            }

            // Show both stacks for copyStack operation
            stacks = {
              s1: stackS1,
              s2: stackS2,
            };
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
        count: currentElements.length,
        headValue: currentElements.length > 0 ? currentElements[currentElements.length - 1] : null, // Top of stack
        tailValue: currentElements.length > 0 ? currentElements[0] : null, // Bottom of stack
        isEmpty: currentElements.length === 0,
      };
    }

    return {
      elements: currentElements,
      stats: currentStats,
      currentOperation,
      stacks,
      mainStack,
      stackS1,
      stackS2,
    };
  };

  // Get current visualization state based on selected step
  const getCurrentVisualizationState = () => {
    if (selectedStep !== null) {
      return getStepState(selectedStep);
    }

    // If there are operations, show the final state (result of all operations)
    if (state.operations.length > 0) {
      return getStepState(state.operations.length - 1);
    }

    return {
      elements: state.elements,
      stats: {
        ...state.stats,
        count: state.stats.length,
      },
      currentOperation: undefined,
      stacks: undefined,
      mainStack: [],
      stackS1: [],
      stackS2: [],
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
              Drag & Drop Stack
            </h1>
            <p className="text-sm text-gray-600 md:text-base dark:text-gray-400">
              ลาก operations ไปยัง Drop Zone และเลือก stack ที่ต้องการ
            </p>
          </div>
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
        </div>
        <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div id="tutorial-operations-panel" className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <Suspense
            fallback={
              <div className="h-64 w-full rounded-lg border bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              </div>
            }
          >
            <StackDragDropOperations
              dragComponents={stackDragComponents}
              onDragStart={handleDragStart}
              onTouchStart={handleTouchStart}
            />
          </Suspense>
        </div>

        {/* Right Side - Drop Zone */}
        <div id="tutorial-drop-zone" className="rounded-lg bg-white p-4 shadow md:p-6 dark:bg-gray-800">
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
            onUpdateOperationSourceStack={updateOperationSourceStack}
            onUpdateOperationTargetStack={updateOperationTargetStack}
            onReorderOperation={reorderOperation}
          />
        </div>
      </div>

      {/* Visualization */}
      <div id="tutorial-visualization" ref={visualizationContainerRef} className="relative">
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
          <StackDragDropVisualization
            ref={visualizationRef}
            elements={currentVisualizationState.elements}
            stats={currentVisualizationState.stats}
            isRunning={isAutoPlaying}
            currentOperation={currentVisualizationState.currentOperation}
            stacks={currentVisualizationState.stacks}
            mainStack={currentVisualizationState.mainStack}
            stackS1={currentVisualizationState.stackS1}
            stackS2={currentVisualizationState.stackS2}
          />
        </Suspense>
      </div>

      <div className="mt-6">
        {/* Step Selection */}
        <div id="tutorial-controls">
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
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        steps={stackTutorialSteps}
        storageKey={getTutorialStorageKey(pathname, 'dragdrop')}
      />
    </div>
  );
};

export default DragDropStack;
