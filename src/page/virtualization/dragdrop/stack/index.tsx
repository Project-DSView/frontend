'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

import { Operation } from '@/types';
import { useDragDropStack } from '@/hooks';
import { stackDragComponents, stackDragDropBaseTemplate } from '@/data';
import { generateDragDropStackCode } from '@/lib';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import StackVisualization from '@/components/playground/dragdrop/visualization/Stack';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';

const CodeEditor = React.lazy(() => import('@/components/editor/CodeEditor'));

const StackPage = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropStack();

  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= Update ================= */

  const updateOperationValue = (id: number, value: string) => {
    setAutoFollow(true);
    updateOperation(id, { value });
  };

  const updateOperationTargetStack = (id: number, targetStack: string) => {
    setAutoFollow(true);
    updateOperation(id, { targetStack });
  };

  const updateOperationSourceStack = (id: number, sourceStack: string) => {
    setAutoFollow(true);
    updateOperation(id, { sourceStack });
  };

  const updateOperationPosition = (id: number, position: string) => {
    setAutoFollow(true);
    updateOperation(id, { position });
  };

  const updateOperationNewValue = (id: number, newValue: string) => {
    setAutoFollow(true);
    updateOperation(id, { newValue });
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
    setAutoFollow(true);
  };

  /* ================= Step Description ================= */

  const getStepDescription = (op: Operation) => {
    if (op.type === 'push') return `Push ${op.value}`;
    if (op.type === 'pop') return 'Pop';
    if (op.type === 'copyStack') return 'Copy Stack';
    return op.name;
  };

  /* ================= Step Simulation ================= */

  const getStepState = (step: number) => {
    const elements: string[] = [];

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
        headValue: elements[elements.length - 1] ?? null,
        tailValue: elements[0] ?? null,
        isEmpty: elements.length === 0,
      },
    };
  };

  const jumpToLatestStep = useCallback(() => {
    if (state.operations.length === 0) {
      setSelectedStep(null);
      return;
    }
    setSelectedStep(state.operations.length - 1);
  }, [state.operations.length]);

  useEffect(() => {
    if (!autoFollow) return;
    if (isAutoPlaying) return;
    jumpToLatestStep();
  }, [state.operations, autoFollow, isAutoPlaying, jumpToLatestStep]);

  const visualizationState =
    selectedStep !== null ? getStepState(selectedStep) : state;

  /* ================= AutoPlay ================= */

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
      return;
    }

    if (state.operations.length === 0) return;

    setAutoFollow(false);
    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        const cur = prev ?? 0;

        if (cur >= state.operations.length - 1) {
          stopAutoPlay();
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

  const stackOps = stackDragComponents.filter((op) =>
    ['push', 'pop', 'copyStack'].includes(op.type),
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 md:px-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Stack
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            คลิก operation เพื่อสร้าง Stack + Python code
          </p>
        </div>
        <div className="flex gap-3">
          <TutorialButton onClick={() => {}} />
          <ExportPNGButton visualizationRef={visualizationRef} disabled={false} />
        </div>
      </div>

      {/* Operations */}
      <div className="mb-4 rounded-md border bg-white p-3 dark:bg-gray-800">
        <h2 className="text-sm font-semibold">Stack Operations</h2>

        <div className="flex flex-wrap gap-2">
          {stackOps.map((op) => (
            <button
              key={op.type}
              onClick={() => {
                setAutoFollow(true);

                addOperation({
                  type: op.type,
                  name: op.name,
                  value: op.type === 'pop' ? null : '',
                  color: op.color,
                  category: op.category,
                  sourceStack: null,
                  targetStack: null,
                  position: null,
                  newValue: null,
                });
              }}
              className="rounded-full border px-3 py-1 text-xs font-medium transition hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700"
              title={op.description}
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      {/* DropZone + Visualization */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col rounded-xl border bg-white p-3 lg:h-[520px] dark:bg-gray-800">
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
              onRemoveOperation={(id) => {
                setAutoFollow(true);
                removeOperation(id);
              }}
              onUpdateOperationValue={updateOperationValue}
              onUpdateOperationPosition={updateOperationPosition}
              onUpdateOperationNewValue={updateOperationNewValue}
              onUpdateOperationTargetStack={updateOperationTargetStack}
              onUpdateOperationSourceStack={updateOperationSourceStack}
              onReorderOperation={(from, to) => {
                setAutoFollow(true);
                reorderOperation(from, to);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col rounded-xl border bg-white p-3 lg:h-[520px] dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-semibold">Stack Visualization</h2>

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

      {/* Step Selector */}
      <div className="mt-6">
        <StepSelector
          operations={state.operations}
          selectedStep={selectedStep}
          onStepSelect={(i) => {
            stopAutoPlay();
            setAutoFollow(false);
            setSelectedStep(i);
          }}
          getStepDescription={getStepDescription}
          onAutoPlay={handleAutoPlay}
          isAutoPlaying={isAutoPlaying}
        />
      </div>

      {/* Generated Code */}
      {(() => {
        const generatedCode =
          state.operations.length === 0
            ? stackDragDropBaseTemplate +
              '\n\n# === User Operations ===\nmyStack = ArrayStack()\n\n# Click operations above to generate code here...'
            : generateDragDropStackCode(state.operations);

        return (
          <div className="mt-6 rounded-xl border bg-white p-3 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Generated Python Code</h2>
              <CopyCodeButton code={generatedCode} />
            </div>

            <React.Suspense fallback={<div>Loading editor...</div>}>
              <CodeEditor code={generatedCode} disabled height="400px" onCodeChange={() => {}} />
            </React.Suspense>
          </div>
        );
      })()}
    </div>
  );
};

export default StackPage;