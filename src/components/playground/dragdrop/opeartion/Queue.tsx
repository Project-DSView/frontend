'use client';

import React, { useState, useMemo } from 'react';

import { QueueDragComponent, OperationCategory } from '@/types';
import { queueCategories } from '@/data';

import OperationCard from '../../shared/OperationCard';
import OperationSearchFilter from '../../shared/OperationSearchFilter';

interface QueueOperationsProps {
  dragComponents: QueueDragComponent[];
  onDragStart: (e: React.DragEvent, component: QueueDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: QueueDragComponent) => void;
}

const QueueDragDropOperations: React.FC<QueueOperationsProps> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory | 'all'>('all');

  // Use categories from data
  const categories = queueCategories;

  // Filter components based on search term and category
  const filteredComponents = useMemo(() => {
    return dragComponents.filter((component) => {
      const matchesSearch =
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dragComponents, searchTerm, selectedCategory]);

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
        Queue Operations
      </h2>

      {/* Search and Filter */}
      <OperationSearchFilter
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
      />

      {/* Operations - Flex Column */}
      <div className="mt-4 space-y-3">
        {filteredComponents.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p>ไม่มี operations</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
                onTouchStart={onTouchStart ? (e) => onTouchStart(e, component) : undefined}
                description={component.description}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueDragDropOperations;
