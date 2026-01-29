import React from 'react';
import { VisualizationViewControlsProps } from '@/types';
import ViewModeSwitcher from './ViewModeSwitcher';
import VisualizationSettings from './VisualizationSettings';

const VisualizationViewControls: React.FC<VisualizationViewControlsProps> = ({
  viewMode,
  onViewModeChange,
  showMemoryAddress,
  onToggleMemoryAddress,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ViewModeSwitcher currentMode={viewMode} onModeChange={onViewModeChange} />
      <VisualizationSettings
        showMemoryAddress={showMemoryAddress}
        onToggleMemoryAddress={onToggleMemoryAddress}
      />
    </div>
  );
};

export default VisualizationViewControls;
