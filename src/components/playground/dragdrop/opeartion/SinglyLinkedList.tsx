'use client';

import React from 'react';
import { SinglyLinkedListOperationsProps } from '@/types';

const SinglyLinkedListDragDropOperations: React.FC<
  SinglyLinkedListOperationsProps
> = ({ dragComponents, onDragStart, onTouchStart }) => {
  return (
    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Singly Linked List Operations
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          เลือก operation เพื่อเพิ่มลงใน Drop Zone
        </p>
      </div>

      {/* Compact Pill Buttons */}
      <div className="flex flex-wrap gap-2">
        {dragComponents.map((component) => (
          <button
            key={component.id}
            type="button"
            draggable
            onDragStart={(e) => onDragStart(e, component)}
            onTouchStart={(e) =>
              onTouchStart && onTouchStart(e, component)
            }
           className={`
  rounded-full
  border
  px-3 py-1
  text-xs font-medium
  cursor-pointer
  select-none
  transition
  active:scale-[0.98]
  ${component.color}
  bg-gray-50
  hover:bg-gray-100
`}
            title={component.description}
          >
            {component.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SinglyLinkedListDragDropOperations;