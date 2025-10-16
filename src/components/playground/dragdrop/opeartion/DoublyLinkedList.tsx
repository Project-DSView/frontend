'use client';

import React, { useState, useMemo } from 'react';
import { DoublyLinkedListOperationsProps, OperationCategory } from '@/types';
import OperationCard from '../../shared/OperationCard';
import OperationSearchFilter from '../../shared/OperationSearchFilter';
import { linkedListCategories } from '@/data';

const DoublyLinkedDragDropListOperations: React.FC<DoublyLinkedListOperationsProps> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory | 'all'>('all');

  // Use categories from data
  const categories = linkedListCategories;

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
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Doubly Linked List Operations</h2>

      {/* Search and Filter */}
      <OperationSearchFilter
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
      />

      {/* Operations Grid - Show filtered operations */}
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

export default DoublyLinkedDragDropListOperations;
