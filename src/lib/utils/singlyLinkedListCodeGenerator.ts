import { Operation } from '@/types';

export const generateSinglyLinkedListCode = (operations: Operation[]) => {
  let code: string[] = [];

  code.push('class Node:');
  code.push('    def __init__(self, value):');
  code.push('        self.value = value');
  code.push('        self.next = None\n');

  code.push('class SinglyLinkedList:');
  code.push('    def __init__(self):');
  code.push('        self.head = None\n');

  code.push('    def insert_beginning(self, value):');
  code.push('        node = Node(value)');
  code.push('        node.next = self.head');
  code.push('        self.head = node\n');

  code.push('    def insert_end(self, value):');
  code.push('        node = Node(value)');
  code.push('        if not self.head:');
  code.push('            self.head = node');
  code.push('            return');
  code.push('        cur = self.head');
  code.push('        while cur.next:');
  code.push('            cur = cur.next');
  code.push('        cur.next = node\n');

  code.push('    def delete_beginning(self):');
  code.push('        if self.head:');
  code.push('            self.head = self.head.next\n');

  code.push('    def delete_end(self):');
  code.push('        if not self.head: return');
  code.push('        if not self.head.next:');
  code.push('            self.head = None');
  code.push('            return');
  code.push('        cur = self.head');
  code.push('        while cur.next.next:');
  code.push('            cur = cur.next');
  code.push('        cur.next = None\n');

  code.push('    def traverse(self):');
  code.push('        cur = self.head');
  code.push('        result = []');
  code.push('        while cur:');
  code.push('            result.append(cur.value)');
  code.push('            cur = cur.next');
  code.push('        return result\n');

  code.push('ll = SinglyLinkedList()\n');

  operations.forEach((op) => {
    switch (op.type) {
      case 'insert_beginning':
        code.push(`ll.insert_beginning(${JSON.stringify(op.value)})`);
        break;
      case 'insert_end':
        code.push(`ll.insert_end(${JSON.stringify(op.value)})`);
        break;
      case 'delete_beginning':
        code.push('ll.delete_beginning()');
        break;
      case 'delete_end':
        code.push('ll.delete_end()');
        break;
      case 'traverse':
        code.push('print("Traverse:", ll.traverse())');
        break;
    }
  });

  code.push('\nprint("Final Linked List:", ll.traverse())');

  return code.join('\n');
};
