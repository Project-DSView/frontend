import { UndirectedGraphDragComponent } from '@/types';

const undirectedGraphDragComponents: UndirectedGraphDragComponent[] = [
  // Insertion Operations
  {
    id: 'add_vertex',
    name: 'Add Vertex',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
    category: 'insertion',
    type: 'add_vertex',
    description: 'เพิ่ม node เข้าไปในกราฟ',
  },
  {
    id: 'add_edge',
    name: 'Add Edge',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
    category: 'insertion',
    type: 'add_edge',
    description: 'เชื่อม node สองตัว (u ↔ v)',
  },

  // Deletion Operations
  {
    id: 'remove_vertex',
    name: 'Remove Vertex',
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600',
    category: 'deletion',
    type: 'remove_vertex',
    description: 'ลบ node และ edge ที่เชื่อมกับมัน',
  },
  {
    id: 'remove_edge',
    name: 'Remove Edge',
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600',
    category: 'deletion',
    type: 'remove_edge',
    description: 'ลบเส้นเชื่อมระหว่าง node สองตัว',
  },

  // Traversal Operations
  {
    id: 'traversal_dfs',
    name: 'DFS Traversal',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    category: 'traversal',
    type: 'traversal_dfs',
    description: 'เดินกราฟด้วย Depth-First Search',
  },
  {
    id: 'traversal_bfs',
    name: 'BFS Traversal',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    category: 'traversal',
    type: 'traversal_bfs',
    description: 'เดินกราฟด้วย Breadth-First Search',
  },
  {
    id: 'shortest_path',
    name: 'Shortest Path',
    color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600',
    category: 'traversal',
    type: 'shortest_path',
    description: 'หาเส้นทางที่สั้นที่สุดระหว่างสองจุด (Dijkstra)',
  },
];

export { undirectedGraphDragComponents };
