'use client';

import React, { useEffect, useRef, useState } from 'react';

import { StackDragComponent } from '@/types';
import { useDragDropStack } from '@/hooks';
import { stackDragComponents } from '@/data';

// Shared components
import DragDropZone from '@/components/playground/shared/DragDropZone';
import StepSelector from '@/components/playground/shared/StepSelector';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';

// Visualization
import StackVisualization from '@/components/playground/dragdrop/visualization/Stack';

// Python
import PythonCodeBlock from '@/components/playground/shared/PythonCodeBlock';
import { generateStackCode } from '@/lib/utils/stackCodeGenerator';

// Tutorial
import TutorialModal from '@/components/tutorial/TutorialModal';

const StackPage = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropStack();

  const [draggedItem, setDraggedItem] = useState<StackDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Drag & Drop ================= */

  const handleDragStart = (e: React.DragEvent, component: StackDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // สำคัญ เพื่อให้ Drop ได้
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    addOperation({
      type: draggedItem.type,
      name: draggedItem.name,
      value: draggedItem.type === 'pop' ? null : '',
      color: draggedItem.color,
      category: draggedItem.category,
      sourceStack: null,
      targetStack: null,
    });

    // ถ้ายังไม่เลือก step ให้เริ่มที่ 0
    if (selectedStep === null) setSelectedStep(0);

    setDraggedItem(null);
  };

  const updateOperationValue = (id: number, value: string) => {
    updateOperation(id, { value });
  };

  const updateOperationTargetStack = (id: number, targetStack: string) => {
    updateOperation(id, { targetStack });
  };

  const updateOperationSourceStack = (id: number, sourceStack: string) => {
    updateOperation(id, { sourceStack });
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const handleClearAll = () => {
    stopAutoPlay();
    clearAll();
    setSelectedStep(null);
  };

  /* ================= Step Description ================= */

  const getStepDescription = (op: any) => {
    if (op.type === 'push') return `Push ${op.value}`;
    if (op.type === 'pop') return 'Pop';
    if (op.type === 'copyStack') return 'Copy Stack';
    return op.name;
  };

  /* ================= Step Simulation ================= */

  const getStepState = (step: number) => {
    let elements: string[] = [];

    for (let i = 0; i <= step; i++) {
      const op = state.operations[i];
      if (!op) continue;

      if (op.type === 'push' && op.value) elements.push(op.value);
      if (op.type === 'pop') elements.pop();
    }

    return {
      elements,
      stats: {
        length: elements.length,
        count: elements.length,
        headValue: elements[elements.length - 1] ?? null,
        tailValue: elements[0] ?? null,
        isEmpty: elements.length === 0,
      },
    };
  };

  const visualizationState = selectedStep !== null ? getStepState(selectedStep) : state;

  /* ================= Prev / Next / First / Last ================= */

  const handleFirst = () => {
    if (state.operations.length === 0) return;
    stopAutoPlay();
    setSelectedStep(0);
  };

  const handleLast = () => {
    if (state.operations.length === 0) return;
    stopAutoPlay();
    setSelectedStep(state.operations.length - 1);
  };

  const handlePrev = () => {
    if (state.operations.length === 0) return;
    stopAutoPlay();
    setSelectedStep((prev) => Math.max(0, (prev ?? 0) - 1));
  };

  const handleNext = () => {
    if (state.operations.length === 0) return;
    stopAutoPlay();
    setSelectedStep((prev) => Math.min(state.operations.length - 1, (prev ?? 0) + 1));
  };

  /* ================= Auto Play ================= */

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
      return;
    }

    if (state.operations.length === 0) return;

    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        const cur = prev ?? 0;

        if (cur >= state.operations.length - 1) {
          setIsAutoPlaying(false);
          if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
          }
          return cur;
        }

        return cur + 1;
      });
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  /* ================= Python Code ================= */

  const pythonCode = generateStackCode(state.operations);
  const stackOps = stackDragComponents.filter((op) => ['push', 'pop', 'copyStack'].includes(op.type));

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 dark:bg-gray-900 md:px-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Drag & Drop Stack</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stack visualization + Python code</p>
        </div>
        <div className="flex gap-3">
          <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          <ExportPNGButton visualizationRef={visualizationRef} disabled={false} />
        </div>
      </div>

      {/* Operations (เล็กแบบในรูป) */}
      <div className="mb-4 rounded-md border bg-white p-3 dark:bg-gray-800">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Stack Operations</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {stackOps.map((op) => (
            <button
              key={op.type}
              draggable
              onDragStart={(e) => handleDragStart(e, op)}
              className="rounded-full border px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
              title={op.description}
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone + Visualization (ทำให้เตี้ยลง + scroll ภายใน) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Drop Zone */}
        <div className="rounded-xl border bg-white p-3 dark:bg-gray-800 lg:h-[520px] flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-xs text-red-600">
              Clear
            </button>
          </div>

          {/* ให้พื้นที่ข้างในเลื่อนแทน */}
          <div className="flex-1 overflow-auto">
            <DragDropZone
              operations={state.operations}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onRemoveOperation={removeOperation}
              onUpdateOperationValue={updateOperationValue}
              onUpdateOperationTargetStack={updateOperationTargetStack}
              onUpdateOperationSourceStack={updateOperationSourceStack}
              onReorderOperation={reorderOperation}
            />
          </div>
        </div>

        {/* Visualization */}
        <div className="rounded-xl border bg-white p-3 dark:bg-gray-800 lg:h-[520px] flex flex-col">
          <h2 className="mb-2 text-sm font-semibold">Stack Visualization</h2>

          {/* กัน component ข้างในดันความสูง */}
          <div className="flex-1 overflow-hidden">
            <StackVisualization
              ref={visualizationRef}
              elements={visualizationState.elements}
              stats={visualizationState.stats}
              isRunning={isAutoPlaying}
            />
          </div>
        </div>
      </div>

      {/* Step Control (เล็กลงนิด) */}
      <div className="mt-6">
        <StepSelector
          operations={state.operations}
          selectedStep={selectedStep}
          onStepSelect={(i) => {
            stopAutoPlay();
            setSelectedStep(i);
          }}
          getStepDescription={getStepDescription}
          onPrevious={handlePrev}
          onNext={handleNext}
          onAutoPlay={handleAutoPlay}
          isAutoPlaying={isAutoPlaying}
          onFirst={handleFirst}
          onLast={handleLast}
        />
      </div>

      {/* Python Code */}
      <div className="mt-6 rounded-xl border bg-white p-3 dark:bg-gray-800">
        <h2 className="text-sm font-semibold">Generated Python Code</h2>
        <div className="mt-2 rounded">
          <PythonCodeBlock code={pythonCode} />
        </div>
      </div>

      {/* Tutorial */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        playgroundMode="dragdrop"
      />
    </div>
  );
};

export default StackPage;
