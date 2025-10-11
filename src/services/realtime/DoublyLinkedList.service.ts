import {
  RealtimeDoublyLinkedListNode,
  RealtimeDoublyLinkedListData,
  RealtimeDoublyLinkedListStats,
  RealtimeDoublyLinkedListOperation,
} from '@/types';

class DoublyLinkedListRealtimeService {
  private data: RealtimeDoublyLinkedListData;

  constructor(initialData: RealtimeDoublyLinkedListData) {
    this.data = { ...initialData };
  }

  getState(): RealtimeDoublyLinkedListData {
    return { ...this.data };
  }

  private updateStats(): RealtimeDoublyLinkedListStats {
    return {
      size: this.data.count,
      isEmpty: this.data.head === null,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  // Real-time operations
  insertFront(value: string): RealtimeDoublyLinkedListData {
    const newNode: RealtimeDoublyLinkedListNode = {
      value,
      next: this.data.head,
      prev: null,
      id: this.generateId(),
    };

    if (this.data.head) {
      this.data.head.prev = newNode;
    }

    this.data.head = newNode;
    if (!this.data.tail) {
      this.data.tail = newNode;
    }
    this.data.count++;

    return this.getState();
  }

  insertLast(value: string): RealtimeDoublyLinkedListData {
    const newNode: RealtimeDoublyLinkedListNode = {
      value,
      next: null,
      prev: this.data.tail,
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

  insertBefore(targetValue: string, value: string): RealtimeDoublyLinkedListData {
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
      const newNode: RealtimeDoublyLinkedListNode = {
        value,
        next: current.next,
        prev: current,
        id: this.generateId(),
      };
      current.next.prev = newNode;
      current.next = newNode;
      this.data.count++;
    }

    return this.getState();
  }

  insertAfter(targetValue: string, value: string): RealtimeDoublyLinkedListData {
    if (!this.data.head) {
      return this.getState();
    }

    let current: RealtimeDoublyLinkedListNode | null = this.data.head;
    while (current && current.value !== targetValue) {
      current = current.next;
    }

    if (current) {
      const newNode: RealtimeDoublyLinkedListNode = {
        value,
        next: current.next,
        prev: current,
        id: this.generateId(),
      };

      if (current.next) {
        current.next.prev = newNode;
      } else {
        this.data.tail = newNode;
      }
      current.next = newNode;
      this.data.count++;
    }

    return this.getState();
  }

  delete(value: string): RealtimeDoublyLinkedListData {
    if (!this.data.head) {
      return this.getState();
    }

    if (this.data.head.value === value) {
      this.data.head = this.data.head.next;
      if (this.data.head) {
        this.data.head.prev = null;
      } else {
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
      if (current.next) {
        current.next.prev = current;
      } else {
        this.data.tail = current;
      }
      this.data.count--;
    }

    return this.getState();
  }

  deleteFront(): RealtimeDoublyLinkedListData {
    if (!this.data.head) {
      return this.getState();
    }

    this.data.head = this.data.head.next;
    if (this.data.head) {
      this.data.head.prev = null;
    } else {
      this.data.tail = null;
    }
    this.data.count--;

    return this.getState();
  }

  deleteLast(): RealtimeDoublyLinkedListData {
    if (!this.data.head) {
      return this.getState();
    }

    if (this.data.head === this.data.tail) {
      this.data.head = null;
      this.data.tail = null;
    } else {
      this.data.tail = this.data.tail!.prev;
      if (this.data.tail) {
        this.data.tail.next = null;
      }
    }
    this.data.count--;

    return this.getState();
  }

  traverseForward(): string[] {
    const result: string[] = [];
    let current = this.data.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  traverseBackward(): string[] {
    const result: string[] = [];
    let current = this.data.tail;
    while (current) {
      result.push(current.value);
      current = current.prev;
    }
    return result;
  }

  search(value: string): boolean {
    let current = this.data.head;
    while (current) {
      if (current.value === value) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Parse code and extract operations
  parseCode(code: string): {
    operations: RealtimeDoublyLinkedListOperation[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      const operations: RealtimeDoublyLinkedListOperation[] = [];
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

        // Match insertAfter calls
        const insertAfterMatch = trimmedLine.match(
          /\.insertAfter\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
        );
        if (insertAfterMatch) {
          operations.push({
            type: 'insertAfter',
            method: 'insertAfter',
            parameters: [insertAfterMatch[1], insertAfterMatch[2]],
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

        // Match deleteFront calls
        const deleteFrontMatch = trimmedLine.match(/\.deleteFront\(\)/);
        if (deleteFrontMatch) {
          operations.push({
            type: 'deleteFront',
            method: 'deleteFront',
            parameters: [],
            lineNumber: index + 1,
          });
        }

        // Match deleteLast calls
        const deleteLastMatch = trimmedLine.match(/\.deleteLast\(\)/);
        if (deleteLastMatch) {
          operations.push({
            type: 'deleteLast',
            method: 'deleteLast',
            parameters: [],
            lineNumber: index + 1,
          });
        }

        // Match traverseForward calls
        const traverseForwardMatch = trimmedLine.match(/\.traverseForward\(\)/);
        if (traverseForwardMatch) {
          operations.push({
            type: 'traverseForward',
            method: 'traverseForward',
            parameters: [],
            lineNumber: index + 1,
          });
        }

        // Match traverseBackward calls
        const traverseBackwardMatch = trimmedLine.match(/\.traverseBackward\(\)/);
        if (traverseBackwardMatch) {
          operations.push({
            type: 'traverseBackward',
            method: 'traverseBackward',
            parameters: [],
            lineNumber: index + 1,
          });
        }

        // Match search calls
        const searchMatch = trimmedLine.match(/\.search\(['"]([^'"]+)['"]\)/);
        if (searchMatch) {
          operations.push({
            type: 'search',
            method: 'search',
            parameters: [searchMatch[1]],
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
  executeOperations(operations: RealtimeDoublyLinkedListOperation[]): RealtimeDoublyLinkedListData {
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
        case 'insertAfter':
          this.insertAfter(operation.parameters[0], operation.parameters[1]);
          break;
        case 'delete':
          this.delete(operation.parameters[0]);
          break;
        case 'deleteFront':
          this.deleteFront();
          break;
        case 'deleteLast':
          this.deleteLast();
          break;
        case 'traverseForward':
          this.traverseForward();
          break;
        case 'traverseBackward':
          this.traverseBackward();
          break;
        case 'search':
          this.search(operation.parameters[0]);
          break;
      }
    });

    return this.getState();
  }
}

export default DoublyLinkedListRealtimeService;
