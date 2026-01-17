'use client';

import React, { useState, useRef } from 'react';

import { SinglyLinkedListDragComponent, Operation } from '@/types';
import { useDragDropSinglyLinkedList } from '@/hooks';
import { singlyLinkedListDragComponents, singlyLinkedListDragDropBaseTemplate } from '@/data';
import { generateDragDropSinglyLinkedListCode } from '@/lib';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';
import StepSelector from '@/components/playground/shared/action/StepSelector';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import SinglyLinkedListVisualization from '@/components/playground/dragdrop/visualization/SinglyLinkedList';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';

const CodeEditor = React.lazy(() => import('@/components/editor/CodeEditor'));

const DragDropSinglyLinkedListPage = () => {
  // const pathname = usePathname();
  const { state, addOperation, updateOperation, removeOperation, clearAll, reorderOperation } =
    useDragDropSinglyLinkedList();

  const [draggedItem, setDraggedItem] = useState<SinglyLinkedListDragComponent | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const visualizationRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, component: SinglyLinkedListDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', 'external');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

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

  const updateOperationValue = (id: number, value: string) => updateOperation(id, { value });
  const updateOperationPosition = (id: number, position: string) =>
    updateOperation(id, { position });
  const updateOperationNewValue = (id: number, newValue: string) =>
    updateOperation(id, { newValue });

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
  };

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
      case 'traverse':
        return 'Traverse linked list';
      default:
        return op.name;
    }
  };

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
        case 'traverse':
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

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    if (state.operations.length === 0) return;

    setIsAutoPlaying(true);
    setSelectedStep(0);

    autoPlayRef.current = setInterval(() => {
      setSelectedStep((prev) => {
        if (prev === null || prev >= state.operations.length - 1) {
          setIsAutoPlaying(false);
          if (autoPlayRef.current) clearInterval(autoPlayRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 md:px-6 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Drag & Drop Singly Linked List
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Linked list visualization + Python code
          </p>
        </div>

        <div className="flex gap-2">
          <TutorialButton onClick={() => {}} />
          <ExportPNGButton visualizationRef={visualizationRef} disabled={false} />
        </div>
      </div>

      <div className="mb-3 rounded-lg border bg-white p-3 dark:bg-gray-800">
        <h2 className="text-sm font-semibold">Linked List Operations</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {singlyLinkedListDragComponents.map((op) => (
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

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-3 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Drop Zone</h2>
            <button onClick={handleClearAll} className="text-xs text-red-600">
              Clear
            </button>
          </div>

          <DragDropZone
            operations={state.operations}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onRemoveOperation={removeOperation}
            onUpdateOperationValue={updateOperationValue}
            onUpdateOperationPosition={updateOperationPosition}
            onUpdateOperationNewValue={updateOperationNewValue}
            onReorderOperation={reorderOperation}
          />
        </div>

        {/* Visualization */}
        <div className="rounded-lg border bg-white p-3 dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-semibold">Singly Linked List Visualization</h2>

          <SinglyLinkedListVisualization
            ref={visualizationRef}
            nodes={visualizationState.nodes}
            stats={visualizationState.stats}
            isRunning={isAutoPlaying}
            currentOperation={
              selectedStep !== null ? state.operations[selectedStep]?.type : undefined
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <StepSelector
          operations={state.operations}
          selectedStep={selectedStep}
          onStepSelect={setSelectedStep}
          getStepDescription={getStepDescription}
          onAutoPlay={handleAutoPlay}
          isAutoPlaying={isAutoPlaying}
        />
      </div>

      {/* Generated Code Logic */}
      {(() => {
        const generatedCode =
          state.operations.length === 0
            ? singlyLinkedListDragDropBaseTemplate +
              '\n\n# === User Operations ===\nmyList = SinglyLinkedList()\n\n# Drop operations above to generate code here...'
            : generateDragDropSinglyLinkedListCode(state.operations);

        return (
          <div className="mt-4 rounded-lg border bg-white p-3 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Generated Python Code</h2>
              <CopyCodeButton code={generatedCode} />
            </div>
            <div className="mt-2 rounded">
              <React.Suspense fallback={<div>Loading editor...</div>}>
                <CodeEditor
                  code={generatedCode}
                  disabled
                  height="400px"
                  onCodeChange={() => {}}
                />
              </React.Suspense>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DragDropSinglyLinkedListPage;
