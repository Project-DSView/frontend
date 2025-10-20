import React, { useEffect } from 'react';

import { StepSelectorProps } from '@/types';

import { Slider } from '@/components/ui/slider';

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
  // Set default step to 0 if no step is selected
  useEffect(() => {
    if (selectedStep === null && operations.length > 0) {
      onStepSelect(0);
    }
  }, [selectedStep, operations.length, onStepSelect]);

  if (operations.length === 0) {
    return null;
  }

  const currentStepIndex = selectedStep !== null ? selectedStep : 0;
  const isFirstStep = currentStepIndex <= 0;
  const isLastStep = currentStepIndex >= operations.length - 1;
  const currentOperation = operations[currentStepIndex];

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Step Control</h2>
          <span className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {operations.length}
          </span>
        </div>
        {isAutoPlaying && (
          <div className="animate-pulse text-xl font-medium text-green-600">กำลังเล่น...</div>
        )}
      </div>

      {/* Current Step Display */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Step {currentStepIndex + 1}</span>
          <span className="text-xs text-gray-500">{currentOperation?.category || 'Unknown'}</span>
        </div>
        <div className="text-sm text-gray-600">
          {currentOperation?.name || 'Unknown Operation'}
          {currentOperation?.value && (
            <span className="ml-1 font-medium text-gray-800">({currentOperation.value})</span>
          )}
          {currentOperation?.position && (
            <span className="ml-1 text-gray-500">at position {currentOperation.position}</span>
          )}
        </div>
      </div>

      {/* Step Slider */}
      <div className="mt-6 flex flex-col items-center justify-center px-2">
        <Slider
          value={[currentStepIndex]}
          onValueChange={(value) => onStepSelect(value[0])}
          max={operations.length - 1}
          min={0}
          step={1}
          className="w-full"
          isAnimating={isAutoPlaying}
        />
        <div className="mt-2 mb-4 flex items-center justify-center">
          <span className="text-gray-500">
            {currentStepIndex + 1} / {operations.length}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mb-4 flex items-center justify-center space-x-3">
        <button
          onClick={() => onStepSelect(0)}
          disabled={isFirstStep}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          <span>First</span>
        </button>

        <button
          onClick={onPrevious}
          disabled={isFirstStep}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Auto Play Button - Center */}
        <button
          onClick={onAutoPlay}
          className={`flex transform items-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl ${
            isAutoPlaying
              ? 'bg-error hover:bg-error/80 animate-pulse text-white'
              : 'bg-success hover:bg-success/80 text-white'
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
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={onNext}
          disabled={isLastStep}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Next</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => onStepSelect(operations.length - 1)}
          disabled={isLastStep}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Last</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Selected Step Description */}
      <div className="border-accent/20 bg-accent/10 mt-4 rounded-lg border p-4">
        <h3 className="text-accent mb-2 font-semibold">คำอธิบาย Step {currentStepIndex + 1}</h3>
        <p className="text-black">
          {currentOperation ? getStepDescription(currentOperation) : 'No operation selected'}
        </p>
      </div>
    </div>
  );
};

export default StepSelector;
