import React from 'react';
import {
  OperationCategory,
  DragComponent,
  DataStructureStats,
  SinglyLinkedListDragComponent,
  DoublyLinkedListDragComponent,
  StackDragComponent,
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
    headValue: string | null;
    tailValue: string | null;
    isEmpty: boolean;
  };
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
  DragDropZoneProps,
};
