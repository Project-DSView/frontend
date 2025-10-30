import { MenuItem, PlaygroundItem } from '@/types';
import { MousePointerClick, Footprints, Zap } from 'lucide-react';

// Icon mapping for each playground type with gradient colors
export const playgroundIcons = {
  'Drag & Drop': {
    Icon: MousePointerClick,
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    bgGradient: 'from-pink-500/20 via-rose-500/20 to-orange-500/20',
    hoverGradient: 'from-pink-600 via-rose-600 to-orange-600',
  },
  'Step Through': {
    Icon: Footprints,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    bgGradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    hoverGradient: 'from-cyan-600 via-blue-600 to-indigo-600',
  },
  'Real-time': {
    Icon: Zap,
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    bgGradient: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20',
    hoverGradient: 'from-yellow-600 via-amber-600 to-orange-600',
  },
};

// Stable positions for particles to avoid hydration mismatch
export const PARTICLE_POSITIONS = [
  { left: 20, top: 30, offsetX: 15, duration: 3 },
  { left: 50, top: 60, offsetX: -20, duration: 4 },
  { left: 70, top: 25, offsetX: 10, duration: 3.5 },
  { left: 35, top: 80, offsetX: -15, duration: 4.5 },
  { left: 85, top: 45, offsetX: 25, duration: 3.2 },
  { left: 15, top: 70, offsetX: -10, duration: 4 },
  { left: 60, top: 15, offsetX: 12, duration: 3.8 },
  { left: 40, top: 50, offsetX: -18, duration: 4.2 },
  { left: 90, top: 80, offsetX: 20, duration: 3.7 },
  { left: 25, top: 40, offsetX: -12, duration: 4.3 },
];

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
