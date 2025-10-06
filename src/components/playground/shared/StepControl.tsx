import React from 'react';
import { StepthroughStepControlProps } from '@/types';
import { Slider } from '@/components/ui/slider';

const StepControl: React.FC<StepthroughStepControlProps> = ({
  steps,
  currentStepIndex,
  onStepSelect,
  onNext,
  onPrevious,
  onAutoPlay,
  isAutoPlaying,
}) => {
  if (steps.length === 0) {
    return (
      <div className="h-full rounded-lg bg-white p-3 shadow sm:p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h3 className="mb-2 text-base font-semibold text-gray-600 sm:text-lg">
              No Steps Available
            </h3>
            <p className="text-xs text-gray-500 sm:text-sm">Run your code to see execution steps</p>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <main className="flex h-full flex-col" suppressHydrationWarning>
      <section className="min-h-0 flex-1">
        {/* Header with Step Counter */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Step Control</h3>
          <p className="text-xs text-gray-600 sm:text-sm">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        {/* Current Step Details - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {currentStep && (
            <div className="space-y-2 sm:space-y-4">
              {/* Code */}
              {currentStep.code && (
                <div className="bg-info/20 rounded-lg p-3 sm:p-4">
                  <div className="text-info mb-2 text-xs font-bold sm:text-sm">Code:</div>
                  <pre className="text-xs break-words whitespace-pre-wrap text-gray-600 sm:text-sm">
                    {currentStep.code}
                  </pre>
                </div>
              )}

              {/* Current Step Info */}
              {currentStep && (
                <div className="bg-info/20 mb-3 rounded-lg p-3 sm:mb-4 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-info text-xs font-bold sm:text-sm">
                      Step {currentStep.stepNumber || currentStepIndex + 1}
                    </span>
                    <span className="text-xs text-gray-500">Line {currentStep.line || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-600 sm:text-sm">
                    {currentStep.state?.message || 'No description available'}
                  </div>
                </div>
              )}

              {/* Print Output */}
              {currentStep.state?.print_output && currentStep.state.print_output.length > 0 && (
                <div className="bg-info/20 rounded-lg p-3 sm:p-4">
                  <div className="text-info mb-2 text-xs font-bold sm:text-sm">Print Output:</div>
                  <div className="space-y-1">
                    {currentStep.state.print_output.map((output, index) => (
                      <div
                        key={index}
                        className="border-neutral bg-neutral/10 rounded border bg-white p-2 font-mono text-xs text-gray-800 shadow-sm sm:text-sm"
                      >
                        {output}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Details */}
              {currentStep.state?.step_detail && (
                <div className="bg-info/20 rounded-lg p-3 sm:p-4">
                  <div className="text-info mb-2 text-xs font-bold sm:text-sm">
                    Operation Details:
                  </div>
                  <div className="text-info space-y-1 text-xs sm:space-y-2 sm:text-sm">
                    <div>
                      <span className="font-medium">Operation:</span>{' '}
                      {currentStep.state.step_detail.operation}
                    </div>
                    {currentStep.state.step_detail.method_name && (
                      <div>
                        <span className="font-medium">Method:</span>{' '}
                        {currentStep.state.step_detail.method_name}
                      </div>
                    )}
                    {currentStep.state.step_detail.detected_behavior && (
                      <div>
                        <span className="font-medium">Behavior:</span>{' '}
                        {currentStep.state.step_detail.detected_behavior}
                      </div>
                    )}
                    {currentStep.state.step_detail.parameters && (
                      <div>
                        <span className="font-medium">Parameters:</span>{' '}
                        {currentStep.state.step_detail.parameters}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 sm:mt-8">
        {/* Step Slider */}
        <div className="mb-3 flex flex-col items-center justify-center px-2 sm:mb-4">
          <Slider
            value={[currentStepIndex]}
            onValueChange={(value) => onStepSelect(value[0])}
            max={steps.length - 1}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="mt-2 mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-500 sm:text-sm">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
        </div>
        {/* Navigation Controls */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1 sm:mb-4 sm:gap-3">
          <button
            onClick={() => onStepSelect(0)}
            disabled={isFirstStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">First</span>
            <span className="sm:hidden">⏮</span>
          </button>

          <button
            onClick={onPrevious}
            disabled={isFirstStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">⏪</span>
          </button>

          <button
            onClick={onNext}
            disabled={isLastStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">⏩</span>
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => onStepSelect(steps.length - 1)}
            disabled={isLastStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <span className="hidden sm:inline">Last</span>
            <span className="sm:hidden">⏭</span>
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={onAutoPlay}
            className={`flex items-center space-x-1 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:space-x-2 sm:px-4 sm:py-3 sm:text-sm ${
              isAutoPlaying
                ? 'bg-error hover:bg-error/80 text-white'
                : 'bg-success hover:bg-success/80 text-white'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span className="hidden sm:inline">Stop</span>
                <span className="sm:hidden">⏸</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="hidden sm:inline">Auto Play</span>
                <span className="sm:hidden">▶</span>
              </>
            )}
          </button>
        </div>
      </section>
    </main>
  );
};

export default StepControl;
