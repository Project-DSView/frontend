import { LinkedListData } from './LinkedList.types';
import { StackData } from './Stack.types';
import { QueueData } from './Queue.types';
import { BSTData } from './BST.types';
import { DirectedGraphData } from './DirectedGraph.types';
import { UndirectedGraphData } from './UndirectedGraph.types';

// Union type for all data structures
type StepthroughData =
  | LinkedListData
  | StackData
  | QueueData
  | BSTData
  | DirectedGraphData
  | UndirectedGraphData;

interface StepthroughRequest {
  code: string;
  dataType: string;
  inputValues?: string[];
}

interface StepthroughStep {
  stepNumber: number;
  line: number;
  code: string;
  state: {
    message: string;
    error?: string;
    input_prompt?: string;
    waiting_for_input?: boolean;
    instances?: Record<string, unknown>;
    active?: unknown;
    print_output?: string[];
    linkedlist?: unknown[];
    nodes?: Record<string, unknown>;
    variables?: Record<string, unknown>;
    returnValue?: unknown;
    ast_info?: {
      node_count?: number;
      has_input?: boolean;
      classes?: string[];
      ast_nodes?: Array<{
        type: string;
        typeDisplay?: string;
        line?: number;
        colOffset?: number;
        category?: string;
        functionName?: string;
        methodName?: string;
        objectName?: string;
        variableName?: string;
        attributeName?: string;
        className?: string;
        operator?: string;
      }>;
      executable_lines?: number[];
    };
    execution_result?: Record<string, unknown>;
    step_detail?: {
      operation: string;
      method_name?: string;
      detected_behavior?: string;
      parameters?: string;
      content?: string;
      output?: string;
      arguments?: string[];
      method_call?: boolean;
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
  status: StepStatus;
  errorMessage?: string | null;
  executedAt: string;
  createdAt: string;
  output?: string; // Full execution stdout
}

export type StepStatus = 'success' | 'error' | 'timeout' | 'waiting';

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
  debugState?: DebugState;
  inputState?: InputState;
  terminalOutput?: string; // Full terminal output
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
  // Debug mode functions
  toggleDebugMode?: () => void;
  setBreakpoint?: (line: number) => void;
  removeBreakpoint?: (line: number) => void;
  stepOver?: () => void;
  stepInto?: () => void;
  stepOut?: () => void;
  continueDebug?: () => void;
  // Input handling functions
  handleInputSubmit?: (values: string[]) => void;
  handleInputCancel?: () => void;
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
  // Debug mode props
  debugState?: DebugState;
  onBreakpointClick?: (line: number) => void;
}

interface Breakpoint {
  line: number;
  enabled: boolean;
}

interface DebugState {
  isDebugMode: boolean;
  breakpoints: Breakpoint[];
  currentDebugLine: number | null;
  isPaused: boolean;
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
  // Debug mode props
  debugState?: DebugState;
  onToggleDebugMode?: () => void;
  onSetBreakpoint?: (line: number) => void;
  onRemoveBreakpoint?: (line: number) => void;
  onStepOver?: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
  onContinue?: () => void;
}

interface StepthroughVisualizationProps<TData extends StepthroughData = StepthroughData> {
  steps: StepthroughStep[];
  currentStepIndex: number;
  data: TData;
  isRunning: boolean;
  error?: string | null;
  terminalOutput?: string; // Full terminal output to display
  astNodes?: Array<{
    type: string;
    typeDisplay?: string;
    line?: number;
    colOffset?: number;
    category?: string;
    functionName?: string;
    methodName?: string;
    objectName?: string;
    variableName?: string;
    attributeName?: string;
    className?: string;
    operator?: string;
  }>;
  currentASTNodeIndex?: number;
}

interface InputState {
  waitingForInput: boolean;
  inputPrompt: string | null;
  inputId: number | null;
  inputHistory: Array<{ prompt: string; value: string; inputId: number }>;
  inputValues?: string[]; // Pre-collected input values
  collectingInputs?: boolean; // Whether we're currently collecting inputs
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
  terminalOutput?: string; // Full terminal output
  title: string;
  description: string;
  visualizationComponent: React.ComponentType<StepthroughVisualizationProps<TData>>;
  error?: string | null;
  // Debug mode props
  debugState?: DebugState;
  onToggleDebugMode?: () => void;
  onSetBreakpoint?: (line: number) => void;
  onRemoveBreakpoint?: (line: number) => void;
  onStepOver?: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
  onContinue?: () => void;
  // Input handling props
  inputState?: InputState;
  onInputSubmit?: (values: string[]) => void;
  onInputCancel?: () => void;
  // AST Preview props
  astPreview?: {
    astNodes: Array<{
      type: string;
      typeDisplay?: string;
      line?: number;
      colOffset?: number;
      category?: string;
      functionName?: string;
      methodName?: string;
      objectName?: string;
      variableName?: string;
      attributeName?: string;
      className?: string;
      operator?: string;
    }>;
    nodeCount: number;
    hasInput: boolean;
    executableLines: number[];
    classes: string[];
    inputCalls: Array<{
      line: number;
      prompt?: string;
    }>;
  } | null;
  astPreviewLoading?: boolean;
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
  DebugState,
  Breakpoint,
  InputState,
};
