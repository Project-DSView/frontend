import React from 'react';
import { StepInfoPanelProps } from '@/types';

const StepInfoPanel: React.FC<StepInfoPanelProps> = ({ stepNumber, message, userCommand }) => (
  <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
    {/* User Command Context */}
    {userCommand && (
      <div className="mb-1.5 flex items-center gap-2 border-b border-blue-200 pb-1.5 dark:border-blue-800">
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          Context
        </span>
        <code className="font-mono text-xs font-medium text-blue-900 dark:text-blue-100">
          {userCommand}
        </code>
      </div>
    )}
    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
      Step {stepNumber}: {message}
    </div>
  </div>
);

export default StepInfoPanel;
