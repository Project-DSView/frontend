import { SinglyLinkedListState, SinglyLinkedListExecutionStep } from '@/types';
import { createExecutionStep } from '@/lib';

class SinglyLinkedListDragDropService {
  private state: SinglyLinkedListState;

  constructor(initialState: SinglyLinkedListState) {
    this.state = initialState;
  }

  // Insert at Beginning
  async insertAtBeginning(value: string): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Insert ค่า ${value} ที่หัวลิสต์`,
        `เรียกใช้ ll.insert_at_beginning(${value})`,
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

    steps.push(createExecutionStep(`เชื่อม new_node.next = head`, `new_node.next = head`, 800));

    // Update state after connecting
    this.state.nodes.unshift(value);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(createExecutionStep(`กำหนด head = new_node`, `head = new_node`, 800));

    steps.push(
      createExecutionStep(
        `Insert at Beginning สำเร็จ! ค่า ${value} อยู่ที่หัวลิสต์`,
        `Insert ${value} สำเร็จ - LinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Insert at End
  async insertAtEnd(value: string): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Insert ค่า ${value} ที่ท้ายลิสต์`,
        `เรียกใช้ ll.insert_at_end(${value})`,
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
          `LinkedList ว่าง กำหนด head = new_node`,
          `head เป็น None, กำหนด head = new_node`,
          800,
        ),
      );
    } else {
      steps.push(
        createExecutionStep(
          `หา position สุดท้าย เพื่อใส่ node ใหม่`,
          `ค้นหา position สุดท้ายใน linked list`,
          800,
        ),
      );

      steps.push(
        createExecutionStep(`เชื่อม current.next = new_node`, `current.next = new_node`, 800),
      );
    }

    // Update state after connecting
    this.state.nodes.push(value);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Insert at End สำเร็จ! ค่า ${value} อยู่ที่ท้ายลิสต์`,
        `Insert ${value} สำเร็จ - LinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Insert at Position
  async insertAtPosition(
    value: string,
    position: number,
  ): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Insert ค่า ${value} ที่ตำแหน่ง ${position}`,
        `เรียกใช้ ll.insert_at_position(${value}, ${position})`,
        1000,
      ),
    );

    if (position < 0 || position > this.state.nodes.length) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่ถูกต้อง`,
          `ตำแหน่ง ${position} ไม่ถูกต้อง - ไม่สามารถ insert ได้`,
          1000,
        ),
      );
      return steps;
    }

    if (position === 0) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง 0 = Insert at Beginning`,
          `เรียกใช้ insert_at_beginning`,
          1000,
        ),
      );
      this.state.nodes.unshift(value);
    } else if (position === this.state.nodes.length) {
      steps.push(
        createExecutionStep(`ตำแหน่ง ${position} = Insert at End`, `เรียกใช้ insert_at_end`, 1000),
      );
      this.state.nodes.push(value);
    } else {
      steps.push(
        createExecutionStep(
          `สร้าง Node ใหม่ด้วยค่า ${value}`,
          `สร้าง new_node = Node(${value})`,
          800,
        ),
      );

      steps.push(
        createExecutionStep(
          `เดินไปยังตำแหน่ง ${position - 1}`,
          `เดินไปยังตำแหน่ง ${position - 1}`,
          800,
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
        createExecutionStep(`เชื่อม current.next = new_node`, `current.next = new_node`, 800),
      );

      // Update state after connecting
      this.state.nodes.splice(position, 0, value);
    }

    // Update state
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Insert at Position สำเร็จ! ค่า ${value} อยู่ที่ตำแหน่ง ${position}`,
        `Insert ${value} สำเร็จ - LinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete from Beginning
  async deleteFromBeginning(): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Delete จากหัวลิสต์`, `เรียกใช้ ll.delete_from_beginning()`, 1000),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `LinkedList ว่าง ไม่สามารถ delete ได้`,
          `LinkedList ว่าง - ไม่มีอะไรให้ delete`,
          1000,
        ),
      );
      return steps;
    }

    const deletedValue = this.state.nodes[0];
    steps.push(
      createExecutionStep(`ลบ head node (${deletedValue})`, `ลบ head node (${deletedValue})`, 800),
    );

    steps.push(createExecutionStep(`กำหนด head = head.next`, `head = head.next`, 800));

    // Update state
    this.state.nodes.shift();
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete from Beginning สำเร็จ! ลบค่า ${deletedValue}`,
        `Delete ${deletedValue} สำเร็จ - LinkedList: [${this.state.nodes.join(', ') || 'ว่าง'}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete from End
  async deleteFromEnd(): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Delete จากท้ายลิสต์`, `เรียกใช้ ll.delete_from_end()`, 1000),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `LinkedList ว่าง ไม่สามารถ delete ได้`,
          `LinkedList ว่าง - ไม่มีอะไรให้ delete`,
          1000,
        ),
      );
      return steps;
    }

    if (this.state.nodes.length === 1) {
      const deletedValue = this.state.nodes[0];
      steps.push(
        createExecutionStep(
          `ลบ node เดียว (${deletedValue})`,
          `ลบ node เดียว (${deletedValue})`,
          800,
        ),
      );

      steps.push(createExecutionStep(`กำหนด head = None`, `head = None`, 800));
    } else {
      steps.push(createExecutionStep(`หา node ก่อนสุดท้าย`, `หา node ก่อนสุดท้าย`, 800));

      const deletedValue = this.state.nodes[this.state.nodes.length - 1];
      steps.push(
        createExecutionStep(
          `ลบ node สุดท้าย (${deletedValue})`,
          `ลบ node สุดท้าย (${deletedValue})`,
          800,
        ),
      );

      steps.push(createExecutionStep(`กำหนด current.next = None`, `current.next = None`, 800));
    }

    // Update state
    this.state.nodes.pop();
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete from End สำเร็จ!`,
        `Delete from End สำเร็จ - LinkedList: [${this.state.nodes.join(', ') || 'ว่าง'}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete by Value
  async deleteByValue(value: string): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Delete ค่า ${value}`,
        `เรียกใช้ ll.delete_by_value(${value})`,
        1000,
      ),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `LinkedList ว่าง ไม่สามารถ delete ได้`,
          `LinkedList ว่าง - ไม่มีอะไรให้ delete`,
          1000,
        ),
      );
      return steps;
    }

    const index = this.state.nodes.indexOf(value);
    if (index === -1) {
      steps.push(
        createExecutionStep(
          `ไม่พบค่า ${value} ใน LinkedList`,
          `ไม่พบค่า ${value} - ไม่มีการเปลี่ยนแปลง`,
          1000,
        ),
      );
      return steps;
    }

    steps.push(
      createExecutionStep(
        `พบค่า ${value} ที่ตำแหน่ง ${index}`,
        `พบค่า ${value} ที่ index ${index}`,
        800,
      ),
    );

    if (index === 0) {
      steps.push(
        createExecutionStep(
          `ลบ head node (${value})`,
          `head.data == ${value}, กำหนด head = head.next`,
          800,
        ),
      );
    } else {
      steps.push(
        createExecutionStep(
          `เชื่อม node ก่อนหน้ากับ node ถัดไป`,
          `เชื่อม current.next = current.next.next`,
          800,
        ),
      );
    }

    // Update state
    this.state.nodes.splice(index, 1);
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete by Value สำเร็จ! ลบค่า ${value}`,
        `Delete ${value} สำเร็จ - LinkedList: [${this.state.nodes.join(', ') || 'ว่าง'}]`,
        1000,
      ),
    );

    return steps;
  }

  // Delete at Position
  async deleteAtPosition(position: number): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Delete ที่ตำแหน่ง ${position}`,
        `เรียกใช้ ll.delete_at_position(${position})`,
        1000,
      ),
    );

    if (this.state.nodes.length === 0 || position < 0 || position >= this.state.nodes.length) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่ถูกต้อง`,
          `ตำแหน่ง ${position} ไม่ถูกต้อง - ไม่สามารถ delete ได้`,
          1000,
        ),
      );
      return steps;
    }

    const deletedValue = this.state.nodes[position];
    if (position === 0) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง 0 = Delete from Beginning`,
          `เรียกใช้ delete_from_beginning`,
          1000,
        ),
      );
      this.state.nodes.shift();
    } else {
      steps.push(
        createExecutionStep(
          `เดินไปยังตำแหน่ง ${position - 1}`,
          `เดินไปยังตำแหน่ง ${position - 1}`,
          800,
        ),
      );

      steps.push(
        createExecutionStep(
          `ลบ node ที่ตำแหน่ง ${position} (${deletedValue})`,
          `ลบ node ที่ตำแหน่ง ${position} (${deletedValue})`,
          800,
        ),
      );

      steps.push(
        createExecutionStep(
          `เชื่อม current.next = current.next.next`,
          `เชื่อม current.next = current.next.next`,
          800,
        ),
      );

      this.state.nodes.splice(position, 1);
    }

    // Update state
    this.state.stats.length = this.state.nodes.length;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;
    this.state.stats.isEmpty = this.state.nodes.length === 0;

    steps.push(
      createExecutionStep(
        `Delete at Position สำเร็จ! ลบค่า ${deletedValue}`,
        `Delete ${deletedValue} สำเร็จ - LinkedList: [${this.state.nodes.join(', ') || 'ว่าง'}]`,
        1000,
      ),
    );

    return steps;
  }

  // Traverse
  async traverse(): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(createExecutionStep(`กำลัง Traverse LinkedList`, `เรียกใช้ ll.traverse()`, 1000));

    steps.push(createExecutionStep(`เริ่มจาก head node`, `current = head`, 800));

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `LinkedList ว่าง - Traverse เสร็จสิ้น`,
          `head เป็น None - LinkedList ว่าง`,
          1000,
        ),
      );
    } else {
      for (let i = 0; i < this.state.nodes.length; i++) {
        steps.push(
          createExecutionStep(
            `อ่านค่า ${this.state.nodes[i]} จาก node ที่ ${i + 1}`,
            `อ่าน current.data = ${this.state.nodes[i]}`,
            600,
          ),
        );

        if (i < this.state.nodes.length - 1) {
          steps.push(createExecutionStep(`ไปยัง node ถัดไป`, `current = current.next`, 600));
        }
      }

      steps.push(
        createExecutionStep(
          `Traverse สำเร็จ! ผลลัพธ์: [${this.state.nodes.join(', ')}]`,
          `Traverse สำเร็จ - พิมพ์ผลลัพธ์: [${this.state.nodes.join(', ')}]`,
          1000,
        ),
      );
    }

    return steps;
  }

  // Update by Value
  async updateByValue(
    oldValue: string,
    newValue: string,
  ): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Update ค่า ${oldValue} เป็น ${newValue}`,
        `เรียกใช้ ll.update_by_value(${oldValue}, ${newValue})`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `เริ่มค้นหาค่า ${oldValue} ใน LinkedList`,
        `เริ่มค้นหาค่า ${oldValue}`,
        800,
      ),
    );

    if (this.state.nodes.length === 0) {
      steps.push(
        createExecutionStep(
          `LinkedList ว่าง - ไม่สามารถ update ได้`,
          `LinkedList ว่าง - ไม่พบค่า ${oldValue}`,
          1000,
        ),
      );
      return steps;
    }

    const index = this.state.nodes.indexOf(oldValue);
    if (index === -1) {
      steps.push(
        createExecutionStep(
          `ไม่พบค่า ${oldValue} ใน LinkedList`,
          `ไม่พบค่า ${oldValue} - ไม่มีการเปลี่ยนแปลง`,
          1000,
        ),
      );
      return steps;
    }

    steps.push(
      createExecutionStep(
        `พบค่า ${oldValue} ที่ตำแหน่ง ${index}`,
        `พบค่า ${oldValue} ที่ index ${index}`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(
        `เปลี่ยนค่า ${oldValue} เป็น ${newValue}`,
        `เปลี่ยน current.data = ${newValue}`,
        800,
      ),
    );

    // Update state
    this.state.nodes[index] = newValue;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;

    steps.push(
      createExecutionStep(
        `Update by Value สำเร็จ! เปลี่ยน ${oldValue} เป็น ${newValue}`,
        `Update สำเร็จ - LinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Update by Position
  async updateByPosition(
    position: number,
    newValue: string,
  ): Promise<SinglyLinkedListExecutionStep[]> {
    const steps: SinglyLinkedListExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Update ที่ตำแหน่ง ${position} เป็น ${newValue}`,
        `เรียกใช้ ll.update_by_position(${position}, ${newValue})`,
        1000,
      ),
    );

    if (position < 0 || position >= this.state.nodes.length) {
      steps.push(
        createExecutionStep(
          `ตำแหน่ง ${position} ไม่ถูกต้อง`,
          `ตำแหน่ง ${position} ไม่ถูกต้อง - ไม่สามารถ update ได้`,
          1000,
        ),
      );
      return steps;
    }

    const oldValue = this.state.nodes[position];
    steps.push(
      createExecutionStep(`เดินไปยังตำแหน่ง ${position}`, `เดินไปยังตำแหน่ง ${position}`, 800),
    );

    for (let i = 0; i < position; i++) {
      steps.push(
        createExecutionStep(
          `เดินผ่าน node ที่ ${i + 1} (${this.state.nodes[i]})`,
          `current = current.next`,
          400,
        ),
      );
    }

    steps.push(
      createExecutionStep(
        `เปลี่ยนค่า ${oldValue} เป็น ${newValue} ที่ตำแหน่ง ${position}`,
        `เปลี่ยน current.data = ${newValue}`,
        800,
      ),
    );

    // Update state
    this.state.nodes[position] = newValue;
    this.state.stats.headValue = this.state.nodes[0] || null;
    this.state.stats.tailValue = this.state.nodes[this.state.nodes.length - 1] || null;

    steps.push(
      createExecutionStep(
        `Update by Position สำเร็จ! เปลี่ยน ${oldValue} เป็น ${newValue}`,
        `Update สำเร็จ - LinkedList: [${this.state.nodes.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Get current state
  getState(): SinglyLinkedListState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<SinglyLinkedListState>): void {
    this.state = { ...this.state, ...newState };
  }
}

export { SinglyLinkedListDragDropService };
