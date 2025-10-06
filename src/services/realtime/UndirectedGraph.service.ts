import {
  RealtimeUndirectedGraphData,
  RealtimeUndirectedGraphNodeData,
  RealtimeUndirectedGraphEdgeData,
  RealtimeUndirectedGraphOperation,
} from '@/types';

export class UndirectedGraphRealtimeService {
  private data: RealtimeUndirectedGraphData;
  private nodePositions: { [key: string]: { x: number; y: number } } = {};

  constructor(initialData?: Partial<RealtimeUndirectedGraphData>) {
    this.data = {
      nodes: [],
      edges: [],
      vertices: 0,
      edgeCount: 0,
      isConnected: true,
      hasCycle: false,
      currentOperation: 'normal',
      ...initialData,
    };
  }

  // Get current data
  getData(): RealtimeUndirectedGraphData {
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
  addVertex(value: string): RealtimeUndirectedGraphData {
    // Check if vertex already exists
    const existingNode = this.data.nodes.find((node) => node.value === value);
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

    const newNode: RealtimeUndirectedGraphNodeData = {
      id,
      value,
      x,
      y,
      neighbors: [],
    };

    this.data.nodes.push(newNode);
    this.data.vertices = this.data.nodes.length;
    this.data.isConnected = this.calculateIsConnected();
    this.data.hasCycle = this.calculateHasCycle();

    return this.getData();
  }

  // Add edge between two vertices
  addEdge(fromValue: string, toValue: string, weight?: number): RealtimeUndirectedGraphData {
    const fromNode = this.data.nodes.find((node) => node.value === fromValue);
    const toNode = this.data.nodes.find((node) => node.value === toValue);

    if (!fromNode || !toNode) {
      return this.data;
    }

    // Check if edge already exists
    const existingEdge = this.data.edges.find(
      (edge) =>
        (edge.from === fromNode.id && edge.to === toNode.id) ||
        (edge.from === toNode.id && edge.to === fromNode.id),
    );

    if (existingEdge) {
      return this.data;
    }

    // Generate unique ID
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newEdge: RealtimeUndirectedGraphEdgeData = {
      id: edgeId,
      from: fromNode.id,
      to: toNode.id,
      weight,
    };

    this.data.edges.push(newEdge);
    this.data.edgeCount = this.data.edges.length;

    // Update neighbors
    if (!fromNode.neighbors.includes(toNode.id)) {
      fromNode.neighbors.push(toNode.id);
    }
    if (!toNode.neighbors.includes(fromNode.id)) {
      toNode.neighbors.push(fromNode.id);
    }

    this.data.isConnected = this.calculateIsConnected();
    this.data.hasCycle = this.calculateHasCycle();

    return this.getData();
  }

  // Remove vertex from graph
  removeVertex(value: string): RealtimeUndirectedGraphData {
    const nodeToRemove = this.data.nodes.find((node) => node.value === value);
    if (!nodeToRemove) {
      return this.data;
    }

    // Remove all edges connected to this vertex
    this.data.edges = this.data.edges.filter(
      (edge) => edge.from !== nodeToRemove.id && edge.to !== nodeToRemove.id,
    );

    // Remove from neighbors of other nodes
    this.data.nodes.forEach((node) => {
      node.neighbors = node.neighbors.filter((neighborId) => neighborId !== nodeToRemove.id);
    });

    // Remove the node
    this.data.nodes = this.data.nodes.filter((node) => node.id !== nodeToRemove.id);
    this.data.vertices = this.data.nodes.length;
    this.data.edgeCount = this.data.edges.length;

    this.data.isConnected = this.calculateIsConnected();
    this.data.hasCycle = this.calculateHasCycle();

    return this.getData();
  }

  // Remove edge between two vertices
  removeEdge(fromValue: string, toValue: string): RealtimeUndirectedGraphData {
    const fromNode = this.data.nodes.find((node) => node.value === fromValue);
    const toNode = this.data.nodes.find((node) => node.value === toValue);

    if (!fromNode || !toNode) {
      return this.data;
    }

    // Remove edge
    this.data.edges = this.data.edges.filter(
      (edge) =>
        !(edge.from === fromNode.id && edge.to === toNode.id) &&
        !(edge.from === toNode.id && edge.to === fromNode.id),
    );

    // Update neighbors
    fromNode.neighbors = fromNode.neighbors.filter((neighborId) => neighborId !== toNode.id);
    toNode.neighbors = toNode.neighbors.filter((neighborId) => neighborId !== fromNode.id);

    this.data.edgeCount = this.data.edges.length;
    this.data.isConnected = this.calculateIsConnected();
    this.data.hasCycle = this.calculateHasCycle();

    return this.getData();
  }

  // DFS traversal
  dfs(startValue: string): string[] {
    const startNode = this.data.nodes.find((node) => node.value === startValue);
    if (!startNode) {
      return [];
    }

    const visited = new Set<string>();
    const result: string[] = [];

    const dfsRecursive = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      const node = this.data.nodes.find((n) => n.id === nodeId);
      if (node) {
        result.push(node.value);

        node.neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            dfsRecursive(neighborId);
          }
        });
      }
    };

    dfsRecursive(startNode.id);
    return result;
  }

  // BFS traversal
  bfs(startValue: string): string[] {
    const startNode = this.data.nodes.find((node) => node.value === startValue);
    if (!startNode) {
      return [];
    }

    const visited = new Set<string>();
    const queue: string[] = [startNode.id];
    const result: string[] = [];

    visited.add(startNode.id);

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      const currentNode = this.data.nodes.find((n) => n.id === currentNodeId);

      if (currentNode) {
        result.push(currentNode.value);

        currentNode.neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        });
      }
    }

    return result;
  }

  // Calculate if graph is connected
  private calculateIsConnected(): boolean {
    if (this.data.nodes.length === 0) return true;
    if (this.data.nodes.length === 1) return true;

    const visited = new Set<string>();
    const startNode = this.data.nodes[0];

    const dfsVisit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.data.nodes.find((n) => n.id === nodeId);
      if (node) {
        node.neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            dfsVisit(neighborId);
          }
        });
      }
    };

    dfsVisit(startNode.id);
    return visited.size === this.data.nodes.length;
  }

  // Calculate if graph has cycle
  private calculateHasCycle(): boolean {
    if (this.data.nodes.length === 0) return false;

    const visited = new Set<string>();

    const hasCycleDFS = (nodeId: string, parentId: string | null): boolean => {
      visited.add(nodeId);

      const node = this.data.nodes.find((n) => n.id === nodeId);
      if (node) {
        for (const neighborId of node.neighbors) {
          if (!visited.has(neighborId)) {
            if (hasCycleDFS(neighborId, nodeId)) {
              return true;
            }
          } else if (neighborId !== parentId) {
            return true;
          }
        }
      }
      return false;
    };

    for (const node of this.data.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id, null)) {
          return true;
        }
      }
    }

    return false;
  }

  // Parse Python code to extract operations
  parseCode(code: string): {
    operations: RealtimeUndirectedGraphOperation[];
    graphVariables: string[];
    isValid: boolean;
    errors: string[];
  } {
    try {
      const operations: RealtimeUndirectedGraphOperation[] = [];
      const graphVariables: string[] = [];
      const errors: string[] = [];

      // Extract graph variable names
      const graphVarRegex = /(\w+)\s*=\s*UndirectedGraph\(\)/g;
      let match;
      while ((match = graphVarRegex.exec(code)) !== null) {
        graphVariables.push(match[1]);
      }

      // If no graph variables found, try to find any variable that calls graph methods
      if (graphVariables.length === 0) {
        const methodCallRegex = /(\w+)\.(add_vertex|add_edge|remove_vertex|remove_edge|dfs|bfs)/g;
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
    operations: RealtimeUndirectedGraphOperation[],
    graphVariables: string[],
  ): RealtimeUndirectedGraphData {
    // Create dynamic graphs based on detected graph variables
    const graphs: {
      [graphName: string]: {
        nodes: RealtimeUndirectedGraphNodeData[];
        edges: RealtimeUndirectedGraphEdgeData[];
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
                neighbors: [],
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
                // Check if edge already exists (for undirected graph, check both directions)
                const existingEdge = graphs[graphName].edges.find(
                  (e) =>
                    (e.from === fromNode.id && e.to === toNode.id) ||
                    (e.from === toNode.id && e.to === fromNode.id),
                );
                if (existingEdge) {
                  break; // Skip if edge already exists
                }

                const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                graphs[graphName].edges.push({
                  id: edgeId,
                  from: fromNode.id,
                  to: toNode.id,
                });

                if (!fromNode.neighbors.includes(toNode.id)) {
                  fromNode.neighbors.push(toNode.id);
                }
                if (!toNode.neighbors.includes(fromNode.id)) {
                  toNode.neighbors.push(fromNode.id);
                }
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
                return (
                  !(
                    fromNode?.value === operation.parameters[0] &&
                    toNode?.value === operation.parameters[1]
                  ) &&
                  !(
                    fromNode?.value === operation.parameters[1] &&
                    toNode?.value === operation.parameters[0]
                  )
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
      this.data.isConnected = this.calculateIsConnected();
      this.data.hasCycle = this.calculateHasCycle();
    }

    // Create allGraphs object for multiple graph visualization
    const allGraphs: {
      [graphName: string]: {
        data: {
          nodes: RealtimeUndirectedGraphNodeData[];
          edges: RealtimeUndirectedGraphEdgeData[];
        };
        vertices: number;
        edgeCount: number;
        isConnected: boolean;
        hasCycle: boolean;
      };
    } = {};

    // Add all graphs to allGraphs
    Object.entries(graphs).forEach(([graphName, graphData]) => {
      allGraphs[graphName] = {
        data: graphData,
        vertices: graphData.nodes.length,
        edgeCount: graphData.edges.length,
        isConnected: true, // Simplified for now
        hasCycle: false, // Simplified for now
      };
    });

    this.data.allGraphs = allGraphs;

    return this.getData();
  }
}
