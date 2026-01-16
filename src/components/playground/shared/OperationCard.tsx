'use client';

import React from 'react';

interface OperationCardProps {
  component: {
    id: string;
    name: string;
    color: string;
    category: string;
    description?: string;
  };
  onDragStart?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

const OperationCard: React.FC<OperationCardProps> = ({
  component,
  onDragStart,
  onTouchStart,
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
      className={`cursor-grab select-none rounded-md border px-2 py-1.5 shadow-sm transition hover:shadow ${component.color}`}
    >
      <div className="text-xs font-semibold leading-tight text-gray-800 dark:text-gray-100">
        {component.name}
      </div>

      {component.description && (
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-gray-600 dark:text-gray-300">
          {component.description}
        </p>
      )}
    </div>
  );
};

export default OperationCard;
