import { BSTDragComponent } from '@/types';

const bstDragComponents: BSTDragComponent[] = [
  // Insertion Operations
  {
    id: 'insert',
    name: 'Insert Node',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
    category: 'insertion',
    type: 'insert',
    description: 'เพิ่ม node ใหม่ใน Binary Search Tree',
  },

  // Deletion Operations
  {
    id: 'delete',
    name: 'Delete Node',
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600',
    category: 'deletion',
    type: 'delete',
    description: 'ลบ node จาก Binary Search Tree',
  },
  // Traversal Operations
  {
    id: 'traverse_inorder',
    name: 'Inorder Traversal',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    category: 'traversal',
    type: 'traverse_inorder',
    description: 'เดินทางผ่าน BST แบบ Inorder (Left → Root → Right)',
  },
  {
    id: 'traverse_preorder',
    name: 'Preorder Traversal',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    category: 'traversal',
    type: 'traverse_preorder',
    description: 'เดินทางผ่าน BST แบบ Preorder (Root → Left → Right)',
  },
  {
    id: 'traverse_postorder',
    name: 'Postorder Traversal',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    category: 'traversal',
    type: 'traverse_postorder',
    description: 'เดินทางผ่าน BST แบบ Postorder (Left → Right → Root)',
  },
];

export { bstDragComponents };
