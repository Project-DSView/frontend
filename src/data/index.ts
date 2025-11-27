// Components
export { getSubmenuItemsWithNested, playgroundItems } from './components/menu.data';
export {
  features,
  structures,
  visualizationModes,
  AUTO_SWITCH_INTERVAL,
  IMAGE_SWITCH_INTERVAL,
  playgroundIcons,
  PARTICLE_POSITIONS,
} from './components/landing.data';
export {
  getMaterialIcon,
  getMaterialTypeLabel,
  getMaterialTypeColor,
  isMaterialClickable,
  isExercise,
} from './components/material.data';

// Drag Drop
export { categories } from './dragdrop/common.data';
export { singlyLinkedListDragComponents } from './dragdrop/singly-linked-list.data';
export { doublyLinkedListDragComponents } from './dragdrop/doubly-linked-list.data';
export { stackDragComponents } from './dragdrop/stack.data';
export { queueDragComponents } from './dragdrop/queue.data';
export { bstDragComponents } from './dragdrop/bst.data';
export { undirectedGraphDragComponents } from './dragdrop/undirected-graph.data';
export { directedGraphDragComponents } from './dragdrop/directed-graph.data';
export {
  stackCategories,
  bstCategories,
  linkedListCategories,
  graphCategories,
  queueCategories,
} from './dragdrop/categories.data';

// Templates
export { singlyLinkedListCodeTemplate } from './template/code.data';
export { doublyLinkedListCodeTemplate } from './template/code.data';
export { stackCodeTemplate } from './template/code.data';
export { queueCodeTemplate } from './template/code.data';
export { bstCodeTemplate } from './template/code.data';
export { undirectedGraphCodeTemplate } from './template/code.data';
export { directedGraphCodeTemplate } from './template/code.data';

// Submissions
export { SUBMISSION_STATUS_CONFIG } from './components/submissions';

// Queue
export {
  LAB_ROOMS,
  TABLE_NUMBERS,
  QUEUE_STATUS_LABELS,
  QUEUE_STATUS_COLORS,
} from './components/queue.data';
