import { BSTDragComponent } from '@/types';

const bstDragComponents: BSTDragComponent[] = [
  // Insertion Operations
  {
    id: 'insert',
    name: 'Insert Node',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'insert',
    description: 'เพิ่ม node ใหม่ใน Binary Search Tree',
  },

  // Deletion Operations
  {
    id: 'delete',
    name: 'Delete Node',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'delete',
    description: 'ลบ node จาก Binary Search Tree',
  },

  // Searching Operations
  {
    id: 'search',
    name: 'Search Node',
    color: 'bg-purple-100 border-purple-300',
    category: 'searching',
    type: 'search',
    description: 'ค้นหา node ใน Binary Search Tree',
  },

  // Traversal Operations
  {
    id: 'traverse_inorder',
    name: 'Inorder Traversal',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traverse_inorder',
    description: 'เดินทางผ่าน BST แบบ Inorder (Left → Root → Right)',
  },
  {
    id: 'traverse_preorder',
    name: 'Preorder Traversal',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traverse_preorder',
    description: 'เดินทางผ่าน BST แบบ Preorder (Root → Left → Right)',
  },
  {
    id: 'traverse_postorder',
    name: 'Postorder Traversal',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traverse_postorder',
    description: 'เดินทางผ่าน BST แบบ Postorder (Left → Right → Root)',
  },

  // Utility Operations
  {
    id: 'find_min',
    name: 'Find Minimum',
    color: 'bg-orange-100 border-orange-300',
    category: 'utility',
    type: 'find_min',
    description: 'หาค่าที่น้อยที่สุดใน BST',
  },
  {
    id: 'find_max',
    name: 'Find Maximum',
    color: 'bg-orange-100 border-orange-300',
    category: 'utility',
    type: 'find_max',
    description: 'หาค่าที่มากที่สุดใน BST',
  },
];

const bstCodeTemplate = `# Python code สำหรับ Binary Search Tree
class BSTNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None
    
    # Insertion Operation
    def insert(self, value):
        if not self.root:
            self.root = BSTNode(value)
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node, value):
        if value < node.value:
            if node.left is None:
                node.left = BSTNode(value)
            else:
                self._insert_recursive(node.left, value)
        elif value > node.value:
            if node.right is None:
                node.right = BSTNode(value)
            else:
                self._insert_recursive(node.right, value)
    
    # Deletion Operation
    def delete(self, value):
        self.root = self._delete_recursive(self.root, value)
    
    def _delete_recursive(self, node, value):
        if node is None:
            return node
        
        if value < node.value:
            node.left = self._delete_recursive(node.left, value)
        elif value > node.value:
            node.right = self._delete_recursive(node.right, value)
        else:
            # Node to be deleted found
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left
            
            # Node with two children
            min_node = self._find_min(node.right)
            node.value = min_node.value
            node.right = self._delete_recursive(node.right, min_node.value)
        
        return node
    
    # Search Operation
    def search(self, value):
        return self._search_recursive(self.root, value)
    
    def _search_recursive(self, node, value):
        if node is None or node.value == value:
            return node is not None
        
        if value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)
    
    # Traversal Operations
    def inorder_traversal(self):
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)
    
    def preorder_traversal(self):
        result = []
        self._preorder_recursive(self.root, result)
        return result
    
    def _preorder_recursive(self, node, result):
        if node:
            result.append(node.value)
            self._preorder_recursive(node.left, result)
            self._preorder_recursive(node.right, result)
    
    def postorder_traversal(self):
        result = []
        self._postorder_recursive(self.root, result)
        return result
    
    def _postorder_recursive(self, node, result):
        if node:
            self._postorder_recursive(node.left, result)
            self._postorder_recursive(node.right, result)
            result.append(node.value)
    
    # Utility Operations
    def find_min(self):
        if not self.root:
            return None
        return self._find_min(self.root).value
    
    def _find_min(self, node):
        while node.left:
            node = node.left
        return node
    
    def find_max(self):
        if not self.root:
            return None
        return self._find_max(self.root).value
    
    def _find_max(self, node):
        while node.right:
            node = node.right
        return node
    
    def get_height(self):
        return self._get_height_recursive(self.root)
    
    def _get_height_recursive(self, node):
        if node is None:
            return 0
        return 1 + max(
            self._get_height_recursive(node.left),
            self._get_height_recursive(node.right)
        )

# เริ่มต้น BST
bst = BinarySearchTree()

`;

export { bstDragComponents, bstCodeTemplate };
