import { StepthroughStep } from './common.types';

interface BaseStepthroughState<TData, TStats> {
  code: string;
  filename: string;
  steps: StepthroughStep[];
  data: TData;
  stats: TStats;
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
}

interface BaseStepthroughService<TData, TStats> {
  extractDataFromSteps(steps: StepthroughStep[], stepIndex: number): TData;
  extractStatsFromSteps(steps: StepthroughStep[], stepIndex: number): TStats;
}

export type { BaseStepthroughState, BaseStepthroughHookReturn, BaseStepthroughService };
