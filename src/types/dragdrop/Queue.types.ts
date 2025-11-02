import { Operation, DragComponent, DataStructureStats } from './common.types';
import { BaseStats, BaseState } from './base.types';

interface QueueElement {
  data: string;
  index: number;
}

interface QueueState {
  elements: string[];
  operations: Operation[];
  stats: DataStructureStats;
}

interface QueueOperation extends Operation {
  type: 'enqueue' | 'dequeue' | 'front' | 'back' | 'is_empty' | 'size';
}

interface QueueDragComponent extends DragComponent {
  type: QueueOperation['type'];
  description: string;
}

interface QueueExecutionStep {
  step: string;
  description: string;
  duration: number;
}

interface QueueCodeTemplate {
  classDefinition: string;
  methods: {
    [key in QueueOperation['type']]: string;
  };
  usage: string;
}

// Queue-specific types
interface QueueData {
  elements: string[];
  count: number;
}

interface QueueStatsExtended extends BaseStats {
  frontValue: string | null;
  backValue: string | null;
}

interface QueueStateExtended extends BaseState<QueueData, QueueStatsExtended> {
  data: QueueData;
  stats: QueueStatsExtended;
}

export type {
  QueueElement,
  QueueState,
  QueueOperation,
  QueueDragComponent,
  QueueExecutionStep,
  QueueCodeTemplate,
  QueueData,
  QueueStatsExtended,
  QueueStateExtended,
};

