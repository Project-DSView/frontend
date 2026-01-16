import React, { useEffect } from 'react';
import { StepSelectorProps } from '@/types';
import { Slider } from '@/components/ui/slider';

const StepSelector: React.FC<StepSelectorProps> = ({
  operations,
  selectedStep,
  onStepSelect,
  getStepDescription,
  onAutoPlay,
  isAutoPlaying = false,
}) => {
  useEffect(() => {
    if (selectedStep === null && operations.length > 0) {
      onStepSelect(0);
    }
  }, [selectedStep, operations.length, onStepSelect]);

  if (operations.length === 0) return null;

  const currentStepIndex = selectedStep ?? 0;
  const isFirstStep = currentStepIndex <= 0;
  const isLastStep = currentStepIndex >= operations.length - 1;
  const currentOperation = operations[currentStepIndex];

  /* =========================
      Local navigation logic
  ========================= */

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepSelect(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < operations.length - 1) {
      onStepSelect(currentStepIndex + 1);
    }
  };

  return (
    <div className="mb-4 rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Step Control
          </h2>
          <span className="text-xs text-gray-500">
            {currentStepIndex + 1} / {operations.length}
          </span>
        </div>
        {isAutoPlaying && (
          <span className="animate-pulse text-xs font-medium text-green-600">
            Playing…
          </span>
        )}
      </div>

      {/* Current Step */}
      <div className="mb-3 rounded-md border bg-gray-50 px-3 py-2 text-xs dark:bg-gray-900">
        <div className="flex justify-between">
          <span className="font-medium">Step {currentStepIndex + 1}</span>
          <span className="text-gray-400">{currentOperation?.category}</span>
        </div>
        <div className="mt-1 text-gray-600 dark:text-gray-300">
          {currentOperation?.name}
          {currentOperation?.value && (
            <span className="ml-1 font-medium">({currentOperation.value})</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-3 px-1">
        <Slider
          value={[currentStepIndex]}
          onValueChange={(v) => onStepSelect(v[0])}
          max={operations.length - 1}
          min={0}
          step={1}
          className="w-full"
          isAnimating={isAutoPlaying}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => onStepSelect(0)}
          disabled={isFirstStep}
          className="rounded border px-2 py-1 text-xs disabled:opacity-40"
        >
          First
        </button>

        <button
          onClick={handlePrev}
          disabled={isFirstStep}
          className="rounded border px-2 py-1 text-xs disabled:opacity-40"
        >
          Prev
        </button>

        <button
          onClick={onAutoPlay}
          className={`rounded px-3 py-1 text-xs font-semibold text-white ${
            isAutoPlaying ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isAutoPlaying ? 'Stop' : 'Play'}
        </button>

        <button
          onClick={handleNext}
          disabled={isLastStep}
          className="rounded border px-2 py-1 text-xs disabled:opacity-40"
        >
          Next
        </button>

        <button
          onClick={() => onStepSelect(operations.length - 1)}
          disabled={isLastStep}
          className="rounded border px-2 py-1 text-xs disabled:opacity-40"
        >
          Last
        </button>
      </div>

      {/* Description */}
      <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs dark:bg-blue-900/40">
        <span className="font-medium text-blue-700 dark:text-blue-300">
          Step {currentStepIndex + 1}:
        </span>{' '}
        {currentOperation
          ? getStepDescription(currentOperation)
          : 'No operation'}
      </div>
    </div>
  );
};

export default StepSelector;
