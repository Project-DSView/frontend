import { BSTNode } from '@/types';

function isNodeLike(val: unknown): boolean {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return 'next' in obj || 'prev' in obj || 'left' in obj || 'right' in obj || 'data' in obj;
}

/**
 * Helper to format object values for display
 */
function formatObjectValue(val: unknown): string | null {
  if (val === undefined || val === null) return 'null';

  // Handle primitive values
  if (typeof val !== 'object') {
    return String(val);
  }

  const obj = val as Record<string, unknown>;

  // Extract meaningful data from node-like objects
  if ('data' in obj && obj.data !== undefined) {
    return String(obj.data);
  }
  if ('value' in obj && obj.value !== undefined) {
    return String(obj.value);
  }
  if ('name' in obj && obj.name !== undefined) {
    return String(obj.name);
  }
  if ('val' in obj && obj.val !== undefined) {
    return String(obj.val);
  }

  // For linked list nodes
  if ('next' in obj || 'prev' in obj) {
    const nodeData = obj.data ?? obj.value ?? obj.name;
    if (nodeData !== undefined) {
      return `Node(${String(nodeData)})`;
    }
  }

  // For BST nodes
  if ('left' in obj || 'right' in obj) {
    const nodeData = obj.data ?? obj.value ?? obj.val;
    if (nodeData !== undefined) {
      return `TreeNode(${String(nodeData)})`;
    }
  }

  // Arrays
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    if (val.length <= 5) {
      return `[${val.map((v) => (typeof v === 'object' ? formatObjectValue(v) : String(v))).join(', ')}]`;
    }
    return `[${val.length} items]`;
  }

  // Try to get a compact representation
  try {
    const str = JSON.stringify(val);
    if (str.length < 40) return str;
    return 'Object';
  } catch {
    return 'Object';
  }
}

function generateHashAddress(value: string): string {
  // Generate distinct address based on value hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Base address 0x300 for BST
  const offset = Math.abs(hash) % 0xfff;
  return `0x${(0x300 + offset).toString(16).toUpperCase().padStart(3, '0')}`;
}

function convertToBSTNode(nodeData: unknown): BSTNode | null {
  if (!nodeData || typeof nodeData !== 'object') {
    return null;
  }

  const data = nodeData as Record<string, unknown>;
  const node: BSTNode = {
    value: String(data.data || data.value || ''),
    left: null,
    right: null,
    id: Math.random().toString(36).substring(2, 11),
  };

  if (data.left) {
    node.left = convertToBSTNode(data.left);
  }
  if (data.right) {
    node.right = convertToBSTNode(data.right);
  }

  return node;
}

export { isNodeLike, formatObjectValue, generateHashAddress, convertToBSTNode };
