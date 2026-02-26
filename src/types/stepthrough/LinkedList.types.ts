// Metadata about user-defined class attributes for dynamic labels
interface ClassMetadata {
  classes?: Record<
    string,
    {
      name: string;
      attributes: Record<string, { name: string; role: string }>;
      methods: string[];
    }
  >;
  node_class?: string;
  list_class?: string;
  data_attr?: string;
  next_attr?: string;
  prev_attr?: string;
  head_attr?: string;
  tail_attr?: string;
  count_attr?: string;
}

interface LinkedListData {
  nodes: string[];
  head: string | null;
  tail: string | null;
  count: number;
  classMetadata?: ClassMetadata;
}

interface StepNodeState {
  nodes: string[];
  currentInsertedValue: string | null;
  insertHistory: string[];
  pendingNodes?: Array<{ variable: string; value: string }>;
  visitedTraverseNodes?: number[];
  isInTraverseSequence?: boolean;
}

export type { LinkedListData, ClassMetadata, StepNodeState };
