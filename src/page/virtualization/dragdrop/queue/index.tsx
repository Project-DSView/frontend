'use client';

import React, { useState, useRef, useEffect } from 'react';

import { QueueDragComponent } from '@/types';
import { useDragDropQueue } from '@/hooks';
import { queueDragComponents } from '@/data';

// Shared components
import DragDropZone from '@/components/playground/shared/DragDropZone';
import StepSelector from '@/components/playground/shared/StepSelector';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';

// Visualization
import QueueVisualization from '@/components/playground/dragdrop/visualization/Queue';

// Python
import PythonCodeBlock from '@/components/playground/shared/PythonCodeBlock';
import { generateQueueCode } from '@/lib/utils/queueCodeGenerator';

// Tutorial
import TutorialModal from '@/components/tutorial/TutorialModal';

const QueuePage = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropQueue();

  const [draggedItem, setDraggedItem] = useState<QueueDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* =========================
      Drag & Drop
  ========================= */

  const handleDragStart = (e: React.DragEvent, component: QueueDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    addOperation({
      type: draggedItem.type,
      name: draggedItem.name,
      value: draggedItem.type === 'enqueue' ? '' : null,
      color: draggedItem.color,
      category: draggedItem.category,
    });

    if (selectedStep === null) setSelectedStep(0);
    setDraggedItem(null);
  };

  /* =========================
      Update helpers
  ========================= */

  const updateOperationValue = (id: number, value: string) => {
    updateOperation(id, { value });
  };

  const handleRemoveOperation = (id: number) => {
    removeOperation(id);
    setSelectedStep(null);
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  };

  const handleClearAll = () => {
    stopAutoPlay();
    clearAll();
    setSelectedStep(null);
  };

  /* =========================
      Step / Auto Play
  ========================= */

  const handleStepSelect = (step: number) => {
    setSelectedStep(step);
    if (isAutoPlaying) stopAutoPlay();
  };

  const handlePrevious = () => {
    if (selectedStep !== null && selectedStep > 0) {
      stopAutoPlay();
      setSelectedStep(selectedStep - 1);
    }
  };

  const handleNext = () => {
    if (selectedStep !== null && selectedStep < state.operations.length - 1) {
      stopAutoPlay();
      setSelectedStep(selectedStep + 1);
    }
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
      return;
    }

    if (state.operations.length === 0) return;

    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayIntervalRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        if (prev === null || prev >= state.operations.length - 1) {
          setIsAutoPlaying(false);
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, []);

  /* =========================
      Step description
  ========================= */

  const getStepDescription = (op: any) => {
    switch (op.type) {
      case 'enqueue':
        return `เพิ่มข้อมูล ${op.value} ลงใน Queue (FIFO)`;
      case 'dequeue':
        return 'นำข้อมูลออกจาก Queue ด้านหน้า';
      default:
        return op.name;
    }
  };

  /* =========================
      State simulation
  ========================= */

  const getStepState = (step: number) => {
    let elements: string[] = [];

    for (let i = 0; i <= step; i++) {
      const op = state.operations[i];
      if (!op) continue;

      if (op.type === 'enqueue' && op.value) elements.push(op.value);
      if (op.type === 'dequeue' && elements.length > 0) elements.shift();
    }

    return {
      elements,
      stats: {
        length: elements.length,
        count: elements.length,
        headValue: elements[0] ?? null,
        tailValue: elements[elements.length - 1] ?? null,
        isEmpty: elements.length === 0,
      },
    };
  };

  const visualizationState = selectedStep !== null ? getStepState(selectedStep) : state;

  /* =========================
      Python Code
  ========================= */

  const pythonCode = generateQueueCode(state.operations);

  /* =========================
      Render
  ========================= */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-gray-900 md:px-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Drag & Drop Queue
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ลาก operation เพื่อสร้าง Queue พร้อมโค้ด Python
          </p>
        </div>
        <div className="flex gap-3">
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          <ExportPNGButton visualizationRef={visualizationRef} disabled={false} />
        </div>
      </div>

      {/* Operations (ย่อให้เล็กลง) */}
      <div className="mb-4 rounded-md border bg-white p-3 shadow-sm dark:bg-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Queue Operations</h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {queueDragComponents.map((op) => (
            <button
              key={op.type}
              draggable
              onDragStart={(e) => handleDragStart(e, op)}
              className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              title={op.description}
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      {/* DropZone + Visualization (เตี้ยลง + scroll ภายใน) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Drop Zone */}
        <div className="rounded-xl border bg-white p-3 shadow-sm dark:bg-gray-800 lg:h-[520px] flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-xs text-red-600">
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <DragDropZone
              operations={state.operations}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onRemoveOperation={handleRemoveOperation}
              onUpdateOperationValue={updateOperationValue}
              onReorderOperation={reorderOperation}
            />
          </div>
        </div>

        {/* Visualization */}
        <div className="rounded-xl border bg-white p-3 shadow-sm dark:bg-gray-800 lg:h-[520px] flex flex-col">
          <h2 className="mb-2 text-sm font-semibold">Queue Visualization</h2>

          <div className="flex-1 overflow-hidden">
            <QueueVisualization
              ref={visualizationRef}
              elements={visualizationState.elements}
              stats={visualizationState.stats}
              isRunning={isAutoPlaying}
            />
          </div>
        </div>
      </div>

      {/* Step Control */}
      <div className="mt-6">
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

      {/* Generated Python Code (ย่อ padding ให้เล็กลง) */}
      {pythonCode && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Generated Python Code
          </h2>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
            <PythonCodeBlock code={pythonCode} />
          </div>
        </div>
      )}

      {/* Tutorial */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        playgroundMode="dragdrop"
      />
    </div>
  );
};

export default QueuePage;
