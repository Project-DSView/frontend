'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
interface TutorialButtonProps {
  onClick: () => void;
  className?: string;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({ onClick, className = '' }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center gap-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800 ${className}`}
      aria-label="เปิดคู่มือการใช้งาน"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Tutorial</span>
    </Button>
  );
};

export default TutorialButton;
