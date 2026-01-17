import {
  bstDragDropBaseTemplate,
  stackDragDropBaseTemplate,
  queueDragDropBaseTemplate,
  singlyLinkedListDragDropBaseTemplate,
  doublyLinkedListDragDropBaseTemplate,
  directedGraphDragDropBaseTemplate,
  undirectedGraphDragDropBaseTemplate,
} from '@/data/template/code.data';

import { DragDropOperation } from '@/types';

// Helper Functions
const toPyValue = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return 'None';
  if (typeof v === 'number') return String(v);
  const num = Number(v);
  if (!isNaN(num)) return String(num);
  return JSON.stringify(String(v));
};

// =============================================================================
// BST Code Generator
// =============================================================================

export const generateDragDropBSTCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    bstDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myBST = BST()',
    '',
  ];

  operations.forEach((op, idx) => {
    const value = op.value ? parseFloat(op.value) : null;
    if (value === null && !op.type.startsWith('traverse')) return;

    switch (op.type) {
      case 'insert':
        lines.push(`# Step ${idx + 1}: Insert ${value}`);
        lines.push(`myBST.insert(${value})`);
        break;
      case 'delete':
        lines.push(`# Step ${idx + 1}: Delete ${value}`);
        lines.push(`myBST.delete(${value})`);
        break;
      case 'search':
        lines.push(`# Step ${idx + 1}: Search ${value}`);
        lines.push(`print("Search ${value}:", myBST.search(${value}))`);
        break;
      case 'traverse_inorder':
        lines.push(`# Step ${idx + 1}: Inorder Traversal`);
        lines.push('print("Inorder:", myBST.inorder())');
        break;
      case 'traverse_preorder':
        lines.push(`# Step ${idx + 1}: Preorder Traversal`);
        lines.push('print("Preorder:", myBST.preorder())');
        break;
      case 'traverse_postorder':
        lines.push(`# Step ${idx + 1}: Postorder Traversal`);
        lines.push('print("Postorder:", myBST.postorder())');
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final tree state');
    lines.push('print("Final Inorder:", myBST.inorder())');
  }

  return lines.join('\n');
};

// =============================================================================
// Stack Code Generator
// =============================================================================

export const generateDragDropStackCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    stackDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myStack = ArrayStack()',
    '',
  ];

  operations.forEach((op, idx) => {
    switch (op.type) {
      case 'push':
        lines.push(`# Step ${idx + 1}: Push ${toPyValue(op.value)}`);
        lines.push(`myStack.push(${toPyValue(op.value)})`);
        break;
      case 'pop':
        lines.push(`# Step ${idx + 1}: Pop`);
        lines.push('popped = myStack.pop()');
        lines.push('print("Popped:", popped)');
        break;
      case 'peek':
        lines.push(`# Step ${idx + 1}: Peek`);
        lines.push('print("Top:", myStack.peek())');
        break;
      case 'is_empty':
        lines.push(`# Step ${idx + 1}: Check if empty`);
        lines.push('print("Is Empty:", myStack.is_empty())');
        break;
      case 'size':
        lines.push(`# Step ${idx + 1}: Get size`);
        lines.push('print("Size:", myStack.size())');
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final stack state');
    lines.push('myStack.print_stack()');
  }

  return lines.join('\n');
};

// =============================================================================
// Queue Code Generator
// =============================================================================

export const generateDragDropQueueCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    queueDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myQueue = ArrayQueue()',
    '',
  ];

  operations.forEach((op, idx) => {
    switch (op.type) {
      case 'enqueue':
        lines.push(`# Step ${idx + 1}: Enqueue ${toPyValue(op.value)}`);
        lines.push(`myQueue.enqueue(${toPyValue(op.value)})`);
        break;
      case 'dequeue':
        lines.push(`# Step ${idx + 1}: Dequeue`);
        lines.push('dequeued = myQueue.dequeue()');
        lines.push('print("Dequeued:", dequeued)');
        break;
      case 'front':
        lines.push(`# Step ${idx + 1}: Get front`);
        lines.push('print("Front:", myQueue.front())');
        break;
      case 'back':
        lines.push(`# Step ${idx + 1}: Get back`);
        lines.push('print("Back:", myQueue.back())');
        break;
      case 'is_empty':
        lines.push(`# Step ${idx + 1}: Check if empty`);
        lines.push('print("Is Empty:", myQueue.is_empty())');
        break;
      case 'size':
        lines.push(`# Step ${idx + 1}: Get size`);
        lines.push('print("Size:", myQueue.size())');
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final queue state');
    lines.push('myQueue.print_queue()');
  }

  return lines.join('\n');
};

// =============================================================================
// Singly Linked List Code Generator
// =============================================================================

export const generateDragDropSinglyLinkedListCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    singlyLinkedListDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myList = SinglyLinkedList()',
    '',
  ];

  operations.forEach((op, idx) => {
    switch (op.type) {
      case 'insert_beginning':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Insert ${toPyValue(op.value)} at beginning`);
          lines.push(`myList.insert_beginning(${toPyValue(op.value)})`);
        }
        break;
      case 'insert_end':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Insert ${toPyValue(op.value)} at end`);
          lines.push(`myList.insert_end(${toPyValue(op.value)})`);
        }
        break;
      case 'insert_position':
        if (op.value && op.position) {
          lines.push(`# Step ${idx + 1}: Insert ${toPyValue(op.value)} at position ${op.position}`);
          lines.push(`myList.insert_position(${toPyValue(op.value)}, ${op.position})`);
        }
        break;
      case 'delete_beginning':
        lines.push(`# Step ${idx + 1}: Delete from beginning`);
        lines.push('myList.delete_beginning()');
        break;
      case 'delete_end':
        lines.push(`# Step ${idx + 1}: Delete from end`);
        lines.push('myList.delete_end()');
        break;
      case 'delete_position':
        if (op.position) {
          lines.push(`# Step ${idx + 1}: Delete at position ${op.position}`);
          lines.push(`myList.delete_position(${op.position})`);
        }
        break;
      case 'traverse':
        lines.push(`# Step ${idx + 1}: Traverse`);
        lines.push('print("List:", myList.traverse())');
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final list state');
    lines.push('print("Final List:", myList.traverse())');
  }

  return lines.join('\n');
};

// =============================================================================
// Doubly Linked List Code Generator
// =============================================================================

export const generateDragDropDoublyLinkedListCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    doublyLinkedListDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myList = DoublyLinkedList()',
    '',
  ];

  operations.forEach((op, idx) => {
    switch (op.type) {
      case 'insert_beginning':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Insert ${toPyValue(op.value)} at beginning`);
          lines.push(`myList.insert_beginning(${toPyValue(op.value)})`);
        }
        break;
      case 'insert_end':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Insert ${toPyValue(op.value)} at end`);
          lines.push(`myList.insert_end(${toPyValue(op.value)})`);
        }
        break;
      case 'insert_position':
        if (op.value && op.position) {
          lines.push(`# Step ${idx + 1}: Insert ${toPyValue(op.value)} at position ${op.position}`);
          lines.push(`myList.insert_position(${toPyValue(op.value)}, ${op.position})`);
        }
        break;
      case 'delete_beginning':
        lines.push(`# Step ${idx + 1}: Delete from beginning`);
        lines.push('myList.delete_beginning()');
        break;
      case 'delete_end':
        lines.push(`# Step ${idx + 1}: Delete from end`);
        lines.push('myList.delete_end()');
        break;
      case 'delete_position':
        if (op.position) {
          lines.push(`# Step ${idx + 1}: Delete at position ${op.position}`);
          lines.push(`myList.delete_position(${op.position})`);
        }
        break;
      case 'update_position':
        if (op.position && op.newValue) {
          lines.push(
            `# Step ${idx + 1}: Update position ${op.position} to ${toPyValue(op.newValue)}`,
          );
          lines.push(`myList.update_position(${op.position}, ${toPyValue(op.newValue)})`);
        }
        break;
      case 'traverse_forward':
        lines.push(`# Step ${idx + 1}: Traverse forward`);
        lines.push('print("Forward:", myList.traverse_forward())');
        break;
      case 'traverse_backward':
        lines.push(`# Step ${idx + 1}: Traverse backward`);
        lines.push('print("Backward:", myList.traverse_backward())');
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final list state');
    lines.push('print("Final Forward:", myList.traverse_forward())');
    lines.push('print("Final Backward:", myList.traverse_backward())');
  }

  return lines.join('\n');
};

// =============================================================================
// Directed Graph Code Generator
// =============================================================================

export const generateDragDropDirectedGraphCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    directedGraphDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myGraph = DirectedGraph()',
    '',
  ];

  operations.forEach((op, idx) => {
    switch (op.type) {
      case 'add_vertex':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Add vertex "${op.value}"`);
          lines.push(`myGraph.add_vertex("${op.value}")`);
        }
        break;
      case 'add_edge':
        if (op.fromVertex && op.toVertex) {
          lines.push(`# Step ${idx + 1}: Add edge ${op.fromVertex} -> ${op.toVertex}`);
          lines.push(`myGraph.add_edge("${op.fromVertex}", "${op.toVertex}")`);
        }
        break;
      case 'remove_vertex':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Remove vertex "${op.value}"`);
          lines.push(`myGraph.remove_vertex("${op.value}")`);
        }
        break;
      case 'remove_edge':
        if (op.fromVertex && op.toVertex) {
          lines.push(`# Step ${idx + 1}: Remove edge ${op.fromVertex} -> ${op.toVertex}`);
          lines.push(`myGraph.remove_edge("${op.fromVertex}", "${op.toVertex}")`);
        }
        break;
      case 'traversal_bfs':
        if (op.startVertex) {
          lines.push(`# Step ${idx + 1}: BFS from "${op.startVertex}"`);
          lines.push(`print("BFS:", myGraph.bfs("${op.startVertex}"))`);
        }
        break;
      case 'traversal_dfs':
        if (op.startVertex) {
          lines.push(`# Step ${idx + 1}: DFS from "${op.startVertex}"`);
          lines.push(`print("DFS:", myGraph.dfs("${op.startVertex}"))`);
        }
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final graph state');
    lines.push('myGraph.display()');
  }

  return lines.join('\n');
};

// =============================================================================
// Undirected Graph Code Generator
// =============================================================================

export const generateDragDropUndirectedGraphCode = (operations: DragDropOperation[]): string => {
  const lines: string[] = [
    undirectedGraphDragDropBaseTemplate,
    '',
    '# === User Operations ===',
    'myGraph = UndirectedGraph()',
    '',
  ];

  operations.forEach((op, idx) => {
    switch (op.type) {
      case 'add_vertex':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Add vertex "${op.value}"`);
          lines.push(`myGraph.add_vertex("${op.value}")`);
        }
        break;
      case 'add_edge':
        if (op.fromVertex && op.toVertex) {
          lines.push(`# Step ${idx + 1}: Add edge ${op.fromVertex} -- ${op.toVertex}`);
          lines.push(`myGraph.add_edge("${op.fromVertex}", "${op.toVertex}")`);
        }
        break;
      case 'remove_vertex':
        if (op.value) {
          lines.push(`# Step ${idx + 1}: Remove vertex "${op.value}"`);
          lines.push(`myGraph.remove_vertex("${op.value}")`);
        }
        break;
      case 'remove_edge':
        if (op.fromVertex && op.toVertex) {
          lines.push(`# Step ${idx + 1}: Remove edge ${op.fromVertex} -- ${op.toVertex}`);
          lines.push(`myGraph.remove_edge("${op.fromVertex}", "${op.toVertex}")`);
        }
        break;
      case 'traversal_bfs':
        if (op.startVertex) {
          lines.push(`# Step ${idx + 1}: BFS from "${op.startVertex}"`);
          lines.push(`print("BFS:", myGraph.bfs("${op.startVertex}"))`);
        }
        break;
      case 'traversal_dfs':
        if (op.startVertex) {
          lines.push(`# Step ${idx + 1}: DFS from "${op.startVertex}"`);
          lines.push(`print("DFS:", myGraph.dfs("${op.startVertex}"))`);
        }
        break;
    }
    lines.push('');
  });

  if (operations.length > 0) {
    lines.push('# Final graph state');
    lines.push('myGraph.display()');
  }

  return lines.join('\n');
};
