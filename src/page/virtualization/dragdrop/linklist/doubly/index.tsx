'use client';

import React, { useState, useRef, lazy, Suspense } from 'react';
import { DoublyLinkedListDragComponent } from '@/types';
import { useDoublyLinkedListDragDrop } from '@/hooks';
import { doublyLinkedListDragComponents } from '@/data';
import DragDropZone from '@/components/virtualization/shared/DragDropZone';
import StepSelector from '@/components/virtualization/shared/StepSelector';
import ExportPNGButton from '@/components/virtualization/shared/ExportPNGButton';

// Lazy load heavy components
const DoublyLinkedDragDropListOperations = lazy(
  () => import('@/components/virtualization/dragdrop/linklist/doubly/DoublyLinkedListOperations'),
);
const DoublyLinkedDragDropListVisualization = lazy(
  () =>
    import('@/components/virtualization/dragdrop/linklist/doubly/DoublyLinkedListVisualization'),
);

const DragDropDoublyLinkList = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll } =
    useDoublyLinkedListDragDrop();

  const [draggedItem, setDraggedItem] = useState<DoublyLinkedListDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoading] = useState(false);
  const dragCounter = useRef(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: DoublyLinkedListDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTouchStart = (e: React.TouchEvent, component: DoublyLinkedListDragComponent) => {
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
        value: ['traverse_forward', 'traverse_backward', 'delete_beginning', 'delete_end'].includes(
          draggedItem.type,
        )
          ? null
          : '',
        position: [
          'insert_position',
          'insert_before_position',
          'delete_position',
          'delete_before_position',
          'search_position',
          'update_position',
        ].includes(draggedItem.type)
          ? ''
          : null,
        newValue: ['update_value', 'update_position'].includes(draggedItem.type) ? '' : null,
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
      insert_beginning: `เพิ่มข้อมูล ${operation.value} ที่ตำแหน่งเริ่มต้นของ doubly linked list`,
      insert_end: `เพิ่มข้อมูล ${operation.value} ที่ตำแหน่งท้ายของ doubly linked list`,
      insert_position: `เพิ่มข้อมูล ${operation.value} ที่ตำแหน่ง ${operation.position}`,
      insert_before_position: `เพิ่มข้อมูล ${operation.value} ก่อนตำแหน่ง ${operation.position}`,
      delete_beginning: 'ลบข้อมูลที่ตำแหน่งเริ่มต้นของ doubly linked list',
      delete_end: 'ลบข้อมูลที่ตำแหน่งท้ายของ doubly linked list',
      delete_position: `ลบข้อมูลที่ตำแหน่ง ${operation.position}`,
      delete_before_position: `ลบข้อมูลก่อนตำแหน่ง ${operation.position}`,
      search: `ค้นหาข้อมูล ${operation.value} ใน doubly linked list`,
      search_position: `ค้นหาข้อมูลที่ตำแหน่ง ${operation.position}`,
      update_value: `อัปเดตข้อมูลเป็น ${operation.newValue}`,
      update_position: `อัปเดตข้อมูลที่ตำแหน่ง ${operation.position} เป็น ${operation.newValue}`,
      traverse_forward: 'เดินทางผ่าน doubly linked list ไปข้างหน้า',
      traverse_backward: 'เดินทางผ่าน doubly linked list ไปข้างหลัง',
    };

    return descriptions[operation.type] || `ดำเนินการ ${operation.name}`;
  };

  // Calculate state for selected step
  const getStepState = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= state.operations.length) {
      return {
        nodes: [],
        stats: {
          length: 0,
          headValue: null as string | null,
          tailValue: null as string | null,
          isEmpty: true,
        },
      };
    }

    let currentNodes: string[] = [];
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
        case 'insert_beginning':
          if (operation.value) {
            currentNodes = [operation.value, ...currentNodes];
          }
          break;
        case 'insert_end':
          if (operation.value) {
            currentNodes = [...currentNodes, operation.value];
          }
          break;
        case 'insert_position':
          if (operation.value && operation.position) {
            const pos = parseInt(operation.position);
            if (pos >= 0 && pos <= currentNodes.length) {
              currentNodes.splice(pos, 0, operation.value);
            }
          }
          break;
        case 'insert_before_position':
          if (operation.value && operation.position) {
            const pos = parseInt(operation.position);
            if (pos >= 0 && pos <= currentNodes.length) {
              currentNodes.splice(pos, 0, operation.value);
            }
          }
          break;
        case 'delete_beginning':
          if (currentNodes.length > 0) {
            currentNodes = currentNodes.slice(1);
          }
          break;
        case 'delete_end':
          if (currentNodes.length > 0) {
            currentNodes = currentNodes.slice(0, -1);
          }
          break;
        case 'delete_position':
          if (operation.position) {
            const pos = parseInt(operation.position);
            if (pos >= 0 && pos < currentNodes.length) {
              currentNodes.splice(pos, 1);
            }
          }
          break;
        case 'delete_before_position':
          if (operation.position) {
            const pos = parseInt(operation.position);
            if (pos > 0 && pos <= currentNodes.length) {
              currentNodes.splice(pos - 1, 1);
            }
          }
          break;
        case 'update_value':
          if (operation.newValue) {
            const index = currentNodes.indexOf(operation.value || '');
            if (index !== -1) {
              currentNodes[index] = operation.newValue;
            }
          }
          break;
        case 'update_position':
          if (operation.position && operation.newValue) {
            const pos = parseInt(operation.position);
            if (pos >= 0 && pos < currentNodes.length) {
              currentNodes[pos] = operation.newValue;
            }
          }
          break;
      }

      // Update stats
      currentStats = {
        length: currentNodes.length,
        headValue: currentNodes.length > 0 ? currentNodes[0] : null,
        tailValue: currentNodes.length > 0 ? currentNodes[currentNodes.length - 1] : null,
        isEmpty: currentNodes.length === 0,
      };
    }

    return { nodes: currentNodes, stats: currentStats };
  };

  // Get current visualization state based on selected step
  const getCurrentVisualizationState = () => {
    if (selectedStep !== null) {
      return getStepState(selectedStep);
    }
    return { nodes: state.nodes, stats: state.stats };
  };

  const currentVisualizationState = getCurrentVisualizationState();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Drag & Drop Doubly Linked List</h1>
          <p className="text-gray-600">
            เลือกประเภท operation จาก dropdown แล้วลาก operations ไปยัง Drop Zone
          </p>
        </div>
        <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
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
          <DoublyLinkedDragDropListOperations
            dragComponents={doublyLinkedListDragComponents}
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
        <DoublyLinkedDragDropListVisualization
          ref={visualizationRef}
          nodes={currentVisualizationState.nodes}
          stats={currentVisualizationState.stats}
          currentOperation={
            selectedStep !== null ? state.operations[selectedStep]?.type : undefined
          }
          selectedStep={
            selectedStep !== null &&
            (state.operations[selectedStep]?.type === 'traverse_forward' ||
              state.operations[selectedStep]?.type === 'traverse_backward')
              ? selectedStep
              : null
          }
        />
      </Suspense>
    </div>
  );
};

export default DragDropDoublyLinkList;
