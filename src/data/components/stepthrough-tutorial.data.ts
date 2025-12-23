import { TutorialStep } from '@/components/playground/tutorial/TutorialOverlay';

export const stepthroughTutorialSteps: TutorialStep[] = [
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
];
