import { UndirectedGraphDragComponent } from '@/types';

const undirectedGraphDragComponents: UndirectedGraphDragComponent[] = [
  {
    id: 'add_vertex',
    name: 'Add Vertex',
    color: 'bg-white border-gray-300',
    category: 'insertion',
    type: 'add_vertex',
    description: 'เพิ่ม node เข้าไปในกราฟ',
  },
  {
    id: 'add_edge',
    name: 'Add Edge',
    color: 'bg-white border-gray-300',
    category: 'insertion',
    type: 'add_edge',
    description: 'เชื่อม node สองตัว (u ↔ v)',
  },

  {
    id: 'remove_vertex',
    name: 'Remove Vertex',
    color: 'bg-white border-gray-300',
    category: 'deletion',
    type: 'remove_vertex',
    description: 'ลบ node และ edge ที่เชื่อมกับมัน',
  },
  {
    id: 'remove_edge',
    name: 'Remove Edge',
    color: 'bg-white border-gray-300',
    category: 'deletion',
    type: 'remove_edge',
    description: 'ลบเส้นเชื่อมระหว่าง node สองตัว',
  },

  {
    id: 'traversal_dfs',
    name: 'DFS Traversal',
    color: 'bg-white border-gray-300',
    category: 'traversal',
    type: 'traversal_dfs',
    description: 'เดินกราฟด้วย Depth-First Search',
  },
  {
    id: 'traversal_bfs',
    name: 'BFS Traversal',
    color: 'bg-white border-gray-300',
    category: 'traversal',
    type: 'traversal_bfs',
    description: 'เดินกราฟด้วย Breadth-First Search',
  },
  {
    id: 'shortest_path',
    name: 'Shortest Path',
    color: 'bg-white border-gray-300',
    category: 'traversal',
    type: 'shortest_path',
    description: 'หาเส้นทางที่สั้นที่สุดระหว่างสองจุด (Dijkstra)',
  },
];

export { undirectedGraphDragComponents };