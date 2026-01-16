'use client';

import React from "react";
import { BSTDragComponent } from "@/types";

interface Props {
  dragComponents: BSTDragComponent[];
  onDragStart: (e: any, component: BSTDragComponent) => void;
  onTouchStart?: (component: BSTDragComponent) => void;
}

const BSTDragDropOperations: React.FC<Props> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">BST Operations</h2>

      {dragComponents.map((op) => (
        <div
          key={op.type}
          draggable
          onDragStart={(e) => onDragStart(e, op)}
          onTouchStart={() => onTouchStart && onTouchStart(op)}
          className={`p-4 rounded-xl border-2 border-dashed cursor-grab ${op.color}`}
        >
          {/* หัวข้อ */}
          <div className="font-bold text-lg">{op.name}</div>

          {/* คำอธิบาย */}
          <div className="text-gray-600 text-sm mt-1">
            {op.description}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BSTDragDropOperations;
