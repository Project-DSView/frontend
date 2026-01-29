import { TutorialStep } from '@/types';

// Drag & Drop Mode Steps
const dragdropTutorialSteps: TutorialStep[] = [
  {
    title: 'ยินดีต้อนรับสู่ Drag & Drop Mode',
    description:
      'โหมดนี้เหมาะสำหรับผู้เริ่มต้น คุณสามารถเรียนรู้โครงสร้างข้อมูลด้วยการลากและวาง operation ต่างๆ ลงใน drop zone',
  },
  {
    title: 'เลือก Operation',
    description:
      'ดูที่เมนูด้านซ้าย คุณจะเห็น operation ต่างๆ ที่สามารถใช้งานได้ เช่น Create, Insert, Delete, Search เป็นต้น คลิกที่ operation ที่ต้องการเพื่อดูรายละเอียด',
  },
  {
    title: 'ลากและวาง Operation',
    description:
      'ลาก operation ที่เลือกไว้ไปวางใน drop zone ด้านล่าง คุณสามารถวางหลาย operation ได้ตามลำดับที่ต้องการ',
  },
  {
    title: 'กรอกค่า Value',
    description:
      'บาง operation ต้องการค่า value เช่น Insert(5) หรือ Search(10) กรอกค่าในช่องที่แสดงขึ้นมา',
  },
  {
    title: 'ดูผลลัพธ์',
    description:
      'หลังจากวาง operation แล้ว คุณจะเห็นผลลัพธ์แสดงใน visualization area ด้านขวา และสามารถควบคุมการทำงานด้วยปุ่มควบคุมด้านล่าง',
  },
];

// Step Through Mode Steps
const stepthroughTutorialSteps: TutorialStep[] = [
  {
    title: 'ยินดีต้อนรับสู่ Step Through Playground',
    description: 'โหมดนี้ช่วยให้คุณเรียนรู้การทำงานของ Code ทีละขั้นตอน (Step-by-step Execution)',
    placement: 'bottom',
    highlightSelector: undefined,
  },
  {
    title: 'Code Editor',
    description:
      '1. แก้ไขโค้ดในส่วนนี้\n2. กดปุ่ม "Run Code" เพื่อเริ่มการทำงาน หรือ "Reset Code" เพื่อล้างค่า',
    highlightSelector: '#tutorial-code-editor',
    placement: 'right',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Step Controls',
    description:
      '3. ควบคุมการทำงานด้วยตนเอง: กด Next เพื่อไปข้างหน้า, Previous เพื่อย้อนกลับ หรือ Auto Play',
    highlightSelector: '#tutorial-step-control',
    placement: 'top',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Visualization',
    description: '4. ดูผลลัพธ์การทำงานของโครงสร้างข้อมูลในแต่ละบรรทัดที่นี่',
    highlightSelector: '#tutorial-visualization',
    placement: 'top',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Variables Panel',
    description:
      'ปุ่ม Variables ใช้สำหรับแสดง/ซ่อน แผงตัวแปร (Variable State Panel) ที่แสดงค่าตัวแปรทั้งหมดในขณะที่โปรแกรมทำงาน ช่วยให้เห็นการเปลี่ยนแปลงของค่าตัวแปรในแต่ละ step',
    highlightSelector: '#tutorial-variables-toggle',
    placement: 'bottom',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Technical / Analogy View',
    description:
      'สลับระหว่าง 2 มุมมอง:\n• Technical View - แสดงโครงสร้างข้อมูลในรูปแบบเทคนิค (Node, Pointer, Address)\n• Analogy View - แสดงเป็นภาพอุปมาอุปไมย เช่น รถไฟสำหรับ Linked List, จานสำหรับ Stack ช่วยให้เข้าใจแนวคิดได้ง่ายขึ้น',
    highlightSelector: '#tutorial-view-mode-switcher',
    placement: 'bottom',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Memory Address',
    description:
      'ปุ่ม Memory Address ใช้แสดงตำแหน่งหน่วยความจำ (Address) ของแต่ละ Node เช่น 0x100, 0x104 ช่วยให้เข้าใจว่าในความเป็นจริง แต่ละ Node ถูกเก็บอยู่ที่ตำแหน่งใดใน Memory',
    highlightSelector: '#tutorial-memory-address-toggle',
    placement: 'bottom',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Common Errors',
    description:
      'ปุ่ม Common Errors แสดงข้อผิดพลาดที่พบบ่อยในการเขียนโค้ดของ Data Structure นี้ เช่น:\n• ลืมอัพเดท pointer\n• ไม่ได้เช็ค null ก่อนเข้าถึง\n• Memory leak\nช่วยให้เรียนรู้จากข้อผิดพลาดที่มักเกิดขึ้น',
    highlightSelector: '#tutorial-common-errors',
    placement: 'bottom',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Export Tools',
    description: 'บันทึกและแชร์ผลงานของคุณเป็นไฟล์ภาพ หรือ Source Code ได้ที่นี่',
    highlightSelector: '#tutorial-export-buttons',
    placement: 'bottom',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Navigation',
    description: 'เข้าถึงเครื่องมือการเรียนรู้อื่นๆ ได้ที่เมนู Playground ด้านบน',
    placement: 'bottom',
    highlightSelector: undefined,
  },
  {
    title: 'ชื่อที่ระบบรองรับ',
    description: 'คลิกเพื่อดูชื่อ Class และ Method ที่รองรับสำหรับแต่ละ Data Structure:',
    placement: 'bottom',
    highlightSelector: undefined,
    customContent: 'naming-guide',
  },
];

interface DataStructureNamingGuide {
  id: string;
  name: string;
  description: string;
  supportedClassNames: string[];
  supportedMethods: string[];
  exampleCode: string;
  iconColor: string;
}

const namingGuides: DataStructureNamingGuide[] = [
  {
    id: 'singlylinkedlist',
    name: 'Singly Linked List',
    description: 'โครงสร้างข้อมูลแบบลิงค์ลิสต์ที่แต่ละโหนดมีเพียงตัวชี้ไปยังโหนดถัดไป',
    supportedClassNames: ['SinglyLinkedList', 'LinkedList'],
    supportedMethods: [
      'insertFront',
      'insertEnd',
      'insert_front',
      'insert_end',
      'traverse',
      'delete',
      'search',
    ],
    exampleCode: `class SinglyLinkedList:
    def __init__(self):
        self.head = None
    
    def insertFront(self, data):
        ...`,
    iconColor: 'text-blue-600',
  },
  {
    id: 'doublylinkedlist',
    name: 'Doubly Linked List',
    description: 'โครงสร้างข้อมูลแบบลิงค์ลิสต์ที่แต่ละโหนดมีตัวชี้ไปยังโหนดก่อนหน้าและถัดไป',
    supportedClassNames: ['DoublyLinkedList'],
    supportedMethods: [
      'insertFront',
      'insertEnd',
      'insert_front',
      'insert_end',
      'traverse',
      'traverseReverse',
      'traverse_reverse',
    ],
    exampleCode: `class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None`,
    iconColor: 'text-purple-600',
  },
  {
    id: 'stack',
    name: 'Stack',
    description: 'โครงสร้างข้อมูลแบบ LIFO (Last In First Out)',
    supportedClassNames: ['Stack', 'ArrayStack'],
    supportedMethods: ['push', 'pop', 'peek', 'stackTop', 'stack_top', 'isEmpty', 'is_empty'],
    exampleCode: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)`,
    iconColor: 'text-green-600',
  },
  {
    id: 'queue',
    name: 'Queue',
    description: 'โครงสร้างข้อมูลแบบ FIFO (First In First Out)',
    supportedClassNames: ['Queue'],
    supportedMethods: ['enqueue', 'dequeue', 'front', 'rear', 'isEmpty', 'is_empty'],
    exampleCode: `class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)`,
    iconColor: 'text-cyan-600',
  },
  {
    id: 'binarysearchtree',
    name: 'Binary Search Tree',
    description: 'โครงสร้างข้อมูลแบบต้นไม้ที่เรียงลำดับตามค่า',
    supportedClassNames: ['BST', 'BinarySearchTree', 'BinaryTree'],
    supportedMethods: [
      'insert',
      'delete',
      'search',
      'inorder',
      'preorder',
      'postorder',
      'findMin',
      'findMax',
    ],
    exampleCode: `class BinarySearchTree:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        ...`,
    iconColor: 'text-orange-600',
  },
  {
    id: 'undirectedgraph',
    name: 'Undirected Graph',
    description: 'กราฟที่ขอบไม่มีทิศทาง เหมาะสำหรับแสดงความสัมพันธ์แบบสองทาง',
    supportedClassNames: ['Graph', 'UndirectedGraph'],
    supportedMethods: [
      'addEdge',
      'add_edge',
      'addVertex',
      'add_vertex',
      'dfs',
      'bfs',
      'isConnected',
    ],
    exampleCode: `class Graph:
    def __init__(self):
        self.adjacency_list = {}
    
    def addEdge(self, u, v):
        ...`,
    iconColor: 'text-red-600',
  },
  {
    id: 'directedgraph',
    name: 'Directed Graph',
    description: 'กราฟที่ขอบมีทิศทาง เหมาะสำหรับแสดงความสัมพันธ์แบบมีทิศทาง',
    supportedClassNames: ['DirectedGraph'],
    supportedMethods: [
      'addEdge',
      'add_edge',
      'addVertex',
      'add_vertex',
      'topologicalSort',
      'hasCycle',
    ],
    exampleCode: `class DirectedGraph:
    def __init__(self):
        self.adjacency_list = {}
    
    def addEdge(self, u, v):
        ...`,
    iconColor: 'text-indigo-600',
  },
];

// Helper function to get steps by mode
const getTutorialSteps = (mode: 'dragdrop' | 'stepthrough' | 'realtime'): TutorialStep[] => {
  switch (mode) {
    case 'dragdrop':
      return dragdropTutorialSteps;
    case 'stepthrough':
      return stepthroughTutorialSteps;
    default:
      return [];
  }
};

// Helper function to get storage key
const getTutorialStorageKey = (
  pagePath: string,
  mode: 'dragdrop' | 'stepthrough' | 'realtime',
): string => {
  return `tutorial-${pagePath}-${mode}-v1`;
};

export {
  dragdropTutorialSteps,
  stepthroughTutorialSteps,
  getTutorialSteps,
  getTutorialStorageKey,
  namingGuides,
};
