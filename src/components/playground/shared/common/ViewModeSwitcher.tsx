import React from 'react';
import { Network, MonitorPlay } from 'lucide-react';

import { ViewModeSwitcherProps } from '@/types';

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  currentMode,
  onModeChange,
  className = '',
}) => {
  return (
    <div
      id="tutorial-view-mode-switcher"
      className={`flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800 ${className}`}
    >
      <button
        onClick={() => onModeChange('technical')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          currentMode === 'technical'
            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <Network size={14} />
        <span>Technical</span>
      </button>
      <button
        onClick={() => onModeChange('analogy')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          currentMode === 'analogy'
            ? 'bg-white text-purple-600 shadow-sm dark:bg-gray-700 dark:text-purple-400'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        <MonitorPlay size={14} />
        <span>Analogy</span>
      </button>
    </div>
  );
};

export default ViewModeSwitcher;
