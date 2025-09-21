import React from 'react';
import {
  OperationCategory,
  DragComponent,
  DataStructureStats,
  SinglyLinkedListDragComponent,
  DoublyLinkedListDragComponent,
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
};
