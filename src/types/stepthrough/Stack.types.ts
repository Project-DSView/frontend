interface StackData {
  elements: string[];
  count: number;
  allStacks?: {
    [stackName: string]: { data: string[]; size: number; isEmpty: boolean; top: string | null };
  };
}

interface StackInstanceData {
  data: unknown[];
  size?: number;
  isEmpty?: boolean;
  top?: unknown;
}

interface StackStepDetail {
  operation?: string;
  after_data?: unknown[];
  before_data?: unknown[];
  value?: unknown[];
  size?: number;
  instance_name?: string;
}

export type { StackData, StackInstanceData, StackStepDetail };
