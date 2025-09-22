'use client';

import React, { useState } from 'react';
import { BSTOperationsProps, OperationCategory } from '@/types';
import OperationCard from '../shared/OperationCard';
import OperationCategoryDropdown from '../shared/OperationCategoryDropdown';

const BSTOperations: React.FC<BSTOperationsProps> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory | null>(null);
  const [showOperations, setShowOperations] = useState(false);

  const categories = [
    {
      key: 'insertion' as OperationCategory,
      title: 'Insertion Operations',
      color: 'text-blue-600',
    },
    {
      key: 'deletion' as OperationCategory,
      title: 'Deletion Operations',
      color: 'text-red-600',
    },
    {
      key: 'searching' as OperationCategory,
      title: 'Searching Operations',
      color: 'text-purple-600',
    },
    {
      key: 'traversal' as OperationCategory,
      title: 'Traversal Operations',
      color: 'text-green-600',
    },
    {
      key: 'utility' as OperationCategory,
      title: 'Utility Operations',
      color: 'text-orange-600',
    },
  ];

  const filteredComponents = selectedCategory
    ? dragComponents.filter((comp) => comp.category === selectedCategory)
    : dragComponents;

  const handleCategorySelect = (category: OperationCategory | null) => {
    setSelectedCategory(category);
    setShowOperations(true);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Drag Components</h2>

      {/* Category Dropdown */}
      <div className="mb-6">
        <OperationCategoryDropdown
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Operations Grid - Only show after category selection */}
      {showOperations && (
        <div className="space-y-3">
          {filteredComponents.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>ไม่มี operations ในหมวดหมู่นี้</p>
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
      )}

      {/* Initial State - Show when no category selected */}
      {!showOperations && (
        <div className="py-12 text-center text-gray-500">
          <h3 className="mb-2 text-lg font-semibold">เลือกประเภท Operation</h3>
          <p className="text-sm">กรุณาเลือกประเภท operation จาก dropdown ด้านบน</p>
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>หมายเหตุ:</strong> BST operations รับเฉพาะตัวเลขเท่านั้น
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default BSTOperations;
