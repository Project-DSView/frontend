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
  debugState,
}) => {
  if (steps.length === 0) {
    return (
      <div className="h-full rounded-lg bg-white p-2 shadow sm:p-3 dark:bg-gray-800">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h3 className="mb-1 text-sm font-semibold text-gray-600 sm:text-base dark:text-gray-300">
              No Steps Available
            </h3>
            <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              Run your code to see execution steps
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Check if current step has an error
  const hasError =
    currentStep?.state?.error &&
    typeof currentStep.state.error === 'string' &&
    currentStep.state.error.trim() !== '';
  const errorMessage = hasError ? currentStep.state.error : null;

  return (
    <main className="flex h-full flex-col" suppressHydrationWarning>
      <section className="min-h-0 flex-1">
        {/* Header with Step Counter */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-100">
                Step Control
              </h3>
              <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {debugState?.isDebugMode && (
                <div className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  Debug Mode
                </div>
              )}
              {isAutoPlaying && (
                <div className="animate-pulse text-sm font-medium text-green-600 dark:text-green-500">
                  กำลังเล่น...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Slider */}
        <div className="mb-2 flex flex-col items-center justify-center px-2 sm:mb-3">
          <Slider
            value={[currentStepIndex]}
            onValueChange={(value) => onStepSelect(value[0])}
            max={steps.length - 1}
            min={0}
            step={1}
            className="w-full"
            isAnimating={isAutoPlaying}
          />
          <div className="mt-1 mb-1 flex items-center justify-center">
            <span className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1 sm:mb-3 sm:gap-2">
          <button
            onClick={() => onStepSelect(0)}
            disabled={isFirstStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-1 sm:px-3 sm:py-2 sm:text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-1 sm:px-3 sm:py-2 sm:text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
            className={`flex transform items-center space-x-1 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:px-4 sm:py-2 sm:text-sm ${
              isAutoPlaying
                ? 'bg-error hover:bg-error/80 animate-pulse text-white'
                : 'bg-success hover:bg-success/80 text-white'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={isLastStep}
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-1 sm:px-3 sm:py-2 sm:text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:space-x-1 sm:px-3 sm:py-2 sm:text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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

        {/* Current Step Details - Scrollable */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 pt-2 dark:border-gray-700">
          {currentStep && (
            <div className="space-y-2 sm:space-y-3">
              {/* Combined Step Information Card */}
              <div
                className={`rounded-lg border p-2 shadow-sm sm:p-3 ${
                  hasError
                    ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                {/* Step Header */}
                <div
                  className={`mb-2 flex items-center justify-between border-b pb-2 ${
                    hasError
                      ? 'border-red-200 dark:border-red-800'
                      : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        hasError
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {currentStep.stepNumber || currentStepIndex + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Step Information
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Line {currentStep.line || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code Section */}
                {currentStep.code && (
                  <div className="mb-2">
                    <div className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Code:
                    </div>
                    <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-900">
                      <pre className="text-xs break-words whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {currentStep.code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Error Message - Show prominently if exists */}
                {hasError && errorMessage && (
                  <div className="mb-2 rounded-lg border border-red-300 bg-red-50 p-2 dark:border-red-700 dark:bg-red-900/30">
                    <div className="mb-1 flex items-center space-x-2">
                      <svg
                        className="h-4 w-4 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-sm font-semibold text-red-900 dark:text-red-300">
                        Error:
                      </div>
                    </div>
                    <div className="font-mono text-xs break-words whitespace-pre-wrap text-red-800 sm:text-sm dark:text-red-200">
                      {errorMessage}
                    </div>
                  </div>
                )}

                {/* Message/Description */}
                {!hasError && (
                  <div className="mb-2">
                    <div className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Description:
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {currentStep.state?.message || 'No description available'}
                    </div>
                  </div>
                )}

                {/* Step Details */}
                {currentStep.state?.step_detail && (
                  <div>
                    <div className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Operation Details:
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                      <div className="flex">
                        <span className="w-20 font-medium text-gray-600 dark:text-gray-400">
                          Operation:
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">
                          {currentStep.state.step_detail.operation}
                        </span>
                      </div>
                      {currentStep.state.step_detail.method_name && (
                        <div className="flex">
                          <span className="w-20 font-medium text-gray-600 dark:text-gray-400">
                            Method:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {currentStep.state.step_detail.method_name}
                          </span>
                        </div>
                      )}
                      {currentStep.state.step_detail.detected_behavior && (
                        <div className="flex">
                          <span className="w-20 font-medium text-gray-600 dark:text-gray-400">
                            Behavior:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {currentStep.state.step_detail.detected_behavior}
                          </span>
                        </div>
                      )}
                      {currentStep.state.step_detail.parameters && (
                        <div className="col-span-full flex">
                          <span className="w-20 font-medium text-gray-600 dark:text-gray-400">
                            Parameters:
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {currentStep.state.step_detail.parameters}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Thai Code Explanation Panel */}
                {currentStep.state?.explanation && (
                  <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        คำอธิบายการทำงาน
                      </span>
                    </div>

                    {/* What does this line do */}
                    {currentStep.state.explanation.what && (
                      <div className="mb-2">
                        <div className="mb-0.5 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                          <span>บรรทัดนี้ทำอะไร:</span>
                        </div>
                        <div className="text-xs text-blue-900 dark:text-blue-200">
                          {currentStep.state.explanation.what}
                        </div>
                      </div>
                    )}

                    {/* Why visualization changed */}
                    {currentStep.state.explanation.why_visual && (
                      <div className="mb-2">
                        <div className="mb-0.5 flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                          <span>ทำไมรูปถึงเปลี่ยน:</span>
                        </div>
                        <div className="text-xs text-purple-900 dark:text-purple-200">
                          {currentStep.state.explanation.why_visual}
                        </div>
                      </div>
                    )}

                    {/* Related concept */}
                    {currentStep.state.explanation.concept && (
                      <div>
                        <div className="mb-0.5 flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                          <span>Concept:</span>
                        </div>
                        <div className="text-xs text-green-900 dark:text-green-200">
                          {currentStep.state.explanation.concept}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default StepControl;
