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

export { singlyLinkedListDragComponents };
