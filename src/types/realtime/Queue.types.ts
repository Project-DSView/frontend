interface QueueData {
  elements: string[];
  count: number;
  dequeuedElement?: string | null;
  // For dynamic multiple queues support
  allQueues?: {
    [queueName: string]: {
      data: string[];
      size: number;
      isEmpty: boolean;
      front: string | null;
      back: string | null;
    };
  };
  currentOperation?: 'normal';
}

interface QueueStats {
  size: number;
  isEmpty: boolean;
  front: string | null;
  back: string | null;
}

interface QueueRealtimeProps {
  data: QueueData;
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
  queueVariable?: string;
}

interface ExecutionResult {
  success: boolean;
  data: QueueData | null;
  error: string | null;
}

export type {
  QueueData,
  QueueStats,
  QueueRealtimeProps,
  SecurityStatus,
  ParsedCode,
  Operation,
  ExecutionResult,
};
