interface DoublyLinkedListNode {
  value: string;
  next: DoublyLinkedListNode | null;
  prev: DoublyLinkedListNode | null;
  id: string;
}

interface DoublyLinkedListData {
  head: DoublyLinkedListNode | null;
  tail: DoublyLinkedListNode | null;
  count: number;
}

interface DoublyLinkedListStats {
  size: number;
  isEmpty: boolean;
}

interface DoublyLinkedListRealtimeProps {
  data: DoublyLinkedListData;
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
  data: DoublyLinkedListData | null;
  error: string | null;
}

export type {
  DoublyLinkedListNode,
  DoublyLinkedListData,
  DoublyLinkedListStats,
  DoublyLinkedListRealtimeProps,
  SecurityStatus,
  ParsedCode,
  Operation,
  ExecutionResult,
};
