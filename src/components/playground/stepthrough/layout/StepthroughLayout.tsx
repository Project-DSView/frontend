'use client';

import React, { useRef, Suspense, useState, lazy, useEffect } from 'react';
import { toast } from 'sonner';
import CodeEditor from '@/components/editor/CodeEditor';
import StepControl from '@/components/playground/shared/StepControl';
import FileUploadButton from '@/components/playground/shared/FileUploadButton';
import CopyCodeButton from '@/components/playground/shared/CopyCodeButton';
import ExportPythonButton from '@/components/playground/shared/ExportPythonButton';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/TutorialButton';
import InputDialog from '@/components/playground/shared/InputDialog';
import { StepthroughLayoutProps, StepthroughData } from '@/types';

// Lazy load heavy components
// Lazy load heavy components
const TutorialOverlay = lazy(() => import('@/components/playground/tutorial/TutorialOverlay'));
const StepIndicator = lazy(() => import('@/components/playground/shared/StepIndicator'));
import { stepthroughTutorialSteps } from '@/data/components/stepthrough-tutorial.data';
import { getTutorialStorageKey } from '@/data/components/tutorial-overlay.data';
import { usePathname } from 'next/navigation';

const StepthroughLayout = <TData extends StepthroughData = StepthroughData>({
  code,
  onCodeChange,
  onExecute,
  onReset,
  onFileLoad,
  filename,
  steps,
  currentStepIndex,
  onStepSelect,
  onNext,
  onPrevious,
  onAutoPlay,
  isAutoPlaying,
  isRunning,
  isLoading,
  data,
  title,
  description,
  visualizationComponent: VisualizationComponent,
  error,
  // Debug mode props
  debugState,
  onToggleDebugMode,
  onSetBreakpoint,

  onStepOver,
  onStepInto,
  onStepOut,
  onContinue,
  // Input handling props
  inputState,
  onInputSubmit,
  onInputCancel,
  terminalOutput,
}: StepthroughLayoutProps<TData>) => {
  // Debug: Log inputState on every render
  console.log('🎨 StepthroughLayout render - inputState:', inputState);
  const pathname = usePathname();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const visualizationRef = useRef<HTMLDivElement | null>(null);
  const stepControlRef = useRef<HTMLDivElement | null>(null);

  // Auto-show tutorial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getTutorialStorageKey(pathname, 'stepthrough');
      const hasSeenTutorial = localStorage.getItem(storageKey) === 'completed';

      if (!hasSeenTutorial) {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 800); // Slight delay for layout to settle
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  // Show toast notification when error occurs
  useEffect(() => {
    if (error) {
      const isSecurityError = error.includes('โค้ดไม่ปลอดภัย') || error.includes('Dangerous');
      toast.error(isSecurityError ? 'โค้ดไม่ปลอดภัย' : 'เกิดข้อผิดพลาดในการรันโค้ด', {
        description: error,
        duration: isSecurityError ? 7000 : 5000,
      });
    }
  }, [error]);

  // Auto-scroll to visualization when auto-play starts
  React.useEffect(() => {
    if (isAutoPlaying && visualizationRef.current) {
      const timer = setTimeout(() => {
        visualizationRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 200); // Small delay to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 dark:bg-gray-900" suppressHydrationWarning>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">
                {title}
              </h1>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">{description}</p>
            </div>
            <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          </div>
          <div className="flex flex-col gap-4">
            {/* Export Buttons */}
            <div id="tutorial-export-buttons" className="flex flex-wrap gap-2 sm:gap-3">
              <FileUploadButton onFileLoad={onFileLoad} disabled={isLoading} />
              <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
              <ExportPythonButton code={code} disabled={isLoading} />
              <CopyCodeButton code={code} disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-2">
        {/* Left Side - Code Editor with Step Control */}
        <div className="rounded-lg bg-white p-3 shadow sm:p-6 dark:bg-gray-800">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h2 className="text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100">
                Code Editor
              </h2>
              <div className="bg-neutral/20 dark:bg-neutral/80 rounded-md px-2 py-1 font-mono text-xs text-black/70 sm:px-3 sm:text-sm dark:text-gray-300">
                {filename}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
              <button
                onClick={onReset}
                disabled={isLoading}
                className="bg-neutral/20 dark:bg-neutral/80 hover:bg-neutral/80 dark:hover:bg-neutral/40 rounded px-3 py-2 text-xs text-black/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm md:px-5 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base dark:text-gray-200"
              >
                Reset Code
              </button>
              <button
                id="tutorial-run-button"
                onClick={onExecute}
                disabled={isLoading || !code.trim()}
                className={`rounded px-3 py-2 text-xs text-white transition-colors sm:px-4 sm:text-sm md:px-5 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base ${
                  isLoading || !code.trim()
                    ? 'bg-neutral/20 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/80'
                }`}
              >
                {isLoading ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          <div id="tutorial-code-editor" className="mb-4" style={{ height: '400px' }}>
            <CodeEditor
              code={code}
              onCodeChange={onCodeChange}
              height="400px"
              currentStep={
                steps.length > 0 && currentStepIndex < steps.length
                  ? {
                      line: steps[currentStepIndex]?.line || 1,
                      stepNumber: steps[currentStepIndex]?.stepNumber || currentStepIndex + 1,
                    }
                  : null
              }
              error={error}
              debugState={debugState}
              onBreakpointClick={onSetBreakpoint}
            />
          </div>

          {/* Step Control - Now below Code Editor */}
          <div
            id="tutorial-step-control"
            ref={stepControlRef}
            className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700"
          >
            <StepControl
              steps={steps}
              currentStepIndex={currentStepIndex}
              onStepSelect={onStepSelect}
              onNext={onNext}
              onPrevious={onPrevious}
              onAutoPlay={onAutoPlay}
              isAutoPlaying={isAutoPlaying}
              isRunning={isRunning}
              debugState={debugState}
              onToggleDebugMode={onToggleDebugMode}
              onStepOver={onStepOver}
              onStepInto={onStepInto}
              onStepOut={onStepOut}
              onContinue={onContinue}
            />
          </div>
        </div>

        {/* Right Side - Visualization */}
        <Suspense
          fallback={
            <div className="flex h-48 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 sm:h-64 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <div className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                  Loading visualization...
                </div>
              </div>
            </div>
          }
        >
          <div id="tutorial-visualization" ref={visualizationRef}>
            <VisualizationComponent
              steps={steps}
              currentStepIndex={currentStepIndex}
              data={data}
              isRunning={isRunning}
              error={error}
              terminalOutput={terminalOutput}
            />
          </div>
        </Suspense>
      </div>

      {/* Step Indicator - Sticky */}
      {isAutoPlaying &&
        steps.length > 0 &&
        currentStepIndex !== null &&
        currentStepIndex < steps.length && (
          <div className="sticky top-4 z-40 mb-4">
            <Suspense
              fallback={
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                  <div className="flex h-6 items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400"></div>
                  </div>
                </div>
              }
            >
              <StepIndicator
                stepNumber={currentStepIndex + 1}
                totalSteps={steps.length}
                message={steps[currentStepIndex]?.state?.message || `Step ${currentStepIndex + 1}`}
                isAutoPlaying={isAutoPlaying}
              />
            </Suspense>
          </div>
        )}

      {/* Tutorial Modal */}
      <Suspense
        fallback={
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        }
      >
        <TutorialOverlay
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          steps={stepthroughTutorialSteps}
          storageKey={getTutorialStorageKey(pathname, 'stepthrough')}
        />
      </Suspense>

      {/* Input Dialog - Supports both upfront collection and interactive mode */}
      {(() => {
        // Only show if:
        // 1. We are explicitly collecting inputs (upfront mode)
        // 2. OR We are waiting for input AND we are at the last step (current execution tip)
        const isAtLastStep = steps.length > 0 && currentStepIndex === steps.length - 1;

        const shouldShow =
          inputState &&
          (inputState.collectingInputs === true ||
            (inputState.waitingForInput === true && isAtLastStep));

        // Debug toggles - remove in production or rely on props
        // console.log('💬 InputDialog check:', { waiting: inputState?.waitingForInput, isAtLastStep, shouldShow });

        if (!shouldShow || !inputState) {
          return null;
        }

        // Determine prompts based on mode
        let dialogPrompts: { prompt: string; inputId: number }[] | null = null;
        let dialogTotal = 1;

        if (inputState.waitingForInput) {
          // Interactive mode: Single prompt
          dialogPrompts = [
            {
              prompt: inputState.inputPrompt || 'Enter value',
              inputId: inputState.inputId || Date.now(),
            },
          ];
          dialogTotal = 1;
        } else if (inputState.collectingInputs) {
          // Upfront mode: Multiple prompts from history/definitions
          if (inputState.inputHistory && inputState.inputHistory.length > 0) {
            dialogPrompts = inputState.inputHistory.map((h, idx) => ({
              prompt: h.prompt || `Input ${idx + 1}`,
              inputId: h.inputId,
            }));
            dialogTotal = inputState.inputHistory.length;
          }
        }

        return (
          <InputDialog
            isOpen={true}
            prompts={dialogPrompts}
            totalInputs={dialogTotal}
            onSubmit={(values) => {
              // Submit values
              if (onInputSubmit) {
                onInputSubmit(values);
              }
            }}
            onCancel={onInputCancel || (() => {})}
          />
        );
      })()}
    </div>
  );
};

export default StepthroughLayout;
