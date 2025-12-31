/**
 * AST Node Type Definitions with Educational Explanations
 * Provides descriptions and learning context for different AST node types
 */

export interface ASTNodeTypeInfo {
  type: string;
  displayName: string;
  description: string;
  thaiDescription: string;
  category: string;
  example: string;
  whyShapedThisWay: string;
  executionFlow: string;
}

export const AST_NODE_TYPES: Record<string, ASTNodeTypeInfo> = {
  Module: {
    type: 'Module',
    displayName: 'Module',
    description: 'The top-level node representing the entire Python script',
    thaiDescription: 'โหนดระดับบนสุดที่แสดงถึงสคริปต์ Python ทั้งหมด',
    category: 'structure',
    example: 'The entire code file',
    whyShapedThisWay:
      'Python organizes code as modules. The Module node contains all top-level statements.',
    executionFlow: 'Execution starts at the Module node and processes its children in order.',
  },
  ClassDef: {
    type: 'ClassDef',
    displayName: 'Class Definition',
    description: 'Represents a class definition in Python',
    thaiDescription: 'แสดงถึงการนิยามคลาสใน Python',
    category: 'definition',
    example: 'class SinglyLinkedList:',
    whyShapedThisWay:
      'Classes are containers for methods and attributes. The AST represents them as nodes with method children.',
    executionFlow: 'Class definitions are processed first, then instances can be created.',
  },
  FunctionDef: {
    type: 'FunctionDef',
    displayName: 'Function Definition',
    description: 'Represents a function or method definition',
    thaiDescription: 'แสดงถึงการนิยามฟังก์ชันหรือเมธอด',
    category: 'definition',
    example: 'def insertFront(self, name):',
    whyShapedThisWay:
      'Functions are callable code blocks. The AST shows the function name, parameters, and body as a tree structure.',
    executionFlow: 'Function definitions are stored but not executed until called.',
  },
  Call: {
    type: 'Call',
    displayName: 'Function Call',
    description: 'Represents a function or method call',
    thaiDescription: 'แสดงถึงการเรียกใช้ฟังก์ชันหรือเมธอด',
    category: 'expression',
    example: 'mylist.insertFront("Tony")',
    whyShapedThisWay:
      'Calls have a function (what to call) and arguments (what to pass). The AST shows this as a tree with the function as the root.',
    executionFlow:
      'When executed, Python evaluates the function and arguments, then executes the function body.',
  },
  Assign: {
    type: 'Assign',
    displayName: 'Assignment',
    description: 'Represents a variable assignment',
    thaiDescription: 'แสดงถึงการกำหนดค่าให้ตัวแปร',
    category: 'statement',
    example: 'mylist = SinglyLinkedList()',
    whyShapedThisWay:
      'Assignments have targets (where to store) and values (what to store). The AST represents this relationship.',
    executionFlow:
      'The right-hand side is evaluated first, then the result is stored in the left-hand side.',
  },
  Attribute: {
    type: 'Attribute',
    displayName: 'Attribute Access',
    description: 'Represents accessing an object attribute',
    thaiDescription: 'แสดงถึงการเข้าถึงแอตทริบิวต์ของออบเจ็กต์',
    category: 'expression',
    example: 'mylist.head',
    whyShapedThisWay:
      'Attributes are accessed through objects. The AST shows the object and attribute name as a parent-child relationship.',
    executionFlow: "Python looks up the attribute in the object's namespace.",
  },
  Name: {
    type: 'Name',
    displayName: 'Variable Name',
    description: 'Represents a variable name',
    thaiDescription: 'แสดงถึงชื่อตัวแปร',
    category: 'expression',
    example: 'mylist',
    whyShapedThisWay: 'Variable names are leaf nodes that reference values in the current scope.',
    executionFlow: 'Python looks up the variable name in the current scope (local, then global).',
  },
  If: {
    type: 'If',
    displayName: 'If Statement',
    description: 'Represents a conditional statement',
    thaiDescription: 'แสดงถึงคำสั่งเงื่อนไข',
    category: 'control',
    example: 'if self.head == None:',
    whyShapedThisWay:
      'If statements have a test condition and body. The AST shows the condition as a child that must be evaluated first.',
    executionFlow:
      "The condition is evaluated. If true, the body executes. Otherwise, it's skipped.",
  },
  While: {
    type: 'While',
    displayName: 'While Loop',
    description: 'Represents a while loop',
    thaiDescription: 'แสดงถึงลูป while',
    category: 'control',
    example: 'while start != None:',
    whyShapedThisWay:
      'While loops have a condition and body. The AST shows this as a tree where the condition is checked repeatedly.',
    executionFlow:
      'The condition is evaluated. If true, the body executes and the condition is checked again.',
  },
  For: {
    type: 'For',
    displayName: 'For Loop',
    description: 'Represents a for loop',
    thaiDescription: 'แสดงถึงลูป for',
    category: 'control',
    example: 'for node in nodes:',
    whyShapedThisWay:
      'For loops iterate over sequences. The AST shows the iterator, target variable, and body.',
    executionFlow:
      'The sequence is evaluated, then each item is assigned to the target and the body executes.',
  },
  BinOp: {
    type: 'BinOp',
    displayName: 'Binary Operation',
    description: 'Represents a binary operation (+, -, *, /, etc.)',
    thaiDescription: 'แสดงถึงการดำเนินการแบบไบนารี (+, -, *, /, ฯลฯ)',
    category: 'expression',
    example: 'a + b',
    whyShapedThisWay:
      'Binary operations have a left operand, operator, and right operand. The AST shows this as a tree.',
    executionFlow:
      'Left operand is evaluated, then right operand, then the operation is performed.',
  },
  Compare: {
    type: 'Compare',
    displayName: 'Comparison',
    description: 'Represents a comparison operation (==, !=, <, >, etc.)',
    thaiDescription: 'แสดงถึงการเปรียบเทียบ (==, !=, <, >, ฯลฯ)',
    category: 'expression',
    example: 'start != None',
    whyShapedThisWay:
      'Comparisons have a left value, operator, and right value. The AST represents this structure.',
    executionFlow:
      'Both sides are evaluated, then the comparison is performed, returning True or False.',
  },
  Constant: {
    type: 'Constant',
    displayName: 'Constant Value',
    description: 'Represents a constant value (string, number, etc.)',
    thaiDescription: 'แสดงถึงค่าคงที่ (สตริง, ตัวเลข, ฯลฯ)',
    category: 'expression',
    example: '"Tony" or 42',
    whyShapedThisWay:
      'Constants are leaf nodes - they have no children and represent literal values.',
    executionFlow: 'Constants evaluate to themselves - no computation needed.',
  },
  Return: {
    type: 'Return',
    displayName: 'Return Statement',
    description: 'Represents a return statement',
    thaiDescription: 'แสดงถึงคำสั่ง return',
    category: 'statement',
    example: 'return result',
    whyShapedThisWay:
      'Return statements have an optional value. The AST shows the value as a child node.',
    executionFlow: 'The return value is evaluated, then the function exits with that value.',
  },
  Expr: {
    type: 'Expr',
    displayName: 'Expression Statement',
    description: 'Represents a standalone expression (like a function call used as a statement)',
    thaiDescription: 'แสดงถึงนิพจน์ที่ใช้เป็นคำสั่ง (เช่น การเรียกฟังก์ชัน)',
    category: 'statement',
    example: 'mylist.traverse()',
    whyShapedThisWay:
      'Expression statements wrap expressions that are executed for their side effects, not their return value.',
    executionFlow: 'The expression is evaluated, but the return value (if any) is discarded.',
  },
};

/**
 * Get information about an AST node type
 */
export function getASTNodeInfo(nodeType: string): ASTNodeTypeInfo | null {
  return AST_NODE_TYPES[nodeType] || null;
}

/**
 * Get all AST node types in a category
 */
export function getASTNodesByCategory(category: string): ASTNodeTypeInfo[] {
  return Object.values(AST_NODE_TYPES).filter((info) => info.category === category);
}

/**
 * Get educational explanation for why AST is shaped a certain way
 */
export function getWhyShapedThisWay(nodeType: string): string {
  const info = getASTNodeInfo(nodeType);
  return info?.whyShapedThisWay || 'This node type represents a specific Python construct.';
}

/**
 * Get execution flow explanation for a node type
 */
export function getExecutionFlow(nodeType: string): string {
  const info = getASTNodeInfo(nodeType);
  return info?.executionFlow || "This node is executed according to Python's execution model.";
}
