import { DoublyLinkedListState, DoublyLinkedListExecutionStep } from '@/types';
import { createExecutionStep } from '@/lib';

class DoublyLinkedListService {
  private state: DoublyLinkedListState;

  constructor(initialState: DoublyLinkedListState) {
    this.state = initialState;
  }

  // Insert at Beginning
  async insertAtBeginning(value: string): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Insert ค่า ${value} ที่หัวลิสต์`,
        `เรียกใช้ dll.insert_at_beginning(${value})`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `สร้าง Node ใหม่ด้วยค่า ${value}`,
        `สร้าง new_node = Node(${value})`,
        800,
      ),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `DoublyLinkedList ว่าง กำหนด head = tail = new_node`,
          `head และ tail เป็น None, กำหนด head = tail = new_node`,
          800,
        ),
      );
    } else {
      steps.push(createExecutionStep(`เชื่อม new_node.next = head`, `new_node.next = head`, 800));
      steps.push(createExecutionStep(`เชื่อม head.prev = new_node`, `head.prev = new_node`, 800));
      steps.push(createExecutionStep(`กำหนด head = new_node`, `head = new_node`, 800));
    }

    // Update state
    this.state.nodes.unshift(value);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Insert at Beginning สำเร็จ! ค่า ${value} อยู่ที่หัวลิสต์`,
        `Insert ${value} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Insert at End
  async insertAtEnd(value: string): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Insert ค่า ${value} ที่ท้ายลิสต์`,
        `เรียกใช้ dll.insert_at_end(${value})`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `สร้าง Node ใหม่ด้วยค่า ${value}`,
        `สร้าง new_node = Node(${value})`,
        800,
      ),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `DoublyLinkedList ว่าง กำหนด head = tail = new_node`,
          `head และ tail เป็น None, กำหนด head = tail = new_node`,
          800,
        ),
      );
    } else {
      steps.push(createExecutionStep(`เชื่อม new_node.prev = tail`, `new_node.prev = tail`, 800));
      steps.push(createExecutionStep(`เชื่อม tail.next = new_node`, `tail.next = new_node`, 800));
      steps.push(createExecutionStep(`กำหนด tail = new_node`, `tail = new_node`, 800));
    }

    // Update state
    this.state.nodes.push(value);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Insert at End สำเร็จ! ค่า ${value} อยู่ที่ท้ายลิสต์`,
        `Insert ${value} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Get current state
  getState(): DoublyLinkedListState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<DoublyLinkedListState>): void {
    this.state = { ...this.state, ...newState };
  }
}

export { DoublyLinkedListService };
