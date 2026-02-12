const singlyLinkedListCodeTemplate = `class DataNode:
    ### Creat Data ###
    def __init__(self, name):
        self.name = name
        self.next = None

class SinglyLinkedList:
    ### Create List ###
    def __init__(self):
        self.count = 0
        self.head = None

    ### Print all name ###
    def traverse(self):
        start = self.head
        while start != None:
            print("->", start.name, end=" ")
            start = start.next
        if self.head == None:
            print("This is an empty list.")
        print()
    
    ### Insert data at the front ###
    def insertFront(self, name):
        pNew = DataNode(name)
        if self.head == None:
            self.head = pNew
        else:
            pNew.next = self.head
            self.head = pNew

    ### Insert Data at the end ###
    def insertLast(self, name):
        pNew = DataNode(name)
        start = self.head
        while start.next != None:
            start = start.next
        start.next = pNew
    
    ### Insert Data Between Data ###
    def insertBefore(self, Node, name):
        pNew = DataNode(name)
        start = self.head
        if self.head.name == Node:
            pNew.next = self.head
            self.head = pNew
            if self.head == None:
                print("Cannot insert, <" + name + "> dose not exist.")
        else:
            while start.next != None:
                if start.next.name == Node:
                    pNew.next = start.next
                    start.next = pNew
                    return
                start = start.next
            print("Cannot insert, <" + Node + "> dose not exist.")

    def delete(self, name):
        if self.head.name == name:
            self.head = self.head.next
            if self.head == None:
                print("Cannot insert, <" + name + "> dose not exist.")
        else:
            start = self.head
            while start.next != None:
                if start.next.name == name:
                    start.next = start.next.next
                    return
                start = start.next
            print("Cannot delete, <" + name + "> dose not exist.")
                    

mylist = SinglyLinkedList()
mylist.insertFront("Tony")
mylist.insertFront("John")
mylist.traverse()
mylist.insertFront("Mika")
mylist.insertLast("Saori")
mylist.insertBefore("John", "Ako")
mylist.traverse()
mylist.delete("John")
mylist.delete("Tony")
mylist.insertBefore("Saori", "Yaoyao")
mylist.traverse()
`;

const doublyLinkedListCodeTemplate = `class DataNode:
    ### Create Data ###
    def __init__(self, name):
        self.name = name
        self.next = None
        self.prev = None

class DoublyLinkedList:
    ### Create List ###
    def __init__(self):
        self.count = 0
        self.head = None
        self.tail = None

    ### Print all name ###
    def traverse(self):
        start = self.head
        while start != None:
            print("->", start.name, end=" ")
            start = start.next
        if self.head == None:
            print("This is an empty list.")
        print()
    
    ### Print all name in reverse ###
    def traverseReverse(self):
        start = self.tail
        while start != None:
            print("->", start.name, end=" ")
            start = start.prev
        if self.tail == None:
            print("This is an empty list.")
        print()
    
    ### Insert data at the front ###
    def insertFront(self, name):
        pNew = DataNode(name)
        if self.head == None:
            self.head = pNew
            self.tail = pNew
        else:
            pNew.next = self.head
            self.head.prev = pNew
            self.head = pNew

    ### Insert Data at the end ###
    def insertLast(self, name):
        pNew = DataNode(name)
        if self.head == None:
            self.head = pNew
            self.tail = pNew
        else:
            self.tail.next = pNew
            pNew.prev = self.tail
            self.tail = pNew
    
    ### Insert Data Between Data ###
    def insertBefore(self, Node, name):
        pNew = DataNode(name)
        if self.head == None:
            print("Cannot insert, list is empty.")
            return
            
        if self.head.name == Node:
            pNew.next = self.head
            self.head.prev = pNew
            self.head = pNew
        else:
            start = self.head
            while start.next != None:
                if start.next.name == Node:
                    pNew.next = start.next
                    pNew.prev = start
                    start.next.prev = pNew
                    start.next = pNew
                    return
                start = start.next
            print("Cannot insert, <" + Node + "> does not exist.")

    def delete(self, name):
        if self.head == None:
            print("Cannot delete, list is empty.")
            return
            
        if self.head.name == name:
            if self.head == self.tail:  # Only one node
                self.head = None
                self.tail = None
            else:
                self.head = self.head.next
                self.head.prev = None
        else:
            start = self.head
            while start.next != None:
                if start.next.name == name:
                    if start.next == self.tail:  # Deleting last node
                        self.tail = start
                        start.next = None
                    else:
                        start.next = start.next.next
                        start.next.prev = start
                    return
                start = start.next
            print("Cannot delete, <" + name + "> does not exist.")
                    

mylist = DoublyLinkedList()
mylist.insertFront("Tony")
mylist.insertFront("John")
mylist.traverse()
mylist.traverseReverse()
mylist.insertFront("Mika")
mylist.insertLast("Saori")
mylist.insertBefore("John", "Ako")
mylist.traverse()
mylist.traverseReverse()
mylist.delete("John")
mylist.delete("Tony")
mylist.insertBefore("Saori", "Yaoyao")
mylist.traverse()
mylist.traverseReverse()
`;

const queueCodeTemplate = `class ArrayQueue:
    def __init__(self):
        self.data = []

    def size(self):
        return len(self.data)

    def is_empty(self):
        return self.data == []

    def enqueue(self, input_data):
        self.data.append(input_data)

    def dequeue(self):
        if self.data == []:
            print("Underflow: Cannot dequeue data from an empty queue")
            return None
        else:
            return self.data.pop(0)

    def front(self):
        if self.data == []:
            return None
        return self.data[0]

    def back(self):
        if self.data == []:
            return None
        return self.data[-1]

    def printQueue(self):
        print(self.data)

myQueue = ArrayQueue()
myQueue.enqueue(10)
myQueue.enqueue(20)
myQueue.enqueue(30)
myQueue.printQueue()

front_value = myQueue.front()
print("Front value:", front_value)

back_value = myQueue.back()
print("Back value:", back_value)

dequeued = myQueue.dequeue()
print("Dequeued:", dequeued)
myQueue.printQueue()

print("Queue size:", myQueue.size())
print("Is empty:", myQueue.is_empty())
`;

const stackCodeTemplate = `class ArrayStack:
    def __init__(self):
        self.data = []

    def size(self):
        return len(self.data)

    def is_empty(self):
        return self.data == []

    def push(self, input_data):
        self.data.append(input_data)

    def pop(self):
        if self.data == []:
            print("Underflow: Cannot pop data from an empty list")
            return None
        else:
            return self.data.pop() 

    def stackTop(self):
        if self.data == []:
            return None
        return self.data[-1]

    def printStack(self):
        print(self.data)


def is_parentheses_matching(expression):
    myStack = ArrayStack()
    for i in expression:
        if i == "(":
            myStack.push(i)
        elif i == ")":
            if myStack.is_empty():
                print("Parentheses in " + expression + " are unmatched")
                return False
            elif myStack.stackTop() == "(":
                myStack.pop()
            else:
                myStack.push(i)

    if myStack.size() == 0:
        return True
    else:
        print("Parentheses in " + expression + " are unmatched")
        return False


def copyStack(s1, s2):
    newStack = ArrayStack()
    # คัดลอกจาก s1 ไป newStack (กลับลำดับ)
    while s1.size() != 0:
        data = s1.pop()
        newStack.push(data)
    # เคลียร์ s2
    while s2.size() != 0:
        s2.pop()
    # คัดลอกจาก newStack กลับไป s1 และ s2
    while newStack.size() != 0:
        data = newStack.pop()
        s1.push(data)
        s2.push(data)
    del newStack


def infixToPostfix(expression):
    text = ""
    getStack = ArrayStack()
    prec = {'+': 1, '-': 1, '*': 2, '/': 2}

    for i in expression:
        if i.isalpha():  # ถ้าเป็นตัวแปร เช่น A, B, C
            text += i
        else:
            # ถ้าเป็น operator (+ - * /)
            while (not getStack.is_empty() and prec.get(i, 0) <= prec.get(getStack.stackTop(), 0)):
                text += getStack.pop()
            getStack.push(i)

    while not getStack.is_empty():
        text += getStack.pop()

    return text


newStack = ArrayStack()
expr = "(((A-B)*C))"
result = is_parentheses_matching(expr)
print(result)

s1 = ArrayStack()
s1.push(10)
s1.push(20)
s1.push(30)

s2 = ArrayStack()
s2.push(15)

copyStack(s1, s2)
s1.printStack()
s2.printStack()

s1.push(50)
s1.printStack()

exp = "A+B*C-D/E"
postfix = infixToPostfix(exp)
print("Postfix of", exp, "is", postfix)
`;

const bstCodeTemplate = `class BSTNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def is_empty(self):
        return self.root is None

    def insert(self, data):
        new_node = BSTNode(data)
        if self.is_empty():
            self.root = new_node
        else:
            current_node = self.root
            while True:
                if data < current_node.data:
                    # Go left
                    if current_node.left is None:
                        current_node.left = new_node
                        return
                    current_node = current_node.left
                else:
                    # Go right
                    if current_node.right is None:
                        current_node.right = new_node
                        return
                    current_node = current_node.right

    def delete(self, data):
        # A helper function to find the successor for case 4
        def find_min_node(node):
            current = node
            while current.left is not None:
                current = current.left
            return current

        # A helper function for recursive deletion
        def _delete_recursive(root, key):
            if root is None:
                return root

            if key < root.data:
                root.left = _delete_recursive(root.left, key)
            elif key > root.data:
                root.right = _delete_recursive(root.right, key)
            else:
                # Case 1: Node with only one child or no child
                if root.left is None:
                    return root.right
                elif root.right is None:
                    return root.left

                # Case 2: Node with two children, get the inorder successor
                temp = find_min_node(root.right)
                root.data = temp.data
                root.right = _delete_recursive(root.right, temp.data)
            return root

        # Store the original root data to check if a deletion occurred
        original_root_data = self.root.data if self.root else None
        self.root = _delete_recursive(self.root, data)
        
        # If the root data has changed, it means the old root was deleted and replaced
        # If a deletion occurred, we can return the data. Otherwise, return None.
        if self.root is None or self.root.data != original_root_data:
            return data
        elif self.root.data == original_root_data and _delete_recursive(self.root, data) != self.root:
            return data
        else:
            return None


    def findMin(self):
        if self.is_empty():
            return None
        current_node = self.root
        while current_node.left is not None:
            current_node = current_node.left
        return current_node.data

    def findMax(self):
        if self.is_empty():
            return None
        current_node = self.root
        while current_node.right is not None:
            current_node = current_node.right
        return current_node.data

    def traverse(self):
        if self.is_empty():
            print("The tree is empty.")
            return

        print("• Preorder: ", end="")
        self.preorder(self.root)
        print()

        print("• Inorder: ", end="")
        self.inorder(self.root)
        print()
        
        print("• Postorder: ", end="")
        self.postorder(self.root)
        print()

    def preorder(self, root):
        if root is not None:
            print(f"-> {root.data}", end=" ")
            self.preorder(root.left)
            self.preorder(root.right)

    def inorder(self, root):
        if root is not None:
            self.inorder(root.left)
            print(f"-> {root.data}", end=" ")
            self.inorder(root.right)

    def postorder(self, root):
        if root is not None:
            self.postorder(root.left)
            self.postorder(root.right)
            print(f"-> {root.data}", end=" ")


#
# Example usage based on the lab document
#

myBST = BST()

# --- Test Case 1: Insertion and Traversal ---
print("--- Test Case 1: Insertion and Traversal ---")
myBST.insert(14)
myBST.insert(23)
myBST.insert(7)
myBST.insert(10)
myBST.insert(33)
myBST.traverse()

print("--- Test Case 2: Deletion and Finding Min/Max ---")
deleted_data = myBST.delete(14)
print(f"Deleted data: {deleted_data}")
print("Min: ", myBST.findMin())
print("Max: ", myBST.findMax())

# --- Test Case 3: More Deletion Tests ---
print("--- Test Case 3: More Deletion Tests ---")
myBST_del = BST()
myBST_del.insert(14)
myBST_del.insert(23)
myBST_del.insert(7)
myBST_del.insert(10)
myBST_del.insert(33)
myBST_del.insert(5)
myBST_del.insert(20)
myBST_del.insert(13)
print("Initial tree:")
myBST_del.traverse()

print("Deleting leaf node (5):")
deleted_data = myBST_del.delete(5)
print(f"Deleted data: {deleted_data}")
myBST_del.traverse()

print("Deleting node with two children (14):")
deleted_data = myBST_del.delete(14)
print(f"Deleted data: {deleted_data}")
myBST_del.traverse()

print("Deleting node with one child (7):")
deleted_data = myBST_del.delete(7)
print(f"Deleted data: {deleted_data}")
myBST_del.traverse()
`;

const undirectedGraphCodeTemplate = `import collections

class UndirectedGraph:
    def __init__(self):
        self.adjacency_list = {}

    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
            print(f"Vertex '{vertex}' added.")
        else:
            print(f"Vertex '{vertex}' already exists.")

    def add_edge(self, vertex1, vertex2):
        if vertex1 in self.adjacency_list and vertex2 in self.adjacency_list:
            if vertex2 not in self.adjacency_list[vertex1]:
                self.adjacency_list[vertex1].append(vertex2)
            if vertex1 not in self.adjacency_list[vertex2]:
                self.adjacency_list[vertex2].append(vertex1)
            print(f"Edge added between '{vertex1}' and '{vertex2}'.")
        else:
            print("Error: One or both vertices not found.")

    def remove_edge(self, vertex1, vertex2):
        if vertex1 in self.adjacency_list and vertex2 in self.adjacency_list:
            try:
                self.adjacency_list[vertex1].remove(vertex2)
                self.adjacency_list[vertex2].remove(vertex1)
                print(f"Edge removed between '{vertex1}' and '{vertex2}'.")
            except ValueError:
                print(f"Error: No edge exists between '{vertex1}' and '{vertex2}'.")

    def remove_vertex(self, vertex_to_remove):
        if vertex_to_remove in self.adjacency_list:
            for vertex in self.adjacency_list:
                if vertex_to_remove in self.adjacency_list[vertex]:
                    self.adjacency_list[vertex].remove(vertex_to_remove)
            del self.adjacency_list[vertex_to_remove]
            print(f"Vertex '{vertex_to_remove}' removed.")
        else:
            print(f"Error: Vertex '{vertex_to_remove}' not found.")

    def display(self):
        if not self.adjacency_list:
            print("The graph is empty.")
            return
        print("--- Graph Adjacency List ---")
        for vertex, neighbors in self.adjacency_list.items():
            print(f"'{vertex}': {', '.join(map(str, neighbors)) if neighbors else 'No neighbors'}")
        print("----------------------------")
        
    def bfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            print("Error: Starting vertex not found.")
            return []
        visited = set()
        queue = collections.deque([start_vertex])
        result = []
        visited.add(start_vertex)
        print(f"BFS (from '{start_vertex}'): ", end="")
        while queue:
            current_vertex = queue.popleft()
            result.append(current_vertex)
            print(f"-> {current_vertex}", end=" ")
            for neighbor in self.adjacency_list[current_vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        print()
        return result

    def dfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            print("Error: Starting vertex not found.")
            return []
        visited = set()
        result = []
        def _dfs_recursive(vertex):
            visited.add(vertex)
            result.append(vertex)
            print(f"-> {vertex}", end=" ")
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    _dfs_recursive(neighbor)
        print(f"DFS (from '{start_vertex}'): ", end="")
        _dfs_recursive(start_vertex)
        print()
        return result

    def has_cycle(self):
        visited = set()
        def dfs_cycle_check(vertex, parent):
            visited.add(vertex)
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    if dfs_cycle_check(neighbor, vertex):
                        return True
                elif neighbor != parent:
                    return True
            return False
        for vertex in self.adjacency_list:
            if vertex not in visited:
                if dfs_cycle_check(vertex, None):
                    return True
        return False

    def is_connected(self):
        if not self.adjacency_list:
            return True
        visited = set()
        start_vertex = next(iter(self.adjacency_list))
        def dfs_visit(vertex):
            visited.add(vertex)
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    dfs_visit(neighbor)
        dfs_visit(start_vertex)
        return len(visited) == len(self.adjacency_list)

# Example usage
print("=== Undirected Graph Example ===")
myGraph = UndirectedGraph()

print("--- Adding Vertices and Edges ---")
myGraph.add_vertex("A")
myGraph.add_vertex("B")
myGraph.add_vertex("C")
myGraph.add_vertex("D")
myGraph.add_edge("A", "B")
myGraph.add_edge("A", "C")
myGraph.add_edge("B", "D")
myGraph.add_edge("C", "D")
myGraph.display()

print("--- Graph Traversal ---")
myGraph.bfs("A")
myGraph.dfs("A")

print("--- Graph Properties ---")
print(f"Is connected: {myGraph.is_connected()}")
print(f"Has cycle: {myGraph.has_cycle()}")

print("--- Removing Edge ---")
myGraph.remove_edge("C", "D")
myGraph.display()

print("--- Final Traversal ---")
myGraph.bfs("A")
myGraph.dfs("A")
`;

const directedGraphCodeTemplate = `import collections

class DirectedGraph:
    def __init__(self):
        self.adjacency_list = {}

    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
            print(f"Vertex '{vertex}' added.")
        else:
            print(f"Vertex '{vertex}' already exists.")

    def add_edge(self, from_vertex, to_vertex):
        if from_vertex in self.adjacency_list and to_vertex in self.adjacency_list:
            if to_vertex not in self.adjacency_list[from_vertex]:
                self.adjacency_list[from_vertex].append(to_vertex)
                print(f"Edge added from '{from_vertex}' to '{to_vertex}'.")
            else:
                print(f"Edge from '{from_vertex}' to '{to_vertex}' already exists.")
        else:
            print("Error: One or both vertices not found.")

    def remove_edge(self, from_vertex, to_vertex):
        if from_vertex in self.adjacency_list and to_vertex in self.adjacency_list:
            try:
                self.adjacency_list[from_vertex].remove(to_vertex)
                print(f"Edge removed from '{from_vertex}' to '{to_vertex}'.")
            except ValueError:
                print(f"Error: No edge exists from '{from_vertex}' to '{to_vertex}'.")

    def remove_vertex(self, vertex_to_remove):
        if vertex_to_remove in self.adjacency_list:
            self.adjacency_list[vertex_to_remove] = []
            for vertex in self.adjacency_list:
                if vertex_to_remove in self.adjacency_list[vertex]:
                    self.adjacency_list[vertex].remove(vertex_to_remove)
            del self.adjacency_list[vertex_to_remove]
            print(f"Vertex '{vertex_to_remove}' removed.")
        else:
            print(f"Error: Vertex '{vertex_to_remove}' not found.")

    def display(self):
        if not self.adjacency_list:
            print("The graph is empty.")
            return
        print("--- Directed Graph Adjacency List ---")
        for vertex, neighbors in self.adjacency_list.items():
            print(f"'{vertex}': {', '.join(map(str, neighbors)) if neighbors else 'No outgoing edges'}")
        print("------------------------------------")
        
    def bfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            print("Error: Starting vertex not found.")
            return []
        visited = set()
        queue = collections.deque([start_vertex])
        result = []
        visited.add(start_vertex)
        print(f"BFS (from '{start_vertex}'): ", end="")
        while queue:
            current_vertex = queue.popleft()
            result.append(current_vertex)
            print(f"-> {current_vertex}", end=" ")
            for neighbor in self.adjacency_list[current_vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        print()
        return result

    def dfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            print("Error: Starting vertex not found.")
            return []
        visited = set()
        result = []
        def _dfs_recursive(vertex):
            visited.add(vertex)
            result.append(vertex)
            print(f"-> {vertex}", end=" ")
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    _dfs_recursive(neighbor)
        print(f"DFS (from '{start_vertex}'): ", end="")
        _dfs_recursive(start_vertex)
        print()
        return result

    def has_cycle(self):
        visited = set()
        rec_stack = set()
        def dfs_cycle_check(vertex):
            visited.add(vertex)
            rec_stack.add(vertex)
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    if dfs_cycle_check(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.remove(vertex)
            return False
        for vertex in self.adjacency_list:
            if vertex not in visited:
                if dfs_cycle_check(vertex):
                    return True
        return False

    def topological_sort(self):
        if self.has_cycle():
            print("Cannot perform topological sort: Graph contains a cycle.")
            return None
        visited = set()
        stack = []
        def dfs_topological(vertex):
            visited.add(vertex)
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    dfs_topological(neighbor)
            stack.append(vertex)
        for vertex in self.adjacency_list:
            if vertex not in visited:
                dfs_topological(vertex)
        return stack[::-1]

    def get_in_degree(self, vertex):
        if vertex not in self.adjacency_list:
            return -1
        in_degree = 0
        for v in self.adjacency_list:
            if vertex in self.adjacency_list[v]:
                in_degree += 1
        return in_degree

    def get_out_degree(self, vertex):
        if vertex not in self.adjacency_list:
            return -1
        return len(self.adjacency_list[vertex])

# Example usage
print("=== Directed Graph Example ===")
myGraph = DirectedGraph()

print("--- Adding Vertices and Edges ---")
myGraph.add_vertex("A")
myGraph.add_vertex("B")
myGraph.add_vertex("C")
myGraph.add_vertex("D")
myGraph.add_edge("A", "B")
myGraph.add_edge("A", "C")
myGraph.add_edge("B", "D")
myGraph.add_edge("C", "D")
myGraph.add_edge("D", "A")  # This creates a cycle
myGraph.add_edge("B", "A")  # This creates bidirectional edge
myGraph.add_edge("C", "A")  # This creates bidirectional edge
myGraph.display()

print("--- Graph Traversal ---")
myGraph.bfs("A")
myGraph.dfs("A")

print("--- Graph Properties ---")
print(f"Has cycle: {myGraph.has_cycle()}")
print(f"Vertex A - In-degree: {myGraph.get_in_degree('A')}, Out-degree: {myGraph.get_out_degree('A')}")

print("--- Removing Edge to Break Cycle ---")
myGraph.remove_edge("D", "A")
myGraph.display()

print("--- Topological Sort ---")
topo_order = myGraph.topological_sort()
if topo_order:
    print(f"Topological order: {' -> '.join(topo_order)}")

print("--- Final Traversal ---")
myGraph.bfs("A")
myGraph.dfs("A")
`;

// =============================================================================
// DRAGDROP BASE TEMPLATES (Class definitions only, no example code)
// =============================================================================

const bstDragDropBaseTemplate = `class BSTNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def is_empty(self):
        return self.root is None

    def insert(self, data):
        new_node = BSTNode(data)
        if self.is_empty():
            self.root = new_node
        else:
            current_node = self.root
            while True:
                if data < current_node.data:
                    if current_node.left is None:
                        current_node.left = new_node
                        return
                    current_node = current_node.left
                else:
                    if current_node.right is None:
                        current_node.right = new_node
                        return
                    current_node = current_node.right

    def delete(self, data):
        def find_min_node(node):
            current = node
            while current.left is not None:
                current = current.left
            return current

        def _delete_recursive(root, key):
            if root is None:
                return root
            if key < root.data:
                root.left = _delete_recursive(root.left, key)
            elif key > root.data:
                root.right = _delete_recursive(root.right, key)
            else:
                if root.left is None:
                    return root.right
                elif root.right is None:
                    return root.left
                temp = find_min_node(root.right)
                root.data = temp.data
                root.right = _delete_recursive(root.right, temp.data)
            return root

        self.root = _delete_recursive(self.root, data)

    def search(self, data):
        current = self.root
        while current:
            if data == current.data:
                return True
            elif data < current.data:
                current = current.left
            else:
                current = current.right
        return False

    def inorder(self, node=None, first=True):
        if first:
            node = self.root
        result = []
        if node:
            result += self.inorder(node.left, False)
            result.append(node.data)
            result += self.inorder(node.right, False)
        return result

    def preorder(self, node=None, first=True):
        if first:
            node = self.root
        result = []
        if node:
            result.append(node.data)
            result += self.preorder(node.left, False)
            result += self.preorder(node.right, False)
        return result

    def postorder(self, node=None, first=True):
        if first:
            node = self.root
        result = []
        if node:
            result += self.postorder(node.left, False)
            result += self.postorder(node.right, False)
            result.append(node.data)
        return result
`;

const stackDragDropBaseTemplate = `class ArrayStack:
    def __init__(self):
        self.data = []

    def size(self):
        return len(self.data)

    def is_empty(self):
        return self.data == []

    def push(self, input_data):
        self.data.append(input_data)

    def pop(self):
        if self.data == []:
            print("Underflow: Cannot pop from empty stack")
            return None
        return self.data.pop()

    def peek(self):
        if self.data == []:
            return None
        return self.data[-1]

    def print_stack(self):
        print("Stack:", self.data)
`;

const queueDragDropBaseTemplate = `class ArrayQueue:
    def __init__(self):
        self.data = []

    def size(self):
        return len(self.data)

    def is_empty(self):
        return self.data == []

    def enqueue(self, input_data):
        self.data.append(input_data)

    def dequeue(self):
        if self.data == []:
            print("Underflow: Cannot dequeue from empty queue")
            return None
        return self.data.pop(0)

    def front(self):
        if self.data == []:
            return None
        return self.data[0]

    def back(self):
        if self.data == []:
            return None
        return self.data[-1]

    def print_queue(self):
        print("Queue:", self.data)
`;

const singlyLinkedListDragDropBaseTemplate = `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None

    def insert_beginning(self, data):
        node = Node(data)
        node.next = self.head
        self.head = node

    def insert_end(self, data):
        node = Node(data)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node

    def insert_position(self, data, pos):
        if pos <= 0:
            return self.insert_beginning(data)
        node = Node(data)
        cur = self.head
        for _ in range(pos - 1):
            if cur is None:
                return
            cur = cur.next
        if cur is None:
            return
        node.next = cur.next
        cur.next = node

    def delete_beginning(self):
        if self.head:
            self.head = self.head.next

    def delete_end(self):
        if not self.head:
            return
        if not self.head.next:
            self.head = None
            return
        cur = self.head
        while cur.next.next:
            cur = cur.next
        cur.next = None

    def delete_position(self, pos):
        if not self.head or pos < 0:
            return
        if pos == 0:
            return self.delete_beginning()
        cur = self.head
        for _ in range(pos - 1):
            if cur.next is None:
                return
            cur = cur.next
        if cur.next:
            cur.next = cur.next.next

    def traverse(self):
        result = []
        cur = self.head
        while cur:
            result.append(cur.data)
            cur = cur.next
        return result
`;

const doublyLinkedListDragDropBaseTemplate = `class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def insert_beginning(self, data):
        node = Node(data)
        if self.head is None:
            self.head = node
            self.tail = node
        else:
            node.next = self.head
            self.head.prev = node
            self.head = node

    def insert_end(self, data):
        node = Node(data)
        if self.tail is None:
            self.head = node
            self.tail = node
        else:
            self.tail.next = node
            node.prev = self.tail
            self.tail = node

    def insert_position(self, data, pos):
        if pos <= 0:
            return self.insert_beginning(data)
        cur = self.head
        for _ in range(pos):
            if cur is None:
                return self.insert_end(data)
            cur = cur.next
        if cur is None:
            return self.insert_end(data)
        node = Node(data)
        prev_node = cur.prev
        prev_node.next = node
        node.prev = prev_node
        node.next = cur
        cur.prev = node

    def delete_beginning(self):
        if self.head is None:
            return
        if self.head == self.tail:
            self.head = None
            self.tail = None
        else:
            self.head = self.head.next
            self.head.prev = None

    def delete_end(self):
        if self.tail is None:
            return
        if self.head == self.tail:
            self.head = None
            self.tail = None
        else:
            self.tail = self.tail.prev
            self.tail.next = None

    def delete_position(self, pos):
        if self.head is None or pos < 0:
            return
        if pos == 0:
            return self.delete_beginning()
        cur = self.head
        for _ in range(pos):
            if cur is None:
                return
            cur = cur.next
        if cur is None:
            return
        if cur == self.tail:
            return self.delete_end()
        cur.prev.next = cur.next
        cur.next.prev = cur.prev

    def update_position(self, pos, new_data):
        cur = self.head
        for _ in range(pos):
            if cur is None:
                return False
            cur = cur.next
        if cur:
            cur.data = new_data
            return True
        return False

    def traverse_forward(self):
        result = []
        cur = self.head
        while cur:
            result.append(cur.data)
            cur = cur.next
        return result

    def traverse_backward(self):
        result = []
        cur = self.tail
        while cur:
            result.append(cur.data)
            cur = cur.prev
        return result
`;

const directedGraphDragDropBaseTemplate = `from collections import deque

class DirectedGraph:
    def __init__(self):
        self.adjacency_list = {}

    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []

    def add_edge(self, from_vertex, to_vertex):
        if from_vertex not in self.adjacency_list:
            self.adjacency_list[from_vertex] = []
        if to_vertex not in self.adjacency_list:
            self.adjacency_list[to_vertex] = []
        if to_vertex not in self.adjacency_list[from_vertex]:
            self.adjacency_list[from_vertex].append(to_vertex)

    def remove_vertex(self, vertex):
        if vertex in self.adjacency_list:
            del self.adjacency_list[vertex]
            for v in self.adjacency_list:
                if vertex in self.adjacency_list[v]:
                    self.adjacency_list[v].remove(vertex)

    def remove_edge(self, from_vertex, to_vertex):
        if from_vertex in self.adjacency_list:
            if to_vertex in self.adjacency_list[from_vertex]:
                self.adjacency_list[from_vertex].remove(to_vertex)

    def bfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            return []
        visited = set()
        queue = deque([start_vertex])
        result = []
        visited.add(start_vertex)
        while queue:
            vertex = queue.popleft()
            result.append(vertex)
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return result

    def dfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            return []
        visited = set()
        result = []
        def _dfs(v):
            visited.add(v)
            result.append(v)
            for neighbor in self.adjacency_list[v]:
                if neighbor not in visited:
                    _dfs(neighbor)
        _dfs(start_vertex)
        return result

    def display(self):
        for vertex, neighbors in self.adjacency_list.items():
            print(f"{vertex}: {neighbors}")
`;

const undirectedGraphDragDropBaseTemplate = `from collections import deque

class UndirectedGraph:
    def __init__(self):
        self.adjacency_list = {}

    def add_vertex(self, vertex):
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []

    def add_edge(self, vertex1, vertex2):
        if vertex1 not in self.adjacency_list:
            self.adjacency_list[vertex1] = []
        if vertex2 not in self.adjacency_list:
            self.adjacency_list[vertex2] = []
        if vertex2 not in self.adjacency_list[vertex1]:
            self.adjacency_list[vertex1].append(vertex2)
        if vertex1 not in self.adjacency_list[vertex2]:
            self.adjacency_list[vertex2].append(vertex1)

    def remove_vertex(self, vertex):
        if vertex in self.adjacency_list:
            for v in self.adjacency_list:
                if vertex in self.adjacency_list[v]:
                    self.adjacency_list[v].remove(vertex)
            del self.adjacency_list[vertex]

    def remove_edge(self, vertex1, vertex2):
        if vertex1 in self.adjacency_list and vertex2 in self.adjacency_list[vertex1]:
            self.adjacency_list[vertex1].remove(vertex2)
        if vertex2 in self.adjacency_list and vertex1 in self.adjacency_list[vertex2]:
            self.adjacency_list[vertex2].remove(vertex1)

    def bfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            return []
        visited = set()
        queue = deque([start_vertex])
        result = []
        visited.add(start_vertex)
        while queue:
            vertex = queue.popleft()
            result.append(vertex)
            for neighbor in self.adjacency_list[vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return result

    def dfs(self, start_vertex):
        if start_vertex not in self.adjacency_list:
            return []
        visited = set()
        result = []
        def _dfs(v):
            visited.add(v)
            result.append(v)
            for neighbor in self.adjacency_list[v]:
                if neighbor not in visited:
                    _dfs(neighbor)
        _dfs(start_vertex)
        return result

    def display(self):
        for vertex, neighbors in self.adjacency_list.items():
            print(f"{vertex}: {neighbors}")
`;

const defaultCodeTemplate = `# Write your code here to analyze its Big O complexity
def example_function(n):
    result = 0
    for i in range(n):
        for j in range(n):
            result += i + j
    return result
`;

export {
  // Original stepthrough templates
  defaultCodeTemplate,
  singlyLinkedListCodeTemplate,
  doublyLinkedListCodeTemplate,
  stackCodeTemplate,
  queueCodeTemplate,
  bstCodeTemplate,
  undirectedGraphCodeTemplate,
  directedGraphCodeTemplate,

  // DragDrop base templates (class definitions only)
  bstDragDropBaseTemplate,
  stackDragDropBaseTemplate,
  queueDragDropBaseTemplate,
  singlyLinkedListDragDropBaseTemplate,
  doublyLinkedListDragDropBaseTemplate,
  directedGraphDragDropBaseTemplate,
  undirectedGraphDragDropBaseTemplate,
};
