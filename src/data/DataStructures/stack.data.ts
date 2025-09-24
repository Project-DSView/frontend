import { StackDragComponent } from '@/types';

const stackDragComponents: StackDragComponent[] = [
  // Insertion Operations
  {
    id: 'push',
    name: 'Push',
    color: 'bg-blue-100 border-blue-300',
    category: 'insertion',
    type: 'push',
    description: 'เพิ่ม element ลงใน stack (บนสุด)',
  },

  // Deletion Operations
  {
    id: 'pop',
    name: 'Pop',
    color: 'bg-red-100 border-red-300',
    category: 'deletion',
    type: 'pop',
    description: 'เอาออก element บนสุดของ stack',
  },
];

const stackCodeTemplate = `# Python code สำหรับ Stack
class Stack:
    def __init__(self):
        self.items = []
    
    # Push operation - เพิ่ม element ลงใน stack
    def push(self, item):
        self.items.append(item)
        print(f"Pushed {item} to stack")
    
    # Pop operation - เอาออก element บนสุด
    def pop(self):
        if self.is_empty():
            print("Stack is empty, cannot pop")
            return None
        item = self.items.pop()
        print(f"Popped {item} from stack")
        return item
    
    # Peek operation - ดูค่า element บนสุดโดยไม่ลบออก
    def peek(self):
        if self.is_empty():
            print("Stack is empty")
            return None
        item = self.items[-1]
        print(f"Top element is: {item}")
        return item
    
    # Check if stack is empty
    def is_empty(self):
        return len(self.items) == 0
    
    # Get size of stack
    def size(self):
        return len(self.items)
    
    # Display stack
    def display(self):
        if self.is_empty():
            print("Stack is empty")
        else:
            print("Stack (top to bottom):", self.items[::-1])

# เริ่มต้น stack
stack = Stack()

`;

export { stackDragComponents, stackCodeTemplate };
