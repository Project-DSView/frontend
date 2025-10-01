import { OperationCategory } from '@/types';

const categories = [
  {
    key: 'insertion' as OperationCategory,
    title: 'Insertion Operations',
    color: 'text-blue-600',
  },
  {
    key: 'deletion' as OperationCategory,
    title: 'Deletion Operations',
    color: 'text-red-600',
  },
  {
    key: 'traversal' as OperationCategory,
    title: 'Traversal Operations',
    color: 'text-green-600',
  },
  {
    key: 'update' as OperationCategory,
    title: 'Update Operations',
    color: 'text-orange-600',
  },
];

export { categories };
