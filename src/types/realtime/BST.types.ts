interface BSTNodeData {
  value: string;
  left: BSTNodeData | null;
  right: BSTNodeData | null;
  parent?: BSTNodeData | null;
  isHighlighted?: boolean;
  x?: number;
  y?: number;
  level?: number;
}

interface BSTData {
  elements: string[]; // For traversal results
  count: number;
  root?: BSTNodeData | null;

  // For dynamic multiple trees support
  allTrees?: {
    [treeName: string]: {
      data: BSTNodeData | null;
      size: number;
      isEmpty: boolean;
      root: BSTNodeData | null;
      traversalResults?: {
        preorder: string[];
        inorder: string[];
        postorder: string[];
      };
    };
  };

  currentOperation?: 'insert' | 'delete' | 'traverse' | 'findMin' | 'findMax' | 'normal';
  currentTraversal?: 'preorder' | 'inorder' | 'postorder';
}

interface BSTStats {
  size: number;
  isEmpty: boolean;
  height: number;
  minValue: string | null;
  maxValue: string | null;
}

interface BSTRealtimeProps {
  data: BSTData;
  isExecuting: boolean;
  error: string | null;
  securityStatus: SecurityStatus;
}

interface SecurityStatus {
  isSafe: boolean;
  violations: string[];
  warnings: string[];
}

interface ParsedCode {
  operations: Operation[];
  isValid: boolean;
  errors: string[];
}

interface Operation {
  type: string;
  method: string;
  parameters: string[];
  lineNumber: number;
  treeVariable?: string;
}

interface ExecutionResult {
  success: boolean;
  data: BSTData | null;
  error: string | null;
}

export type {
  BSTNodeData,
  BSTData,
  BSTStats,
  BSTRealtimeProps,
  SecurityStatus,
  ParsedCode,
  Operation,
  ExecutionResult,
};
