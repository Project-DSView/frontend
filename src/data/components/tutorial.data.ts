import {
  DataStructure,
  LearningTip,
  PlaygroundMode,
  TutorialSection,
} from '@/types/props/tutorial.types';

const dataStructures: DataStructure[] = [
  {
    name: 'Singly Linked List',
    description: 'โครงสร้างข้อมูลแบบลิงค์ลิสต์ที่แต่ละโหนดมีเพียงตัวชี้ไปยังโหนดถัดไป',
    iconName: 'LinkIcon',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Doubly Linked List',
    description: 'โครงสร้างข้อมูลแบบลิงค์ลิสต์ที่แต่ละโหนดมีตัวชี้ไปยังโหนดก่อนหน้าและถัดไป',
    iconName: 'LinkIcon',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Stack',
    description:
      'โครงสร้างข้อมูลแบบ LIFO (Last In First Out) เหมาะสำหรับการจัดการข้อมูลแบบเรียงซ้อน',
    iconName: 'Layers',
    iconColor: 'text-green-600',
  },
  {
    name: 'Binary Search Tree',
    description: 'โครงสร้างข้อมูลแบบต้นไม้ที่แต่ละโหนดมีลูกได้มากสุด 2 โหนด และเรียงลำดับตามค่า',
    iconName: 'TreePine',
    iconColor: 'text-orange-600',
  },
  {
    name: 'Undirected Graph',
    description: 'กราฟที่ขอบไม่มีทิศทาง เหมาะสำหรับแสดงความสัมพันธ์แบบสองทาง',
    iconName: 'Network',
    iconColor: 'text-red-600',
  },
  {
    name: 'Directed Graph',
    description: 'กราฟที่ขอบมีทิศทาง เหมาะสำหรับแสดงความสัมพันธ์แบบมีทิศทาง',
    iconName: 'Network',
    iconColor: 'text-indigo-600',
  },
];

const learningTips: LearningTip[] = [
  {
    title: 'เริ่มต้นด้วย Drag & Drop',
    description: 'เรียนรู้พื้นฐานการทำงานของโครงสร้างข้อมูลด้วยการลากและวาง operation ต่างๆ',
  },
  {
    title: 'ฝึกฝนด้วย Step Through',
    description: 'เข้าใจขั้นตอนการทำงานทีละขั้นตอนด้วยการควบคุมการทำงานด้วยตนเอง',
  },
  {
    title: 'ทดลองกับ Real-time',
    description: 'เขียนโค้ดและดูผลลัพธ์แบบเรียลไทม์เพื่อฝึกการเขียนโปรแกรม',
  },
  {
    title: 'ใช้ Export เพื่อบันทึกผลงาน',
    description: 'ส่งออกผลลัพธ์เพื่อเก็บเป็นหลักฐานการเรียนรู้หรือแชร์กับผู้อื่น',
  },
];

const playgroundModes: PlaygroundMode[] = [
  {
    title: 'Drag & Drop',
    description: 'การเรียนรู้แบบลากและวาง เหมาะสำหรับผู้เริ่มต้น',
    iconName: 'ArrowRight',
    iconColor: 'text-blue-600',
    steps: [
      {
        image: '/tutorial/dragdrop_1.jpg',
        alt: 'Step 1: Select Operation',
        description: 'เลือก operation ที่ต้องการใช้งาน',
      },
      {
        image: '/tutorial/dragdrop_2.jpg',
        alt: 'Step 2-3: Drag and Drop',
        description: 'ลาก operation ไปวางใน drop zone',
      },
      {
        image: '/tutorial/dragdrop_3.jpg',
        alt: 'Step 4: Enter Value',
        description: 'กรอกค่า value หาก operation ต้องการ',
      },
      {
        image: '/tutorial/dragdrop_4.jpg',
        alt: 'Step 5-6: View Results and Control',
        description: 'ดูผลลัพธ์และควบคุมการทำงานของแต่ละ operation',
      },
    ],
  },
  {
    title: 'Step Through',
    description: 'การเรียนรู้แบบควบคุมทีละขั้นตอน เหมาะสำหรับการเข้าใจรายละเอียด',
    iconName: 'Play',
    iconColor: 'text-green-600',
    steps: [
      {
        image: '/tutorial/step_1.jpg',
        alt: 'Step 1-2: Edit Code and Run',
        description: 'แก้ไขโค้ดและกดปุ่ม "Run Code" หรือ "Reset Code"',
      },
      {
        image: '/tutorial/step_2.jpg',
        alt: 'Step 3: Control Execution',
        description: 'ควบคุมการทำงานด้วยตนเองผ่านปุ่มควบคุม',
      },
      {
        image: '/tutorial/step_3.jpg',
        alt: 'Step 4: View Step Results',
        description: 'ดูผลลัพธ์ตามขั้นตอนที่ควบคุม',
      },
    ],
  },
  {
    title: 'Real-time',
    description: 'การเรียนรู้แบบเรียลไทม์ เหมาะสำหรับการฝึกเขียนโปรแกรม',
    iconName: 'Zap',
    iconColor: 'text-purple-600',
    steps: [
      {
        image: '/tutorial/realtime_1.jpg',
        alt: 'Step 1-2: Edit Code and See Results',
        description: 'แก้ไขโค้ดและดูผลลัพธ์เปลี่ยนแปลงแบบเรียลไทม์',
      },
    ],
  },
];

const tutorialSections: TutorialSection[] = [
  {
    title: 'การเข้าถึง Playground',
    description: 'เข้าถึง playground ผ่านเมนู Navigation ที่ด้านบนของหน้าเว็บ',
    image: '/tutorial/nav.jpg',
    alt: 'Navigation Menu',
  },
  {
    title: 'การส่งออกผลลัพธ์ (Export)',
    description: 'บันทึกและแชร์ผลงานการเรียนรู้ของคุณ',
    image: '/tutorial/export.jpg',
    alt: 'Export Results',
  },
];

export { dataStructures, learningTips, playgroundModes, tutorialSections };
