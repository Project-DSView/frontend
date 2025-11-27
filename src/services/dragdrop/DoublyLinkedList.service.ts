import { DoublyLinkedListState, DoublyLinkedListExecutionStep } from '@/types';
import { createExecutionStep } from '@/lib';

class DoublyLinkedListDragDropService {
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

  // Insert at Position
  async insertAtPosition(
    value: string,
    position: number,
  ): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Insert ค่า ${value} ที่ตำแหน่ง ${position}`,
        `เรียกใช้ dll.insert_at_position(${value}, ${position})`,
        1000,
      ),
    );

    if (position < 0 || position > this.state.nodes.length) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่ถูกต้อง!`,
          `ตำแหน่งต้องอยู่ระหว่าง 0 ถึง ${this.state.nodes.length}`,
          1000,
        ),
      );
      return steps;
    }

    if (position === 0) {
      return this.insertAtBeginning(value);
    }

    if (position === this.state.nodes.length) {
      return this.insertAtEnd(value);
    }

    steps.push(
      createExecutionStep(
        `สร้าง Node ใหม่ด้วยค่า ${value}`,
        `สร้าง new_node = Node(${value})`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(
        `หา node ที่ตำแหน่ง ${position - 1}`,
        `current = head, for i in range(${position - 1}): current = current.next`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `เชื่อม new_node.next = current.next`,
        `new_node.next = current.next`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(`เชื่อม new_node.prev = current`, `new_node.prev = current`, 800),
    );

    steps.push(
      createExecutionStep(
        `เชื่อม current.next.prev = new_node`,
        `current.next.prev = new_node`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(`เชื่อม current.next = new_node`, `current.next = new_node`, 800),
    );

    // Update state
    this.state.nodes.splice(position, 0, value);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Insert at Position สำเร็จ! ค่า ${value} อยู่ที่ตำแหน่ง ${position}`,
        `Insert ${value} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Insert Before Position
  async insertBeforePosition(
    value: string,
    position: number,
  ): Promise<DoublyLinkedListExecutionStep[]> {
    return this.insertAtPosition(value, position);
  }

  // Delete from Beginning
  async deleteFromBeginning(): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Delete จากหัวลิสต์`, `เรียกใช้ dll.delete_from_beginning()`, 1000),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `DoublyLinkedList ว่าง ไม่สามารถ Delete ได้`,
          `DoublyLinkedList ว่าง`,
          1000,
        ),
      );
      return steps;
    }

    if (this.state.nodes.length === 1) {
      steps.push(
        createExecutionStep(`มี node เดียว กำหนด head = tail = None`, `head = tail = None`, 800),
      );
    } else {
      steps.push(createExecutionStep(`กำหนด head = head.next`, `head = head.next`, 800));
      steps.push(createExecutionStep(`กำหนด head.prev = None`, `head.prev = None`, 800));
    }

    const deletedValue = this.state.nodes[0];

    // Update state
    this.state.nodes.shift();
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete from Beginning สำเร็จ! ลบค่า ${deletedValue} ออกจากหัวลิสต์`,
        `Delete ${deletedValue} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete from End
  async deleteFromEnd(): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Delete จากท้ายลิสต์`, `เรียกใช้ dll.delete_from_end()`, 1000),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `DoublyLinkedList ว่าง ไม่สามารถ Delete ได้`,
          `DoublyLinkedList ว่าง`,
          1000,
        ),
      );
      return steps;
    }

    if (this.state.nodes.length === 1) {
      steps.push(
        createExecutionStep(`มี node เดียว กำหนด head = tail = None`, `head = tail = None`, 800),
      );
    } else {
      steps.push(createExecutionStep(`กำหนด tail = tail.prev`, `tail = tail.prev`, 800));
      steps.push(createExecutionStep(`กำหนด tail.next = None`, `tail.next = None`, 800));
    }

    const deletedValue = this.state.nodes[this.state.nodes.length - 1];

    // Update state
    this.state.nodes.pop();
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete from End สำเร็จ! ลบค่า ${deletedValue} ออกจากท้ายลิสต์`,
        `Delete ${deletedValue} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete by Value
  async deleteByValue(value: string): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Delete ค่า ${value}`,
        `เรียกใช้ dll.delete_by_value(${value})`,
        1000,
      ),
    );

    const index = this.state.nodes.indexOf(value);
    if (index === -1) {
      steps.push(createExecutionStep(`ไม่พบค่า ${value} ในลิสต์`, `ไม่พบค่า ${value}`, 1000));
      return steps;
    }

    if (index === 0) {
      return this.deleteFromBeginning();
    }

    if (index === this.state.nodes.length - 1) {
      return this.deleteFromEnd();
    }

    steps.push(
      createExecutionStep(
        `หา node ที่มีค่า ${value}`,
        `current = head, while current.data != ${value}: current = current.next`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `เชื่อม current.prev.next = current.next`,
        `current.prev.next = current.next`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(
        `เชื่อม current.next.prev = current.prev`,
        `current.next.prev = current.prev`,
        800,
      ),
    );

    // Update state
    this.state.nodes.splice(index, 1);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete by Value สำเร็จ! ลบค่า ${value} ออกจากลิสต์`,
        `Delete ${value} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete at Position
  async deleteAtPosition(position: number): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Delete ที่ตำแหน่ง ${position}`,
        `เรียกใช้ dll.delete_at_position(${position})`,
        1000,
      ),
    );

    if (position < 0 || position >= this.state.nodes.length) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่ถูกต้อง!`,
          `ตำแหน่งต้องอยู่ระหว่าง 0 ถึง ${this.state.nodes.length - 1}`,
          1000,
        ),
      );
      return steps;
    }

    if (position === 0) {
      return this.deleteFromBeginning();
    }

    if (position === this.state.nodes.length - 1) {
      return this.deleteFromEnd();
    }

    const deletedValue = this.state.nodes[position];

    steps.push(
      createExecutionStep(
        `หา node ที่ตำแหน่ง ${position}`,
        `current = head, for i in range(${position}): current = current.next`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `เชื่อม current.prev.next = current.next`,
        `current.prev.next = current.next`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(
        `เชื่อม current.next.prev = current.prev`,
        `current.next.prev = current.prev`,
        800,
      ),
    );

    // Update state
    this.state.nodes.splice(position, 1);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete at Position สำเร็จ! ลบค่า ${deletedValue} ออกจากตำแหน่ง ${position}`,
        `Delete ${deletedValue} สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete Before Position
  async deleteBeforePosition(position: number): Promise<DoublyLinkedListExecutionStep[]> {
    if (position <= 0) {
      const steps: DoublyLinkedListExecutionStep[] = [];
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่สามารถ delete before ได้`,
          `ตำแหน่งต้องมากกว่า 0`,
          1000,
        ),
      );
      return steps;
    }
    return this.deleteAtPosition(position - 1);
  }

  // Traverse Forward
  async traverseForward(): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Traverse Forward`, `เรียกใช้ dll.traverse_forward()`, 1000),
    );

    if (this.state.nodes.length === 0) {
      steps.push(createExecutionStep(`DoublyLinkedList ว่าง`, `DoublyLinkedList ว่าง`, 1000));
      return steps;
    }

    for (let i = 0; i < this.state.nodes.length; i++) {
      const value = this.state.nodes[i];
      steps.push(
        createExecutionStep(
          `อ่านค่า ${value}`,
          `current = current.next, print(current.data)`,
          1000,
        ),
      );
    }

    steps.push(
      createExecutionStep(`Traverse Forward เสร็จสิ้น`, `Traverse Forward เสร็จสิ้น`, 1000),
    );

    return steps;
  }

  // Traverse Backward
  async traverseBackward(): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Traverse Backward`, `เรียกใช้ dll.traverse_backward()`, 1000),
    );

    if (this.state.nodes.length === 0) {
      steps.push(createExecutionStep(`DoublyLinkedList ว่าง`, `DoublyLinkedList ว่าง`, 1000));
      return steps;
    }

    for (let i = this.state.nodes.length - 1; i >= 0; i--) {
      const value = this.state.nodes[i];
      steps.push(
        createExecutionStep(
          `อ่านค่า ${value}`,
          `current = current.prev, print(current.data)`,
          1000,
        ),
      );
    }

    steps.push(
      createExecutionStep(`Traverse Backward เสร็จสิ้น`, `Traverse Backward เสร็จสิ้น`, 1000),
    );

    return steps;
  }

  // Update by Value
  async updateByValue(
    oldValue: string,
    newValue: string,
  ): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Update ค่า ${oldValue} เป็น ${newValue}`,
        `เรียกใช้ dll.update_by_value(${oldValue}, ${newValue})`,
        1000,
      ),
    );

    const index = this.state.nodes.indexOf(oldValue);
    if (index === -1) {
      steps.push(createExecutionStep(`ไม่พบค่า ${oldValue} ในลิสต์`, `ไม่พบค่า ${oldValue}`, 1000));
      return steps;
    }

    steps.push(
      createExecutionStep(
        `หา node ที่มีค่า ${oldValue}`,
        `current = head, while current.data != ${oldValue}: current = current.next`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(`อัปเดต current.data = ${newValue}`, `current.data = ${newValue}`, 800),
    );

    // Update state
    this.state.nodes[index] = newValue;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;

    steps.push(
      createExecutionStep(
        `Update by Value สำเร็จ! เปลี่ยนค่า ${oldValue} เป็น ${newValue}`,
        `Update สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Update by Position
  async updateByPosition(
    position: number,
    newValue: string,
  ): Promise<DoublyLinkedListExecutionStep[]> {
    const steps: DoublyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Update ที่ตำแหน่ง ${position} เป็น ${newValue}`,
        `เรียกใช้ dll.update_by_position(${position}, ${newValue})`,
        1000,
      ),
    );

    if (position < 0 || position >= this.state.nodes.length) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่ถูกต้อง!`,
          `ตำแหน่งต้องอยู่ระหว่าง 0 ถึง ${this.state.nodes.length - 1}`,
          1000,
        ),
      );
      return steps;
    }

    const oldValue = this.state.nodes[position];

    steps.push(
      createExecutionStep(
        `หา node ที่ตำแหน่ง ${position}`,
        `current = head, for i in range(${position}): current = current.next`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(`อัปเดต current.data = ${newValue}`, `current.data = ${newValue}`, 800),
    );

    // Update state
    this.state.nodes[position] = newValue;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;

    steps.push(
      createExecutionStep(
        `Update by Position สำเร็จ! เปลี่ยนค่า ${oldValue} เป็น ${newValue} ที่ตำแหน่ง ${position}`,
        `Update สำเร็จ - DoublyLinkedList: [${this.state.nodes.join(', ')}]`,
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

export { DoublyLinkedListDragDropService };
