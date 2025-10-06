import {
  RealtimeSinglyLinkedListNode,
  RealtimeSinglyLinkedListData,
  RealtimeSinglyLinkedListStats,
  RealtimeSinglyLinkedListOperation,
} from '@/types';

export class SinglyLinkedListRealtimeService {
  private data: RealtimeSinglyLinkedListData;

  constructor(initialData: RealtimeSinglyLinkedListData) {
    this.data = { ...initialData };
  }

  getState(): RealtimeSinglyLinkedListData {
    return { ...this.data };
  }

  private updateStats(): RealtimeSinglyLinkedListStats {
    return {
      size: this.data.count,
      isEmpty: this.data.head === null,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  // Real-time operations
  insertFront(value: string): RealtimeSinglyLinkedListData {
    const newNode: RealtimeSinglyLinkedListNode = {
      value,
      next: this.data.head,
      id: this.generateId(),
    };

    this.data.head = newNode;
    if (!this.data.tail) {
      this.data.tail = newNode;
    }
    this.data.count++;

    return this.getState();
  }

  insertLast(value: string): RealtimeSinglyLinkedListData {
    const newNode: RealtimeSinglyLinkedListNode = {
      value,
      next: null,
      id: this.generateId(),
    };

    if (!this.data.head) {
      this.data.head = newNode;
      this.data.tail = newNode;
    } else {
      this.data.tail!.next = newNode;
      this.data.tail = newNode;
    }
    this.data.count++;

    return this.getState();
  }

  insertBefore(targetValue: string, value: string): RealtimeSinglyLinkedListData {
    if (!this.data.head) {
      return this.getState();
    }

    if (this.data.head.value === targetValue) {
      return this.insertFront(value);
    }

    let current = this.data.head;
    while (current.next && current.next.value !== targetValue) {
      current = current.next;
    }

    if (current.next) {
      const newNode: RealtimeSinglyLinkedListNode = {
        value,
        next: current.next,
        id: this.generateId(),
      };
      current.next = newNode;
      this.data.count++;
    }

    return this.getState();
  }

  delete(value: string): RealtimeSinglyLinkedListData {
    if (!this.data.head) {
      return this.getState();
    }

    if (this.data.head.value === value) {
      this.data.head = this.data.head.next;
      if (!this.data.head) {
        this.data.tail = null;
      }
      this.data.count--;
      return this.getState();
    }

    let current = this.data.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }

    if (current.next) {
      current.next = current.next.next;
      if (!current.next) {
        this.data.tail = current;
      }
      this.data.count--;
    }

    return this.getState();
  }

  traverse(): string[] {
    const result: string[] = [];
    let current = this.data.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  // Parse code and extract operations
  parseCode(code: string): {
    operations: RealtimeSinglyLinkedListOperation[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      // Simple regex-based parsing for now
      const operations: RealtimeSinglyLinkedListOperation[] = [];
      const lines = code.split('\n');

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Match insertFront calls
        const insertFrontMatch = trimmedLine.match(/\.insertFront\(['"]([^'"]+)['"]\)/);
        if (insertFrontMatch) {
          operations.push({
            type: 'insertFront',
            method: 'insertFront',
            parameters: [insertFrontMatch[1]],
            lineNumber: index + 1,
          });
        }

        // Match insertLast calls
        const insertLastMatch = trimmedLine.match(/\.insertLast\(['"]([^'"]+)['"]\)/);
        if (insertLastMatch) {
          operations.push({
            type: 'insertLast',
            method: 'insertLast',
            parameters: [insertLastMatch[1]],
            lineNumber: index + 1,
          });
        }

        // Match insertBefore calls
        const insertBeforeMatch = trimmedLine.match(
          /\.insertBefore\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
        );
        if (insertBeforeMatch) {
          operations.push({
            type: 'insertBefore',
            method: 'insertBefore',
            parameters: [insertBeforeMatch[1], insertBeforeMatch[2]],
            lineNumber: index + 1,
          });
        }

        // Match delete calls
        const deleteMatch = trimmedLine.match(/\.delete\(['"]([^'"]+)['"]\)/);
        if (deleteMatch) {
          operations.push({
            type: 'delete',
            method: 'delete',
            parameters: [deleteMatch[1]],
            lineNumber: index + 1,
          });
        }

        // Match traverse calls
        const traverseMatch = trimmedLine.match(/\.traverse\(\)/);
        if (traverseMatch) {
          operations.push({
            type: 'traverse',
            method: 'traverse',
            parameters: [],
            lineNumber: index + 1,
          });
        }
      });

      return {
        operations,
        isValid: true,
        errors: [],
      };
    } catch (error) {
      return {
        operations: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Execute operations from parsed code
  executeOperations(operations: RealtimeSinglyLinkedListOperation[]): RealtimeSinglyLinkedListData {
    operations.forEach((operation) => {
      switch (operation.type) {
        case 'insertFront':
          this.insertFront(operation.parameters[0]);
          break;
        case 'insertLast':
          this.insertLast(operation.parameters[0]);
          break;
        case 'insertBefore':
          this.insertBefore(operation.parameters[0], operation.parameters[1]);
          break;
        case 'delete':
          this.delete(operation.parameters[0]);
          break;
        case 'traverse':
          this.traverse();
          break;
      }
    });

    return this.getState();
  }
}
