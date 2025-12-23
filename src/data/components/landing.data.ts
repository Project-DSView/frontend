import {
  Move,
  StepForward,
  Zap,
  MousePointerClick,
  Footprints,
  GitBranch,
  Network,
  Layers,
} from 'lucide-react';

import { VisualizationMode, Structure } from '@/types';

const playgroundIcons = {
  'Drag & Drop': {
    Icon: MousePointerClick,
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    bgGradient: 'from-pink-500/20 via-rose-500/20 to-orange-500/20',
    hoverGradient: 'from-pink-600 via-rose-600 to-orange-600',
  },
  'Step Through': {
    Icon: Footprints,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    bgGradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    hoverGradient: 'from-cyan-600 via-blue-600 to-indigo-600',
  },
  'Real-time': {
    Icon: Zap,
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    bgGradient: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20',
    hoverGradient: 'from-yellow-600 via-amber-600 to-orange-600',
  },
};

const visualizationModes: VisualizationMode[] = [
  {
    id: 'dragdrop',
    title: 'Drag & Drop',
    icon: Move,
    images: ['/landing/dragdrop_1.jpg', '/landing/dragdrop_2.jpg'],
  },
  {
    id: 'stepthrough',
    title: 'Step Through',
    icon: StepForward,
    images: ['/landing/step_1.jpg', '/landing/step_2.jpg'],
  },
  {
    id: 'realtime',
    title: 'Real-time',
    icon: Zap,
    images: ['/landing/reailtime_1.jpg', '/landing/realtime_2.jpg'],
  },
];

const structures: Structure[] = [
  {
    id: 'bst',
    name: 'Binary Search Tree',
    icon: GitBranch,
    description: 'โครงสร้างข้อมูลแบบต้นไม้ที่ช่วยในการค้นหาอย่างมีประสิทธิภาพ',
    preview: '/landing/LearnPicture.png',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'graph',
    name: 'Graph',
    icon: Network,
    description: 'โครงสร้างข้อมูลแบบกราฟสำหรับแสดงความสัมพันธ์ระหว่างข้อมูล',
    preview: '/landing/Understand.png',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'linkedlist',
    name: 'Linked List',
    icon: GitBranch,
    description: 'โครงสร้างข้อมูลแบบลิงก์ลิสต์ที่เชื่อมต่อข้อมูลแบบต่อเนื่อง',
    preview: '/landing/Easytouse.png',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'stack',
    name: 'Stack',
    icon: Layers,
    description: 'โครงสร้างข้อมูลแบบสแต็กที่ทำงานแบบ LIFO (Last In First Out)',
    preview: '/landing/Picture2.png',
    color: 'from-orange-500 to-red-500',
  },
];

// Stable positions for particles to avoid hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 20, top: 30, offsetX: 15, duration: 3 },
  { left: 50, top: 60, offsetX: -20, duration: 4 },
  { left: 70, top: 25, offsetX: 10, duration: 3.5 },
  { left: 35, top: 80, offsetX: -15, duration: 4.5 },
  { left: 85, top: 45, offsetX: 25, duration: 3.2 },
  { left: 15, top: 70, offsetX: -10, duration: 4 },
  { left: 60, top: 15, offsetX: 12, duration: 3.8 },
  { left: 40, top: 50, offsetX: -18, duration: 4.2 },
  { left: 90, top: 80, offsetX: 20, duration: 3.7 },
  { left: 25, top: 40, offsetX: -12, duration: 4.3 },
];

const AUTO_SWITCH_INTERVAL = 5000; // 5 seconds
const IMAGE_SWITCH_INTERVAL = 3000; // 3 seconds for images within mode

export {
  visualizationModes,
  AUTO_SWITCH_INTERVAL,
  IMAGE_SWITCH_INTERVAL,
  playgroundIcons,
  PARTICLE_POSITIONS,
  structures,
};
