interface StackData {
  elements: string[];
  count: number;
  // For copyStack operation - support multiple stacks
  stacks?: {
    s1: string[];
    s2: string[];
  };
  // For dynamic multiple stacks support
  allStacks?: {
    [stackName: string]: {
      data: string[];
      size: number;
      isEmpty: boolean;
      top: string | null;
    };
  };
  currentOperation?: 'copyStack' | 'normal';
}

interface StackStats {
  size: number;
  isEmpty: boolean;
}

interface StackRealtimeProps {
  data: StackData;
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
  stackVariable?: string;
}

interface ExecutionResult {
  success: boolean;
  data: StackData | null;
  error: string | null;
}

export type {
  StackData,
  StackStats,
  StackRealtimeProps,
  SecurityStatus,
  ParsedCode,
  Operation,
  ExecutionResult,
};
