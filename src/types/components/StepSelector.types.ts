interface Operation {
  id: number;
  type: string;
  name: string;
  value?: string | null;
  position?: string | null;
  newValue?: string | null;
  color: string;
  category: string;
}

interface StepSelectorProps {
  operations: Operation[];
  selectedStep: number | null;
  onStepSelect: (stepIndex: number) => void;
  getStepDescription: (operation: Operation) => string;
  onPrevious?: () => void;
  onNext?: () => void;
  onAutoPlay?: () => void;
  isAutoPlaying?: boolean;
}

export type { StepSelectorProps };
