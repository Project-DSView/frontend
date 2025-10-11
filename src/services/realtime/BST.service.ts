import {
  RealtimeBSTData,
  RealtimeBSTNodeData,
  RealtimeBSTStats,
  RealtimeBSTOperation,
} from '@/types';

class BSTRealtimeService {
  private data: RealtimeBSTData;

  constructor(initialData: RealtimeBSTData) {
    this.data = { ...initialData };
  }

  getState(): RealtimeBSTData {
    return { ...this.data };
  }

  private updateStats(): RealtimeBSTStats {
    const size = this.getTreeSize(this.data.root ?? null);
    const height = this.getTreeHeight(this.data.root ?? null);
    const minValue = this.findMinValue(this.data.root ?? null);
    const maxValue = this.findMaxValue(this.data.root ?? null);

    return {
      size,
      isEmpty: this.data.root === null,
      height,
      minValue,
      maxValue,
    };
  }

  // BST Operations
  insert(value: string): RealtimeBSTData {
    this.data.root = this.insertNode(this.data.root ?? null, value);
    this.data.count = this.getTreeSize(this.data.root ?? null);
    this.data.elements = this.inorderTraversal(this.data.root ?? null);
    this.data.currentOperation = 'insert';
    return this.getState();
  }

  delete(value: string): RealtimeBSTData {
    this.data.root = this.deleteNode(this.data.root ?? null, value);
    this.data.count = this.getTreeSize(this.data.root ?? null);
    this.data.elements = this.inorderTraversal(this.data.root ?? null);
    this.data.currentOperation = 'delete';
    return this.getState();
  }

  findMin(): string | null {
    this.data.currentOperation = 'findMin';
    return this.findMinValue(this.data.root ?? null);
  }

  findMax(): string | null {
    this.data.currentOperation = 'findMax';
    return this.findMaxValue(this.data.root ?? null);
  }

  traverse(mode: 'preorder' | 'inorder' | 'postorder'): string[] {
    this.data.currentOperation = 'traverse';
    this.data.currentTraversal = mode;

    let result: string[] = [];
    switch (mode) {
      case 'preorder':
        result = this.preorderTraversal(this.data.root ?? null);
        break;
      case 'inorder':
        result = this.inorderTraversal(this.data.root ?? null);
        break;
      case 'postorder':
        result = this.postorderTraversal(this.data.root ?? null);
        break;
    }

    this.data.elements = result;
    return result;
  }

  // Helper methods
  private insertNode(node: RealtimeBSTNodeData | null, value: string): RealtimeBSTNodeData {
    if (node === null) {
      return {
        value,
        left: null,
        right: null,
        isHighlighted: true,
      };
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  private deleteNode(node: RealtimeBSTNodeData | null, value: string): RealtimeBSTNodeData | null {
    if (node === null) {
      return null;
    }

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
    } else {
      // Node to be deleted found
      if (node.left === null) {
        return node.right;
      } else if (node.right === null) {
        return node.left;
      }

      // Node with two children
      const minValue = this.findMinValue(node.right);
      if (minValue) {
        node.value = minValue;
        node.right = this.deleteNode(node.right, minValue);
      }
    }

    return node;
  }

  private findMinValue(node: RealtimeBSTNodeData | null): string | null {
    if (node === null) {
      return null;
    }
    while (node.left !== null) {
      node = node.left;
    }
    return node.value;
  }

  private findMaxValue(node: RealtimeBSTNodeData | null): string | null {
    if (node === null) {
      return null;
    }
    while (node.right !== null) {
      node = node.right;
    }
    return node.value;
  }

  private getTreeSize(node: RealtimeBSTNodeData | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + this.getTreeSize(node.left) + this.getTreeSize(node.right);
  }

  private getTreeHeight(node: RealtimeBSTNodeData | null): number {
    if (node === null) {
      return 0;
    }
    return 1 + Math.max(this.getTreeHeight(node.left), this.getTreeHeight(node.right));
  }

  private preorderTraversal(node: RealtimeBSTNodeData | null): string[] {
    if (node === null) {
      return [];
    }
    return [
      node.value,
      ...this.preorderTraversal(node.left),
      ...this.preorderTraversal(node.right),
    ];
  }

  private inorderTraversal(node: RealtimeBSTNodeData | null): string[] {
    if (node === null) {
      return [];
    }
    return [...this.inorderTraversal(node.left), node.value, ...this.inorderTraversal(node.right)];
  }

  private postorderTraversal(node: RealtimeBSTNodeData | null): string[] {
    if (node === null) {
      return [];
    }
    return [
      ...this.postorderTraversal(node.left),
      ...this.postorderTraversal(node.right),
      node.value,
    ];
  }

  // Method to set allTrees from execution result
  setAllTrees(allTrees: {
    [treeName: string]: {
      data: RealtimeBSTNodeData | null;
      size: number;
      isEmpty: boolean;
      root: RealtimeBSTNodeData | null;
      traversalResults?: { preorder: string[]; inorder: string[]; postorder: string[] };
    };
  }): RealtimeBSTData {
    this.data.allTrees = allTrees;
    return this.getState();
  }

  // Parse code and extract operations
  parseCode(code: string): {
    operations: RealtimeBSTOperation[];
    treeVariables: string[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      const operations: RealtimeBSTOperation[] = [];
      const treeVariables = new Set<string>();
      const lines = code.split('\n');

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Match tree variable declarations (e.g., myBST = BST(), tree1 = BST())
        const treeDeclMatch = trimmedLine.match(/^(\w+)\s*=\s*BST\(\)/);
        if (treeDeclMatch) {
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');
          if (!isInsideFunction) {
            treeVariables.add(treeDeclMatch[1]);
          }
        }

        // Match insert calls with tree variable (e.g., myBST.insert(10))
        const insertMatch = trimmedLine.match(/(\w+)\.insert\(['"]?([^'")]+)['"]?\)/);
        if (insertMatch) {
          const treeVar = insertMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            let param = insertMatch[2];
            if (!isNaN(Number(param))) {
              param = param;
            }
            operations.push({
              type: 'insert',
              method: 'insert',
              parameters: [param],
              lineNumber: index + 1,
              treeVariable: treeVar,
            });
          }
        }

        // Match delete calls with tree variable (e.g., myBST.delete(10))
        const deleteMatch = trimmedLine.match(/(\w+)\.delete\(['"]?([^'")]+)['"]?\)/);
        if (deleteMatch) {
          const treeVar = deleteMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            let param = deleteMatch[2];
            if (!isNaN(Number(param))) {
              param = param;
            }
            operations.push({
              type: 'delete',
              method: 'delete',
              parameters: [param],
              lineNumber: index + 1,
              treeVariable: treeVar,
            });
          }
        }

        // Match findMin calls with tree variable
        const findMinMatch = trimmedLine.match(/(\w+)\.findMin\(\)/);
        if (findMinMatch) {
          const treeVar = findMinMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'findMin',
              method: 'findMin',
              parameters: [],
              lineNumber: index + 1,
              treeVariable: treeVar,
            });
          }
        }

        // Match findMax calls with tree variable
        const findMaxMatch = trimmedLine.match(/(\w+)\.findMax\(\)/);
        if (findMaxMatch) {
          const treeVar = findMaxMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'findMax',
              method: 'findMax',
              parameters: [],
              lineNumber: index + 1,
              treeVariable: treeVar,
            });
          }
        }

        // Match traverse calls with tree variable
        const traverseMatch = trimmedLine.match(/(\w+)\.traverse\(\)/);
        if (traverseMatch) {
          const treeVar = traverseMatch[1];
          const isInsideFunction = line.startsWith('    ') || line.startsWith('\t');

          if (!isInsideFunction) {
            operations.push({
              type: 'traverse',
              method: 'traverse',
              parameters: [],
              lineNumber: index + 1,
              treeVariable: treeVar,
            });
          }
        }
      });

      return {
        operations,
        treeVariables: Array.from(treeVariables),
        isValid: true,
        errors: [],
      };
    } catch (error) {
      return {
        operations: [],
        treeVariables: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Execute operations from parsed code
  executeOperations(operations: RealtimeBSTOperation[], treeVariables: string[]): RealtimeBSTData {
    // Create dynamic trees based on detected tree variables
    const trees: { [treeName: string]: RealtimeBSTNodeData | null } = {};

    // Initialize all detected tree variables
    treeVariables.forEach((treeName) => {
      trees[treeName] = null;
    });

    // Execute operations dynamically
    operations.forEach((operation) => {
      if (operation.treeVariable) {
        const treeName = operation.treeVariable;

        // Ensure tree exists
        if (!trees[treeName]) {
          trees[treeName] = null;
        }

        switch (operation.type) {
          case 'insert':
            if (operation.parameters[0]) {
              trees[treeName] = this.insertNode(trees[treeName], operation.parameters[0]);
            }
            break;
          case 'delete':
            if (operation.parameters[0]) {
              trees[treeName] = this.deleteNode(trees[treeName], operation.parameters[0]);
            }
            break;
        }
      }
    });

    // Update main tree to show the first non-empty tree or first tree
    const firstTreeName = treeVariables[0];
    if (firstTreeName && trees[firstTreeName]) {
      this.data.root = trees[firstTreeName];
      this.data.count = this.getTreeSize(trees[firstTreeName]);
      this.data.elements = this.inorderTraversal(trees[firstTreeName]);
    }

    // Create allTrees object for multiple tree visualization
    const allTrees: {
      [treeName: string]: {
        data: RealtimeBSTNodeData | null;
        size: number;
        isEmpty: boolean;
        root: RealtimeBSTNodeData | null;
        traversalResults: { preorder: string[]; inorder: string[]; postorder: string[] };
      };
    } = {};

    // Add all trees to allTrees
    Object.entries(trees).forEach(([treeName, treeData]) => {
      allTrees[treeName] = {
        data: treeData,
        size: this.getTreeSize(treeData),
        isEmpty: treeData === null,
        root: treeData,
        traversalResults: {
          preorder: this.preorderTraversal(treeData),
          inorder: this.inorderTraversal(treeData),
          postorder: this.postorderTraversal(treeData),
        },
      };
    });

    this.data.allTrees = allTrees;

    return this.getState();
  }
}

export default BSTRealtimeService;
