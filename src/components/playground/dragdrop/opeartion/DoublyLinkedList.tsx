'use client';

import React, { useState, useMemo } from 'react';

import { DoublyLinkedListOperationsProps, OperationCategory } from '@/types';
import { linkedListCategories } from '@/data';

import OperationCard from './OperationCard';
import OperationSearchFilter from './OperationSearchFilter';

const DoublyLinkedDragDropListOperations: React.FC<DoublyLinkedListOperationsProps> = ({
  dragComponents,
  onDragStart,
  onTouchStart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory | 'all'>('all');

  const categories = linkedListCategories;

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
    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
      {/* ================= Header ================= */}
      <div className="mb-1">
        <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-100">
          Doubly Linked List Operations
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          เลือก operation แล้วลากไปวางที่ Drop Zone
        </p>
      </div>

      {/* ================= Search & Filter ================= */}
      <div className="mb-2">
        <OperationSearchFilter
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          categories={categories}
        />
      </div>

      {/* ================= Operations ================= */}
      <div className="space-y-1">
        {filteredComponents.length === 0 ? (
          <div className="py-3 text-center text-[11px] text-gray-500 dark:text-gray-400">
            ไม่มี operations
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {filteredComponents.map((component) => (
              <OperationCard
                key={component.id}
                component={{
                  id: component.id,
                  name: component.name,
                  color: component.color,
                  category: component.category,
                  description: component.description,
                }}
                onDragStart={(e) => onDragStart(e, component)}
                onTouchStart={(e) => onTouchStart && onTouchStart(e, component)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoublyLinkedDragDropListOperations;
