import { StackState, StackExecutionStep } from '@/types';
import { createExecutionStep } from '@/lib';

class StackService {
  private state: StackState;

  constructor(initialState: StackState) {
    this.state = initialState;
  }

  // Push operation - เพิ่ม element ลงใน stack
  async push(value: string): Promise<StackExecutionStep[]> {
    const steps: StackExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Push ค่า ${value} ลงใน stack`,
        `เรียกใช้ stack.push(${value})`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(`เพิ่ม ${value} ลงใน stack (บนสุด)`, `stack.items.append(${value})`, 800),
    );

    // Update state
    this.state.elements.push(value);
    this.state.stats.length = this.state.elements.length;
    this.state.stats.headValue = this.state.elements[this.state.elements.length - 1] || null;
    this.state.stats.tailValue = this.state.elements[0] || null;
    this.state.stats.isEmpty = this.state.elements.length === 0;

    steps.push(
      createExecutionStep(
        `Push สำเร็จ! ค่า ${value} อยู่บนสุดของ stack`,
        `Push ${value} สำเร็จ - Stack: [${this.state.elements.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Pop operation - เอาออก element บนสุด
  async pop(): Promise<StackExecutionStep[]> {
    const steps: StackExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Pop element บนสุดจาก stack`, `เรียกใช้ stack.pop()`, 1000),
    );

    if (this.state.elements.length === 0) {
      steps.push(
        createExecutionStep(`Stack ว่าง ไม่สามารถ pop ได้`, `Stack is empty, cannot pop`, 800),
      );
      return steps;
    }

    const poppedValue = this.state.elements[this.state.elements.length - 1];
    steps.push(
      createExecutionStep(
        `เอาออกค่า ${poppedValue} จากบนสุดของ stack`,
        `item = stack.items.pop()`,
        800,
      ),
    );

    // Update state
    this.state.elements.pop();
    this.state.stats.length = this.state.elements.length;
    this.state.stats.headValue = this.state.elements[this.state.elements.length - 1] || null;
    this.state.stats.tailValue = this.state.elements[0] || null;
    this.state.stats.isEmpty = this.state.elements.length === 0;

    steps.push(
      createExecutionStep(
        `Pop สำเร็จ! ค่า ${poppedValue} ถูกลบออกจาก stack`,
        `Pop ${poppedValue} สำเร็จ - Stack: [${this.state.elements.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Peek operation - ดูค่า element บนสุดโดยไม่ลบออก
  async peek(): Promise<StackExecutionStep[]> {
    const steps: StackExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลัง Peek ดูค่า element บนสุดของ stack`, `เรียกใช้ stack.peek()`, 1000),
    );

    if (this.state.elements.length === 0) {
      steps.push(createExecutionStep(`Stack ว่าง ไม่มี element ให้ดู`, `Stack is empty`, 800));
      return steps;
    }

    const topValue = this.state.elements[this.state.elements.length - 1];
    steps.push(createExecutionStep(`Element บนสุดคือ ${topValue}`, `return stack.items[-1]`, 800));

    steps.push(
      createExecutionStep(
        `Peek สำเร็จ! ค่า ${topValue} อยู่บนสุดของ stack`,
        `Peek สำเร็จ - Top element: ${topValue}`,
        1000,
      ),
    );

    return steps;
  }

  // Is Empty operation - เช็คว่า stack ว่างหรือไม่
  async isEmpty(): Promise<StackExecutionStep[]> {
    const steps: StackExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลังเช็คว่า stack ว่างหรือไม่`, `เรียกใช้ stack.is_empty()`, 1000),
    );

    const isEmpty = this.state.elements.length === 0;
    steps.push(
      createExecutionStep(
        `Stack ${isEmpty ? 'ว่าง' : 'ไม่ว่าง'}`,
        `return len(stack.items) == 0`,
        800,
      ),
    );

    steps.push(
      createExecutionStep(
        `Is Empty สำเร็จ! Stack ${isEmpty ? 'ว่าง' : 'ไม่ว่าง'}`,
        `Is Empty สำเร็จ - Result: ${isEmpty}`,
        1000,
      ),
    );

    return steps;
  }

  // Size operation - ดูจำนวน elements ใน stack
  async size(): Promise<StackExecutionStep[]> {
    const steps: StackExecutionStep[] = [];

    steps.push(
      createExecutionStep(`กำลังดูจำนวน elements ใน stack`, `เรียกใช้ stack.size()`, 1000),
    );

    const size = this.state.elements.length;
    steps.push(createExecutionStep(`Stack มี ${size} elements`, `return len(stack.items)`, 800));

    steps.push(
      createExecutionStep(
        `Size สำเร็จ! Stack มี ${size} elements`,
        `Size สำเร็จ - Result: ${size}`,
        1000,
      ),
    );

    return steps;
  }

  // Get current state
  getState(): StackState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<StackState>): void {
    this.state = { ...this.state, ...newState };
  }
}

export { StackService };
