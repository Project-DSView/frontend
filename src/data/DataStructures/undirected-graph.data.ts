import { UndirectedGraphDragComponent, UndirectedGraphCodeTemplate } from '@/types';

export const undirectedGraphDragComponents: UndirectedGraphDragComponent[] = [
  // Insertion Operations
  {
    id: 'add_vertex',
    name: 'Add Vertex',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'add_vertex',
    description: 'เพิ่ม node เข้าไปในกราฟ',
  },
  {
    id: 'add_edge',
    name: 'Add Edge',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'add_edge',
    description: 'เชื่อม node สองตัว (u ↔ v)',
  },

  // Deletion Operations
  {
    id: 'remove_vertex',
    name: 'Remove Vertex',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'remove_vertex',
    description: 'ลบ node และ edge ที่เชื่อมกับมัน',
  },
  {
    id: 'remove_edge',
    name: 'Remove Edge',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'remove_edge',
    description: 'ลบเส้นเชื่อมระหว่าง node สองตัว',
  },

  // Traversal Operations
  {
    id: 'traversal_dfs',
    name: 'DFS Traversal',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traversal_dfs',
    description: 'เดินกราฟด้วย Depth-First Search',
  },
  {
    id: 'traversal_bfs',
    name: 'BFS Traversal',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traversal_bfs',
    description: 'เดินกราฟด้วย Breadth-First Search',
  },
  {
    id: 'shortest_path',
    name: 'Shortest Path',
    color: 'bg-purple-100 border-purple-300',
    category: 'traversal',
    type: 'shortest_path',
    description: 'หาเส้นทางที่สั้นที่สุดระหว่างสองจุด (Dijkstra)',
  },
];

export const undirectedGraphCodeTemplate: UndirectedGraphCodeTemplate = {
  addVertex: `def add_vertex(self, value):
    """เพิ่ม vertex ใหม่เข้าไปในกราฟ"""
    if value not in self.vertices:
        self.vertices[value] = []
        print(f"เพิ่ม vertex {value} สำเร็จ")
    else:
        print(f"Vertex {value} มีอยู่แล้ว")`,

  addEdge: `def add_edge(self, from_vertex, to_vertex):
    """เพิ่ม edge ระหว่างสอง vertex"""
    if from_vertex in self.vertices and to_vertex in self.vertices:
        if to_vertex not in self.vertices[from_vertex]:
            self.vertices[from_vertex].append(to_vertex)
            self.vertices[to_vertex].append(from_vertex)
            print(f"เพิ่ม edge ระหว่าง {from_vertex} และ {to_vertex} สำเร็จ")
        else:
            print(f"Edge ระหว่าง {from_vertex} และ {to_vertex} มีอยู่แล้ว")
    else:
        print("ไม่พบ vertex ที่ระบุ")`,

  removeVertex: `def remove_vertex(self, value):
    """ลบ vertex และ edges ที่เกี่ยวข้อง"""
    if value in self.vertices:
        # ลบ edges ที่เชื่อมกับ vertex นี้
        for neighbor in self.vertices[value]:
            self.vertices[neighbor].remove(value)
        
        # ลบ vertex
        del self.vertices[value]
        print(f"ลบ vertex {value} และ edges ที่เกี่ยวข้องสำเร็จ")
    else:
        print(f"ไม่พบ vertex {value}")`,

  removeEdge: `def remove_edge(self, from_vertex, to_vertex):
    """ลบ edge ระหว่างสอง vertex"""
    if (from_vertex in self.vertices and 
        to_vertex in self.vertices and 
        to_vertex in self.vertices[from_vertex]):
        
        self.vertices[from_vertex].remove(to_vertex)
        self.vertices[to_vertex].remove(from_vertex)
        print(f"ลบ edge ระหว่าง {from_vertex} และ {to_vertex} สำเร็จ")
    else:
        print(f"ไม่พบ edge ระหว่าง {from_vertex} และ {to_vertex}")`,

  traversal: `def dfs(self, start_vertex, visited=None):
    """Depth-First Search traversal"""
    if visited is None:
        visited = set()
    
    if start_vertex not in self.vertices:
        print(f"ไม่พบ vertex {start_vertex}")
        return
    
    visited.add(start_vertex)
    print(f"เยี่ยม vertex: {start_vertex}")
    
    for neighbor in self.vertices[start_vertex]:
        if neighbor not in visited:
            self.dfs(neighbor, visited)

def bfs(self, start_vertex):
    """Breadth-First Search traversal"""
    if start_vertex not in self.vertices:
        print(f"ไม่พบ vertex {start_vertex}")
        return
    
    visited = set()
    queue = [start_vertex]
    visited.add(start_vertex)
    
    while queue:
        vertex = queue.pop(0)
        print(f"เยี่ยม vertex: {vertex}")
        
        for neighbor in self.vertices[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
  
  shortestPath: `def shortest_path(self, start, end):
    """หาเส้นทางที่สั้นที่สุดด้วย Dijkstra's Algorithm"""
    if start not in self.vertices or end not in self.vertices:
        print("ไม่พบ vertex ที่ระบุ")
        return None
    
    if start == end:
        print("จุดเริ่มต้นและจุดปลายทางเหมือนกัน")
        return [start]
    
    # เริ่มต้น Dijkstra's Algorithm
    distances = {vertex: float('inf') for vertex in self.vertices}
    distances[start] = 0
    previous = {vertex: None for vertex in self.vertices}
    unvisited = set(self.vertices.keys())
    
    while unvisited:
        # หา vertex ที่มีระยะทางน้อยที่สุด
        current = min(unvisited, key=lambda v: distances[v])
        unvisited.remove(current)
        
        print(f"เยี่ยม vertex: {current} (ระยะทาง: {distances[current]})")
        
        # ตรวจสอบ neighbors
        for neighbor in self.vertices[current]:
            if neighbor in unvisited:
                edge_weight = 1  # ใช้ weight = 1 สำหรับ unweighted graph
                new_distance = distances[current] + edge_weight
                
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current
    
    # สร้างเส้นทางย้อนกลับ
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous[current]
    
    path.reverse()
    
    if path[0] != start:
        print(f"ไม่พบเส้นทางจาก {start} ไป {end}")
        return None
    
    print(f"เส้นทางที่สั้นที่สุด: {' → '.join(path)} (ระยะทาง: {distances[end]})")
    return path`,
};
