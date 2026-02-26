// Common Pitfalls and Errors Data for Educational Feedback

import { CommonError } from '@/types';

export const COMMON_ERRORS: CommonError[] = [
  {
    id: 'losing_reference',
    title: 'Losing List Reference',
    titleTh: 'สูญเสีย Reference ของ List',
    description:
      'When reassigning the head pointer without saving the old head first, you lose access to the entire list.',
    descriptionTh:
      'เมื่อ reassign head pointer โดยไม่เก็บ head เดิมไว้ก่อน จะทำให้สูญเสีย access ไปยัง list ทั้งหมด',
    example: `# ผิด - จะสูญเสีย list ทั้งหมด
self.head = newNode

# ถูก - เก็บ reference ก่อน
temp = self.head
newNode.next = temp
self.head = newNode`,
    solution: 'Always save the old head reference before reassigning.',
    solutionTh: 'เก็บ reference ของ head เดิมไว้ก่อนจะ reassign เสมอ',
    severity: 'error',
  },
  {
    id: 'null_pointer',
    title: 'Null Pointer Exception',
    titleTh: 'Null Pointer Exception',
    description: 'Trying to access .next or .data on a node that is None causes an error.',
    descriptionTh: 'การพยายามเข้าถึง .next หรือ .data บน node ที่เป็น None จะทำให้เกิด error',
    example: `# ผิด - ถ้า current เป็น None จะ error
print(current.data)

# ถูก - ตรวจสอบก่อน
if current is not None:
    print(current.data)`,
    solution: 'Always check if the node is None before accessing its attributes.',
    solutionTh: 'ตรวจสอบว่า node ไม่ใช่ None ก่อนเข้าถึง attribute เสมอ',
    severity: 'error',
  },
  {
    id: 'memory_leak',
    title: 'Memory Leak',
    titleTh: 'Memory Leak',
    description:
      "When deleting a node, if you don't properly update the previous node's pointer, the deleted node remains in memory.",
    descriptionTh:
      'เมื่อลบ node ถ้าไม่อัพเดท pointer ของ node ก่อนหน้าอย่างถูกต้อง node ที่ลบจะยังคงอยู่ใน memory',
    example: `# ผิด - node ยังอยู่ใน memory
current = None  # แค่ลบ reference ของตัวแปร

# ถูก - ปรับ pointer ก่อนหน้า
prev.next = current.next  # ข้าม node ที่ต้องการลบ`,
    solution: "Update the previous node's next pointer to skip over the deleted node.",
    solutionTh: 'อัพเดท next pointer ของ node ก่อนหน้าให้ข้าม node ที่ต้องการลบ',
    severity: 'warning',
  },
  {
    id: 'infinite_loop',
    title: 'Infinite Loop',
    titleTh: 'Infinite Loop',
    description: 'Forgetting to move the pointer in a while loop causes an infinite loop.',
    descriptionTh: 'การลืมเลื่อน pointer ใน while loop จะทำให้เกิด loop วนไม่รู้จบ',
    example: `# ผิด - ไม่มี current = current.next
while current is not None:
    print(current.data)
    # ลืม current = current.next

# ถูก - มีการเลื่อน pointer
while current is not None:
    print(current.data)
    current = current.next`,
    solution: 'Always update the loop variable at the end of each iteration.',
    solutionTh: 'อัพเดทตัวแปร loop ทุกครั้งที่จบ iteration',
    severity: 'warning',
  },
];

export const getPitfallInfo = (type: string): CommonError | undefined => {
  return COMMON_ERRORS.find((error) => error.id === type);
};
