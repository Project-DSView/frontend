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
  node_class?: string; // Class name of node (e.g., "DataNode")
  list_class?: string; // Class name of list (e.g., "SinglyLinkedList")
  data_attr?: string; // Node's data attribute (e.g., "name")
  next_attr?: string; // Node's next pointer (e.g., "next")
  prev_attr?: string; // Node's prev pointer for doubly linked
  head_attr?: string; // List's head pointer (e.g., "head")
  tail_attr?: string; // List's tail pointer (e.g., "tail")
  count_attr?: string; // List's size counter (e.g., "count")
}

interface LinkedListData {
  nodes: string[];
  head: string | null;
  tail: string | null;
  count: number;
  classMetadata?: ClassMetadata;
}

export type { LinkedListData, ClassMetadata };
