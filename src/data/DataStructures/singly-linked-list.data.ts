import { SinglyLinkedListDragComponent } from '@/types';

const singlyLinkedListDragComponents: SinglyLinkedListDragComponent[] = [
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
    description: 'เพิ่ม node ใหม่ที่ท้ายลิสต์',
  },
  {
    id: 'insert_position',
    name: 'Insert at Position',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'insert_position',
    description: 'แทรก node ใหม่ที่ตำแหน่งที่กำหนด',
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
    description: 'ลบ node สุดท้าย',
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

  // Traversal Operations
  {
    id: 'traverse',
    name: 'Traverse (Head→Tail)',
    color: 'bg-green-100 border-green-300',
    category: 'traversal',
    type: 'traverse',
    description: 'เดินจาก head → tail เพื่อดูข้อมูลทุก node',
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

const singlyLinkedListCodeTemplate = `# Python code สำหรับ Singly Linked List
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    # Insertion Operations
    def insert_at_beginning(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def insert_at_end(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = new_node
    
    def insert_at_position(self, data, position):
        if position < 0:
            return False
        
        if position == 0:
            self.insert_at_beginning(data)
            return True
        
        new_node = Node(data)
        current = self.head
        for i in range(position - 1):
            if not current:
                return False
            current = current.next
        
        if not current:
            return False
        
        new_node.next = current.next
        current.next = new_node
        return True
    
    # Deletion Operations
    def delete_from_beginning(self):
        if not self.head:
            return None
        data = self.head.data
        self.head = self.head.next
        return data
    
    def delete_from_end(self):
        if not self.head:
            return None
        
        if not self.head.next:
            data = self.head.data
            self.head = None
            return data
        
        current = self.head
        while current.next.next:
            current = current.next
        
        data = current.next.data
        current.next = None
        return data
    
    def delete_by_value(self, data):
        if not self.head:
            return False
        
        if self.head.data == data:
            self.head = self.head.next
            return True
        
        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                return True
            current = current.next
        
        return False
    
    def delete_at_position(self, position):
        if not self.head or position < 0:
            return None
        
        if position == 0:
            return self.delete_from_beginning()
        
        current = self.head
        for i in range(position - 1):
            if not current or not current.next:
                return None
            current = current.next
        
        if not current.next:
            return None
        
        data = current.next.data
        current.next = current.next.next
        return data
    
    # Traversal Operations
    def traverse(self):
        result = []
        current = self.head
        while current:
            result.append(current.data)
            current = current.next
        return result
    
    # Searching Operations
    def search_by_value(self, data):
        current = self.head
        position = 0
        while current:
            if current.data == data:
                return position
            current = current.next
            position += 1
        return -1
    
    def search_by_position(self, position):
        if position < 0:
            return None
        
        current = self.head
        for i in range(position):
            if not current:
                return None
            current = current.next
        
        return current.data if current else None
    
    # Update/Modify Operations
    def update_by_value(self, old_value, new_value):
        current = self.head
        while current:
            if current.data == old_value:
                current.data = new_value
                return True
            current = current.next
        return False
    
    def update_by_position(self, position, new_value):
        if position < 0:
            return False
        
        current = self.head
        for i in range(position):
            if not current:
                return False
            current = current.next
        
        if current:
            current.data = new_value
            return True
        return False
    

# เริ่มต้น linked list
ll = LinkedList()

`;

export { singlyLinkedListDragComponents, singlyLinkedListCodeTemplate };
