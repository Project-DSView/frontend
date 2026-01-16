export const generateDoublyLinkedListCode = (operations: any[]) => {
  const py = (v: any) => {
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    return JSON.stringify(String(v)); // string
  };

  const pyInt = (v: any) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 'None';
    return String(Math.trunc(n));
  };

  const lines: string[] = [];

  // ====== Class Node ======
  lines.push('class Node:');
  lines.push('    def __init__(self, data):');
  lines.push('        self.data = data');
  lines.push('        self.prev = None');
  lines.push('        self.next = None');
  lines.push('');

  // ====== Class DoublyLinkedList ======
  lines.push('class DoublyLinkedList:');
  lines.push('    def __init__(self):');
  lines.push('        self.head = None');
  lines.push('        self.tail = None');
  lines.push('        self.count = 0');
  lines.push('');

  lines.push('    def insert_beginning(self, data):');
  lines.push('        node = Node(data)');
  lines.push('        if self.head is None:');
  lines.push('            self.head = node');
  lines.push('            self.tail = node');
  lines.push('        else:');
  lines.push('            node.next = self.head');
  lines.push('            self.head.prev = node');
  lines.push('            self.head = node');
  lines.push('        self.count += 1');
  lines.push('');

  lines.push('    def insert_end(self, data):');
  lines.push('        node = Node(data)');
  lines.push('        if self.tail is None:');
  lines.push('            self.head = node');
  lines.push('            self.tail = node');
  lines.push('        else:');
  lines.push('            self.tail.next = node');
  lines.push('            node.prev = self.tail');
  lines.push('            self.tail = node');
  lines.push('        self.count += 1');
  lines.push('');

  lines.push('    def insert_position(self, data, pos):');
  lines.push('        # pos: 0..count');
  lines.push('        if pos is None:');
  lines.push('            return');
  lines.push('        pos = int(pos)');
  lines.push('        if pos <= 0:');
  lines.push('            return self.insert_beginning(data)');
  lines.push('        if pos >= self.count:');
  lines.push('            return self.insert_end(data)');
  lines.push('        cur = self.head');
  lines.push('        for _ in range(pos):');
  lines.push('            cur = cur.next');
  lines.push('        node = Node(data)');
  lines.push('        prev_node = cur.prev');
  lines.push('        prev_node.next = node');
  lines.push('        node.prev = prev_node');
  lines.push('        node.next = cur');
  lines.push('        cur.prev = node');
  lines.push('        self.count += 1');
  lines.push('');

  lines.push('    def delete_beginning(self):');
  lines.push('        if self.head is None:');
  lines.push('            return');
  lines.push('        if self.head == self.tail:');
  lines.push('            self.head = None');
  lines.push('            self.tail = None');
  lines.push('        else:');
  lines.push('            self.head = self.head.next');
  lines.push('            self.head.prev = None');
  lines.push('        self.count -= 1');
  lines.push('');

  lines.push('    def delete_end(self):');
  lines.push('        if self.tail is None:');
  lines.push('            return');
  lines.push('        if self.head == self.tail:');
  lines.push('            self.head = None');
  lines.push('            self.tail = None');
  lines.push('        else:');
  lines.push('            self.tail = self.tail.prev');
  lines.push('            self.tail.next = None');
  lines.push('        self.count -= 1');
  lines.push('');

  lines.push('    def delete_position(self, pos):');
  lines.push('        if self.head is None or pos is None:');
  lines.push('            return');
  lines.push('        pos = int(pos)');
  lines.push('        if pos <= 0:');
  lines.push('            return self.delete_beginning()');
  lines.push('        if pos >= self.count - 1:');
  lines.push('            return self.delete_end()');
  lines.push('        cur = self.head');
  lines.push('        for _ in range(pos):');
  lines.push('            cur = cur.next');
  lines.push('        cur.prev.next = cur.next');
  lines.push('        cur.next.prev = cur.prev');
  lines.push('        self.count -= 1');
  lines.push('');

  lines.push('    def update_position(self, pos, new_data):');
  lines.push('        if pos is None:');
  lines.push('            return False');
  lines.push('        pos = int(pos)');
  lines.push('        if pos < 0 or pos >= self.count:');
  lines.push('            return False');
  lines.push('        cur = self.head');
  lines.push('        for _ in range(pos):');
  lines.push('            cur = cur.next');
  lines.push('        cur.data = new_data');
  lines.push('        return True');
  lines.push('');

  lines.push('    def traverse_forward(self):');
  lines.push('        res = []');
  lines.push('        cur = self.head');
  lines.push('        while cur is not None:');
  lines.push('            res.append(cur.data)');
  lines.push('            cur = cur.next');
  lines.push('        return res');
  lines.push('');

  lines.push('    def traverse_backward(self):');
  lines.push('        res = []');
  lines.push('        cur = self.tail');
  lines.push('        while cur is not None:');
  lines.push('            res.append(cur.data)');
  lines.push('            cur = cur.prev');
  lines.push('        return res');
  lines.push('');

  // ====== Runner ======
  lines.push('dll = DoublyLinkedList()');
  lines.push('');

  operations.forEach((op: any, idx: number) => {
    const type = op?.type;

    // comment แบบ stepthrough
    const comment = (() => {
      switch (type) {
        case 'insert_beginning':
          return `# Step ${idx + 1}: insert ${op.value} at beginning`;
        case 'insert_end':
          return `# Step ${idx + 1}: insert ${op.value} at end`;
        case 'insert_position':
          return `# Step ${idx + 1}: insert ${op.value} at position ${op.position}`;
        case 'delete_beginning':
          return `# Step ${idx + 1}: delete from beginning`;
        case 'delete_end':
          return `# Step ${idx + 1}: delete from end`;
        case 'delete_position':
          return `# Step ${idx + 1}: delete at position ${op.position}`;
        case 'update_position':
          return `# Step ${idx + 1}: update position ${op.position} -> ${op.newValue}`;
        case 'traverse_forward':
          return `# Step ${idx + 1}: traverse forward`;
        case 'traverse_backward':
          return `# Step ${idx + 1}: traverse backward`;
        default:
          return `# Step ${idx + 1}: ${op?.name ?? type ?? 'unknown'}`;
      }
    })();

    lines.push(comment);

    switch (type) {
      case 'insert_beginning':
        if (op.value !== '' && op.value !== null && op.value !== undefined) {
          lines.push(`dll.insert_beginning(${py(op.value)})`);
        }
        break;

      case 'insert_end':
        if (op.value !== '' && op.value !== null && op.value !== undefined) {
          lines.push(`dll.insert_end(${py(op.value)})`);
        }
        break;

      case 'insert_position':
        if (op.value !== '' && op.value !== null && op.value !== undefined) {
          lines.push(`dll.insert_position(${py(op.value)}, ${pyInt(op.position)})`);
        }
        break;

      case 'delete_beginning':
        lines.push('dll.delete_beginning()');
        break;

      case 'delete_end':
        lines.push('dll.delete_end()');
        break;

      case 'delete_position':
        lines.push(`dll.delete_position(${pyInt(op.position)})`);
        break;

      case 'update_position':
        lines.push(`dll.update_position(${pyInt(op.position)}, ${py(op.newValue)})`);
        break;

      case 'traverse_forward':
        lines.push('print("Traverse Forward:", dll.traverse_forward())');
        break;

      case 'traverse_backward':
        lines.push('print("Traverse Backward:", dll.traverse_backward())');
        break;

      default:
        lines.push(`# (skip) unsupported op.type = ${py(type)}`);
        break;
    }

    lines.push(''); // เว้นบรรทัด
  });

  lines.push('print("Final Forward:", dll.traverse_forward())');
  lines.push('print("Final Backward:", dll.traverse_backward())');

  return lines.join('\n');
};
