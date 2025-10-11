import { MenuItem, PlaygroundItem } from '@/types';

const getSubmenuItemsWithNested = (basePath: string): MenuItem[] => [
  {
    href: null,
    label: 'LinkList',
    hasSubItems: true,
    subItems: [
      { href: `${basePath}/linklist/singly`, label: 'Singly Linked List' },
      { href: `${basePath}/linklist/doubly`, label: 'Doubly Linked List' },
    ],
  },
  { href: `${basePath}/stack`, label: 'Stack', hasSubItems: false },
  { href: `${basePath}/bst`, label: 'Binary Search Tree', hasSubItems: false },
  {
    href: null,
    label: 'Graph',
    hasSubItems: true,
    subItems: [
      { href: `${basePath}/graph/undirected`, label: 'Undirected Graph' },
      { href: `${basePath}/graph/directed`, label: 'Directed Graph' },
    ],
  },
];

const playgroundItems: PlaygroundItem[] = [
  {
    title: 'Tutorial',
    description: 'Tutorial For Use This Playground',
    href: '/tutorial',
  },
  {
    title: 'Drag & Drop',
    description: 'Instant Code Preview',
    items: getSubmenuItemsWithNested('/dragdrop'),
  },
  {
    title: 'Step Through',
    description: 'Run Step by Step',
    items: getSubmenuItemsWithNested('/stepthrough'),
  },
  {
    title: 'Real-time',
    description: 'Live Code Execution',
    items: getSubmenuItemsWithNested('/realtime'),
  },
];

export { getSubmenuItemsWithNested, playgroundItems };
