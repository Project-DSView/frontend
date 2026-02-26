import { StackState, StackExecutionStep } from '@/types';
import { createExecutionStep } from '@/lib';

class StackDragDropService {
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
  // Get current state
  getState(): StackState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<StackState>): void {
    this.state = { ...this.state, ...newState };
  }
}

export { StackDragDropService };
