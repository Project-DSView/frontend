'use client';

import React from 'react';
import { StackDragComponent } from '@/types';

interface Props {
  dragComponents: StackDragComponent[];
  onDragStart: (e: React.DragEvent, component: StackDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: StackDragComponent) => void;
}

const StackDragDropOperations: React.FC<Props> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  return (
    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
      {/* Title */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Stack Operations
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          เลือก operation แล้วลากไปวางที่ Drop Zone
        </p>
      </div>

      {/* Operations (compact like the screenshot) */}
      <div className="flex flex-wrap gap-2">
        {dragComponents.map((item) => (
          <button
            key={item.id}
            type="button"
            draggable
            onDragStart={(e) => onDragStart(e as any, item)}
            onTouchStart={(e) => onTouchStart && onTouchStart(e, item)}
            className={`cursor-grab select-none rounded-full border px-3 py-1 text-xs font-medium text-gray-800 transition hover:bg-gray-100 active:scale-[0.98] dark:text-gray-100 dark:hover:bg-gray-700 ${item.color}`}
            title={item.description}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StackDragDropOperations;
