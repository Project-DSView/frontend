import { BSTState, BSTNode, BSTStats, BSTExecutionStep } from '@/types';
import { compareNumericLiterals, isValidNumericLiteral } from '@/lib/utils/numericCompare';

class BSTDragDropService {
  private state: BSTState;

  constructor(initialState: BSTState) {
    this.state = { ...initialState };
  }

  getState(): BSTState {
    return { ...this.state };
  }

  private updateStats(): void {
    const stats = this.calculateStats();
    this.state.stats = stats;
  }

  private calculateStats(): BSTStats {
    const size = this.getSize(this.state.root);
    const height = this.getHeight(this.state.root);

    return {
      size,
      height,
      isEmpty: this.state.root === null,
    };
  }

  private getSize(node: BSTNode | null): number {
    if (!node) return 0;
    return 1 + this.getSize(node.left) + this.getSize(node.right);
  }

  private getHeight(node: BSTNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async insert(value: string): Promise<BSTExecutionStep[]> {
    const steps: BSTExecutionStep[] = [];

    const normalizedValue = value.trim();
    if (!isValidNumericLiteral(normalizedValue)) {
      return [
        {
          step: `รูปแบบตัวเลขไม่ถูกต้อง: ${value}`,
          description: 'รองรับเฉพาะ numeric literal เช่น 123, -4.5, 2e307',
          duration: 1200,
        },
      ];
    }

    steps.push({
      step: `เริ่มการเพิ่มค่า ${normalizedValue} ใน BST`,
      description: `กำลังเพิ่มค่า ${normalizedValue} ใน Binary Search Tree`,
      duration: 1000,
    });

    if (!this.state.root) {
      this.state.root = {
        value: normalizedValue,
        left: null,
        right: null,
        id: this.generateId(),
      };
      steps.push({
        step: `สร้าง root node ด้วยค่า ${normalizedValue}`,
        description: `เนื่องจาก BST ยังว่างเปล่า จึงสร้าง root node ใหม่`,
        duration: 1500,
        nodeValue: normalizedValue,
      });
    } else {
      const path = this.insertRecursive(this.state.root, normalizedValue, []);
      steps.push({
        step: `เพิ่มค่า ${normalizedValue} ตาม path: ${path.join(' → ')}`,
        description: `เดินทางตาม BST property เพื่อหาตำแหน่งที่เหมาะสม`,
        duration: 2000,
        nodeValue: normalizedValue,
        path: path,
      });
    }

    this.updateStats();
    return steps;
  }

  private insertRecursive(node: BSTNode, value: string, path: string[]): string[] {
    const cmp = compareNumericLiterals(value, node.value);
    if (cmp === null) {
      path.push(`Invalid number ${value}`);
      return path;
    }

    if (cmp < 0) {
      path.push(`Left of ${node.value}`);
      if (node.left) {
        return this.insertRecursive(node.left, value, path);
      } else {
        node.left = {
          value,
          left: null,
          right: null,
          id: this.generateId(),
        };
        return path;
      }
    } else if (cmp > 0) {
      path.push(`Right of ${node.value}`);
      if (node.right) {
        return this.insertRecursive(node.right, value, path);
      } else {
        node.right = {
          value,
          left: null,
          right: null,
          id: this.generateId(),
        };
        return path;
      }
    } else {
      path.push(`Duplicate value ${value}`);
      return path;
    }
  }

  async delete(value: string): Promise<BSTExecutionStep[]> {
    const steps: BSTExecutionStep[] = [];

    const normalizedValue = value.trim();
    if (!isValidNumericLiteral(normalizedValue)) {
      return [
        {
          step: `รูปแบบตัวเลขไม่ถูกต้อง: ${value}`,
          description: 'รองรับเฉพาะ numeric literal เช่น 123, -4.5, 2e307',
          duration: 1200,
        },
      ];
    }

    steps.push({
      step: `เริ่มการลบค่า ${normalizedValue} จาก BST`,
      description: `กำลังค้นหาและลบค่า ${normalizedValue} จาก Binary Search Tree`,
      duration: 1000,
    });

    if (!this.state.root) {
      steps.push({
        step: `BST ว่างเปล่า ไม่สามารถลบได้`,
        description: `ไม่มีข้อมูลใน BST`,
        duration: 1000,
      });
      return steps;
    }

    const path = this.findNodePath(this.state.root, normalizedValue, []);
    if (path.length === 0) {
      steps.push({
        step: `ไม่พบค่า ${normalizedValue} ใน BST`,
        description: `ค่า ${normalizedValue} ไม่มีอยู่ใน BST`,
        duration: 1000,
      });
      return steps;
    }

    steps.push({
      step: `พบค่า ${normalizedValue} ตาม path: ${path.join(' → ')}`,
      description: `ค้นหาค่า ${normalizedValue} สำเร็จ`,
      duration: 1500,
      nodeValue: normalizedValue,
      path: path,
    });

    this.state.root = this.deleteRecursive(this.state.root, normalizedValue);
    this.updateStats();

    steps.push({
      step: `ลบค่า ${normalizedValue} สำเร็จ`,
      description: `ลบ node และปรับโครงสร้าง BST ใหม่`,
      duration: 1500,
    });

    return steps;
  }

  private findNodePath(node: BSTNode | null, value: string, path: string[]): string[] {
    if (!node) return [];

    const cmp = compareNumericLiterals(value, node.value);
    if (cmp === null) return [];

    if (cmp === 0) {
      return [...path, node.value];
    } else if (cmp < 0) {
      return this.findNodePath(node.left, value, [...path, node.value]);
    } else {
      return this.findNodePath(node.right, value, [...path, node.value]);
    }
  }

  private deleteRecursive(node: BSTNode | null, value: string): BSTNode | null {
    if (!node) return null;

    const cmp = compareNumericLiterals(value, node.value);
    if (cmp === null) return node;

    if (cmp < 0) {
      node.left = this.deleteRecursive(node.left, value);
    } else if (cmp > 0) {
      node.right = this.deleteRecursive(node.right, value);
    } else {
      // Node to be deleted found
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      // Node with two children
      const minNode = this.findMinNode(node.right);
      node.value = minNode.value;
      node.right = this.deleteRecursive(node.right, minNode.value);
    }

    return node;
  }

  private findMinNode(node: BSTNode): BSTNode {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  async traverseInorder(): Promise<BSTExecutionStep[]> {
    const steps: BSTExecutionStep[] = [];
    const result: string[] = [];

    steps.push({
      step: `เริ่ม Inorder Traversal (Left → Root → Right)`,
      description: `เดินทางผ่าน BST แบบ Inorder`,
      duration: 1000,
    });

    this.inorderRecursive(this.state.root, result, steps);

    steps.push({
      step: `Inorder Traversal เสร็จสิ้น: [${result.join(', ')}]`,
      description: `ผลลัพธ์การเดินทางแบบ Inorder`,
      duration: 1000,
    });

    return steps;
  }

  private inorderRecursive(
    node: BSTNode | null,
    result: string[],
    steps: BSTExecutionStep[],
  ): void {
    if (node) {
      this.inorderRecursive(node.left, result, steps);
      result.push(node.value);
      steps.push({
        step: `อ่านค่า ${node.value}`,
        description: `เยี่ยม node ${node.value} ใน Inorder traversal`,
        duration: 800,
        nodeValue: node.value,
      });
      this.inorderRecursive(node.right, result, steps);
    }
  }

  async traversePreorder(): Promise<BSTExecutionStep[]> {
    const steps: BSTExecutionStep[] = [];
    const result: string[] = [];

    steps.push({
      step: `เริ่ม Preorder Traversal (Root → Left → Right)`,
      description: `เดินทางผ่าน BST แบบ Preorder`,
      duration: 1000,
    });

    this.preorderRecursive(this.state.root, result, steps);

    steps.push({
      step: `Preorder Traversal เสร็จสิ้น: [${result.join(', ')}]`,
      description: `ผลลัพธ์การเดินทางแบบ Preorder`,
      duration: 1000,
    });

    return steps;
  }

  private preorderRecursive(
    node: BSTNode | null,
    result: string[],
    steps: BSTExecutionStep[],
  ): void {
    if (node) {
      result.push(node.value);
      steps.push({
        step: `อ่านค่า ${node.value}`,
        description: `เยี่ยม node ${node.value} ใน Preorder traversal`,
        duration: 800,
        nodeValue: node.value,
      });
      this.preorderRecursive(node.left, result, steps);
      this.preorderRecursive(node.right, result, steps);
    }
  }

  async traversePostorder(): Promise<BSTExecutionStep[]> {
    const steps: BSTExecutionStep[] = [];
    const result: string[] = [];

    steps.push({
      step: `เริ่ม Postorder Traversal (Left → Right → Root)`,
      description: `เดินทางผ่าน BST แบบ Postorder`,
      duration: 1000,
    });

    this.postorderRecursive(this.state.root, result, steps);

    steps.push({
      step: `Postorder Traversal เสร็จสิ้น: [${result.join(', ')}]`,
      description: `ผลลัพธ์การเดินทางแบบ Postorder`,
      duration: 1000,
    });

    return steps;
  }

  private postorderRecursive(
    node: BSTNode | null,
    result: string[],
    steps: BSTExecutionStep[],
  ): void {
    if (node) {
      this.postorderRecursive(node.left, result, steps);
      this.postorderRecursive(node.right, result, steps);
      result.push(node.value);
      steps.push({
        step: `อ่านค่า ${node.value}`,
        description: `เยี่ยม node ${node.value} ใน Postorder traversal`,
        duration: 800,
        nodeValue: node.value,
      });
    }
  }
}

export { BSTDragDropService };
