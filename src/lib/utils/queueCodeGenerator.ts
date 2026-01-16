// src/lib/utils/queueCodeGenerator.ts

import { QueueOperation } from '@/types';

export const generateQueueCode = (operations: QueueOperation[]): string => {
  const lines: string[] = [];

  lines.push('queue = []');
  lines.push('');

  operations.forEach((op) => {
    switch (op.type) {
      case 'enqueue':
        if (op.value !== null && op.value !== undefined && op.value !== '') {
          lines.push(`queue.append(${JSON.stringify(op.value)})`);
        }
        break;

      case 'dequeue':
        lines.push('if queue:');
        lines.push('    queue.pop(0)');
        break;

      default:
        break;
    }
  });

  lines.push('');
  lines.push("print('Final Queue:', queue)");

  return lines.join('\n');
};
