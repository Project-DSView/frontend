'use client';

import React, { useState, useRef, useEffect } from 'react';

import { QueueDragComponent, Operation } from '@/types';
import { useDragDropQueue } from '@/hooks';
import { queueDragComponents, queueDragDropBaseTemplate } from '@/data';
import { generateDragDropQueueCode } from '@/lib';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import QueueVisualization from '@/components/playground/dragdrop/visualization/Queue';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';

const CodeEditor = React.lazy(() => import('@/components/editor/CodeEditor'));

const QueuePage = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropQueue();

  const [draggedItem, setDraggedItem] = useState<QueueDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // ✅ NEW: auto-follow latest step
  const [autoFollow, setAutoFollow] = useState(true);

  const [, setIsTutorialOpen] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Auto follow latest ================= */

  useEffect(() => {
    if (!autoFollow) return;
    if (isAutoPlaying) return;

    if (state.operations.length === 0) {
      setSelectedStep(null);
      return;
    }

    setSelectedStep(state.operations.length - 1);
  }, [state.operations, autoFollow, isAutoPlaying]);

  /* ================= Drag ================= */

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

    // ✅ user plays -> follow latest
    setAutoFollow(true);

    addOperation({
      type: draggedItem.type,
      name: draggedItem.name,
      value: draggedItem.type === 'enqueue' ? '' : null,
      color: draggedItem.color,
      category: draggedItem.category,
      position: null,
      newValue: null,
    });

    setDraggedItem(null);
  };

  /* ================= Update / Remove / Reorder ================= */

  const updateOperationValue = (id: number, value: string) => {
    setAutoFollow(true);
    updateOperation(id, { value });
  };

  const updateOperationPosition = (id: number, position: string) => {
    setAutoFollow(true);
    updateOperation(id, { position });
  };

  const updateOperationNewValue = (id: number, newValue: string) => {
    setAutoFollow(true);
    updateOperation(id, { newValue });
  };

  const handleRemoveOperation = (id: number) => {
    setAutoFollow(true);
    removeOperation(id);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /* ================= AutoPlay ================= */

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
    setAutoFollow(true);
  };

  const handleStepSelect = (step: number) => {
    // ✅ manual scrub -> stop follow
    setAutoFollow(false);
    setSelectedStep(step);
    if (isAutoPlaying) stopAutoPlay();
  };

  const handlePrevious = () => {
    if (state.operations.length === 0) return;
    stopAutoPlay();
    setAutoFollow(false);
    setSelectedStep((prev) => Math.max(0, (prev ?? 0) - 1));
  };

  const handleNext = () => {
    if (state.operations.length === 0) return;
    stopAutoPlay();
    setAutoFollow(false);
    setSelectedStep((prev) => Math.min(state.operations.length - 1, (prev ?? 0) + 1));
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
      return;
    }

    if (state.operations.length === 0) return;

    // autoplay = manual timeline
    setAutoFollow(false);
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

  /* ================= Step logic ================= */

  const getStepDescription = (op: Operation) => {
    switch (op.type) {
      case 'enqueue':
        return `เพิ่มข้อมูล ${op.value} ลงใน Queue (FIFO)`;
      case 'dequeue':
        return 'นำข้อมูลออกจาก Queue ด้านหน้า';
      default:
        return op.name;
    }
  };

  const getStepState = (step: number) => {
    const elements: string[] = [];

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

  const visualizationState =
    selectedStep !== null ? getStepState(selectedStep) : state;

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 md:px-8 dark:bg-gray-900">
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

      {/* Operations */}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border bg-white p-3 shadow-sm lg:h-[520px] dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-xs text-red-600">
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <DragDropZone
              operations={state.operations}
              selectedStep={selectedStep}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveOperation={handleRemoveOperation}
              onUpdateOperationValue={updateOperationValue}
              onUpdateOperationPosition={updateOperationPosition}
              onUpdateOperationNewValue={updateOperationNewValue}
              onReorderOperation={(from, to) => {
                setAutoFollow(true);
                reorderOperation(from, to);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col rounded-xl border bg-white p-3 shadow-sm lg:h-[520px] dark:bg-gray-800">
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

      {(() => {
        const generatedCode =
          state.operations.length === 0
            ? queueDragDropBaseTemplate +
              '\n\n# === User Operations ===\nmyQueue = ArrayQueue()\n\n# Drop operations above to generate code here...'
            : generateDragDropQueueCode(state.operations);

        return (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Generated Python Code
              </h2>
              <CopyCodeButton code={generatedCode} />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
              <React.Suspense fallback={<div>Loading editor...</div>}>
                <CodeEditor code={generatedCode} disabled height="400px" onCodeChange={() => {}} />
              </React.Suspense>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default QueuePage;
