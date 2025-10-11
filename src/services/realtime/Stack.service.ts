import { RealtimeStackData, RealtimeStackStats, RealtimeStackOperation } from '@/types';

class StackRealtimeService {
  private data: RealtimeStackData;

  constructor(initialData: RealtimeStackData) {
    this.data = { ...initialData };
  }

  getState(): RealtimeStackData {
    return { ...this.data };
  }

  private updateStats(): RealtimeStackStats {
    return {
      size: this.data.count,
      isEmpty: this.data.elements.length === 0,
    };
  }

  // Real-time operations
  push(value: string): RealtimeStackData {
    this.data.elements.push(value);
    this.data.count++;
    return this.getState();
  }

  pop(): RealtimeStackData {
    if (this.data.elements.length > 0) {
      this.data.elements.pop();
      this.data.count--;
    }
    return this.getState();
  }

  peek(): string | null {
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

  clear(): RealtimeStackData {
    this.data.elements = [];
    this.data.count = 0;
    return this.getState();
  }

  // Copy stack operation - creates a copy of current stack
  copyStack(): RealtimeStackData {
    // Create a copy of current stack for s1
    const s1Copy = [...this.data.elements];
    // Create an empty stack for s2 initially
    const s2Copy: string[] = [];

    // Simulate the copyStack algorithm
    const newStack: string[] = [];

    // Step 1: Move data from s1 to newStack (reversing order)
    while (s1Copy.length > 0) {
      const data = s1Copy.pop()!;
      newStack.push(data);
    }

    // Step 2: Move data back from newStack to both s1 and s2
    while (newStack.length > 0) {
      const data = newStack.pop()!;
      s1Copy.push(data);
      s2Copy.push(data);
    }

    // Update the data with both stacks
    this.data.stacks = {
      s1: s1Copy,
      s2: s2Copy,
    };
    this.data.currentOperation = 'copyStack';

    return this.getState();
  }

  // Method to set allStacks from execution result
  setAllStacks(allStacks: {
    [stackName: string]: { data: string[]; size: number; isEmpty: boolean; top: string | null };
  }): RealtimeStackData {
    this.data.allStacks = allStacks;
    return this.getState();
  }

  // Parse code and extract operations
  parseCode(code: string): {
    operations: RealtimeStackOperation[];
    stackVariables: string[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      const operations: RealtimeStackOperation[] = [];
      const stackVariables = new Set<string>();
      const lines = code.split('\n');

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Match stack variable declarations (e.g., s1 = ArrayStack(), s2 = ArrayStack())
        // Only match global variables (not inside functions)
        const stackDeclMatch = trimmedLine.match(/^(\w+)\s*=\s*ArrayStack\(\)/);
        if (stackDeclMatch) {
          // Check if this line is not inside a function definition
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');
          if (!isInsideFunction) {
            stackVariables.add(stackDeclMatch[1]);
          }
        }

        // Match push calls with stack variable (e.g., s1.push(10), s2.push(20))
        // Only match global operations (not inside functions)
        const pushMatch = trimmedLine.match(/(\w+)\.push\(['"]?([^'")]+)['"]?\)/);
        if (pushMatch) {
          const stackVar = pushMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            let param = pushMatch[2];
            // If it's a number, keep it as string
            if (!isNaN(Number(param))) {
              param = param; // Keep as string representation of number
            }
            operations.push({
              type: 'push',
              method: 'push',
              parameters: [param],
              lineNumber: index + 1,
              stackVariable: stackVar,
            });
          }
        }

        // Match pop calls with stack variable (e.g., s1.pop(), s2.pop())
        // Only match global operations (not inside functions)
        const popMatch = trimmedLine.match(/(\w+)\.pop\(\)/);
        if (popMatch) {
          const stackVar = popMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'pop',
              method: 'pop',
              parameters: [],
              lineNumber: index + 1,
              stackVariable: stackVar,
            });
          }
        }

        // Match peek calls with stack variable
        // Only match global operations (not inside functions)
        const peekMatch = trimmedLine.match(/(\w+)\.stackTop\(\)/);
        if (peekMatch) {
          const stackVar = peekMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'peek',
              method: 'peek',
              parameters: [],
              lineNumber: index + 1,
              stackVariable: stackVar,
            });
          }
        }

        // Match isEmpty calls with stack variable
        // Only match global operations (not inside functions)
        const isEmptyMatch = trimmedLine.match(/(\w+)\.is_empty\(\)/);
        if (isEmptyMatch) {
          const stackVar = isEmptyMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'isEmpty',
              method: 'isEmpty',
              parameters: [],
              lineNumber: index + 1,
              stackVariable: stackVar,
            });
          }
        }

        // Match size calls with stack variable
        // Only match global operations (not inside functions)
        const sizeMatch = trimmedLine.match(/(\w+)\.size\(\)/);
        if (sizeMatch) {
          const stackVar = sizeMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'size',
              method: 'size',
              parameters: [],
              lineNumber: index + 1,
              stackVariable: stackVar,
            });
          }
        }

        // Match clear calls with stack variable
        // Only match global operations (not inside functions)
        const clearMatch = trimmedLine.match(/(\w+)\.clear\(\)/);
        if (clearMatch) {
          const stackVar = clearMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'clear',
              method: 'clear',
              parameters: [],
              lineNumber: index + 1,
              stackVariable: stackVar,
            });
          }
        }

        // Match copyStack calls
        const copyStackMatch = trimmedLine.match(/copyStack\(([^,)]+),\s*([^)]+)\)/);
        if (copyStackMatch) {
          operations.push({
            type: 'copyStack',
            method: 'copyStack',
            parameters: [copyStackMatch[1].trim(), copyStackMatch[2].trim()],
            lineNumber: index + 1,
          });
        }
      });

      return {
        operations,
        stackVariables: Array.from(stackVariables),
        isValid: true,
        errors: [],
      };
    } catch (error: unknown) {
      return {
        operations: [],
        stackVariables: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Execute operations from parsed code
  executeOperations(
    operations: RealtimeStackOperation[],
    stackVariables: string[],
  ): RealtimeStackData {
    // Create dynamic stacks based on detected stack variables
    const stacks: { [stackName: string]: string[] } = {};

    // Initialize all detected stack variables
    stackVariables.forEach((stackName) => {
      stacks[stackName] = [];
    });

    // Execute operations dynamically
    operations.forEach((operation) => {
      if (operation.stackVariable) {
        const stackName = operation.stackVariable;

        // Ensure stack exists
        if (!stacks[stackName]) {
          stacks[stackName] = [];
        }

        switch (operation.type) {
          case 'push':
            if (operation.parameters[0]) {
              stacks[stackName].push(operation.parameters[0]);
            }
            break;
          case 'pop':
            if (stacks[stackName].length > 0) {
              stacks[stackName].pop();
            }
            break;
          case 'clear':
            stacks[stackName] = [];
            break;
        }
      } else if (operation.type === 'copyStack') {
        // Handle copyStack operation
        const sourceStack = operation.parameters[0];
        const targetStack = operation.parameters[1];

        if (stacks[sourceStack] && stacks[targetStack]) {
          // Create a temporary stack to reverse the order
          const tempStack: string[] = [];

          // Step 1: Move data from source to temp (reversing order)
          while (stacks[sourceStack].length > 0) {
            const data = stacks[sourceStack].pop()!;
            tempStack.push(data);
          }

          // Step 2: Clear target stack
          stacks[targetStack] = [];

          // Step 3: Move data back from temp to both source and target
          while (tempStack.length > 0) {
            const data = tempStack.pop()!;
            stacks[sourceStack].push(data);
            stacks[targetStack].push(data);
          }
        }
      }
    });

    // Update main stack to show the first non-empty stack or first stack
    const firstStackName = stackVariables[0];
    if (firstStackName && stacks[firstStackName]) {
      this.data.elements = [...stacks[firstStackName]];
      this.data.count = stacks[firstStackName].length;
    }

    // Create allStacks object for multiple stack visualization
    const allStacks: {
      [stackName: string]: { data: string[]; size: number; isEmpty: boolean; top: string | null };
    } = {};

    // Add all stacks to allStacks
    Object.entries(stacks).forEach(([stackName, stackData]) => {
      allStacks[stackName] = {
        data: [...stackData],
        size: stackData.length,
        isEmpty: stackData.length === 0,
        top: stackData.length > 0 ? stackData[stackData.length - 1] : null,
      };
    });

    this.data.allStacks = allStacks;

    return this.getState();
  }
}

export default StackRealtimeService;
