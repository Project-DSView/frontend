import React from 'react';

interface StepIndicatorProps {
  stepNumber: number;
  totalSteps: number;
  message?: string;
  isAutoPlaying?: boolean;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  stepNumber,
  totalSteps,
  message,
  isAutoPlaying = false,
  className = '',
}) => {
  return (
    <div
      className={`absolute top-4 right-4 z-10 rounded-lg border border-gray-200 bg-white p-3 shadow-lg transition-all duration-300 ${
        isAutoPlaying ? 'animate-pulse' : ''
      } ${className}`}
    >
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div
            className={`h-2 w-2 rounded-full ${
              isAutoPlaying ? 'animate-ping bg-green-500' : 'bg-blue-500'
            }`}
          />
          <span className="text-sm font-semibold text-gray-800">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
        {isAutoPlaying && <div className="text-xs font-medium text-green-600">Playing...</div>}
      </div>
      {message && <div className="mt-2 max-w-xs text-xs text-gray-600">{message}</div>}
    </div>
  );
};

export default StepIndicator;
