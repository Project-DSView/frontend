import { StackDragComponent } from '@/types';

const stackDragComponents: StackDragComponent[] = [
  // Insertion Operations
  {
    id: 'push',
    name: 'Push',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-500',
    category: 'insertion',
    type: 'push',
    description: 'เพิ่ม element ลงใน stack (บนสุด)',
  },

  // Deletion Operations
  {
    id: 'pop',
    name: 'Pop',
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600',
    category: 'deletion',
    type: 'pop',
    description: 'เอาออก element บนสุดของ stack',
  },

  // Utility Operations
  {
    id: 'copyStack',
    name: 'Copy Stack',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    category: 'utility',
    type: 'copyStack',
    description: 'คัดลอกข้อมูลจาก stack หนึ่งไปยังอีก stack หนึ่ง',
  },
];

export { stackDragComponents };
