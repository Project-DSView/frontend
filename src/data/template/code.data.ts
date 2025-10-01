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

const stackCodeTemplate = `class ArrayStack:
    def __init__(self):
        self.data = []
    def size(self):
        return len(self.data)
    def is_empty(self):
        if self.data == []:
            return True
        else:
            return False
    def push(self, input_data):
        self.data.append(input_data)
    def pop(self):
        if self.data == []:
            return print("Underflow: Cannot pop data from an empty list")
        else:
            self.data.pop()
    def stackTop(self):
        return self.data[-1]

    def printStack(self):
        print(self.data)

def is_parentheses_matching(expression):
        myStack = ArrayStack()
        for i in expression:
            if i == "(":
                myStack.push(i)
            elif i == ")":
                if myStack.stackTop() == "(":
                    myStack.pop()
                else:
                    myStack.push(i)
        if myStack.size() == 0:
            return True
        else:
            print("Parentheses in "+ expression + " are unmatched")
            return False
        
def copyStack(s1, s2):
        newStack = ArrayStack()
        while s1.size() != 0:
            data = s1.pop()
            newStack.push(data)
        while s2.size() != 0:
            s2.pop()
        while newStack.size() != 0:
            data = newStack.pop()
            s1.push(data)
            s2.push(data)
        
        del newStack
def infixToPostfix(expression):
        text = ""
        getStack = ArrayStack()
        lista = ["+", "-"]
        listb = ["*", "/"]
        for i in expression:
            if i not in lista and i not in listb:
                text += i
            elif i in listb:
                if getStack.size() == 0:
                    getStack.push(i)
                else:
                    if getStack.stackTop() == "+" or getStack.stackTop() == "-":
                        getStack.push(i)
                    else:
                        while getStack.size() != 0:
                            data = getStack.stackTop()
                            text += data
                            getStack.push(i)
            elif i in lista:
                if getStack.size() == 0:
                    getStack.push(i)
                else:
                    while getStack.size() != 0:
                        data = getStack.stackTop()
                        text += data
                        getStack.pop()
                    getStack.push(i)
        while getStack.size() != 0:
            data = getStack.stackTop()
            text += data
            getStack.pop()
        return text

newStack = ArrayStack()
str = "(((A-B)*C)"
result = is_parentheses_matching(str)
print(result)
s1 = ArrayStack(); 
s1.push(10); s1.push(20); s1.push(30)
s2 = ArrayStack(); s2.push(15)
copyStack(s1, s2)
s1.printStack()
s2.printStack()
exp = "A+B*C-D/E"
postfix = infixToPostfix(exp)
print("Postfix of", exp, "is", postfix)

`;

const bstCodeTemplate = `class BSTNode:
    """
    A class representing a single node in the Binary Search Tree.

    Attributes:
        data: The data stored in the node.
        left: A reference to the left child node.
        right: A reference to the right child node.
    """
    def __init__(self, data):
        """
        Initializes a new BSTNode.

        Args:
            data: The data to be stored in the node.
        """
        self.data = data
        self.left = None
        self.right = None

class BST:
    """
    A class representing the Binary Search Tree.

    Attributes:
        root: The root node of the tree.
    """
    def __init__(self):
        """
        Initializes an empty Binary Search Tree.
        """
        self.root = None

    def is_empty(self):
        """
        Checks if the tree is empty.

        Returns:
            True if the tree is empty, False otherwise.
        """
        return self.root is None

    def insert(self, data):
        """
        Inserts a new data value into the tree.

        Args:
            data: The data to be inserted.
        """
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
        """
        Deletes a node with the specified data from the tree.

        Args:
            data: The data of the node to be deleted.

        Returns:
            The deleted data if successful, None otherwise.
        """
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
        """
        Finds the minimum value in the tree.

        Returns:
            The minimum value, or None if the tree is empty.
        """
        if self.is_empty():
            return None
        current_node = self.root
        while current_node.left is not None:
            current_node = current_node.left
        return current_node.data

    def findMax(self):
        """
        Finds the maximum value in the tree.

        Returns:
            The maximum value, or None if the tree is empty.
        """
        if self.is_empty():
            return None
        current_node = self.root
        while current_node.right is not None:
            current_node = current_node.right
        return current_node.data

    def traverse(self):
        """
        Performs all three traversals (preorder, inorder, postorder) and prints the results.
        """
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
        """
        Performs a preorder traversal (Root -> Left -> Right).
        """
        if root is not None:
            print(f"-> {root.data}", end=" ")
            self.preorder(root.left)
            self.preorder(root.right)

    def inorder(self, root):
        """
        Performs an inorder traversal (Left -> Root -> Right).
        """
        if root is not None:
            self.inorder(root.left)
            print(f"-> {root.data}", end=" ")
            self.inorder(root.right)

    def postorder(self, root):
        """
        Performs a postorder traversal (Left -> Right -> Root).
        """
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

print("\n--- Test Case 2: Deletion and Finding Min/Max ---")
deleted_data = myBST.delete(14)
print(f"Deleted data: {deleted_data}")
print("Min: ", myBST.findMin())
print("Max: ", myBST.findMax())

# --- Test Case 3: More Deletion Tests ---
print("\n--- Test Case 3: More Deletion Tests ---")
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

print("\nDeleting leaf node (5):")
deleted_data = myBST_del.delete(5)
print(f"Deleted data: {deleted_data}")
myBST_del.traverse()

print("\nDeleting node with two children (14):")
deleted_data = myBST_del.delete(14)
print(f"Deleted data: {deleted_data}")
myBST_del.traverse()

print("\nDeleting node with one child (7):")
deleted_data = myBST_del.delete(7)
print(f"Deleted data: {deleted_data}")
myBST_del.traverse()
`;

const undirectedGraphCodeTemplate = `
    import collections

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
        print("\n--- Graph Adjacency List ---")
        for vertex, neighbors in self.adjacency_list.items():
            print(f"'{vertex}': {', '.join(map(str, neighbors)) if neighbors else 'No neighbors'}")
        print("----------------------------\n")
        
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
        print("\n--- Directed Graph Adjacency List ---")
        for vertex, neighbors in self.adjacency_list.items():
            print(f"'{vertex}': {', '.join(map(str, neighbors)) if neighbors else 'No outgoing edges'}")
        print("------------------------------------\n")
        
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

export {
  singlyLinkedListCodeTemplate,
  doublyLinkedListCodeTemplate,
  stackCodeTemplate,
  bstCodeTemplate,
  undirectedGraphCodeTemplate,
  directedGraphCodeTemplate,
};
