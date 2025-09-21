interface Operation {
  id: number;
  type: string;
  name: string;
  value: string | null;
  position: string | null;
  newValue: string | null;
  color: string;
  category: string;
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
  | 'binary-search-tree'
  | 'graph';

type OperationCategory = 'insertion' | 'deletion' | 'traversal' | 'searching' | 'update';

export type {
  Operation,
  DragComponent,
  ExecutionState,
  DataStructureStats,
  DataStructureType,
  OperationCategory,
};
