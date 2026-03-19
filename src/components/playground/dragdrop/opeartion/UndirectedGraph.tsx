'use client';

import React from 'react';
import type { UndirectedGraphDragComponent } from '@/types';

type Props = {
  dragComponents: UndirectedGraphDragComponent[];
  onOperationClick: (component: UndirectedGraphDragComponent) => void;
  onDragStart?: (e: React.DragEvent, component: UndirectedGraphDragComponent) => void;
};

const UndirectedGraphDragDropOperations: React.FC<Props> = ({
  dragComponents,
  onOperationClick,
  onDragStart,
}) => {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Graph Operations</h2>

      <div className="mt-2 flex flex-wrap gap-2">
        {dragComponents.map((c) => (
          <button
            key={c.id}
            type="button"
            draggable={Boolean(onDragStart)}
            onDragStart={(e) => onDragStart?.(e, c)}
            onClick={() => onOperationClick(c)}
            className={`rounded-full border px-3 py-1 text-xs font-medium text-gray-800 transition hover:brightness-95 active:scale-[0.98] dark:text-gray-100 dark:hover:brightness-110 ${c.color}`}
            title={c.description}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UndirectedGraphDragDropOperations;
