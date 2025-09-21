import { Operation, DragComponent, DataStructureStats } from '../common.types';

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

export type {
  StackElement,
  StackState,
  StackOperation,
  StackDragComponent,
  StackExecutionStep,
  StackCodeTemplate,
};
