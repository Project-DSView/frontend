// Components
export { getSubmenuItemsWithNested, playgroundItems } from './components/menu.data';
export { default as features } from './components/card.data';
export { structures as showcaseStructures } from './components/showcase.data';
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
export { bstDragComponents } from './dragdrop/bst.data';
export { undirectedGraphDragComponents } from './dragdrop/undirected-graph.data';
export { directedGraphDragComponents } from './dragdrop/directed-graph.data';
export {
  stackCategories,
  bstCategories,
  linkedListCategories,
  graphCategories,
} from './dragdrop/categories.data';

// Templates
export { singlyLinkedListCodeTemplate } from './template/code.data';
export { doublyLinkedListCodeTemplate } from './template/code.data';
export { stackCodeTemplate } from './template/code.data';
export { bstCodeTemplate } from './template/code.data';
export { undirectedGraphCodeTemplate } from './template/code.data';
export { directedGraphCodeTemplate } from './template/code.data';

// Submissions
export { SUBMISSION_STATUS_CONFIG } from './components/submissions';
