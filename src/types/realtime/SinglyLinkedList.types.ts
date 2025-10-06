interface SinglyLinkedListNode {
  value: string;
  next: SinglyLinkedListNode | null;
  id: string;
}

interface SinglyLinkedListData {
  head: SinglyLinkedListNode | null;
  tail: SinglyLinkedListNode | null;
  count: number;
}

interface SinglyLinkedListStats {
  size: number;
  isEmpty: boolean;
}

interface SinglyLinkedListRealtimeProps {
  data: SinglyLinkedListData;
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
}

interface ExecutionResult {
  success: boolean;
  data: SinglyLinkedListData | null;
  error: string | null;
}

export type {
  SinglyLinkedListNode,
  SinglyLinkedListData,
  SinglyLinkedListStats,
  SinglyLinkedListRealtimeProps,
  SecurityStatus,
  ParsedCode,
  Operation,
  ExecutionResult,
};
