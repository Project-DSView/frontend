interface BaseOperation {
  id: number;
  type: string;
  value?: string | null;
  position?: string | null;
  newValue?: string | null;
}

interface BaseStats {
  size: number;
  isEmpty: boolean;
}

interface BaseState<TData, TStats extends BaseStats> {
  data: TData;
  operations: BaseOperation[];
  stats: TStats;
}

interface BaseExecutionStep {
  step: string;
  description: string;
  duration: number;
  nodeValue?: string;
  path?: string[];
}

interface BaseHookState {
  isRunning: boolean;
  currentLine: number;
  currentStep: string;
  executionHistory: string[];
  currentOperation: string | undefined;
  highlightedNodes: string[];
  searchPath: string[];
  currentPosition: number;
}

interface BaseHookReturn<TData, TStats extends BaseStats, TOperation extends BaseOperation> {
  state: BaseState<TData, TStats>;
  isRunning: boolean;
  currentLine: number;
  currentStep: string;
  executionHistory: string[];
  currentOperation: string | undefined;
  highlightedNodes: string[];
  searchPath: string[];
  currentPosition: number;
  error: string | null;
  addOperation: (operation: Omit<TOperation, 'id'>) => void;
  updateOperation: (id: number, updates: Partial<TOperation>) => void;
  removeOperation: (id: number) => void;
  clearOperations: () => void;
  clearAll: () => void;
  reorderOperation: (fromIndex: number, toIndex: number) => void;
  executeOperation: (
    operation: TOperation,
    currentState: BaseState<TData, TStats>,
  ) => Promise<BaseState<TData, TStats>>;
  executeAllOperations: () => Promise<void>;
  updateDataState: (newData: TData, newStats: TStats) => void;
  setCurrentLine: (line: number) => void;
  setCurrentStep: (step: string) => void;
}

interface BaseDataStructureService<
  TData,
  TStats extends BaseStats,
  TOperation extends BaseOperation,
> {
  getState(): BaseState<TData, TStats>;
  executeOperation(operation: TOperation): Promise<BaseExecutionStep[]>;
}

export type {
  BaseOperation,
  BaseStats,
  BaseState,
  BaseExecutionStep,
  BaseHookState,
  BaseHookReturn,
  BaseDataStructureService,
};
