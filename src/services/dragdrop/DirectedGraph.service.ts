import {
  DirectedGraphState,
  DirectedGraphNode,
  DirectedGraphEdge,
  DirectedGraphExecutionStep,
  DirectedGraphOperation,
} from '@/types';
import { createExecutionStep } from '@/lib';

class DirectedGraphDragDropService {
  private state: DirectedGraphState;

  constructor(initialState: DirectedGraphState) {
    this.state = initialState;
  }

  /* ================= Utilities ================= */

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  private updateStats() {
    const vertices = this.state.nodes.length;
    const edges = this.state.edges.length;

    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};

    this.state.nodes.forEach((n) => {
      inDegree[n.id] = 0;
      outDegree[n.id] = 0;
    });

    this.state.edges.forEach((e) => {
      inDegree[e.to]++;
      outDegree[e.from]++;
    });

    this.state.stats = {
      size: vertices,
      isEmpty: vertices === 0,
      vertices,
      edges,
      isStronglyConnected: true,
      hasCycle: false,
      inDegree,
      outDegree,
    };
  }

  /* ================= Operations ================= */

  async addVertex(value: string): Promise<DirectedGraphExecutionStep[]> {
    if (this.state.nodes.some((n) => n.value === value)) return [];

    const node: DirectedGraphNode = {
      id: this.generateId(),
      value,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      outgoingEdges: [],
      incomingEdges: [],
    };

    this.state.nodes.push(node);
    this.updateStats();

    return [
      createExecutionStep(`เพิ่ม Vertex ${value}`, `add_vertex(${value})`, 600),
    ];
  }

  async addEdge(fromValue: string, toValue: string) {
    let fromNode = this.state.nodes.find((n) => n.value === fromValue);
    let toNode = this.state.nodes.find((n) => n.value === toValue);

    if (!fromNode) {
      fromNode = {
        id: this.generateId(),
        value: fromValue,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        outgoingEdges: [],
        incomingEdges: [],
      };
      this.state.nodes.push(fromNode);
    }

    if (!toNode) {
      toNode = {
        id: this.generateId(),
        value: toValue,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        outgoingEdges: [],
        incomingEdges: [],
      };
      this.state.nodes.push(toNode);
    }

    if (
      this.state.edges.some(
        (e) => e.from === fromNode!.id && e.to === toNode!.id,
      )
    ) {
      return [];
    }

    const edge: DirectedGraphEdge = {
      id: this.generateId(),
      from: fromNode.id,
      to: toNode.id,
      isDirected: true,
    };

    this.state.edges.push(edge);
    fromNode.outgoingEdges.push(edge.id);
    toNode.incomingEdges.push(edge.id);

    this.updateStats();

    return [
      createExecutionStep(
        `เพิ่ม Edge ${fromValue} → ${toValue}`,
        `add_edge(${fromValue}, ${toValue})`,
        600,
      ),
    ];
  }

  async executeOperation(op: DirectedGraphOperation) {
    switch (op.type) {
      case 'add_vertex':
        return this.addVertex(op.value || '');
      case 'add_edge':
        return this.addEdge(op.fromVertex || '', op.toVertex || '');
      default:
        return [];
    }
  }

  getState(): DirectedGraphState {
    return { ...this.state };
  }
}

export { DirectedGraphDragDropService };
