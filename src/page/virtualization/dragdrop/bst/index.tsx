'use client';

import React, { useRef, lazy, Suspense } from 'react';
import { BSTDragComponent, BSTNode, BSTOperation } from '@/types';
import { useDragDropBST } from '@/hooks';
import { bstDragComponents, bstDragDropBaseTemplate } from '@/data';
import { generateDragDropBSTCode } from '@/lib';

import DragDropZone from '@/components/playground/dragdrop/DragDropZone';

const BSTDragDropVisualization = lazy(
  () => import('@/components/playground/dragdrop/visualization/BST'),
);
const CopyCodeButton = lazy(() => import('@/components/playground/shared/action/CopyCodeButton'));
const CodeEditor = lazy(() => import('@/components/editor/CodeEditor'));

const safeUUID = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
    : Math.random().toString(36).substring(2, 11);

const insertNode = (root: BSTNode | null, value: string): BSTNode => {
  if (!root) return { value, left: null, right: null, id: safeUUID() };

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
  const size = (n: BSTNode | null): number => (n ? 1 + size(n.left) + size(n.right) : 0);
  const height = (n: BSTNode | null): number =>
    n ? 1 + Math.max(height(n.left), height(n.right)) : 0;

  return { size: size(root), height: height(root), isEmpty: !root };
};

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

  const updateBSTStateRef = useRef(updateBSTState);

  React.useEffect(() => {
    updateBSTStateRef.current = updateBSTState;
  }, [updateBSTState]);

  /* ================= Update ================= */

  const updateOperationValue = (id: number, value: string) => {
    const op = state.operations.find((o: BSTOperation) => o.id === id);
    if (op?.type === 'insert' && value && isNaN(parseFloat(value))) return;
    updateOperation(id, { value });
  };

  const updateOperationPosition = (id: number, position: string) => {
    updateOperation(id, { position });
  };

  const updateOperationNewValue = (id: number, newValue: string) => {
    updateOperation(id, { newValue });
  };

  /* ================= Recalculate BST ================= */

  React.useEffect(() => {
    let root: BSTNode | null = null;

    state.operations.forEach((op: BSTOperation) => {
      if (op.value) {
        const v = parseFloat(op.value);
        if (!isNaN(v)) {
          if (op.type === 'insert') root = insertNode(root, v.toString());
          if (op.type === 'delete') root = deleteNode(root, v.toString());
        }
      }
    });

    updateBSTStateRef.current(root, calculateStats(root));
  }, [state.operations]);

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 md:px-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-5">
        <h1 className="mb-1 text-xl font-semibold text-gray-800 dark:text-gray-100">
          Binary Search Tree
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          คลิก operation เพื่อสร้าง BST + Python code
        </p>
      </div>

      {/* Operations */}
      <div className="mb-4 rounded-md border border-dashed border-gray-300 bg-white p-3 shadow-sm dark:bg-gray-800">
        <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          BST Operations
        </h2>

        <div className="flex flex-wrap gap-2">
          {bstDragComponents.map((component) => (
            <button
              key={component.id}
              onClick={() => {
                addOperation({
                  type: component.type,
                  name: component.name,
                  value: component.type.startsWith('traverse') ? null : '',
                  color: component.color,
                  category: component.category,
                  position: null,
                  newValue: null,
                });
              }}
              className="rounded-full border px-3 py-1 text-xs font-medium transition hover:opacity-80 active:scale-95"
              style={{
                background: component.color + '14',
                borderColor: component.color,
                color: component.color,
              }}
              title={component.name}
            >
              {component.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Drop Zone */}
        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-3 shadow-sm lg:h-[520px] dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Drop Zone
            </h2>

            <button
              onClick={() => clearAll()}
              className="rounded-md bg-gray-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-600"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <DragDropZone
              operations={state.operations}
              onRemoveOperation={removeOperation}
              onUpdateOperationValue={updateOperationValue}
              onUpdateOperationPosition={updateOperationPosition}
              onUpdateOperationNewValue={updateOperationNewValue}
              onReorderOperation={reorderOperation}
            />
          </div>
        </div>

        {/* Visualization */}
        <div className="flex flex-col rounded-xl border border-dashed border-gray-300 bg-white p-3 shadow-sm lg:h-[520px] dark:bg-gray-800">
          <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
            BST Visualization
          </h2>

          <div className="flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="flex h-[420px] items-center justify-center text-sm text-gray-500">
                  Loading...
                </div>
              }
            >
              <BSTDragDropVisualization root={state.root} stats={state.stats} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Generated Code */}
      {(() => {
        const generatedCode =
          state.operations.length === 0
            ? bstDragDropBaseTemplate +
              '\n\n# === User Operations ===\nmyBST = BST()\n\n# Click operations above to generate code here...'
            : generateDragDropBSTCode(state.operations);

        return (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Generated Python Code
              </h3>
              <Suspense fallback={null}>
                <CopyCodeButton code={generatedCode} />
              </Suspense>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700">
              <CodeEditor code={generatedCode} disabled height="400px" onCodeChange={() => {}} />
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DragDropBST;