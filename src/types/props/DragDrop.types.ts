import React from 'react';
import {
  OperationCategory,
  DragComponent,
  DataStructureStats,
  SinglyLinkedListDragComponent,
  DoublyLinkedListDragComponent,
  StackDragComponent,
  QueueDragComponent,
  Operation,
} from '@/types';

interface CodeEditorProps {
  code: string;
  currentLine?: number;
  title?: string;
  maxHeight?: string;
}

interface OperationCardProps {
  component: DragComponent;
  onDragStart: (e: React.DragEvent, component: DragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: DragComponent) => void;
  description?: string;
}

interface OperationCategoryDropdownProps {
  categories: { key: OperationCategory; title: string; color: string }[];
  selectedCategory: OperationCategory | null;
  onCategorySelect: (category: OperationCategory | null) => void;
}

interface VisualizationProps {
  nodes: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  title?: string;
  renderNode?: (value: string, index: number) => React.ReactNode;
}

interface SinglyLinkedListOperationsProps {
  dragComponents: SinglyLinkedListDragComponent[];
  onDragStart: (e: React.DragEvent, component: SinglyLinkedListDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: SinglyLinkedListDragComponent) => void;
}

interface SinglyLinkedListVisualizationProps {
  nodes: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  currentPosition?: number;
  selectedStep?: number | null;
  currentOperationData?: {
    type: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
  };
}

interface DoublyLinkedListOperationsProps {
  dragComponents: DoublyLinkedListDragComponent[];
  onDragStart: (e: React.DragEvent, component: DoublyLinkedListDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: DoublyLinkedListDragComponent) => void;
}

interface DoublyLinkedListVisualizationProps {
  nodes: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  currentPosition?: number;
  selectedStep?: number | null;
  currentOperationData?: {
    type: string;
    value?: string | null;
    position?: string | null;
    newValue?: string | null;
  };
}

interface StackOperationsProps {
  dragComponents: StackDragComponent[];
  onDragStart: (e: React.DragEvent, component: StackDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: StackDragComponent) => void;
}

interface StackVisualizationProps {
  elements: string[];
  stats: {
    length: number;
    count: number;
    headValue: string | null;
    tailValue: string | null;
    isEmpty: boolean;
  };
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  // For copyStack operation - support multiple stacks
  stacks?: {
    s1: string[];
    s2: string[];
  };
  // Individual stack data
  mainStack?: string[];
  stackS1?: string[];
  stackS2?: string[];
}

interface QueueOperationsProps {
  dragComponents: QueueDragComponent[];
  onDragStart?: (e: React.DragEvent, component: QueueDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: QueueDragComponent) => void;
}

interface QueueVisualizationProps {
  dequeuedElement?: string | null;
  elements: string[];
  stats: DataStructureStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
}

interface DragDropZoneProps {
  operations: Operation[];
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveOperation: (id: number) => void;
  onUpdateOperationValue: (id: number, value: string) => void;
  onUpdateOperationPosition: (id: number, position: string) => void;
  onUpdateOperationNewValue: (id: number, newValue: string) => void;
  onUpdateOperationSourceStack?: (id: number, sourceStack: string) => void;
  onUpdateOperationTargetStack?: (id: number, targetStack: string) => void;
  onReorderOperation?: (fromIndex: number, toIndex: number) => void;
  children?: React.ReactNode;
}

export type {
  OperationCardProps,
  OperationCategoryDropdownProps,
  CodeEditorProps,
  VisualizationProps,
  SinglyLinkedListOperationsProps,
  SinglyLinkedListVisualizationProps,
  DoublyLinkedListOperationsProps,
  DoublyLinkedListVisualizationProps,
  StackOperationsProps,
  StackVisualizationProps,
  QueueOperationsProps,
  QueueVisualizationProps,
  DragDropZoneProps,
};
