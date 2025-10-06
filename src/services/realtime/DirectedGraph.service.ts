import {
  RealtimeDirectedGraphData,
  RealtimeDirectedGraphNodeData,
  RealtimeDirectedGraphEdgeData,
  RealtimeDirectedGraphOperation,
} from '@/types';

export class DirectedGraphRealtimeService {
  private data: RealtimeDirectedGraphData;
  private nodePositions: { [key: string]: { x: number; y: number } } = {};

  constructor(initialData?: Partial<RealtimeDirectedGraphData>) {
    this.data = {
      nodes: [],
      edges: [],
      vertices: 0,
      edgeCount: 0,
      isStronglyConnected: true,
      hasCycle: false,
      inDegree: {},
      outDegree: {},
      currentOperation: 'normal',
      ...initialData,
    };
  }

  // Get current data
  getData(): RealtimeDirectedGraphData {
    return { ...this.data };
  }

  // Get node positions
  getNodePositions(): { [key: string]: { x: number; y: number } } {
    return { ...this.nodePositions };
  }

  // Update node position
  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.nodePositions[nodeId] = { x, y };
  }

  // Get node position (with fallback to original position)
  getNodePosition(nodeId: string, originalX: number, originalY: number): { x: number; y: number } {
    return this.nodePositions[nodeId] || { x: originalX, y: originalY };
  }

  // Add vertex to graph
  addVertex(value: string): RealtimeDirectedGraphData {
    // Check if vertex already exists
    const existingNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === value,
    );
    if (existingNode) {
      return this.data;
    }

    // Generate unique ID
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate position (simple grid layout)
    const nodeCount = this.data.nodes.length;
    const cols = Math.ceil(Math.sqrt(nodeCount + 1));
    const x = 100 + (nodeCount % cols) * 150;
    const y = 100 + Math.floor(nodeCount / cols) * 150;

    const newNode: RealtimeDirectedGraphNodeData = {
      id,
      value,
      x,
      y,
      outgoingEdges: [],
      incomingEdges: [],
    };

    this.data.nodes.push(newNode);
    this.data.vertices = this.data.nodes.length;
    this.updateStats();

    return this.getData();
  }

  // Add edge between two vertices (directed)
  addEdge(fromValue: string, toValue: string, weight?: number): RealtimeDirectedGraphData {
    const fromNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === fromValue,
    );
    const toNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === toValue,
    );

    if (!fromNode || !toNode) {
      return this.data;
    }

    // Check if edge already exists
    const existingEdge = this.data.edges.find(
      (edge: RealtimeDirectedGraphEdgeData) => edge.from === fromNode.id && edge.to === toNode.id,
    );

    if (existingEdge) {
      return this.data;
    }

    // Generate unique ID
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newEdge: RealtimeDirectedGraphEdgeData = {
      id: edgeId,
      from: fromNode.id,
      to: toNode.id,
      weight,
      isDirected: true,
    };

    this.data.edges.push(newEdge);
    this.data.edgeCount = this.data.edges.length;

    // Update outgoing and incoming edges
    fromNode.outgoingEdges.push(edgeId);
    toNode.incomingEdges.push(edgeId);

    this.updateStats();

    return this.getData();
  }

  // Remove vertex from graph
  removeVertex(value: string): RealtimeDirectedGraphData {
    const nodeToRemove = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === value,
    );
    if (!nodeToRemove) {
      return this.data;
    }

    // Remove all edges connected to this vertex
    this.data.edges = this.data.edges.filter(
      (edge: RealtimeDirectedGraphEdgeData) =>
        edge.from !== nodeToRemove.id && edge.to !== nodeToRemove.id,
    );

    // Remove from outgoing and incoming edges of other nodes
    this.data.nodes.forEach((node: RealtimeDirectedGraphNodeData) => {
      node.outgoingEdges = node.outgoingEdges.filter(
        (edgeId: string) =>
          !this.data.edges.some((edge: RealtimeDirectedGraphEdgeData) => edge.id === edgeId),
      );
      node.incomingEdges = node.incomingEdges.filter(
        (edgeId: string) =>
          !this.data.edges.some((edge: RealtimeDirectedGraphEdgeData) => edge.id === edgeId),
      );
    });

    // Remove the node
    this.data.nodes = this.data.nodes.filter(
      (node: RealtimeDirectedGraphNodeData) => node.id !== nodeToRemove.id,
    );
    this.data.vertices = this.data.nodes.length;
    this.data.edgeCount = this.data.edges.length;

    this.updateStats();

    return this.getData();
  }

  // Remove edge between two vertices
  removeEdge(fromValue: string, toValue: string): RealtimeDirectedGraphData {
    const fromNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === fromValue,
    );
    const toNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === toValue,
    );

    if (!fromNode || !toNode) {
      return this.data;
    }

    // Remove edge
    const edgeToRemove = this.data.edges.find(
      (edge: RealtimeDirectedGraphEdgeData) => edge.from === fromNode.id && edge.to === toNode.id,
    );

    if (edgeToRemove) {
      this.data.edges = this.data.edges.filter(
        (edge: RealtimeDirectedGraphEdgeData) => edge.id !== edgeToRemove.id,
      );

      // Update outgoing and incoming edges
      fromNode.outgoingEdges = fromNode.outgoingEdges.filter(
        (edgeId: string) => edgeId !== edgeToRemove.id,
      );
      toNode.incomingEdges = toNode.incomingEdges.filter(
        (edgeId: string) => edgeId !== edgeToRemove.id,
      );
    }

    this.data.edgeCount = this.data.edges.length;
    this.updateStats();

    return this.getData();
  }

  // DFS traversal
  dfs(startValue: string): string[] {
    const startNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === startValue,
    );
    if (!startNode) {
      return [];
    }

    const visited = new Set<string>();
    const result: string[] = [];

    const dfsRecursive = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const node = this.data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === nodeId);
      if (node) {
        result.push(node.value);

        // Only follow outgoing edges for directed graph
        const outgoingEdges = this.data.edges.filter(
          (edge: RealtimeDirectedGraphEdgeData) => edge.from === nodeId,
        );
        outgoingEdges.forEach((edge: RealtimeDirectedGraphEdgeData) => {
          if (!visited.has(edge.to)) {
            dfsRecursive(edge.to);
          }
        });
      }
    };

    dfsRecursive(startNode.id);
    return result;
  }

  // BFS traversal
  bfs(startValue: string): string[] {
    const startNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === startValue,
    );
    if (!startNode) {
      return [];
    }

    const visited = new Set<string>();
    const queue: string[] = [startNode.id];
    const result: string[] = [];

    visited.add(startNode.id);

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      const currentNode = this.data.nodes.find(
        (n: RealtimeDirectedGraphNodeData) => n.id === currentNodeId,
      );

      if (currentNode) {
        result.push(currentNode.value);

        // Only follow outgoing edges for directed graph
        const outgoingEdges = this.data.edges.filter(
          (edge: RealtimeDirectedGraphEdgeData) => edge.from === currentNodeId,
        );
        outgoingEdges.forEach((edge: RealtimeDirectedGraphEdgeData) => {
          if (!visited.has(edge.to)) {
            visited.add(edge.to);
            queue.push(edge.to);
          }
        });
      }
    }

    return result;
  }

  // Topological sort
  topologicalSort(): string[] {
    if (this.calculateHasCycle()) {
      return []; // Cannot perform topological sort if cycle exists
    }

    const visited = new Set<string>();
    const stack: string[] = [];

    const dfsTopological = (nodeId: string) => {
      visited.add(nodeId);

      const node = this.data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === nodeId);
      if (node) {
        // Only follow outgoing edges for directed graph
        const outgoingEdges = this.data.edges.filter(
          (edge: RealtimeDirectedGraphEdgeData) => edge.from === nodeId,
        );
        outgoingEdges.forEach((edge: RealtimeDirectedGraphEdgeData) => {
          if (!visited.has(edge.to)) {
            dfsTopological(edge.to);
          }
        });
      }

      stack.push(nodeId);
    };

    // Visit all nodes
    this.data.nodes.forEach((node: RealtimeDirectedGraphNodeData) => {
      if (!visited.has(node.id)) {
        dfsTopological(node.id);
      }
    });

    // Convert node IDs to values and reverse
    return stack
      .map((nodeId) => {
        const node = this.data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === nodeId);
        return node ? node.value : nodeId;
      })
      .reverse();
  }

  // Shortest path using Dijkstra's algorithm
  shortestPath(startValue: string, endValue: string): string[] {
    const startNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === startValue,
    );
    const endNode = this.data.nodes.find(
      (node: RealtimeDirectedGraphNodeData) => node.value === endValue,
    );

    if (!startNode || !endNode) {
      return [];
    }

    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const visited = new Set<string>();
    const unvisited = new Set<string>();

    // Initialize distances
    this.data.nodes.forEach((node: RealtimeDirectedGraphNodeData) => {
      distances[node.id] = node.id === startNode.id ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });

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

      if (currentNodeId === '' || minDistance === Infinity) break;

      unvisited.delete(currentNodeId);
      visited.add(currentNodeId);

      // Check outgoing neighbors only for directed graph
      const outgoingEdges = this.data.edges.filter(
        (edge: RealtimeDirectedGraphEdgeData) => edge.from === currentNodeId,
      );
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
    let currentId = endNode.id;

    while (currentId !== null) {
      const node = this.data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === currentId);
      if (node) {
        path.unshift(node.value);
      }
      currentId = previous[currentId] || '';
    }

    return path[0] === startValue ? path : [];
  }

  // Calculate if graph is strongly connected
  private calculateIsStronglyConnected(): boolean {
    if (this.data.nodes.length === 0) return true;
    if (this.data.nodes.length === 1) return true;

    // Check if every node can reach every other node
    for (const startNode of this.data.nodes) {
      const visited = new Set<string>();
      const dfsVisit = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = this.data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === nodeId);
        if (node) {
          const outgoingEdges = this.data.edges.filter(
            (edge: RealtimeDirectedGraphEdgeData) => edge.from === nodeId,
          );
          outgoingEdges.forEach((edge) => {
            if (!visited.has(edge.to)) {
              dfsVisit(edge.to);
            }
          });
        }
      };

      dfsVisit(startNode.id);
      if (visited.size !== this.data.nodes.length) {
        return false;
      }
    }

    return true;
  }

  // Calculate if graph has cycle
  private calculateHasCycle(): boolean {
    if (this.data.nodes.length === 0) return false;

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const node = this.data.nodes.find((n: RealtimeDirectedGraphNodeData) => n.id === nodeId);
      if (node) {
        const outgoingEdges = this.data.edges.filter(
          (edge: RealtimeDirectedGraphEdgeData) => edge.from === nodeId,
        );
        for (const edge of outgoingEdges) {
          if (!visited.has(edge.to)) {
            if (hasCycleDFS(edge.to)) {
              return true;
            }
          } else if (recStack.has(edge.to)) {
            return true;
          }
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of this.data.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) {
          return true;
        }
      }
    }

    return false;
  }

  // Calculate in-degree and out-degree
  private calculateDegrees(): {
    inDegree: { [nodeId: string]: number };
    outDegree: { [nodeId: string]: number };
  } {
    const inDegree: { [nodeId: string]: number } = {};
    const outDegree: { [nodeId: string]: number } = {};

    // Initialize degrees
    this.data.nodes.forEach((node: RealtimeDirectedGraphNodeData) => {
      inDegree[node.id] = 0;
      outDegree[node.id] = 0;
    });

    // Calculate degrees from edges
    this.data.edges.forEach((edge: RealtimeDirectedGraphEdgeData) => {
      outDegree[edge.from]++;
      inDegree[edge.to]++;
    });

    return { inDegree, outDegree };
  }

  // Update all statistics
  private updateStats(): void {
    this.data.isStronglyConnected = this.calculateIsStronglyConnected();
    this.data.hasCycle = this.calculateHasCycle();
    const degrees = this.calculateDegrees();
    this.data.inDegree = degrees.inDegree;
    this.data.outDegree = degrees.outDegree;
  }

  // Parse Python code to extract operations
  parseCode(code: string): {
    operations: RealtimeDirectedGraphOperation[];
    graphVariables: string[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      const operations: RealtimeDirectedGraphOperation[] = [];
      const graphVariables: string[] = [];
      const errors: string[] = [];

      // Extract graph variable names
      const graphVarRegex = /(\w+)\s*=\s*DirectedGraph\(\)/g;
      let match;
      while ((match = graphVarRegex.exec(code)) !== null) {
        graphVariables.push(match[1]);
      }

      // If no graph variables found, try to find any variable that calls graph methods
      if (graphVariables.length === 0) {
        const methodCallRegex =
          /(\w+)\.(add_vertex|add_edge|remove_vertex|remove_edge|dfs|bfs|topological_sort)/g;
        while ((match = methodCallRegex.exec(code)) !== null) {
          if (!graphVariables.includes(match[1])) {
            graphVariables.push(match[1]);
          }
        }
      }

      // Parse operations
      const lines = code.split('\n');
      lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Skip comments and empty lines
        if (trimmedLine.startsWith('#') || trimmedLine === '') return;

        // Add vertex
        const addVertexMatch = trimmedLine.match(/(\w+)\.add_vertex\(['"]?([^'"),\s]+)['"]?\)/);
        if (addVertexMatch) {
          operations.push({
            type: 'add_vertex',
            parameters: [addVertexMatch[2]],
            graphVariable: addVertexMatch[1],
          });
          return;
        }

        // Add edge
        const addEdgeMatch = trimmedLine.match(
          /(\w+)\.add_edge\(['"]?([^'"),\s]+)['"]?,\s*['"]?([^'"),\s]+)['"]?\)/,
        );
        if (addEdgeMatch) {
          operations.push({
            type: 'add_edge',
            parameters: [addEdgeMatch[2], addEdgeMatch[3]],
            graphVariable: addEdgeMatch[1],
            fromVertex: addEdgeMatch[2],
            toVertex: addEdgeMatch[3],
          });
          return;
        }

        // Remove vertex
        const removeVertexMatch = trimmedLine.match(/(\w+)\.remove_vertex\(['"]([^'"]+)['"]\)/);
        if (removeVertexMatch) {
          operations.push({
            type: 'remove_vertex',
            parameters: [removeVertexMatch[2]],
            graphVariable: removeVertexMatch[1],
          });
          return;
        }

        // Remove edge
        const removeEdgeMatch = trimmedLine.match(
          /(\w+)\.remove_edge\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
        );
        if (removeEdgeMatch) {
          operations.push({
            type: 'remove_edge',
            parameters: [removeEdgeMatch[2], removeEdgeMatch[3]],
            graphVariable: removeEdgeMatch[1],
            fromVertex: removeEdgeMatch[2],
            toVertex: removeEdgeMatch[3],
          });
          return;
        }

        // DFS traversal
        const dfsMatch = trimmedLine.match(/(\w+)\.dfs\(['"]([^'"]+)['"]\)/);
        if (dfsMatch) {
          operations.push({
            type: 'traversal_dfs',
            parameters: [dfsMatch[2]],
            graphVariable: dfsMatch[1],
            startVertex: dfsMatch[2],
          });
          return;
        }

        // BFS traversal
        const bfsMatch = trimmedLine.match(/(\w+)\.bfs\(['"]([^'"]+)['"]\)/);
        if (bfsMatch) {
          operations.push({
            type: 'traversal_bfs',
            parameters: [bfsMatch[2]],
            graphVariable: bfsMatch[1],
            startVertex: bfsMatch[2],
          });
          return;
        }

        // Topological sort
        const topoMatch = trimmedLine.match(/(\w+)\.topological_sort\(\)/);
        if (topoMatch) {
          operations.push({
            type: 'topological_sort',
            parameters: [],
            graphVariable: topoMatch[1],
          });
          return;
        }
      });

      return {
        operations,
        graphVariables,
        isValid: true,
        errors,
      };
    } catch (error) {
      return {
        operations: [],
        graphVariables: [],
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Execute operations from parsed code
  executeOperations(
    operations: RealtimeDirectedGraphOperation[],
    graphVariables: string[],
  ): RealtimeDirectedGraphData {
    // Create dynamic graphs based on detected graph variables
    const graphs: {
      [graphName: string]: {
        nodes: RealtimeDirectedGraphNodeData[];
        edges: RealtimeDirectedGraphEdgeData[];
      };
    } = {};

    // Initialize all detected graph variables
    graphVariables.forEach((graphName) => {
      graphs[graphName] = { nodes: [], edges: [] };
    });

    // Execute operations dynamically
    operations.forEach((operation) => {
      if (operation.graphVariable) {
        const graphName = operation.graphVariable;

        // Ensure graph exists
        if (!graphs[graphName]) {
          graphs[graphName] = { nodes: [], edges: [] };
        }

        switch (operation.type) {
          case 'add_vertex':
            if (operation.parameters[0]) {
              // Check if vertex already exists
              const existingNode = graphs[graphName].nodes.find(
                (n) => n.value === operation.parameters[0],
              );
              if (existingNode) {
                break; // Skip if node already exists
              }

              const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const nodeCount = graphs[graphName].nodes.length;

              // Improved positioning algorithm for better visualization
              const radius = 200; // Base radius for circular layout
              const centerX = 300; // Center X coordinate
              const centerY = 200; // Center Y coordinate

              let x, y;
              if (nodeCount === 0) {
                // First node in center
                x = centerX;
                y = centerY;
              } else if (nodeCount === 1) {
                // Second node to the right
                x = centerX + radius;
                y = centerY;
              } else if (nodeCount === 2) {
                // Third node to the left
                x = centerX - radius;
                y = centerY;
              } else if (nodeCount === 3) {
                // Fourth node above
                x = centerX;
                y = centerY - radius;
              } else if (nodeCount === 4) {
                // Fifth node below
                x = centerX;
                y = centerY + radius;
              } else {
                // For more than 5 nodes, use circular layout
                const angle = (2 * Math.PI * nodeCount) / Math.max(5, nodeCount);
                x = centerX + radius * Math.cos(angle);
                y = centerY + radius * Math.sin(angle);
              }

              const newNode = {
                id: nodeId,
                value: operation.parameters[0],
                x,
                y,
                outgoingEdges: [],
                incomingEdges: [],
              };

              graphs[graphName].nodes.push(newNode);
            }
            break;
          case 'add_edge':
            if (operation.parameters[0] && operation.parameters[1]) {
              const fromNode = graphs[graphName].nodes.find(
                (n) => n.value === operation.parameters[0],
              );
              const toNode = graphs[graphName].nodes.find(
                (n) => n.value === operation.parameters[1],
              );

              if (fromNode && toNode) {
                // Check if edge already exists
                const existingEdge = graphs[graphName].edges.find(
                  (e) => e.from === fromNode.id && e.to === toNode.id,
                );
                if (existingEdge) {
                  break; // Skip if edge already exists
                }

                const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newEdge = {
                  id: edgeId,
                  from: fromNode.id,
                  to: toNode.id,
                  isDirected: true as const,
                };
                graphs[graphName].edges.push(newEdge);

                fromNode.outgoingEdges.push(edgeId);
                toNode.incomingEdges.push(edgeId);
              }
            }
            break;
          case 'remove_vertex':
            if (operation.parameters[0]) {
              graphs[graphName].nodes = graphs[graphName].nodes.filter(
                (n) => n.value !== operation.parameters[0],
              );
              graphs[graphName].edges = graphs[graphName].edges.filter((e) => {
                const fromNode = graphs[graphName].nodes.find((n) => n.id === e.from);
                const toNode = graphs[graphName].nodes.find((n) => n.id === e.to);
                return fromNode && toNode;
              });
            }
            break;
          case 'remove_edge':
            if (operation.parameters[0] && operation.parameters[1]) {
              graphs[graphName].edges = graphs[graphName].edges.filter((e) => {
                const fromNode = graphs[graphName].nodes.find((n) => n.id === e.from);
                const toNode = graphs[graphName].nodes.find((n) => n.id === e.to);
                return !(
                  fromNode?.value === operation.parameters[0] &&
                  toNode?.value === operation.parameters[1]
                );
              });
            }
            break;
        }
      }
    });

    // Update main graph to show the first non-empty graph or first graph
    const firstGraphName = graphVariables[0];
    if (firstGraphName && graphs[firstGraphName]) {
      this.data.nodes = graphs[firstGraphName].nodes;
      this.data.edges = graphs[firstGraphName].edges;
      this.data.vertices = this.data.nodes.length;
      this.data.edgeCount = this.data.edges.length;
      this.updateStats();
    }

    // Create allGraphs object for multiple graph visualization
    const allGraphs: {
      [graphName: string]: {
        data: { nodes: RealtimeDirectedGraphNodeData[]; edges: RealtimeDirectedGraphEdgeData[] };
        vertices: number;
        edgeCount: number;
        isStronglyConnected: boolean;
        hasCycle: boolean;
        inDegree: { [nodeId: string]: number };
        outDegree: { [nodeId: string]: number };
      };
    } = {};

    // Add all graphs to allGraphs
    Object.entries(graphs).forEach(([graphName, graphData]) => {
      // Calculate stats for this graph
      const tempService = new DirectedGraphRealtimeService({
        nodes: graphData.nodes,
        edges: graphData.edges,
      });
      const tempData = tempService.getData();

      allGraphs[graphName] = {
        data: graphData,
        vertices: graphData.nodes.length,
        edgeCount: graphData.edges.length,
        isStronglyConnected: tempData.isStronglyConnected,
        hasCycle: tempData.hasCycle,
        inDegree: tempData.inDegree,
        outDegree: tempData.outDegree,
      };
    });

    this.data.allGraphs = allGraphs;

    return this.getData();
  }
}
