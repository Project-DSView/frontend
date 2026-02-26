import {
  UndirectedGraphState,
  UndirectedGraphNode,
  UndirectedGraphEdge,
  UndirectedGraphExecutionStep,
  UndirectedGraphOperation,
} from '@/types';
import { createExecutionStep } from '@/lib';

class UndirectedGraphDragDropService {
  private state: UndirectedGraphState;

  constructor(initialState: UndirectedGraphState) {
    this.state = initialState;
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Update stats
  private updateStats(): void {
    const vertices = this.state.nodes.length;
    const edges = this.state.edges.length;
    const isConnected = this.checkConnectivity();
    const hasCycle = this.checkCycle();

    this.state.stats = {
      size: vertices,
      isEmpty: vertices === 0,
      vertices,
      edges,
      isConnected,
      hasCycle,
    };
  }

  // Check if graph is connected using DFS
  private checkConnectivity(): boolean {
    if (this.state.nodes.length === 0) return true;

    const visited = new Set<string>();
    const startNode = this.state.nodes[0];
    this.dfsVisit(startNode.id, visited);

    return visited.size === this.state.nodes.length;
  }

  // DFS helper for connectivity check
  private dfsVisit(nodeId: string, visited: Set<string>): void {
    visited.add(nodeId);
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          this.dfsVisit(neighborId, visited);
        }
      });
    }
  }

  // Check if graph has cycle using DFS
  private checkCycle(): boolean {
    if (this.state.nodes.length === 0) return false;

    const visited = new Set<string>();
    const recStack = new Set<string>();

    for (const node of this.state.nodes) {
      if (!visited.has(node.id)) {
        if (this.hasCycleDFS(node.id, visited, recStack, null)) {
          return true;
        }
      }
    }

    return false;
  }

  // DFS helper for cycle detection
  private hasCycleDFS(
    nodeId: string,
    visited: Set<string>,
    recStack: Set<string>,
    parent: string | null,
  ): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (node) {
      for (const neighborId of node.neighbors) {
        if (neighborId === parent) continue; // Skip parent in undirected graph

        if (!visited.has(neighborId)) {
          if (this.hasCycleDFS(neighborId, visited, recStack, nodeId)) {
            return true;
          }
        } else if (recStack.has(neighborId)) {
          return true;
        }
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  // Add Vertex
  async addVertex(value: string): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลังเพิ่ม Vertex ${value} เข้าไปในกราฟ`,
        `เรียกใช้ graph.add_vertex(${value})`,
        1000,
      ),
    );

    // Check if vertex already exists
    const existingNode = this.state.nodes.find((n) => n.value === value);
    if (existingNode) {
      steps.push(
        createExecutionStep(
          `Vertex ${value} มีอยู่แล้วในกราฟ`,
          `Vertex ${value} already exists`,
          1000,
        ),
      );
      return steps;
    }

    // Create new node
    const newNode: UndirectedGraphNode = {
      id: this.generateId(),
      value,
      x: Math.random() * 400 + 100, // Random position
      y: Math.random() * 300 + 100,
      neighbors: [],
    };

    this.state.nodes.push(newNode);
    this.updateStats();

    steps.push(
      createExecutionStep(`สร้าง Vertex ${value} สำเร็จ`, `Vertex ${value} added to graph`, 1000),
    );

    return steps;
  }

  // Add Edge
  async addEdge(fromValue: string, toValue: string): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลังเพิ่ม Edge ระหว่าง ${fromValue} และ ${toValue}`,
        `เรียกใช้ graph.add_edge(${fromValue}, ${toValue})`,
        1000,
      ),
    );

    const fromNode = this.state.nodes.find((n) => n.value === fromValue);
    const toNode = this.state.nodes.find((n) => n.value === toValue);

    if (!fromNode) {
      steps.push(
        createExecutionStep(`ไม่พบ Vertex ${fromValue}`, `Vertex ${fromValue} not found`, 1000),
      );
      return steps;
    }

    if (!toNode) {
      steps.push(
        createExecutionStep(`ไม่พบ Vertex ${toValue}`, `Vertex ${toValue} not found`, 1000),
      );
      return steps;
    }

    if (fromValue === toValue) {
      steps.push(
        createExecutionStep(
          `ไม่สามารถเชื่อม Vertex กับตัวเองได้`,
          `Cannot connect vertex to itself`,
          1000,
        ),
      );
      return steps;
    }

    // Check if edge already exists
    const existingEdge = this.state.edges.find(
      (e) =>
        (e.from === fromNode.id && e.to === toNode.id) ||
        (e.from === toNode.id && e.to === fromNode.id),
    );

    if (existingEdge) {
      steps.push(
        createExecutionStep(
          `Edge ระหว่าง ${fromValue} และ ${toValue} มีอยู่แล้ว`,
          `Edge already exists`,
          1000,
        ),
      );
      return steps;
    }

    // Create edge
    const newEdge: UndirectedGraphEdge = {
      id: this.generateId(),
      from: fromNode.id,
      to: toNode.id,
    };

    this.state.edges.push(newEdge);

    // Update neighbors
    fromNode.neighbors.push(toNode.id);
    toNode.neighbors.push(fromNode.id);

    this.updateStats();

    steps.push(
      createExecutionStep(
        `เพิ่ม Edge ระหว่าง ${fromValue} และ ${toValue} สำเร็จ`,
        `Edge added successfully`,
        1000,
      ),
    );

    return steps;
  }

  // Remove Vertex
  async removeVertex(value: string): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลังลบ Vertex ${value}`,
        `เรียกใช้ graph.remove_vertex(${value})`,
        1000,
      ),
    );

    const nodeToRemove = this.state.nodes.find((n) => n.value === value);
    if (!nodeToRemove) {
      steps.push(createExecutionStep(`ไม่พบ Vertex ${value}`, `Vertex ${value} not found`, 1000));
      return steps;
    }

    // Remove all edges connected to this vertex
    const edgesToRemove = this.state.edges.filter(
      (e) => e.from === nodeToRemove.id || e.to === nodeToRemove.id,
    );

    for (const edge of edgesToRemove) {
      // Update neighbors
      const otherNodeId = edge.from === nodeToRemove.id ? edge.to : edge.from;
      const otherNode = this.state.nodes.find((n) => n.id === otherNodeId);
      if (otherNode) {
        otherNode.neighbors = otherNode.neighbors.filter((id) => id !== nodeToRemove.id);
      }
    }

    // Remove edges
    this.state.edges = this.state.edges.filter(
      (e) => e.from !== nodeToRemove.id && e.to !== nodeToRemove.id,
    );

    // Remove node
    this.state.nodes = this.state.nodes.filter((n) => n.id !== nodeToRemove.id);

    this.updateStats();

    steps.push(
      createExecutionStep(
        `ลบ Vertex ${value} และ edges ที่เกี่ยวข้องสำเร็จ`,
        `Vertex and connected edges removed`,
        1000,
      ),
    );

    return steps;
  }

  // Remove Edge
  async removeEdge(fromValue: string, toValue: string): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลังลบ Edge ระหว่าง ${fromValue} และ ${toValue}`,
        `เรียกใช้ graph.remove_edge(${fromValue}, ${toValue})`,
        1000,
      ),
    );

    const fromNode = this.state.nodes.find((n) => n.value === fromValue);
    const toNode = this.state.nodes.find((n) => n.value === toValue);

    if (!fromNode || !toNode) {
      steps.push(
        createExecutionStep(
          `ไม่พบ Vertex ${fromValue} หรือ ${toValue}`,
          `One or both vertices not found`,
          1000,
        ),
      );
      return steps;
    }

    const edgeToRemove = this.state.edges.find(
      (e) =>
        (e.from === fromNode.id && e.to === toNode.id) ||
        (e.from === toNode.id && e.to === fromNode.id),
    );

    if (!edgeToRemove) {
      steps.push(
        createExecutionStep(
          `ไม่พบ Edge ระหว่าง ${fromValue} และ ${toValue}`,
          `Edge not found`,
          1000,
        ),
      );
      return steps;
    }

    // Remove edge
    this.state.edges = this.state.edges.filter((e) => e.id !== edgeToRemove.id);

    // Update neighbors
    fromNode.neighbors = fromNode.neighbors.filter((id) => id !== toNode.id);
    toNode.neighbors = toNode.neighbors.filter((id) => id !== fromNode.id);

    this.updateStats();

    steps.push(
      createExecutionStep(
        `ลบ Edge ระหว่าง ${fromValue} และ ${toValue} สำเร็จ`,
        `Edge removed successfully`,
        1000,
      ),
    );

    return steps;
  }

  // DFS Traversal
  async traversalDFS(startValue: string): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `เริ่ม DFS Traversal จาก Vertex ${startValue}`,
        `เรียกใช้ graph.dfs(${startValue})`,
        1000,
      ),
    );

    const startNode = this.state.nodes.find((n) => n.value === startValue);
    if (!startNode) {
      steps.push(
        createExecutionStep(`ไม่พบ Vertex ${startValue}`, `Vertex ${startValue} not found`, 1000),
      );
      return steps;
    }

    const visited = new Set<string>();
    const result: string[] = [];

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const node = this.state.nodes.find((n) => n.id === nodeId);
      if (node) {
        result.push(node.value);
        steps.push(
          createExecutionStep(`เยี่ยม Vertex ${node.value}`, `Visit vertex ${node.value}`, 1000),
        );

        node.neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            dfs(neighborId);
          }
        });
      }
    };

    dfs(startNode.id);

    steps.push(
      createExecutionStep(
        `DFS Traversal เสร็จสิ้น: [${result.join(', ')}]`,
        `DFS completed: [${result.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // BFS Traversal
  async traversalBFS(startValue: string): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `เริ่ม BFS Traversal จาก Vertex ${startValue}`,
        `เรียกใช้ graph.bfs(${startValue})`,
        1000,
      ),
    );

    const startNode = this.state.nodes.find((n) => n.value === startValue);
    if (!startNode) {
      steps.push(
        createExecutionStep(`ไม่พบ Vertex ${startValue}`, `Vertex ${startValue} not found`, 1000),
      );
      return steps;
    }

    const visited = new Set<string>();
    const queue: string[] = [startNode.id];
    const result: string[] = [];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;

      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      const node = this.state.nodes.find((n) => n.id === nodeId);
      if (node) {
        result.push(node.value);
        steps.push(
          createExecutionStep(`เยี่ยม Vertex ${node.value}`, `Visit vertex ${node.value}`, 1000),
        );

        node.neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            queue.push(neighborId);
          }
        });
      }
    }

    steps.push(
      createExecutionStep(
        `BFS Traversal เสร็จสิ้น: [${result.join(', ')}]`,
        `BFS completed: [${result.join(', ')}]`,
        1000,
      ),
    );

    return steps;
  }

  // Shortest Path (Dijkstra's Algorithm)
  async shortestPath(
    startValue: string,
    endValue: string,
  ): Promise<UndirectedGraphExecutionStep[]> {
    const steps: UndirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `เริ่มหา Shortest Path จาก ${startValue} ไป ${endValue}`,
        `เรียกใช้ graph.shortest_path(${startValue}, ${endValue})`,
        1000,
      ),
    );

    const startNode = this.state.nodes.find((n) => n.value === startValue);
    const endNode = this.state.nodes.find((n) => n.value === endValue);

    if (!startNode) {
      steps.push(
        createExecutionStep(`ไม่พบ Vertex ${startValue}`, `Vertex ${startValue} not found`, 1000),
      );
      return steps;
    }

    if (!endNode) {
      steps.push(
        createExecutionStep(`ไม่พบ Vertex ${endValue}`, `Vertex ${endValue} not found`, 1000),
      );
      return steps;
    }

    if (startValue === endValue) {
      steps.push(
        createExecutionStep(
          `จุดเริ่มต้นและจุดปลายทางเหมือนกัน`,
          `Start and end vertices are the same`,
          1000,
        ),
      );
      return steps;
    }

    // Dijkstra's Algorithm
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const visited = new Set<string>();
    const unvisited = new Set<string>();

    // Initialize distances
    this.state.nodes.forEach((node) => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });

    steps.push(
      createExecutionStep(
        `เริ่มต้น Dijkstra's Algorithm`,
        `Initialize distances and previous nodes`,
        1000,
      ),
    );

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let currentNodeId = '';
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currentNodeId = nodeId;
        }
      }

      if (currentNodeId === '') break;

      const currentNode = this.state.nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) break;

      unvisited.delete(currentNodeId);
      visited.add(currentNodeId);

      steps.push(
        createExecutionStep(
          `เยี่ยม Vertex ${currentNode.value} (ระยะทาง: ${distances[currentNodeId]})`,
          `Visit vertex ${currentNode.value} with distance ${distances[currentNodeId]}`,
          1000,
        ),
      );

      // Check neighbors
      for (const neighborId of currentNode.neighbors) {
        if (visited.has(neighborId)) continue;

        const edge = this.state.edges.find(
          (e) =>
            (e.from === currentNodeId && e.to === neighborId) ||
            (e.from === neighborId && e.to === currentNodeId),
        );

        if (!edge) continue;

        const edgeWeight = edge.weight || 1;
        const newDistance = distances[currentNodeId] + edgeWeight;

        if (newDistance < distances[neighborId]) {
          distances[neighborId] = newDistance;
          previous[neighborId] = currentNodeId;
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    const pathNodeIds: string[] = [];
    let currentId = endNode.id;

    while (currentId !== null) {
      const node = this.state.nodes.find((n) => n.id === currentId);
      if (node) {
        path.unshift(node.value);
        pathNodeIds.unshift(node.id);
      }
      currentId = previous[currentId] || '';
    }

    if (path.length === 0 || path[0] !== startValue) {
      steps.push(
        createExecutionStep(
          `ไม่พบเส้นทางจาก ${startValue} ไป ${endValue}`,
          `No path found from ${startValue} to ${endValue}`,
          1000,
        ),
      );
      return steps;
    }

    // Find edges in the shortest path
    const pathEdges: string[] = [];
    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      const fromId = pathNodeIds[i];
      const toId = pathNodeIds[i + 1];

      const edge = this.state.edges.find(
        (e) => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId),
      );

      if (edge) {
        pathEdges.push(edge.id);
      }
    }

    steps.push(
      createExecutionStep(
        `พบ Shortest Path: [${path.join(' → ')}] (ระยะทาง: ${distances[endNode.id]})`,
        `Found shortest path: [${path.join(' → ')}] with distance ${distances[endNode.id]}`,
        1000,
      ),
    );

    return steps;
  }

  // Execute operation
  async executeOperation(
    operation: UndirectedGraphOperation,
  ): Promise<UndirectedGraphExecutionStep[]> {
    switch (operation.type) {
      case 'add_vertex':
        return this.addVertex(operation.value || '');
      case 'add_edge':
        return this.addEdge(operation.fromVertex || '', operation.toVertex || '');
      case 'remove_vertex':
        return this.removeVertex(operation.value || '');
      case 'remove_edge':
        return this.removeEdge(operation.fromVertex || '', operation.toVertex || '');
      case 'traversal_dfs':
        return this.traversalDFS(operation.startVertex || '');
      case 'traversal_bfs':
        return this.traversalBFS(operation.startVertex || '');
      case 'shortest_path':
        return this.shortestPath(operation.startVertex || '', operation.endVertex || '');
      default:
        return [];
    }
  }

  // Get current state
  getState(): UndirectedGraphState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<UndirectedGraphState>): void {
    this.state = { ...this.state, ...newState };
  }
}

export { UndirectedGraphDragDropService };
