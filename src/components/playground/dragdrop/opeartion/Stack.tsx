'use client';

import React from 'react';
import { StackDragComponent } from '@/types';
import OperationCard from '../../shared/OperationCard';
interface StackOperationsProps {
  dragComponents: StackDragComponent[];
  onDragStart: (e: React.DragEvent, component: StackDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: StackDragComponent) => void;
}

const StackDragDropOperations: React.FC<StackOperationsProps> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  // Show all operations without category filtering
  const filteredComponents = dragComponents;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Stack Operations</h2>

      {/* Operations Grid - Show all operations */}
      <div className="space-y-3">
        {filteredComponents.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>ไม่มี operations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredComponents.map((component) => (
              <OperationCard
                key={component.id}
                component={{
                  id: component.id,
                  name: component.name,
                  color: component.color,
                  category: component.category,
                }}
                onDragStart={(e) => onDragStart(e, component)}
                onTouchStart={(e) => onTouchStart && onTouchStart(e, component)}
                description={component.description}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StackDragDropOperations;
