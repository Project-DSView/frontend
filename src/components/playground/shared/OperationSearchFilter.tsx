import React from 'react';
import { Search, X } from 'lucide-react';

import { OperationSearchFilterProps, OperationCategory } from '@/types';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const OperationSearchFilter: React.FC<OperationSearchFilterProps> = ({
  onSearchChange,
  onCategoryChange,
  searchTerm,
  selectedCategory,
  categories,
}) => {
  const handleClearFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Combined Search and Filter Row */}
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหา operations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => onCategoryChange(value as OperationCategory | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="หมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.key} value={category.key}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {(searchTerm || selectedCategory !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex shrink-0 items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">ล้าง</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>กรองแล้ว:</span>
          {searchTerm && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
              `{searchTerm}`
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
              {categories.find((c) => c.key === selectedCategory)?.title}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationSearchFilter;
