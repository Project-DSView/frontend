import React from 'react';

interface Operation {
  id: number;
  type: string;
  name: string;
  value?: string | null;
  position?: string | null;
  newValue?: string | null;
  color: string;
  category: string;
}

interface StepSelectorProps {
  operations: Operation[];
  selectedStep: number | null;
  onStepSelect: (stepIndex: number) => void;
  getStepDescription: (operation: Operation) => string;
  onPrevious?: () => void;
  onNext?: () => void;
  onAutoPlay?: () => void;
  isAutoPlaying?: boolean;
}

const StepSelector: React.FC<StepSelectorProps> = ({
  operations,
  selectedStep,
  onStepSelect,
  getStepDescription,
  onPrevious,
  onNext,
  onAutoPlay,
  isAutoPlaying = false,
}) => {
  if (operations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">เลือก Step ที่ต้องการดู</h2>
        <span className="text-sm text-gray-500">{operations.length} operations</span>
      </div>

      {/* Navigation Buttons */}
      <div className="mb-4 flex items-center justify-center space-x-3">
        <button
          onClick={onPrevious}
          disabled={selectedStep === null || selectedStep <= 0}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Previous</span>
        </button>

        <button
          onClick={onNext}
          disabled={selectedStep === null || selectedStep >= operations.length - 1}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Next</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={onAutoPlay}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            isAutoPlaying
              ? 'bg-error hover:bg-error/50 text-white'
              : 'bg-info hover:bg-info/50 text-white'
          }`}
        >
          {isAutoPlaying ? (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <span>Stop</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Auto Play</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {operations.map((operation, index) => (
          <button
            key={operation.id}
            onClick={() => onStepSelect(index)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedStep === index
                ? 'border-accent bg-accent/10 text-accent-foreground'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Step {index + 1}</span>
              </div>
              <span className="text-xs text-gray-500">{operation.category}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {operation.name}
              {operation.value && (
                <span className="ml-1 font-medium text-gray-800">({operation.value})</span>
              )}
              {operation.position && (
                <span className="ml-1 text-gray-500">at position {operation.position}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Step Description */}
      {selectedStep !== null && operations[selectedStep] && (
        <div className="border-accent/20 bg-accent/10 mt-4 rounded-lg border p-4">
          <h3 className="text-accent mb-2 font-semibold">คำอธิบาย Step {selectedStep + 1}</h3>
          <p className="text-black">{getStepDescription(operations[selectedStep])}</p>
        </div>
      )}
    </div>
  );
};

export default StepSelector;
