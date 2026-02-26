import { QueueDragComponent } from '@/types';

const queueDragComponents: QueueDragComponent[] = [
  // Insertion Operations
  {
    id: 'enqueue',
    name: 'Enqueue',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500',
    category: 'insertion',
    type: 'enqueue',
    description: 'เพิ่ม element ลงใน queue (ท้ายสุด - FIFO)',
  },

  // Deletion Operations
  {
    id: 'dequeue',
    name: 'Dequeue',
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600',
    category: 'deletion',
    type: 'dequeue',
    description: 'เอาออก element หน้าสุดของ queue',
  },
];

export { queueDragComponents };
