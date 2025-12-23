import { TutorialStep } from '@/components/playground/tutorial/TutorialOverlay';

// Drag & Drop Mode Steps
export const dragdropTutorialSteps: TutorialStep[] = [
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
export const stepthroughTutorialSteps: TutorialStep[] = [
  {
    title: 'ยินดีต้อนรับสู่ Step Through Mode',
    description:
      'โหมดนี้เหมาะสำหรับการเข้าใจรายละเอียดการทำงานของโครงสร้างข้อมูลทีละขั้นตอน คุณสามารถควบคุมการทำงานด้วยตนเอง',
  },
  {
    title: 'แก้ไขโค้ด',
    description:
      'ดูที่ Code Editor ด้านซ้าย คุณสามารถแก้ไขโค้ด Python ได้ตามต้องการ หรือใช้โค้ดตัวอย่างที่มีอยู่แล้ว',
  },
  {
    title: 'รันโค้ด',
    description:
      'กดปุ่ม "Run Code" เพื่อเริ่มการทำงาน หรือกด "Reset Code" เพื่อรีเซ็ตโค้ดกลับเป็นค่าเริ่มต้น',
  },
  {
    title: 'ควบคุมการทำงาน',
    description:
      'ใช้ปุ่มควบคุมด้านล่าง Code Editor เพื่อควบคุมการทำงาน: กด "Next" เพื่อไปขั้นตอนถัดไป, "Previous" เพื่อย้อนกลับ, หรือ "Auto Play" เพื่อเล่นอัตโนมัติ',
  },
  {
    title: 'ดูผลลัพธ์',
    description:
      'ผลลัพธ์จะแสดงใน visualization area ด้านขวา พร้อมกับ highlight โหนดหรือ element ที่กำลังทำงานอยู่',
  },
];

// Real-time Mode Steps
export const realtimeTutorialSteps: TutorialStep[] = [
  {
    title: 'ยินดีต้อนรับสู่ Real-time Mode',
    description:
      'โหมดนี้เหมาะสำหรับการฝึกเขียนโปรแกรม คุณสามารถแก้ไขโค้ดและดูผลลัพธ์เปลี่ยนแปลงแบบเรียลไทม์',
  },
  {
    title: 'แก้ไขโค้ด',
    description: 'แก้ไขโค้ดใน Code Editor ด้านซ้าย ผลลัพธ์จะอัปเดตทันทีเมื่อคุณแก้ไขโค้ด',
  },
  {
    title: 'ดูผลลัพธ์แบบ Real-time',
    description:
      'ผลลัพธ์จะแสดงใน visualization area ด้านขวาและอัปเดตทันทีเมื่อโค้ดเปลี่ยนแปลง ไม่ต้องกดปุ่ม Run',
  },
];

// Helper function to get steps by mode
export const getTutorialSteps = (mode: 'dragdrop' | 'stepthrough' | 'realtime'): TutorialStep[] => {
  switch (mode) {
    case 'dragdrop':
      return dragdropTutorialSteps;
    case 'stepthrough':
      return stepthroughTutorialSteps;
    case 'realtime':
      return realtimeTutorialSteps;
    default:
      return [];
  }
};

// Helper function to get storage key
export const getTutorialStorageKey = (
  pagePath: string,
  mode: 'dragdrop' | 'stepthrough' | 'realtime',
): string => {
  return `tutorial-${pagePath}-${mode}-v1`;
};
