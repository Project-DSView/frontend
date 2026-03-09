// Components
export { getSubmenuItemsWithNested, playgroundItems } from './components/menu.data';
export {
  structures,
  visualizationModes,
  AUTO_SWITCH_INTERVAL,
  IMAGE_SWITCH_INTERVAL,
  PARTICLE_POSITIONS,
} from './components/landing.data';
export {
  getMaterialIcon,
  getMaterialTypeLabel,
  getMaterialTypeColor,
  isMaterialClickable,
  isExercise,
} from './components/material.data';
export {
  dragdropTutorialSteps,
  stepthroughTutorialSteps,
  getTutorialSteps,
  getTutorialStorageKey,
  namingGuides,
} from './components/tutorial.data';

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
export {
  defaultCodeTemplate,
  singlyLinkedListCodeTemplate,
  doublyLinkedListCodeTemplate,
  stackCodeTemplate,
  queueCodeTemplate,
  bstCodeTemplate,
  undirectedGraphCodeTemplate,
  directedGraphCodeTemplate,
  singlyLinkedListDragDropBaseTemplate,
  doublyLinkedListDragDropBaseTemplate,
  stackDragDropBaseTemplate,
  queueDragDropBaseTemplate,
  bstDragDropBaseTemplate,
  undirectedGraphDragDropBaseTemplate,
  directedGraphDragDropBaseTemplate,
} from './template/code.data';

// Submissions
export { SUBMISSION_STATUS_CONFIG } from './components/submissions';

// Queue
export {
  LAB_ROOMS,
  TABLE_NUMBERS,
  QUEUE_STATUS_LABELS,
  QUEUE_STATUS_COLORS,
} from './components/queue.data';

// About
export { advisor, developers } from './components/about.data';

// Pitfalls
export { COMMON_ERRORS, getPitfallInfo } from './components/pitfalls.data';

// Big O Complexity
export { BIG_O_COMPLEXITY_DATA } from './components/bigo-complexity.data';
