import { StepthroughStep, DebugState, ComplexityAnalysis } from './common.types';

interface BaseStepthroughState<TData, TStats> {
  code: string;
  filename: string;
  steps: StepthroughStep[];
  data: TData;
  stats: TStats;
  debugState?: DebugState;
  terminalOutput?: string;
}

interface InputState {
  waitingForInput: boolean;
  inputPrompt: string | null;
  inputId: number | null;
  inputHistory: Array<{ prompt: string; value: string; inputId: number }>;
  inputValues?: string[];
  collectingInputs?: boolean;
}

interface BaseStepthroughHookReturn<TData, TStats> {
  state: {
    code: string;
    filename: string;
    steps: StepthroughStep[];
    currentStepIndex: number;
    isRunning: boolean;
    isAutoPlaying: boolean;
    executionId: string | null;
    error: string | null;
    data: TData;
    stats: TStats;
    debugState?: DebugState;
    inputState?: InputState;
    terminalOutput?: string;
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
    complexity?: ComplexityAnalysis | null;
  };
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

interface BaseStepthroughService<TData, TStats> {
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): TData;
  extractStatsFromSteps(steps: StepthroughStep[], stepIndex: number): TStats;
}

export type { BaseStepthroughState, BaseStepthroughHookReturn, BaseStepthroughService, InputState };
