import { Operation } from '@/types';

export function generateDirectedGraphCode(operations: Operation[]): string {
  if (!operations || operations.length === 0) return '';

  const lines: string[] = [];

  lines.push(
    `from collections import deque`,
    ``,
    `graph = {}`,
    ``,
  );

  const ensureVertex = (v: string) => {
    lines.push(
      `if "${v}" not in graph:`,
      `    graph["${v}"] = []`,
    );
  };

  operations.forEach((op, index) => {
    lines.push(``);
    lines.push(`# Step ${index + 1}: ${op.name}`);

    switch (op.type) {
      case 'add_vertex':
        if (op.value) {
          ensureVertex(op.value);
        }
        break;

      case 'add_edge':
        if (op.fromVertex && op.toVertex) {
          ensureVertex(op.fromVertex);
          ensureVertex(op.toVertex);
          lines.push(`graph["${op.fromVertex}"].append("${op.toVertex}")`);
        }
        break;

      case 'remove_vertex':
        if (op.value) {
          lines.push(
            `if "${op.value}" in graph:`,
            `    graph.pop("${op.value}")`,
            `    for v in graph:`,
            `        if "${op.value}" in graph[v]:`,
            `            graph[v].remove("${op.value}")`,
          );
        }
        break;

      case 'remove_edge':
        if (op.fromVertex && op.toVertex) {
          lines.push(
            `if "${op.fromVertex}" in graph and "${op.toVertex}" in graph["${op.fromVertex}"]:`,
            `    graph["${op.fromVertex}"].remove("${op.toVertex}")`,
          );
        }
        break;

      case 'traversal_bfs':
        if (op.startVertex) {
          lines.push(
            `visited = set()`,
            `queue = deque(["${op.startVertex}"])`,
            ``,
            `while queue:`,
            `    v = queue.popleft()`,
            `    if v not in visited:`,
            `        print(v, end=" ")`,
            `        visited.add(v)`,
            `        for n in graph.get(v, []):`,
            `            if n not in visited:`,
            `                queue.append(n)`,
          );
        }
        break;

      case 'traversal_dfs':
        if (op.startVertex) {
          lines.push(
            `visited = set()`,
            ``,
            `def dfs(v):`,
            `    if v in visited:`,
            `        return`,
            `    print(v, end=" ")`,
            `    visited.add(v)`,
            `    for n in graph.get(v, []):`,
            `        dfs(n)`,
            ``,
            `dfs("${op.startVertex}")`,
          );
        }
        break;

      case 'shortest_path':
        if (op.startVertex && op.endVertex) {
          lines.push(
            `queue = deque([[ "${op.startVertex}" ]])`,
            `visited = set()`,
            ``,
            `while queue:`,
            `    path = queue.popleft()`,
            `    v = path[-1]`,
            `    if v == "${op.endVertex}":`,
            `        print("Shortest path:", " -> ".join(path))`,
            `        break`,
            `    if v not in visited:`,
            `        visited.add(v)`,
            `        for n in graph.get(v, []):`,
            `            queue.append(path + [n])`,
          );
        }
        break;

      default:
        lines.push(`# Unsupported operation`);
    }
  });

  lines.push(``, `print("\\nGraph:", graph)`);

  return lines.join('\n');
}
