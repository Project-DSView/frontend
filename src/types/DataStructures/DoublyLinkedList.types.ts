import { Operation, DragComponent, DataStructureStats } from '../common.types';
import { BaseStats, BaseState } from './base.types';

interface DoublyLinkedListNode {
  data: string;
  next: DoublyLinkedListNode | null;
  prev: DoublyLinkedListNode | null;
}

interface DoublyLinkedListState {
  nodes: string[];
  operations: Operation[];
  stats: DataStructureStats;
}

interface DoublyLinkedListOperation extends Operation {
  type:
    | 'insert_beginning'
    | 'insert_end'
    | 'insert_position'
    | 'insert_before_position'
    | 'delete_beginning'
    | 'delete_end'
    | 'delete_value'
    | 'delete_position'
    | 'delete_before_position'
    | 'traverse_forward'
    | 'traverse_backward'
    | 'search_value'
    | 'search_position'
    | 'update_value'
    | 'update_position';
}

interface DoublyLinkedListDragComponent extends DragComponent {
  type: DoublyLinkedListOperation['type'];
  description: string;
}

interface DoublyLinkedListExecutionStep {
  step: string;
  description: string;
  duration: number;
}

interface DoublyLinkedListCodeTemplate {
  classDefinition: string;
  methods: {
    [key in DoublyLinkedListOperation['type']]: string;
  };
  usage: string;
}

// DoublyLinkedList-specific types
interface DoublyLinkedListData {
  nodes: string[];
}

interface DoublyLinkedListStatsExtended extends BaseStats {
  headValue: string | null;
  tailValue: string | null;
}

interface DoublyLinkedListStateExtended extends BaseState<DoublyLinkedListData, DoublyLinkedListStatsExtended> {
  data: DoublyLinkedListData;
  stats: DoublyLinkedListStatsExtended;
}

export type {
  DoublyLinkedListNode,
  DoublyLinkedListState,
  DoublyLinkedListOperation,
  DoublyLinkedListDragComponent,
  DoublyLinkedListExecutionStep,
  DoublyLinkedListCodeTemplate,
  DoublyLinkedListData,
  DoublyLinkedListStatsExtended,
  DoublyLinkedListStateExtended,
};
