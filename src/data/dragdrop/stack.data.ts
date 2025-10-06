import { StackDragComponent } from '@/types';

const stackDragComponents: StackDragComponent[] = [
  // Insertion Operations
  {
    id: 'push',
    name: 'Push',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'push',
    description: 'เพิ่ม element ลงใน stack (บนสุด)',
  },

  // Deletion Operations
  {
    id: 'pop',
    name: 'Pop',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'pop',
    description: 'เอาออก element บนสุดของ stack',
  },

  // Utility Operations
  {
    id: 'copyStack',
    name: 'Copy Stack',
    color: 'bg-green-100 border-green-300',
    category: 'utility',
    type: 'copyStack',
    description: 'คัดลอกข้อมูลจาก stack หนึ่งไปยังอีก stack หนึ่ง',
  },
];

export { stackDragComponents };
