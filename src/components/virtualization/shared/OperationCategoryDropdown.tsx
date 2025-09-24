'use client';

import React, { useState } from 'react';
import { OperationCategoryDropdownProps } from '@/types';

const OperationCategoryDropdown: React.FC<OperationCategoryDropdownProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryData = categories.find((cat) => cat.key === selectedCategory);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          {selectedCategoryData ? (
            <>
              <span className="font-medium text-gray-700">{selectedCategoryData.title}</span>
            </>
          ) : (
            <span className="text-gray-500">เลือกประเภท Operation</span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                onCategorySelect(null);
                setIsOpen(false);
              }}
              className="flex w-full items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50"
            >
              <span className="text-gray-700">ทั้งหมด</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => {
                  onCategorySelect(category.key);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 ${
                  selectedCategory === category.key ? 'bg-blue-50' : ''
                }`}
              >
                <span
                  className={`font-medium ${selectedCategory === category.key ? 'text-blue-700' : 'text-gray-700'}`}
                >
                  {category.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationCategoryDropdown;
