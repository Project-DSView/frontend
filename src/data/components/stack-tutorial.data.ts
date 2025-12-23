import { TutorialStep } from '@/components/playground/tutorial/TutorialOverlay';

export const stackTutorialSteps: TutorialStep[] = [
  {
    title: 'ยินดีต้อนรับสู่ Stack Playground',
    description:
      'Stack คือโครงสร้างข้อมูลแบบ Last-In, First-Out (LIFO) ข้อมูลที่เข้าทีหลังสุดจะถูกนำออกมาก่อน เรียนรู้วิธีการใช้งานได้เลย!',
    placement: 'bottom',
    highlightSelector: undefined,
  },
  {
    title: 'Operations Panel',
    description:
      'เลือกคำสั่งที่นี่ เช่น Push (เพิ่ม), Pop (ลบ), Peek (ดู) ลากคำสั่งเหล่านี้ไปวางที่ Drop Zone',
    highlightSelector: '#tutorial-operations-panel',
    placement: 'right',
    spotlightPadding: 16,
    disableNextUntilVisible: true,
  },
  {
    title: 'Drop Zone',
    description: 'พื้นที่สำหรับวางคำสั่ง คุณสามารถเรียงลำดับขั้นตอนการทำงานของ Stack ได้ที่นี่',
    highlightSelector: '#tutorial-drop-zone',
    placement: 'left',
    spotlightPadding: 16,
    disableNextUntilVisible: true,
  },
  {
    title: 'Step Controls',
    description: 'ปุ่มควบคุมการทำงานทีละขั้นตอน (Step-by-step) หรือเล่นอัตโนมัติ (Auto Play)',
    highlightSelector: '#tutorial-controls',
    placement: 'top',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Visualization',
    description: 'ดูการเปลี่ยนแปลงของ Stack แบบกราฟิกได้ที่นี่ เมื่อคุณกด Run หรือ Step',
    highlightSelector: '#tutorial-visualization',
    placement: 'top',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'พร้อมแล้ว!',
    description: 'เริ่มลองลากคำสั่งและดูผลลัพธ์กันเลย!',
    highlightSelector: undefined,
  },
];
