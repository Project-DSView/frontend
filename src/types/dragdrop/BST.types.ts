import { Operation } from './common.types';
import { BaseStats, BaseState } from './base.types';

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
  isEmpty: boolean;
}

interface BSTOperation extends Operation {
  type:
    | 'insert'
    | 'delete'
    | 'search'
    | 'traverse_inorder'
    | 'traverse_preorder'
    | 'traverse_postorder';
  category: 'insertion' | 'deletion' | 'searching' | 'traversal';
  position: string | null;
  newValue: string | null;
}

interface BSTDragComponent {
  id: string;
  name: string;
  color: string;
  category: 'insertion' | 'deletion' | 'searching' | 'traversal';
  type:
    | 'insert'
    | 'delete'
    | 'search'
    | 'traverse_inorder'
    | 'traverse_preorder'
    | 'traverse_postorder';
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

interface BSTData {
  root: BSTNode | null;
}

interface BSTStatsExtended extends BaseStats {
  height: number;
}

interface BSTStateExtended extends BaseState<BSTData, BSTStatsExtended> {
  data: BSTData;
  stats: BSTStatsExtended;
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
  BSTData,
  BSTStatsExtended,
  BSTStateExtended,
};
