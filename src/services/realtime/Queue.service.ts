import { RealtimeQueueData, RealtimeQueueStats, RealtimeQueueOperation } from '@/types';

class QueueRealtimeService {
  private data: RealtimeQueueData;

  constructor(initialData: RealtimeQueueData) {
    this.data = { ...initialData };
  }

  getState(): RealtimeQueueData {
    return { ...this.data };
  }

  private updateStats(): RealtimeQueueStats {
    return {
      size: this.data.count,
      isEmpty: this.data.elements.length === 0,
      front: this.data.elements[0] || null,
      back: this.data.elements[this.data.elements.length - 1] || null,
    };
  }

  // Real-time operations
  enqueue(value: string): RealtimeQueueData {
    this.data.elements.push(value);
    this.data.count++;
    return this.getState();
  }

  dequeue(): RealtimeQueueData {
    if (this.data.elements.length > 0) {
      const dequeuedValue = this.data.elements[0]; // Store value before removing
      this.data.elements.shift(); // FIFO - remove from front
      this.data.count--;
      // Store dequeued element in data
      this.data.dequeuedElement = dequeuedValue;
    } else {
      this.data.dequeuedElement = null;
    }
    return this.getState();
  }

  front(): string | null {
    if (this.data.elements.length === 0) {
      return null;
    }
    return this.data.elements[0];
  }

  back(): string | null {
    if (this.data.elements.length === 0) {
      return null;
    }
    return this.data.elements[this.data.elements.length - 1];
  }

  isEmpty(): boolean {
    return this.data.elements.length === 0;
  }

  size(): number {
    return this.data.elements.length;
  }

  clear(): RealtimeQueueData {
    this.data.elements = [];
    this.data.count = 0;
    return this.getState();
  }

  // Method to set allQueues from execution result
  setAllQueues(allQueues: {
    [queueName: string]: { data: string[]; size: number; isEmpty: boolean; front: string | null; back: string | null };
  }): RealtimeQueueData {
    this.data.allQueues = allQueues;
    return this.getState();
  }

  // Parse code and extract operations
  parseCode(code: string): {
    operations: RealtimeQueueOperation[];
    queueVariables: string[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      const operations: RealtimeQueueOperation[] = [];
      const queueVariables = new Set<string>();
      const lines = code.split('\n');

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Match queue variable declarations (e.g., q1 = ArrayQueue(), q2 = ArrayQueue())
        const queueDeclMatch = trimmedLine.match(/^(\w+)\s*=\s*ArrayQueue\(\)/);
        if (queueDeclMatch) {
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');
          if (!isInsideFunction) {
            queueVariables.add(queueDeclMatch[1]);
          }
        }

        // Match enqueue calls
        const enqueueMatch = trimmedLine.match(/(\w+)\.enqueue\(['"]?([^'")]+)['"]?\)/);
        if (enqueueMatch) {
          const queueVar = enqueueMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            let param = enqueueMatch[2];
            if (!isNaN(Number(param))) {
              param = param;
            }
            operations.push({
              type: 'enqueue',
              method: 'enqueue',
              parameters: [param],
              lineNumber: index + 1,
              queueVariable: queueVar,
            });
          }
        }

        // Match dequeue calls
        const dequeueMatch = trimmedLine.match(/(\w+)\.dequeue\(\)/);
        if (dequeueMatch) {
          const queueVar = dequeueMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'dequeue',
              method: 'dequeue',
              parameters: [],
              lineNumber: index + 1,
              queueVariable: queueVar,
            });
          }
        }

        // Match front calls
        const frontMatch = trimmedLine.match(/(\w+)\.front\(\)/);
        if (frontMatch) {
          const queueVar = frontMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'front',
              method: 'front',
              parameters: [],
              lineNumber: index + 1,
              queueVariable: queueVar,
            });
          }
        }

        // Match back calls
        const backMatch = trimmedLine.match(/(\w+)\.back\(\)/);
        if (backMatch) {
          const queueVar = backMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'back',
              method: 'back',
              parameters: [],
              lineNumber: index + 1,
              queueVariable: queueVar,
            });
          }
        }
      });

      return {
        operations,
        queueVariables: Array.from(queueVariables),
        isValid: true,
        errors: [],
      };
    } catch (error) {
      return {
        operations: [],
        queueVariables: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Execute operations with queue variables
  executeOperations(
    operations: RealtimeQueueOperation[],
    queueVariables: string[],
  ): RealtimeQueueData {
    // Initialize queues
    const queues: { [key: string]: QueueRealtimeService } = {};
    queueVariables.forEach((varName) => {
      queues[varName] = new QueueRealtimeService({ elements: [], count: 0 });
    });

    let lastDequeuedElement: string | null = null;

    // Execute operations
    operations.forEach((operation) => {
      const queueVar = operation.queueVariable;
      if (queueVar && queues[queueVar]) {
        const service = queues[queueVar];
        switch (operation.method) {
          case 'enqueue':
            if (operation.parameters.length > 0) {
              service.enqueue(operation.parameters[0]);
              // Reset dequeued element when enqueueing
              lastDequeuedElement = null;
            }
            break;
          case 'dequeue':
            const dequeuedState = service.dequeue();
            lastDequeuedElement = dequeuedState.dequeuedElement || null;
            break;
          case 'front':
            service.front();
            break;
          case 'back':
            service.back();
            break;
        }
      }
    });

    // Build allQueues object
    const allQueues: {
      [queueName: string]: { data: string[]; size: number; isEmpty: boolean; front: string | null; back: string | null };
    } = {};
    Object.keys(queues).forEach((varName) => {
      const queueState = queues[varName].getState();
      allQueues[varName] = {
        data: queueState.elements,
        size: queueState.elements.length,
        isEmpty: queueState.elements.length === 0,
        front: queueState.elements[0] || null,
        back: queueState.elements[queueState.elements.length - 1] || null,
      };
    });

    // If only one queue, use it as main data
    if (queueVariables.length === 1) {
      const mainQueue = queues[queueVariables[0]].getState();
      return {
        ...mainQueue,
        dequeuedElement: lastDequeuedElement,
        allQueues,
      };
    }

    // Multiple queues - return with allQueues
    return {
      elements: [],
      count: 0,
      dequeuedElement: lastDequeuedElement,
      allQueues,
    };
  }
}

export { QueueRealtimeService };

