import React from 'react';
import { FilePen, Video, Code, FileText } from 'lucide-react';
import { Material } from '@/types';

// Material type definitions
type MaterialType = 'document' | 'video' | 'code_exercise' | 'pdf_exercise';

// Icon mapping for each material type
const getMaterialIcon = (type: MaterialType) => {
  switch (type) {
    case 'document':
      return React.createElement(FileText, { className: 'h-5 w-5 text-info' });
    case 'video':
      return React.createElement(Video, { className: 'h-5 w-5 text-success' });
    case 'code_exercise':
      return React.createElement(Code, { className: 'h-5 w-5 text-error' });
    case 'pdf_exercise':
      return React.createElement(FilePen, { className: 'h-5 w-5 text-error' });
    default:
      return React.createElement(FileText, { className: 'h-5 w-5 text-black' });
  }
};

// Label mapping for each material type
const materialTypeLabels: Record<MaterialType, string> = {
  document: 'เอกสาร',
  video: 'วิดีโอ',
  code_exercise: 'แบบฝึกหัด',
  pdf_exercise: 'แบบฝึกหัด',
};

// Color mapping for each material type
const materialTypeColors: Record<MaterialType, string> = {
  document: 'bg-info text-white',
  video: 'bg-success text-white',
  code_exercise: 'bg-error text-white',
  pdf_exercise: 'bg-error text-white',
};

const getMaterialTypeLabel = (type: MaterialType) => {
  return materialTypeLabels[type] || materialTypeLabels.document;
};

const getMaterialTypeColor = (type: MaterialType) => {
  return materialTypeColors[type] || materialTypeColors.document;
};

// Check if material is clickable
const isMaterialClickable = (material: Material) => {
  return (
    material.type === 'code_exercise' ||
    material.type === 'pdf_exercise' ||
    (material.type === 'document' && material.file_url) ||
    (material.type === 'video' && material.video_url)
  );
};

// Check if material is an exercise
const isExercise = (type: MaterialType) => {
  return type === 'code_exercise' || type === 'pdf_exercise';
};

export {
  getMaterialIcon,
  getMaterialTypeLabel,
  getMaterialTypeColor,
  isMaterialClickable,
  isExercise,
};
