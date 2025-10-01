import { useMutation, useQuery } from '@tanstack/react-query';
import { executeStepthrough } from '@/api';
import { StepthroughStep } from '@/types';

// Execute stepthrough mutation
export const useExecuteStepthrough = (dataType: string) => {
  return useMutation({
    mutationFn: (code: string) =>
      executeStepthrough({
        code,
        dataType,
      }),
    mutationKey: ['stepthrough', 'execute'],
  });
};

// Stepthrough data query
export const useStepthroughData = <TData>(
  executionId: string | null,
  steps: StepthroughStep[],
  currentStepIndex: number,
  isRunning: boolean,
  error: string | null,
  data: TData,
) => {
  return useQuery({
    queryKey: ['stepthrough', 'data'],
    queryFn: () =>
      Promise.resolve({
        executionId,
        steps,
        currentStepIndex,
        isRunning,
        error,
        data,
      }),
    staleTime: Infinity,
    enabled: false,
  });
};

// Current step details query
export const useCurrentStepDetails = (
  currentStepIndex: number,
  steps: StepthroughStep[],
  isAutoPlaying: boolean,
) => {
  return useQuery({
    queryKey: ['stepthrough', 'current-step'],
    queryFn: () =>
      Promise.resolve({
        stepIndex: currentStepIndex,
        currentStep: steps[currentStepIndex] || null,
        totalSteps: steps.length,
        isAutoPlaying,
      }),
    staleTime: Infinity,
    enabled: false,
  });
};

// Stepthrough state query
export const useStepthroughState = <TData, TStats>(state: {
  code: string;
  filename: string;
  steps: StepthroughStep[];
  data: TData;
  stats: TStats;
  currentStepIndex: number;
  isRunning: boolean;
  isAutoPlaying: boolean;
  executionId: string | null;
  error: string | null;
}) => {
  return useQuery({
    queryKey: ['stepthrough', 'state'],
    queryFn: () => Promise.resolve(state),
    staleTime: Infinity,
    enabled: false,
  });
};
