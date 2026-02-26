'use client';

import React from 'react';
import { BSTDragComponent } from '@/types';

interface Props {
  dragComponents: BSTDragComponent[];
  onDragStart: (e: React.DragEvent, component: BSTDragComponent) => void;
  onTouchStart?: (component: BSTDragComponent) => void;
}

const BSTDragDropOperations: React.FC<Props> = ({ dragComponents, onDragStart, onTouchStart }) => {
  return (
    <div className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold">BST Operations</h2>

      {dragComponents.map((op) => (
        <div
          key={op.type}
          draggable
          onDragStart={(e) => onDragStart(e, op)}
          onTouchStart={() => onTouchStart && onTouchStart(op)}
          className={`cursor-grab rounded-xl border-2 border-dashed p-4 ${op.color}`}
        >
          {/* หัวข้อ */}
          <div className="text-lg font-bold">{op.name}</div>

          {/* คำอธิบาย */}
          <div className="mt-1 text-sm text-gray-600">{op.description}</div>
        </div>
      ))}
    </div>
  );
};

export default BSTDragDropOperations;
