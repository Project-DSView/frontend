import { TutorialStep } from '@/components/playground/tutorial/TutorialOverlay';

export const queueTutorialSteps: TutorialStep[] = [
  {
    title: 'ยินดีต้อนรับสู่ Queue Playground',
    description:
      'Queue คือโครงสร้างข้อมูลแบบ First-In, First-Out (FIFO) ข้อมูลที่เข้ามาก่อนจะถูกนำออกไปก่อน เหมือนการต่อคิว',
    placement: 'bottom',
    highlightSelector: undefined,
  },
  {
    title: 'Operations Panel',
    description: 'เลือกคำสั่ง Enqueue (เข้าคิว), Dequeue (ออกคิว) จากตรงนี้',
    highlightSelector: '#tutorial-operations-panel',
    placement: 'right',
    spotlightPadding: 16,
    disableNextUntilVisible: true,
  },
  {
    title: 'Drop Zone',
    description: 'วางคำสั่งที่เลือกที่นี่เพื่อสร้าง Queue',
    highlightSelector: '#tutorial-drop-zone',
    placement: 'left',
    spotlightPadding: 16,
    disableNextUntilVisible: true,
  },
  {
    title: 'Step Controls',
    description: 'ควบคุมการเล่น Playback, Next, Previous ได้ที่ปุ่มเหล่านี้',
    highlightSelector: '#tutorial-controls',
    placement: 'top',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'Visualization',
    description:
      'สังเกตการทำงานของ Queue ที่ส่วนแสดงผลนี้ ข้อมูลจะเข้าทางด้านหลังและออกทางด้านหน้า',
    highlightSelector: '#tutorial-visualization',
    placement: 'top',
    spotlightPadding: 8,
    disableNextUntilVisible: true,
  },
  {
    title: 'เริ่มกันเลย',
    description: 'สนุกกับการเรียนรู้ Queue!',
    highlightSelector: undefined,
  },
];
