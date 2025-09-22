import { Operation } from '../common.types';

interface BSTNode {
  value: string;
  left: BSTNode | null;
  right: BSTNode | null;
  id: string;
  x?: number;
  y?: number;
}

interface BSTStats {
  size: number;
  height: number;
  minValue: string | null;
  maxValue: string | null;
  isEmpty: boolean;
}

interface BSTOperation extends Operation {
  type:
    | 'insert'
    | 'delete'
    | 'search'
    | 'traverse_inorder'
    | 'traverse_preorder'
    | 'traverse_postorder'
    | 'find_min'
    | 'find_max';
  category: 'insertion' | 'deletion' | 'searching' | 'traversal' | 'utility';
  position: string | null;
  newValue: string | null;
}

interface BSTDragComponent {
  id: string;
  name: string;
  color: string;
  category: 'insertion' | 'deletion' | 'searching' | 'traversal' | 'utility';
  type:
    | 'insert'
    | 'delete'
    | 'search'
    | 'traverse_inorder'
    | 'traverse_preorder'
    | 'traverse_postorder'
    | 'find_min'
    | 'find_max';
  description: string;
}

interface BSTState {
  root: BSTNode | null;
  operations: BSTOperation[];
  stats: BSTStats;
}

interface BSTExecutionStep {
  step: string;
  description: string;
  duration: number;
  nodeValue?: string;
  path?: string[];
}

interface BSTCodeTemplate {
  insert: string;
  delete: string;
  search: string;
  traverse: string;
  findMin: string;
  findMax: string;
}

interface BSTOperationsProps {
  dragComponents: BSTDragComponent[];
  onDragStart: (e: React.DragEvent, component: BSTDragComponent) => void;
  onTouchStart?: (e: React.TouchEvent, component: BSTDragComponent) => void;
}

interface BSTVisualizationProps {
  root: BSTNode | null;
  stats: BSTStats;
  isRunning?: boolean;
  currentOperation?: string;
  currentStep?: string;
  selectedStep?: number | null;
  highlightedNodes?: string[];
  searchPath?: string[];
}

interface PositionedNode extends BSTNode {
  x: number;
  y: number;
  level: number;
}

export type {
  BSTNode,
  BSTStats,
  BSTOperation,
  BSTDragComponent,
  BSTState,
  BSTExecutionStep,
  BSTCodeTemplate,
  BSTOperationsProps,
  BSTVisualizationProps,
  PositionedNode,
};
