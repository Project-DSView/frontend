'use client';

import React, { useState, useRef, lazy, Suspense } from 'react';
import { BSTDragComponent, BSTNode } from '@/types';
import { useDragDropBST } from '@/hooks';
import { bstDragComponents } from '@/data';

import DragDropZoneBST from '@/components/playground/shared/DragDropZoneBST';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import PythonCodeBlock from '@/components/playground/shared/PythonCodeBlock';
import { generatePythonCodeFromOperations } from '@/lib/utils/bstCodeGenerator';

const BSTDragDropVisualization = lazy(() =>
  import('@/components/playground/dragdrop/visualization/BST'),
);

/* Safe UUID */
const safeUUID = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);

/* ==========================================================
   BST Helpers
========================================================== */

const insertNode = (root: BSTNode | null, value: string): BSTNode => {
  if (!root) {
    return { value, left: null, right: null, id: safeUUID() };
  }

  const v = parseFloat(value);
  const r = parseFloat(root.value);

  if (v < r) root.left = insertNode(root.left, value);
  else if (v > r) root.right = insertNode(root.right, value);

  return root;
};

const deleteNode = (root: BSTNode | null, value: string): BSTNode | null => {
  if (!root) return null;

  const v = parseFloat(value);
  const r = parseFloat(root.value);

  if (v < r) root.left = deleteNode(root.left, value);
  else if (v > r) root.right = deleteNode(root.right, value);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;

    let temp = root.right;
    while (temp.left) temp = temp.left;

    root.value = temp.value;
    root.right = deleteNode(root.right, temp.value);
  }

  return root;
};

const calculateStats = (root: BSTNode | null) => {
  const size = (n: BSTNode | null): number =>
    n ? 1 + size(n.left) + size(n.right) : 0;

  const height = (n: BSTNode | null): number =>
    n ? 1 + Math.max(height(n.left), height(n.right)) : 0;

  return { size: size(root), height: height(root), isEmpty: !root };
};

/* ==========================================================
    Main Component
========================================================== */

const DragDropBST = () => {
  const {
    state,
    addOperation,
    updateOperation,
    removeOperation,
    clearAll,
    reorderOperation,
    updateBSTState,
  } = useDragDropBST();

  const [pythonCode, setPythonCode] = useState<string>('');

  const draggedItemRef = useRef<BSTDragComponent | null>(null);

  /* Drag Start */
  const handleDragStart = (e, component) => {
    draggedItemRef.current = component;
    e.dataTransfer.setData('text/plain', 'external');
  };

  /* Drop */
  const handleDrop = (e) => {
    e.preventDefault();

    const item = draggedItemRef.current;
    if (!item) return;

    const newOperation = {
      id: safeUUID(),
      type: item.type,
      name: item.name,
      value: item.type.startsWith('traverse') ? null : '',
      color: item.color,
      category: item.category,
    };

    addOperation(newOperation);
    draggedItemRef.current = null;
  };

  /* Update value */
  const updateOperationValue = (id, value) => {
    const op = state.operations.find((o) => o.id === id);

    if (op?.type === 'insert' && value && isNaN(parseFloat(value))) return;

    updateOperation(id, { value });
  };

  /* Auto Update BST + Python Code */
  React.useEffect(() => {
    let root: BSTNode | null = null;

    state.operations.forEach((op) => {
      if (op.value) {
        const v = parseFloat(op.value);
        if (!isNaN(v)) {
          if (op.type === 'insert') root = insertNode(root, v.toString());
          if (op.type === 'delete') root = deleteNode(root, v.toString());
        }
      }
    });

    updateBSTState(root, calculateStats(root));

    setPythonCode(generatePythonCodeFromOperations(state.operations));
  }, [state.operations]);

  /* ==========================================================
      Render UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
        Drag & Drop Binary Search Tree
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        ลาก operation เพื่อสร้าง BST พร้อมโค้ด Python อัตโนมัติ
      </p>

      {/* Operations */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          BST Operations
        </h2>

        <div className="flex flex-wrap gap-3">
          {bstDragComponents.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              className="px-4 py-2 rounded-lg cursor-grab text-sm font-medium transition select-none hover:opacity-70 border"
              style={{
                background: component.color + '20',
                borderColor: component.color,
                color: component.color,
              }}
            >
              {component.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop Zone */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Drop Zone</h2>

            <button
              onClick={() => {
                clearAll();
                setPythonCode('');
              }}
              className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>

          <DragDropZoneBST
            operations={state.operations}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onRemoveOperation={removeOperation}
            onUpdateOperationValue={updateOperationValue}
            onReorderOperation={reorderOperation}
          />
        </div>

        {/* Visualization */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 shadow">
          <h2 className="text-lg font-semibold mb-4">BST Visualization</h2>

          <Suspense fallback={<div>Loading...</div>}>
            <BSTDragDropVisualization
              root={state.root}
              stats={state.stats}
            />
          </Suspense>
        </div>
      </div>

      {/* Python Output */}
      {pythonCode && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-3">Generated Python Code</h3>

          <PythonCodeBlock code={pythonCode} />

          <button
            onClick={() => navigator.clipboard.writeText(pythonCode)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Copy Code
          </button>
        </div>
      )}
    </div>
  );
};

export default DragDropBST;
