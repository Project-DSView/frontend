import { GitBranch, Layers, Network } from 'lucide-react';
import { Structure } from '@/types';

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

export { structures };
