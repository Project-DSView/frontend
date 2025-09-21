'use client';

import React, { useState, useRef } from 'react';
import { SinglyLinkedListOperation, SinglyLinkedListDragComponent } from '@/types';
import { useDataStructure } from '@/hooks';
import { singlyLinkedListDragComponents } from '@/data';
import { CodeGenerationService } from '@/services';
import SinglyLinkedListOperations from '@/components/DataStructures/singly-linked-list/SinglyLinkedListOperations';
import SinglyLinkedListVisualization from '@/components/DataStructures/singly-linked-list/SinglyLinkedListVisualization';
import DragDropZone from '@/components/DataStructures/shared/DragDropZone';
import CodeMirrorEditor from '@/components/DataStructures/shared/CodeMirrorEditor';

const DragDropSinglyLinkList = () => {
  const {
    state,
    isRunning,
    currentLine,
    currentStep,
    executionHistory,
    currentOperation,
    currentPosition,
    addOperation,
    updateOperation,
    removeOperation,
    clearAll,
    executeAllOperations,
  } = useDataStructure();

  const [draggedItem, setDraggedItem] = useState<SinglyLinkedListDragComponent | null>(null);
  const [code, setCode] = useState(CodeGenerationService.getCodeTemplate('singly-linked-list'));
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, component: SinglyLinkedListDragComponent) => {
    setDraggedItem(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTouchStart = (e: React.TouchEvent, component: SinglyLinkedListDragComponent) => {
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
        value: [
          'traverse',
          'delete_beginning',
          'delete_end',
        ].includes(draggedItem.type)
          ? null
          : '',
        position: [
          'insert_position',
          'delete_position',
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

  const handleExecuteOperations = async () => {
    await executeAllOperations();
    const generatedCode = CodeGenerationService.generateSinglyLinkedListCode(
      state.operations as SinglyLinkedListOperation[],
    );
    setCode(generatedCode);
  };

  const handleClearAll = () => {
    clearAll();
    setCode(CodeGenerationService.getCodeTemplate('singly-linked-list'));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Drag & Drop Singly Linked List</h1>
        <p className="text-gray-600">
          เลือกประเภท operation จาก dropdown แล้วลาก operations ไปยัง Drop Zone
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side - Drag Components */}
        <SinglyLinkedListOperations
          dragComponents={singlyLinkedListDragComponents}
          onDragStart={handleDragStart}
          onTouchStart={handleTouchStart}
        />

        {/* Right Side - Drop Zone */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Drop Zone</h2>
            <div className="space-x-2">
              <button
                onClick={handleExecuteOperations}
                disabled={isRunning}
                className={`px-4 py-2 ${isRunning ? 'bg-gray-400' : 'bg-accent hover:bg-accent/50'} rounded text-white transition-colors`}
              >
                {isRunning ? 'Running...' : '▶ Run'}
              </button>
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

      {/* Execution Status */}
      {(isRunning || currentStep) && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center space-x-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
            <h3 className="font-semibold text-blue-800">Execution Status</h3>
          </div>
          <p className="font-medium text-blue-700">{currentStep}</p>

          {/* Execution History */}
          <div className="mt-4 max-h-32 overflow-y-auto rounded border bg-white p-3">
            <div className="mb-2 text-xs text-gray-600">Execution Log:</div>
            {executionHistory.map((step, index) => (
              <div
                key={index}
                className="border-b border-gray-100 py-1 text-sm text-gray-700 last:border-b-0"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualization */}
      <SinglyLinkedListVisualization
        nodes={state.nodes}
        stats={state.stats}
        isRunning={isRunning}
        currentOperation={currentOperation}
        currentStep={currentStep}
        currentPosition={currentPosition}
      />

      {/* Code Editor */}
      <CodeMirrorEditor code={code} currentLine={currentLine} title="Generated Python Code" />
    </div>
  );
};

export default DragDropSinglyLinkList;
