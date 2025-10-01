import {
  DirectedGraphState,
  DirectedGraphNode,
  DirectedGraphEdge,
  DirectedGraphExecutionStep,
  DirectedGraphOperation,
} from '@/types';
import { createExecutionStep } from '@/lib';

class DirectedGraphService {
  private state: DirectedGraphState;

  constructor(initialState: DirectedGraphState) {
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
    const isStronglyConnected = this.checkStrongConnectivity();
    const hasCycle = this.checkCycle();
    const inDegree = this.calculateInDegree();
    const outDegree = this.calculateOutDegree();

    this.state.stats = {
      size: vertices,
      isEmpty: vertices === 0,
      vertices,
      edges,
      isStronglyConnected,
      hasCycle,
      inDegree,
      outDegree,
    };
  }

  // Calculate in-degree for each vertex
  private calculateInDegree(): { [key: string]: number } {
    const inDegree: { [key: string]: number } = {};

    // Initialize all vertices with 0 in-degree
    this.state.nodes.forEach((node) => {
      inDegree[node.id] = 0;
    });

    // Count incoming edges
    this.state.edges.forEach((edge) => {
      inDegree[edge.to]++;
    });

    return inDegree;
  }

  // Calculate out-degree for each vertex
  private calculateOutDegree(): { [key: string]: number } {
    const outDegree: { [key: string]: number } = {};

    // Initialize all vertices with 0 out-degree
    this.state.nodes.forEach((node) => {
      outDegree[node.id] = 0;
    });

    // Count outgoing edges
    this.state.edges.forEach((edge) => {
      outDegree[edge.from]++;
    });

    return outDegree;
  }

  // Check if graph is strongly connected using Kosaraju's algorithm
  private checkStrongConnectivity(): boolean {
    if (this.state.nodes.length === 0) return true;

    const visited = new Set<string>();
    const stack: string[] = [];

    // First DFS to fill stack
    const startNode = this.state.nodes[0];
    this.dfsFillStack(startNode.id, visited, stack);

    // If not all nodes visited, not strongly connected
    if (visited.size !== this.state.nodes.length) return false;

    // Create transpose graph
    const transpose = this.createTransposeGraph();

    // Reset visited
    visited.clear();

    // Second DFS on transpose graph
    const firstNode = stack.pop()!;
    this.dfsTranspose(firstNode, visited, transpose);

    // If all nodes visited in transpose, strongly connected
    return visited.size === this.state.nodes.length;
  }

  // DFS to fill stack for Kosaraju's algorithm
  private dfsFillStack(nodeId: string, visited: Set<string>, stack: string[]): void {
    visited.add(nodeId);

    this.state.edges.forEach((edge) => {
      if (edge.from === nodeId && !visited.has(edge.to)) {
        this.dfsFillStack(edge.to, visited, stack);
      }
    });

    stack.push(nodeId);
  }

  // Create transpose graph
  private createTransposeGraph(): { [key: string]: string[] } {
    const transpose: { [key: string]: string[] } = {};

    this.state.nodes.forEach((node) => {
      transpose[node.id] = [];
    });

    this.state.edges.forEach((edge) => {
      transpose[edge.to].push(edge.from);
    });

    return transpose;
  }

  // DFS on transpose graph
  private dfsTranspose(
    nodeId: string,
    visited: Set<string>,
    transpose: { [key: string]: string[] },
  ): void {
    visited.add(nodeId);

    if (transpose[nodeId]) {
      transpose[nodeId].forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          this.dfsTranspose(neighborId, visited, transpose);
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
        if (this.hasCycleDFS(node.id, visited, recStack)) {
          return true;
        }
      }
    }

    return false;
  }

  // DFS helper for cycle detection
  private hasCycleDFS(nodeId: string, visited: Set<string>, recStack: Set<string>): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const outgoingEdges = this.state.edges.filter((edge) => edge.from === nodeId);

    for (const edge of outgoingEdges) {
      if (!visited.has(edge.to)) {
        if (this.hasCycleDFS(edge.to, visited, recStack)) {
          return true;
        }
      } else if (recStack.has(edge.to)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  // Add Vertex
  async addVertex(value: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

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
    const newNode: DirectedGraphNode = {
      id: this.generateId(),
      value,
      x: Math.random() * 400 + 100, // Random position
      y: Math.random() * 300 + 100,
      outgoingEdges: [],
      incomingEdges: [],
    };

    this.state.nodes.push(newNode);
    this.updateStats();

    steps.push(
      createExecutionStep(`สร้าง Vertex ${value} สำเร็จ`, `Vertex ${value} added to graph`, 1000),
    );

    return steps;
  }

  // Add Edge
  async addEdge(fromValue: string, toValue: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลังเพิ่ม Edge จาก ${fromValue} ไป ${toValue}`,
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
    const existingEdge = this.state.edges.find((e) => e.from === fromNode.id && e.to === toNode.id);

    if (existingEdge) {
      steps.push(
        createExecutionStep(
          `Edge จาก ${fromValue} ไป ${toValue} มีอยู่แล้ว`,
          `Edge already exists`,
          1000,
        ),
      );
      return steps;
    }

    // Create edge
    const newEdge: DirectedGraphEdge = {
      id: this.generateId(),
      from: fromNode.id,
      to: toNode.id,
      isDirected: true,
    };

    this.state.edges.push(newEdge);

    // Update node connections
    fromNode.outgoingEdges.push(newEdge.id);
    toNode.incomingEdges.push(newEdge.id);

    this.updateStats();

    steps.push(
      createExecutionStep(
        `เพิ่ม Edge จาก ${fromValue} ไป ${toValue} สำเร็จ`,
        `Edge added successfully`,
        1000,
      ),
    );

    return steps;
  }

  // Remove Vertex
  async removeVertex(value: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

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
      // Update node connections
      const fromNode = this.state.nodes.find((n) => n.id === edge.from);
      const toNode = this.state.nodes.find((n) => n.id === edge.to);

      if (fromNode) {
        fromNode.outgoingEdges = fromNode.outgoingEdges.filter((id) => id !== edge.id);
      }
      if (toNode) {
        toNode.incomingEdges = toNode.incomingEdges.filter((id) => id !== edge.id);
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
  async removeEdge(fromValue: string, toValue: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

    steps.push(
      createExecutionStep(
        `กำลังลบ Edge จาก ${fromValue} ไป ${toValue}`,
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

    const edgeToRemove = this.state.edges.find((e) => e.from === fromNode.id && e.to === toNode.id);

    if (!edgeToRemove) {
      steps.push(
        createExecutionStep(`ไม่พบ Edge จาก ${fromValue} ไป ${toValue}`, `Edge not found`, 1000),
      );
      return steps;
    }

    // Remove edge
    this.state.edges = this.state.edges.filter((e) => e.id !== edgeToRemove.id);

    // Update node connections
    fromNode.outgoingEdges = fromNode.outgoingEdges.filter((id) => id !== edgeToRemove.id);
    toNode.incomingEdges = toNode.incomingEdges.filter((id) => id !== edgeToRemove.id);

    this.updateStats();

    steps.push(
      createExecutionStep(
        `ลบ Edge จาก ${fromValue} ไป ${toValue} สำเร็จ`,
        `Edge removed successfully`,
        1000,
      ),
    );

    return steps;
  }

  // DFS Traversal
  async traversalDFS(startValue: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

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

        // Visit outgoing edges only
        const outgoingEdges = this.state.edges.filter((edge) => edge.from === nodeId);
        outgoingEdges.forEach((edge) => {
          if (!visited.has(edge.to)) {
            dfs(edge.to);
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
  async traversalBFS(startValue: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

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

        // Add outgoing neighbors to queue
        const outgoingEdges = this.state.edges.filter((edge) => edge.from === nodeId);
        outgoingEdges.forEach((edge) => {
          if (!visited.has(edge.to)) {
            queue.push(edge.to);
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
  async shortestPath(startValue: string, endValue: string): Promise<DirectedGraphExecutionStep[]> {
    const steps: DirectedGraphExecutionStep[] = [];

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

      // Check outgoing neighbors only
      const outgoingEdges = this.state.edges.filter((edge) => edge.from === currentNodeId);
      for (const edge of outgoingEdges) {
        if (visited.has(edge.to)) continue;

        const edgeWeight = edge.weight || 1;
        const newDistance = distances[currentNodeId] + edgeWeight;

        if (newDistance < distances[edge.to]) {
          distances[edge.to] = newDistance;
          previous[edge.to] = currentNodeId;
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

      const edge = this.state.edges.find((e) => e.from === fromId && e.to === toId);

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
  async executeOperation(operation: DirectedGraphOperation): Promise<DirectedGraphExecutionStep[]> {
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
  getState(): DirectedGraphState {
    return { ...this.state };
  }

  // Update state
  updateState(newState: Partial<DirectedGraphState>): void {
    this.state = { ...this.state, ...newState };
  }
}

export { DirectedGraphService };
