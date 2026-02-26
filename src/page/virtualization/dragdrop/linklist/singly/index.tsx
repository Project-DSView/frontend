'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';

import { Operation } from '@/types';
import { useDragDropSinglyLinkedList } from '@/hooks';
import {
  singlyLinkedListDragComponents,
  singlyLinkedListDragDropBaseTemplate,
  getTutorialSteps,
  getTutorialStorageKey,
} from '@/data';
import { generateDragDropSinglyLinkedListCode } from '@/lib';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import TutorialOverlay from '@/components/playground/shared/tutorial/TutorialOverlay';
import SinglyLinkedListVisualization from '@/components/playground/dragdrop/visualization/SinglyLinkedList';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';

const CodeEditor = React.lazy(() => import('@/components/editor/CodeEditor'));

const DragDropSinglyLinkedListPage = () => {
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropSinglyLinkedList();

  /* ================= State ================= */
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [autoFollow, setAutoFollow] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);

  /* ================= Auto follow latest ================= */

  useEffect(() => {
    if (!autoFollow) return;
    if (state.operations.length === 0) {
      setSelectedStep(null);
      return;
    }
    setSelectedStep(state.operations.length - 1);
  }, [state.operations, autoFollow]);

  /* ================= Update Operation ================= */

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

  const handleClearAll = () => {
    clearAll();
    setSelectedStep(null);
    setAutoFollow(true);
  };

  /* ================= Step Description ================= */

  const getStepDescription = (op: Operation) => {
    switch (op.type) {
      case 'insert_beginning':
        return `Insert ${op.value} at beginning`;
      case 'insert_end':
        return `Insert ${op.value} at end`;
      case 'insert_position':
        return `Insert ${op.value} at position ${op.position}`;
      case 'delete_beginning':
        return 'Delete from beginning';
      case 'delete_end':
        return 'Delete from end';
      case 'delete_value':
        return `Delete value ${op.value}`;
      case 'delete_position':
        return `Delete at position ${op.position}`;
      case 'update_value':
        return `Update value → ${op.newValue}`;
      case 'update_position':
        return `Update position ${op.position} → ${op.newValue}`;
      default:
        return op.name;
    }
  };

  /* ================= Step Simulation ================= */

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
        case 'insert_position':
          if (op.value && op.position !== null) {
            const pos = Number(op.position);
            if (pos >= 0 && pos <= nodes.length) nodes.splice(pos, 0, op.value);
          }
          break;
        case 'delete_beginning':
          nodes.shift();
          break;
        case 'delete_end':
          nodes.pop();
          break;
        case 'delete_value':
          if (op.value) {
            const idx = nodes.indexOf(op.value);
            if (idx !== -1) nodes.splice(idx, 1);
          }
          break;
        case 'delete_position':
          if (op.position !== null) {
            const pos = Number(op.position);
            if (pos >= 0 && pos < nodes.length) nodes.splice(pos, 1);
          }
          break;
        case 'update_value':
          if (op.value && op.newValue) {
            const idx = nodes.indexOf(op.value);
            if (idx !== -1) nodes[idx] = op.newValue;
          }
          break;
        case 'update_position':
          if (op.position !== null && op.newValue) {
            const pos = Number(op.position);
            if (pos >= 0 && pos < nodes.length) nodes[pos] = op.newValue;
          }
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

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 md:px-6 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Drag & Drop Singly Linked List
            </h1>

            <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          </div>

          <ExportPNGButton visualizationRef={visualizationRef} />
        </div>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          คลิก operation เพื่อสร้าง Singly Linked List + Python code
        </p>
      </div>

      {/* Operations */}
      <div className="mb-3 rounded-lg border bg-white p-3 dark:bg-gray-800">
        <h2 className="text-sm font-semibold">Linked List Operations</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {singlyLinkedListDragComponents.map((op) => (
            <button
              key={op.type}
              onClick={() => {
                setAutoFollow(true);
                addOperation({
                  type: op.type,
                  name: op.name,
                  value: '',
                  position: null,
                  newValue: null,
                  color: op.color,
                  category: op.category,
                });
              }}
              className="rounded-full border px-3 py-1 text-xs transition hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700"
            >
              {op.name}
            </button>
          ))}
        </div>
      </div>

      {/* Drop + Visualization */}
      <div className="grid gap-3 lg:grid-cols-2 lg:h-[420px]">
        <div className="flex h-full flex-col rounded-lg border bg-white p-3 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-xs text-red-600">
              Clear
            </button>
          </div>

          <div className="flex-1">
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
              onReorderOperation={(from, to) => {
                setAutoFollow(true);
                reorderOperation(from, to);
              }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-3 dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-semibold">Singly Linked List Visualization</h2>

          <div className="flex-1 overflow-hidden">
            <SinglyLinkedListVisualization
              ref={visualizationRef}
              nodes={visualizationState.nodes}
              stats={visualizationState.stats}
            />
          </div>
        </div>
      </div>

      {/* Step Selector */}
      <div className="mt-4">
        <StepSelector
          operations={state.operations}
          selectedStep={selectedStep}
          onStepSelect={(step) => {
            setAutoFollow(false);
            setSelectedStep(step);
          }}
          getStepDescription={getStepDescription}
        />
      </div>

      {/* Generated Code */}
      <div className="mt-4 rounded-lg border bg-white p-3 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Generated Python Code</h2>
          <CopyCodeButton
            code={
              state.operations.length === 0
                ? singlyLinkedListDragDropBaseTemplate
                : generateDragDropSinglyLinkedListCode(state.operations)
            }
          />
        </div>

        <Suspense fallback={<div>Loading editor...</div>}>
          <CodeEditor
            code={
              state.operations.length === 0
                ? singlyLinkedListDragDropBaseTemplate
                : generateDragDropSinglyLinkedListCode(state.operations)
            }
            disabled
            height="400px"
            onCodeChange={() => {}}
          />
        </Suspense>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        steps={getTutorialSteps('dragdrop')}
        storageKey={getTutorialStorageKey(
          typeof window !== 'undefined'
            ? window.location.pathname
            : '/virtualization/dragdrop/linkedlist/singly',
          'dragdrop'
        )}
      />
    </div>
  );
};

export default DragDropSinglyLinkedListPage;