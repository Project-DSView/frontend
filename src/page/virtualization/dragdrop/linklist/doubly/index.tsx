'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

import { DoublyLinkedListDragComponent, Operation } from '@/types';
import { useDragDropDoublyLinkedList } from '@/hooks';
import { doublyLinkedListDragComponents, doublyLinkedListDragDropBaseTemplate } from '@/data';
import { generateDragDropDoublyLinkedListCode } from '@/lib';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import DoublyLinkedListVisualization from '@/components/playground/dragdrop/visualization/DoublyLinkedList';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';

const CodeEditor = React.lazy(() => import('@/components/editor/CodeEditor'));

const DragDropDoublyLinkedListPage = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropDoublyLinkedList();

  const [draggedItem, setDraggedItem] = useState<DoublyLinkedListDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // ✅ NEW: auto-follow latest step
  const [autoFollow, setAutoFollow] = useState(true);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  // ✅ follow latest whenever operations change (and not in manual / autoplay)
  useEffect(() => {
    if (!autoFollow) return;
    if (isAutoPlaying) return;

    if (state.operations.length === 0) {
      setSelectedStep(null);
      return;
    }

    setSelectedStep(state.operations.length - 1);
  }, [state.operations, autoFollow, isAutoPlaying]);

  const handleDragStart = (e: React.DragEvent, component: DoublyLinkedListDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    // ✅ user is "playing" -> follow latest
    setAutoFollow(true);

    addOperation({
      type: draggedItem.type,
      name: draggedItem.name,
      value: '',
      position: null,
      newValue: null,
      color: draggedItem.color,
      category: draggedItem.category,
    });

    setDraggedItem(null);
  };

  // ✅ updates => follow latest
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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClearAll = () => {
    clearAll();
    setSelectedStep(null);
    setAutoFollow(true);
    setIsAutoPlaying(false);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = null;
  };

  /* =========================
      Step Description
  ========================= */

  const getStepDescription = (op: Operation) => {
    switch (op.type) {
      case 'insert_beginning':
        return `Insert ${op.value} at beginning`;
      case 'insert_end':
        return `Insert ${op.value} at end`;
      case 'insert_position':
        return `Insert ${op.value} at position ${op.position}`;
      case 'insert_before_position':
        return `Insert ${op.value} before position ${op.position}`;
      case 'delete_beginning':
        return 'Delete from beginning';
      case 'delete_end':
        return 'Delete from end';
      case 'delete_position':
        return `Delete at position ${op.position}`;
      case 'delete_before_position':
        return `Delete before position ${op.position}`;
      case 'update_value':
        return `Update value → ${op.newValue}`;
      case 'update_position':
        return `Update position ${op.position} → ${op.newValue}`;
      case 'traverse_forward':
        return 'Traverse forward (head → tail)';
      case 'traverse_backward':
        return 'Traverse backward (tail → head)';
      default:
        return op.name;
    }
  };

  /* =========================
      Step Simulation
  ========================= */

  const getStepState = (step: number) => {
    let nodes: string[] = [];

    for (let i = 0; i <= step; i++) {
      const op = state.operations[i];
      if (!op) continue;

      switch (op.type) {
        case 'insert_beginning':
          if (op.value) nodes = [op.value, ...nodes];
          break;

        case 'insert_end':
          if (op.value) nodes = [...nodes, op.value];
          break;

        case 'insert_position': {
          if (op.value && op.position !== null) {
            const pos = Number(op.position);
            if (Number.isFinite(pos) && pos >= 0 && pos <= nodes.length) {
              nodes.splice(pos, 0, op.value);
            }
          }
          break;
        }

        case 'insert_before_position': {
          if (op.value && op.position !== null) {
            const pos = Number(op.position);
            const target = Number.isFinite(pos) ? Math.max(0, pos - 1) : 0;
            nodes.splice(Math.min(target, nodes.length), 0, op.value);
          }
          break;
        }

        case 'delete_beginning':
          nodes.shift();
          break;

        case 'delete_end':
          nodes.pop();
          break;

        case 'delete_position': {
          if (op.position !== null) {
            const pos = Number(op.position);
            if (Number.isFinite(pos) && pos >= 0 && pos < nodes.length) {
              nodes.splice(pos, 1);
            }
          }
          break;
        }

        case 'delete_before_position': {
          if (op.position !== null) {
            const pos = Number(op.position);
            const target = Number.isFinite(pos) ? pos - 1 : -1;
            if (target >= 0 && target < nodes.length) nodes.splice(target, 1);
          }
          break;
        }

        case 'update_value': {
          if (op.value && op.newValue) {
            const idx = nodes.indexOf(op.value);
            if (idx !== -1) nodes[idx] = op.newValue;
          }
          break;
        }

        case 'update_position': {
          if (op.position !== null && op.newValue) {
            const pos = Number(op.position);
            if (Number.isFinite(pos) && pos >= 0 && pos < nodes.length) nodes[pos] = op.newValue;
          }
          break;
        }

        case 'traverse_forward':
        case 'traverse_backward':
          break;

        default:
          break;
      }
    }

    return {
      nodes,
      stats: {
        length: nodes.length,
        headValue: nodes[0] ?? null,
        tailValue: nodes[nodes.length - 1] ?? null,
        isEmpty: nodes.length === 0,
      },
    };
  };

  const visualizationState =
    selectedStep !== null ? getStepState(selectedStep) : { nodes: state.nodes, stats: state.stats };

  /* =========================
      Prev / Next / Auto Play
  ========================= */

  const handlePrev = () => {
    if (state.operations.length === 0) return;
    setAutoFollow(false);
    setSelectedStep((prev) => Math.max(0, (prev ?? 0) - 1));
  };

  const handleNext = () => {
    if (state.operations.length === 0) return;
    setAutoFollow(false);
    setSelectedStep((prev) => Math.min(state.operations.length - 1, (prev ?? 0) + 1));
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
      return;
    }

    if (state.operations.length === 0) return;

    // autoplay = manual timeline
    setAutoFollow(false);
    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        const cur = prev ?? 0;
        if (cur >= state.operations.length - 1) {
          setIsAutoPlaying(false);
          if (autoPlayRef.current) clearInterval(autoPlayRef.current);
          autoPlayRef.current = null;
          return cur;
        }
        return cur + 1;
      });
    }, 1500);
  };

  /* =========================
      Python Code
  ========================= */

  const generatedCode = useMemo(() => {
    if (state.operations.length === 0) {
      return (
        doublyLinkedListDragDropBaseTemplate +
        '\n\n# === User Operations ===\nmyList = DoublyLinkedList()\n\n# Drop operations above to generate code here...'
      );
    }
    return generateDragDropDoublyLinkedListCode(state.operations);
  }, [state.operations]);

  /* =========================
      Render
  ========================= */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:px-6 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Drag & Drop Doubly Linked List
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Doubly linked list visualization + Python code
          </p>
        </div>
        <div className="flex gap-2">
          <TutorialButton onClick={() => {}} />
          <ExportPNGButton visualizationRef={visualizationRef} disabled={false} />
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-white p-3 shadow-sm dark:bg-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Linked List Operations
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">
          {doublyLinkedListDragComponents.map((op) => (
            <button
              key={op.type}
              draggable
              onDragStart={(e) => handleDragStart(e, op)}
              className="rounded-full border px-3 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-3 shadow-sm dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-xs text-red-600">
              Clear
            </button>
          </div>

          <DragDropZone
            operations={state.operations}
            selectedStep={selectedStep}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onRemoveOperation={(id) => {
              setAutoFollow(true);
              removeOperation(id);
            }}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
            onReorderOperation={(from, to) => {
              setAutoFollow(true);
              reorderOperation(from, to);
            }}
          />
        </div>

        <div className="rounded-xl border bg-white p-3 shadow-sm dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-semibold">Doubly Linked List Visualization</h2>

          <DoublyLinkedListVisualization
            ref={visualizationRef}
            nodes={visualizationState.nodes}
            stats={visualizationState.stats}
            isRunning={isAutoPlaying}
            currentOperation={
              selectedStep !== null ? state.operations[selectedStep]?.type : undefined
            }
            selectedStep={selectedStep}
            currentOperationData={
              selectedStep !== null ? state.operations[selectedStep] : undefined
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <StepSelector
          operations={state.operations}
          selectedStep={selectedStep}
          onStepSelect={(step) => {
            setAutoFollow(false); // scrub = manual
            setSelectedStep(step);
          }}
          getStepDescription={getStepDescription}
          onPrevious={handlePrev}
          onNext={handleNext}
          onAutoPlay={handleAutoPlay}
          isAutoPlaying={isAutoPlaying}
        />
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Generated Python Code</h2>
          <CopyCodeButton code={generatedCode} />
        </div>

        <div className="mt-3 rounded-xl">
          <React.Suspense fallback={<div>Loading editor...</div>}>
            <CodeEditor code={generatedCode} disabled height="400px" onCodeChange={() => {}} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default DragDropDoublyLinkedListPage;
