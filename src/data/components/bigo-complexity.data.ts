import { BigOComplexityInfo } from '@/types';

const BIG_O_COMPLEXITY_DATA: BigOComplexityInfo[] = [
  {
    notation: 'O(1)',
    type: 'Constant',
    examples: 'Hash table access, Array index access',
    description: 'ใช้เวลาคงที่ไม่ว่าข้อมูลจะมีขนาดเท่าไหร่ก็ตาม',
    color: '#10b981',
  },
  {
    notation: 'O(log n)',
    type: 'Logarithmic',
    examples: 'Binary search of a sorted array',
    description: 'เวลาเพิ่มขึ้นทีละน้อย เมื่อ n เพิ่มเป็นสองเท่า เวลาจะเพิ่มขึ้นเพียงค่าคงที่',
    color: '#14b8a6',
  },
  {
    notation: 'O(n)',
    type: 'Linear',
    examples: 'Finding an item in an unsorted list',
    description: 'เวลาเพิ่มขึ้นตามสัดส่วนของ n ถ้า n เพิ่มเป็นสองเท่า เวลาก็เพิ่มเป็นสองเท่า',
    color: '#3b82f6',
  },
  {
    notation: 'O(n log n)',
    type: 'Linearithmic',
    examples: 'Quicksort, Merge Sort',
    description:
      'เวลาเพิ่มขึ้นในอัตราที่มากกว่า linear เล็กน้อย เป็นประสิทธิภาพที่ดีที่สุดสำหรับ comparison-based sorting',
    color: '#f59e0b',
  },
  {
    notation: 'O(n²)',
    type: 'Quadratic',
    examples: 'Bubble Sort, Selection Sort',
    description: 'เวลาเพิ่มขึ้นตามผลคูณของ n*n ถ้า n เพิ่มเป็นสองเท่า เวลาจะเพิ่มขึ้น 4 เท่า',
    color: '#f97316',
  },
  {
    notation: 'O(2ⁿ)',
    type: 'Exponential',
    examples: 'Recursive Fibonacci, Travelling salesman (DP)',
    description: 'เวลาเพิ่มขึ้นแบบทวีคูณตาม n แต่ละ n ที่เพิ่มขึ้นทำให้เวลาเพิ่มเป็นสองเท่า',
    color: '#ef4444',
  },
  {
    notation: 'O(n!)',
    type: 'Factorial',
    examples: 'Travelling salesman (Brute force), Permutations',
    description:
      'เวลาเพิ่มขึ้นตามผลคูณของตัวเลขทั้งหมด (เช่น 1×2×3×4...) ช้าที่สุดในบรรดา complexity ทั่วไป',
    color: '#ef4444',
  },
];

export { BIG_O_COMPLEXITY_DATA };
