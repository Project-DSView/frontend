import { Operation, DragComponent, DataStructureStats } from './common.types';
import { BaseStats, BaseState } from './base.types';

interface SinglyLinkedListNode {
  data: string;
  next: SinglyLinkedListNode | null;
}

interface SinglyLinkedListState {
  nodes: string[];
  operations: Operation[];
  stats: DataStructureStats;
}

interface SinglyLinkedListOperation extends Operation {
  type:
    | 'insert_beginning'
    | 'insert_end'
    | 'insert_position'
    | 'delete_beginning'
    | 'delete_end'
    | 'delete_value'
    | 'delete_position'
    | 'traverse'
    | 'search_value'
    | 'search_position'
    | 'update_value'
    | 'update_position';
}

interface SinglyLinkedListDragComponent extends DragComponent {
  type: SinglyLinkedListOperation['type'];
  description: string;
}

interface SinglyLinkedListExecutionStep {
  step: string;
  description: string;
  duration: number;
}

interface SinglyLinkedListCodeTemplate {
  classDefinition: string;
  methods: {
    [key in SinglyLinkedListOperation['type']]: string;
  };
  usage: string;
}

// SinglyLinkedList-specific types
interface SinglyLinkedListData {
  nodes: string[];
}

interface SinglyLinkedListStatsExtended extends BaseStats {
  headValue: string | null;
  tailValue: string | null;
}

interface SinglyLinkedListStateExtended
  extends BaseState<SinglyLinkedListData, SinglyLinkedListStatsExtended> {
  data: SinglyLinkedListData;
  stats: SinglyLinkedListStatsExtended;
}

export type {
  SinglyLinkedListNode,
  SinglyLinkedListState,
  SinglyLinkedListOperation,
  SinglyLinkedListDragComponent,
  SinglyLinkedListExecutionStep,
  SinglyLinkedListCodeTemplate,
  SinglyLinkedListData,
  SinglyLinkedListStatsExtended,
  SinglyLinkedListStateExtended,
};
