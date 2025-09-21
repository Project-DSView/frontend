import React from 'react';
import { OperationCardProps } from '@/types';

const OperationCard: React.FC<OperationCardProps> = ({
  component,
  onDragStart,
  onTouchStart,
  description,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, component)}
      onTouchStart={(e) => onTouchStart && onTouchStart(e, component)}
      className={`${component.color} cursor-move rounded-lg border-2 border-dashed p-3 transition-shadow duration-200 hover:shadow-md active:scale-95`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">{component.name}</span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{description || component.name}</p>
    </div>
  );
};

export default OperationCard;
