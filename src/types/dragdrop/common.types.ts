interface Operation {
  id: number;
  type: string;
  name: string;
  value: string | null;
  position: string | null;
  newValue: string | null;
  color: string;
  category: string;
  endVertex?: string | null;
  startVertex?: string | null;
  fromVertex?: string | null;
  toVertex?: string | null;
  sourceStack?: string | null; // For copyStack operation
  targetStack?: string | null; // For copyStack operation
}

interface DragComponent {
  id: string;
  name: string;
  color: string;
  category: string;
}

interface ExecutionState {
  isRunning: boolean;
  currentLine: number;
  currentStep: string;
  executionHistory: string[];
}

interface DataStructureStats {
  length: number;
  headValue: string | null;
  tailValue: string | null;
  isEmpty: boolean;
}

type DataStructureType =
  | 'singly-linked-list'
  | 'doubly-linked-list'
  | 'stack'
  | 'queue'
  | 'binary-search-tree'
  | 'graph';

type OperationCategory =
  | 'insertion'
  | 'deletion'
  | 'traversal'
  | 'searching'
  | 'update'
  | 'utility';

interface Category {
  key: OperationCategory | 'all';
  title: string;
  color: string;
}

interface OperationSearchFilterProps {
  onSearchChange: (searchTerm: string) => void;
  onCategoryChange: (category: OperationCategory | 'all') => void;
  searchTerm: string;
  selectedCategory: OperationCategory | 'all';
  categories: { key: OperationCategory | 'all'; title: string; color: string }[];
}

interface DragDropOperation {
  type: string;
  value?: string | null;
  position?: string | null;
  newValue?: string | null;
  fromVertex?: string | null;
  toVertex?: string | null;
  startVertex?: string | null;
}

export type {
  Operation,
  DragComponent,
  ExecutionState,
  DataStructureStats,
  DataStructureType,
  OperationCategory,
  Category,
  OperationSearchFilterProps,
  DragDropOperation,
};
