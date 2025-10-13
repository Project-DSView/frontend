import React from 'react';
import { FileText, Video, Code } from 'lucide-react';
import { Material } from '@/types';

// Material type definitions
export type MaterialType = 'document' | 'video' | 'code_exercise' | 'pdf_exercise';

// Icon mapping for each material type
export const getMaterialIcon = (type: MaterialType) => {
  switch (type) {
    case 'document':
      return React.createElement(FileText, { className: 'h-5 w-5 text-success' });
    case 'video':
      return React.createElement(Video, { className: 'h-5 w-5 text-secondary' });
    case 'code_exercise':
      return React.createElement(Code, { className: 'h-5 w-5 text-error' });
    case 'pdf_exercise':
      return React.createElement(FileText, { className: 'h-5 w-5 text-info' });
    default:
      return React.createElement(FileText, { className: 'h-5 w-5 text-black' });
  }
};

// Label mapping for each material type
export const materialTypeLabels: Record<MaterialType, string> = {
  document: 'เอกสาร',
  video: 'วิดีโอ',
  code_exercise: 'แบบฝึกหัดโค้ด',
  pdf_exercise: 'แบบฝึกหัด PDF',
};

// Color mapping for each material type
export const materialTypeColors: Record<MaterialType, string> = {
  document: 'bg-success text-white',
  video: 'bg-secondary text-white',
  code_exercise: 'bg-error text-white',
  pdf_exercise: 'bg-info text-white',
};

// Helper functions
export const getMaterialTypeLabel = (type: MaterialType) => {
  return materialTypeLabels[type] || materialTypeLabels.document;
};

export const getMaterialTypeColor = (type: MaterialType) => {
  return materialTypeColors[type] || materialTypeColors.document;
};

// Check if material is clickable
export const isMaterialClickable = (material: Material) => {
  return (
    (material.type === 'document' && material.file_url) ||
    (material.type === 'pdf_exercise' && material.file_url) ||
    (material.type === 'video' && material.video_url)
  );
};

// Check if material is an exercise
export const isExercise = (type: MaterialType) => {
  return type === 'code_exercise' || type === 'pdf_exercise';
};
