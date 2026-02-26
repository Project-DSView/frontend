import { QueueState, BaseExecutionStep } from '@/types';
import { createExecutionStep } from '@/lib';

class QueueDragDropService {
  private state: QueueState;

  constructor(initialState: QueueState) {
    this.state = {
      elements: [...initialState.elements],
      operations: [...initialState.operations],
      stats: { ...initialState.stats },
    };
  }

  getState(): QueueState {
    return {
      elements: [...this.state.elements],
      operations: [...this.state.operations],
      stats: { ...this.state.stats },
    };
  }

  // Enqueue operation - เพิ่ม element ลงใน queue
  async enqueue(value: string): Promise<BaseExecutionStep[]> {
    const steps: BaseExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Enqueue ค่า ${value} ลงใน queue`,
        `เรียกใช้ queue.enqueue(${value})`,
        1000,
      ),
    );

    steps.push(
      createExecutionStep(
        `เพิ่ม ${value} ลงใน queue (ท้ายสุด)`,
        `queue.items.append(${value})`,
        800,
      ),
    );

    // Update state
    this.state.elements.push(value);
    this.updateStats();

    steps.push(
      createExecutionStep(
        `Enqueue สำเร็จ! ค่า ${value} อยู่ท้ายสุดของ queue`,
        `Enqueue ${value} สำเร็จ - Queue: [${this.state.elements.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Dequeue operation - เอาออก element หน้าสุด
  async dequeue(): Promise<BaseExecutionStep[]> {
    const steps: BaseExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลัง Dequeue element หน้าสุดจาก queue`,
        `เรียกใช้ queue.dequeue()`,
        1000,
      ),
    );

    if (this.state.elements.length === 0) {
      steps.push(
        createExecutionStep(
          `Queue ว่าง ไม่สามารถ dequeue ได้`,
          `Queue is empty, cannot dequeue`,
          800,
        ),
      );
      return steps;
    }

    const dequeuedValue = this.state.elements[0];
    steps.push(
      createExecutionStep(
        `เอาออกค่า ${dequeuedValue} จากหน้าสุดของ queue`,
        `item = queue.items.pop(0)`,
        800,
      ),
    );

    // Update state
    this.state.elements.shift();
    this.updateStats();

    steps.push(
      createExecutionStep(
        `Dequeue สำเร็จ! ค่า ${dequeuedValue} ถูกลบออกจาก queue`,
        `Dequeue ${dequeuedValue} สำเร็จ - Queue: [${this.state.elements.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  front(): string | null {
    return this.state.elements.length > 0 ? this.state.elements[0] : null;
  }

  back(): string | null {
    return this.state.elements.length > 0
      ? this.state.elements[this.state.elements.length - 1]
      : null;
  }

  isEmpty(): boolean {
    return this.state.elements.length === 0;
  }

  size(): number {
    return this.state.elements.length;
  }

  private updateStats(): void {
    this.state.stats = {
      length: this.state.elements.length,
      headValue: this.state.elements.length > 0 ? this.state.elements[0] : null,
      tailValue:
        this.state.elements.length > 0 ? this.state.elements[this.state.elements.length - 1] : null,
      isEmpty: this.state.elements.length === 0,
    };
  }

  clear(): void {
    this.state.elements = [];
    this.updateStats();
  }
}

export { QueueDragDropService };
