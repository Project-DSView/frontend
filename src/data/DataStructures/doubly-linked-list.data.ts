import { DoublyLinkedListDragComponent } from '@/types';

const doublyLinkedListDragComponents: DoublyLinkedListDragComponent[] = [
  // Insertion Operations
  {
    id: 'insert_beginning',
    name: 'Insert at Beginning',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'insert_beginning',
    description: 'เพิ่ม node ใหม่ที่หัวลิสต์ (head)',
  },
  {
    id: 'insert_end',
    name: 'Insert at End',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'insert_end',
    description: 'เพิ่ม node ใหม่ที่ท้ายลิสต์ (tail)',
  },
  {
    id: 'insert_position',
    name: 'Insert at Position',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'insert_position',
    description: 'แทรก node ใหม่ที่ตำแหน่งที่กำหนด',
  },
  {
    id: 'insert_before_position',
    name: 'Insert Before Position',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'insert_before_position',
    description: 'แทรก node ใหม่ก่อนตำแหน่งที่กำหนด',
  },

  // Deletion Operations
  {
    id: 'delete_beginning',
    name: 'Delete from Beginning',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'delete_beginning',
    description: 'ลบ node แรก (head)',
  },
  {
    id: 'delete_end',
    name: 'Delete from End',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'delete_end',
    description: 'ลบ node สุดท้าย (tail)',
  },
  {
    id: 'delete_value',
    name: 'Delete by Value',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'delete_value',
    description: 'ลบ node ตามค่าที่กำหนด',
  },
  {
    id: 'delete_position',
    name: 'Delete at Position',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'delete_position',
    description: 'ลบ node ตามตำแหน่งที่กำหนด',
  },
  {
    id: 'delete_before_position',
    name: 'Delete Before Position',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'delete_before_position',
    description: 'ลบ node ก่อนตำแหน่งที่กำหนด',
  },

  // Traversal Operations
  {
    id: 'traverse_forward',
    name: 'Traverse Forward (Head→Tail)',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traverse_forward',
    description: 'เดินจาก head → tail เพื่อดูข้อมูลทุก node',
  },
  {
    id: 'traverse_backward',
    name: 'Traverse Backward (Tail→Head)',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traverse_backward',
    description: 'เดินจาก tail → head เพื่อดูข้อมูลทุก node',
  },
  // Update/Modify Operations
  {
    id: 'update_value',
    name: 'Update by Value',
    color: 'bg-orange-100 border-orange-300',
    category: 'update',
    type: 'update_value',
    description: 'เปลี่ยนค่าข้อมูล (data) ตามค่าที่กำหนด',
  },
  {
    id: 'update_position',
    name: 'Update by Position',
    color: 'bg-orange-100 border-orange-300',
    category: 'update',
    type: 'update_position',
    description: 'เปลี่ยนค่าข้อมูล (data) ตามตำแหน่งที่กำหนด',
  },
];

const doublyLinkedListCodeTemplate = `# Python code สำหรับ Doubly Linked List
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
    
    # Insertion Operations
    def insert_at_beginning(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
    
    def insert_at_end(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.prev = self.tail
            self.tail.next = new_node
            self.tail = new_node
    
    # Deletion Operations
    def delete_from_beginning(self):
        if not self.head:
            return None
        
        data = self.head.data
        if self.head == self.tail:
            self.head = None
            self.tail = None
        else:
            self.head = self.head.next
            self.head.prev = None
        
        return data
    
    def delete_from_end(self):
        if not self.head:
            return None
        
        data = self.tail.data
        if self.head == self.tail:
            self.head = None
            self.tail = None
        else:
            self.tail = self.tail.prev
            self.tail.next = None
        
        return data
    
    # Traversal Operations
    def traverse_forward(self):
        result = []
        current = self.head
        while current:
            result.append(current.data)
            current = current.next
        return result
    
    def traverse_backward(self):
        result = []
        current = self.tail
        while current:
            result.append(current.data)
            current = current.prev
        return result
    

# เริ่มต้น doubly linked list
dll = DoublyLinkedList()

`;

export { doublyLinkedListDragComponents, doublyLinkedListCodeTemplate };
