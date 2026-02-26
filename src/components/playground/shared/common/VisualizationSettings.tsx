import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface VisualizationSettingsProps {
  showMemoryAddress: boolean;
  onToggleMemoryAddress: (value: boolean) => void;
  className?: string;
}

/**
 * VisualizationSettings Component
 * Toggle panel สำหรับ settings ต่างๆ ของ visualization
 * วางไว้มุมขวาบนของ visualization area
 */
const VisualizationSettings: React.FC<VisualizationSettingsProps> = ({
  showMemoryAddress,
  onToggleMemoryAddress,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Memory Address Toggle */}
      <button
        id="tutorial-memory-address-toggle"
        onClick={() => onToggleMemoryAddress(!showMemoryAddress)}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          showMemoryAddress
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
        }`}
        title={showMemoryAddress ? 'Hide Memory Addresses' : 'Show Memory Addresses'}
      >
        {showMemoryAddress ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        <span>Memory Address</span>
      </button>
    </div>
  );
};

export default VisualizationSettings;
