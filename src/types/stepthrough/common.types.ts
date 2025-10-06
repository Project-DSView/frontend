import { LinkedListData } from './LinkedList.types';
import { StackData } from './Stack.types';
import { BSTData } from './BST.types';
import { DirectedGraphData } from './DirectedGraph.types';
import { UndirectedGraphData } from './UndirectedGraph.types';

// Union type for all data structures
type StepthroughData =
  | LinkedListData
  | StackData
  | BSTData
  | DirectedGraphData
  | UndirectedGraphData;

interface StepthroughRequest {
  code: string;
  dataType: string;
}

interface StepthroughStep {
  stepNumber: number;
  line: number;
  code: string;
  state: {
    message: string;
    instances?: Record<string, unknown>;
    active?: unknown;
    print_output?: string[];
    linkedlist?: unknown[];
    nodes?: Record<string, unknown>;
    step_detail?: {
      operation: string;
      method_name?: string;
      detected_behavior?: string;
      parameters?: string;
      behavior_analysis?: {
        name: string;
        params: string[];
        behavior_type: string;
        operations: unknown[];
        has_loop: boolean;
        has_print: boolean;
        creates_new_node: boolean;
        modifies_head: boolean;
        modifies_count: boolean;
        modifies_next_pointers: boolean;
        checks_empty_list: boolean;
        traverses_list: boolean;
        finds_target: boolean;
        deletes_node: boolean;
        method_name_hints: {
          is_insert: boolean;
          is_delete: boolean;
          is_traverse: boolean;
          is_front: boolean;
          is_last: boolean;
          is_getter: boolean;
          is_init: boolean;
        };
      };
    };
  };
}

interface StepthroughResponse {
  executionId: string;
  code: string;
  dataType: string;
  steps: StepthroughStep[];
  totalSteps: number;
  status: 'success' | 'error';
  errorMessage?: string | null;
  executedAt: string;
  createdAt: string;
}

interface StepthroughState<TData extends StepthroughData = StepthroughData> {
  code: string;
  filename: string;
  steps: StepthroughStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isAutoPlaying: boolean;
  executionId: string | null;
  error: string | null;
  data: TData;
}

interface StepthroughHookReturn<TData extends StepthroughData = StepthroughData> {
  state: StepthroughState<TData>;
  setCode: (code: string) => void;
  setFilename: (filename: string) => void;
  loadCodeFromFile: (code: string, filename: string) => void;
  executeCode: () => Promise<void>;
  setCurrentStep: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  toggleAutoPlay: () => void;
  reset: () => void;
  isLoading: boolean;
}

interface StepthroughCodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  disabled?: boolean;
  currentStep?: {
    line: number;
    stepNumber: number;
  } | null;
  height?: string | number;
  error?: string | null;
}

interface StepthroughStepControlProps {
  steps: StepthroughStep[];
  currentStepIndex: number;
  onStepSelect: (stepIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onAutoPlay: () => void;
  isAutoPlaying: boolean;
  isRunning: boolean;
}

interface StepthroughVisualizationProps<TData extends StepthroughData = StepthroughData> {
  steps: StepthroughStep[];
  currentStepIndex: number;
  data: TData;
  isRunning: boolean;
  error?: string | null;
}

interface StepthroughLayoutProps<TData extends StepthroughData = StepthroughData> {
  code: string;
  onCodeChange: (code: string) => void;
  onExecute: () => void;
  onReset: () => void;
  onFileLoad: (code: string, filename: string) => void;
  filename: string;
  steps: StepthroughStep[];
  currentStepIndex: number;
  onStepSelect: (stepIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onAutoPlay: () => void;
  isAutoPlaying: boolean;
  isRunning: boolean;
  isLoading: boolean;
  data: TData;
  title: string;
  description: string;
  visualizationComponent: React.ComponentType<StepthroughVisualizationProps<TData>>;
  error?: string | null;
}

export type {
  StepthroughRequest,
  StepthroughStep,
  StepthroughResponse,
  StepthroughState,
  StepthroughHookReturn,
  StepthroughCodeEditorProps,
  StepthroughStepControlProps,
  StepthroughVisualizationProps,
  StepthroughLayoutProps,
  StepthroughData,
};
