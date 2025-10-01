import { Operation, DragComponent, DataStructureStats } from './common.types';
import { BaseStats, BaseState } from './base.types';

interface StackElement {
  data: string;
  index: number;
}

interface StackState {
  elements: string[];
  operations: Operation[];
  stats: DataStructureStats;
}

interface StackOperation extends Operation {
  type: 'push' | 'pop' | 'peek' | 'is_empty' | 'size';
}

interface StackDragComponent extends DragComponent {
  type: StackOperation['type'];
  description: string;
}

interface StackExecutionStep {
  step: string;
  description: string;
  duration: number;
}

interface StackCodeTemplate {
  classDefinition: string;
  methods: {
    [key in StackOperation['type']]: string;
  };
  usage: string;
}

// Stack-specific types
interface StackData {
  elements: string[];
}

interface StackStatsExtended extends BaseStats {
  headValue: string | null;
  tailValue: string | null;
}

interface StackStateExtended extends BaseState<StackData, StackStatsExtended> {
  data: StackData;
  stats: StackStatsExtended;
}

export type {
  StackElement,
  StackState,
  StackOperation,
  StackDragComponent,
  StackExecutionStep,
  StackCodeTemplate,
  StackData,
  StackStatsExtended,
  StackStateExtended,
};
