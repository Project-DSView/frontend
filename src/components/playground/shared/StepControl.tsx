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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Step Control</h3>
              <p className="text-xs text-gray-600 sm:text-sm">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
            {isAutoPlaying && (
              <div className="text-xl text-green-600 font-medium animate-pulse">
                กำลังเล่น...
              </div>
            )}
          </div>
        </div>

        {/* Current Step Details - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {currentStep && (
            <div className="space-y-3 sm:space-y-4">
              {/* Combined Step Information Card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                {/* Step Header */}
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <span className="text-sm font-semibold">
                        {currentStep.stepNumber || currentStepIndex + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Step Information</h4>
                      <p className="text-xs text-gray-500">Line {currentStep.line || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Code Section */}
                {currentStep.code && (
                  <div className="mb-4">
                    <div className="mb-2 text-xs font-semibold text-gray-700">Code:</div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <pre className="text-xs break-words whitespace-pre-wrap text-gray-800 sm:text-sm">
                        {currentStep.code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Message/Description */}
                <div className="mb-4">
                  <div className="mb-2 text-xs font-semibold text-gray-700">Description:</div>
                  <div className="text-sm text-gray-600">
                    {currentStep.state?.message || 'No description available'}
                  </div>
                </div>

                {/* Step Details */}
                {currentStep.state?.step_detail && (
                  <div>
                    <div className="mb-2 text-xs font-semibold text-gray-700">
                      Operation Details:
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:text-sm">
                      <div className="flex">
                        <span className="w-20 font-medium text-gray-600">Operation:</span>
                        <span className="text-gray-800">
                          {currentStep.state.step_detail.operation}
                        </span>
                      </div>
                      {currentStep.state.step_detail.method_name && (
                        <div className="flex">
                          <span className="w-20 font-medium text-gray-600">Method:</span>
                          <span className="text-gray-800">
                            {currentStep.state.step_detail.method_name}
                          </span>
                        </div>
                      )}
                      {currentStep.state.step_detail.detected_behavior && (
                        <div className="flex">
                          <span className="w-20 font-medium text-gray-600">Behavior:</span>
                          <span className="text-gray-800">
                            {currentStep.state.step_detail.detected_behavior}
                          </span>
                        </div>
                      )}
                      {currentStep.state.step_detail.parameters && (
                        <div className="col-span-full flex">
                          <span className="w-20 font-medium text-gray-600">Parameters:</span>
                          <span className="text-gray-800">
                            {currentStep.state.step_detail.parameters}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Print Output - Separate Section */}
              {currentStep.state?.print_output && currentStep.state.print_output.length > 0 && (
                <div className="bg-accent/20 border-accent rounded-lg border p-4 sm:p-6">
                  <div className="mb-3 flex items-center">
                    <div className="bg-accent/20 mr-2 flex h-6 w-6 items-center justify-center rounded-full">
                      <svg
                        className="text-accent h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-accent text-sm font-semibold">Output</h4>
                  </div>
                  <div className="space-y-2">
                    {currentStep.state.print_output.map((output, index) => (
                      <div
                        key={index}
                        className="border-accent rounded-md border bg-white p-3 font-mono text-xs text-gray-800 shadow-sm sm:text-sm"
                      >
                        {output}
                      </div>
                    ))}
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
            isAnimating={isAutoPlaying}
          />
          <div className="mt-2 mb-2 flex items-center justify-center">
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
          </button>

          {/* Auto Play Button - Center */}
          <button
            onClick={onAutoPlay}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 sm:px-6 sm:py-3 sm:text-base ${
              isAutoPlaying
                ? 'bg-error hover:bg-error/80 text-white animate-pulse'
                : 'bg-success hover:bg-success/80 text-white'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={isLastStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <span className="hidden sm:inline">Next</span>

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
        </div>
      </section>
    </main>
  );
};

export default StepControl;
