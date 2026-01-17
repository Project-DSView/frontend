'use client';

import React, { useRef, Suspense, useState, lazy, useEffect } from 'react';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import { StepthroughLayoutProps, StepthroughData } from '@/types';
import { stepthroughTutorialSteps, getTutorialStorageKey } from '@/data';

// Lazy load heavy components
const TutorialOverlay = lazy(
  () => import('@/components/playground/shared/tutorial/TutorialOverlay'),
);
const StepIndicator = lazy(() => import('@/components/playground/shared/action/StepIndicator'));

import CodeEditor from '@/components/editor/CodeEditor';
import StepControl from '@/components/playground/shared/action/StepControl';
import FileUploadButton from '@/components/playground/shared/action/FileUploadButton';
import CopyCodeButton from '@/components/playground/shared/action/CopyCodeButton';
import ExportPythonButton from '@/components/playground/shared/action/ExportPythonButton';
import ExportPNGButton from '@/components/playground/shared/action/ExportPNGButton';
import TutorialButton from '@/components/playground/shared/tutorial/TutorialButton';
import InputDialog from '@/components/playground/stepthrough/InputDialog';

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
  complexity,
}: StepthroughLayoutProps<TData>) => {
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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 dark:bg-gray-900" suppressHydrationWarning>
      {/* Header */}
      <div className="mb-2 sm:mb-3">
        <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="mb-1 text-base font-bold text-gray-800 sm:text-lg dark:text-gray-100">
                {title}
              </h1>
              <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">{description}</p>
            </div>
            <TutorialButton onClick={() => setIsTutorialOpen(true)} />
          </div>
          <div className="flex flex-col gap-2">
            {/* Export Buttons */}
            <div id="tutorial-export-buttons" className="flex flex-wrap gap-1 sm:gap-2">
              <FileUploadButton onFileLoad={onFileLoad} disabled={isLoading} />
              <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
              <ExportPythonButton code={code} disabled={isLoading} />
              <CopyCodeButton code={code} disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2 sm:mb-3 sm:gap-3 lg:grid-cols-[2fr_3fr]">
        {/* Left Side - Code Editor with Step Control */}
        <div className="min-w-0 overflow-hidden rounded-lg bg-white p-2 shadow sm:p-3 dark:bg-gray-800">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <h2 className="text-sm font-semibold text-gray-800 sm:text-base dark:text-gray-100">
                Code Editor
              </h2>
              <div className="bg-neutral/20 dark:bg-neutral/80 rounded-md px-2 py-1 font-mono text-xs text-black/70 sm:px-3 sm:text-sm dark:text-gray-300">
                {filename}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:space-x-1">
              <button
                onClick={onReset}
                disabled={isLoading}
                className="bg-neutral/20 dark:bg-neutral/80 hover:bg-neutral/80 dark:hover:bg-neutral/40 rounded px-2 py-1 text-xs text-black/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-xs dark:text-gray-200"
              >
                Reset Code
              </button>
              <button
                id="tutorial-run-button"
                onClick={onExecute}
                disabled={isLoading || !code.trim()}
                className={`rounded px-2 py-1 text-xs text-white transition-colors sm:px-3 sm:py-1.5 sm:text-xs ${
                  isLoading || !code.trim()
                    ? 'bg-neutral/20 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/80'
                }`}
              >
                {isLoading ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          <div
            id="tutorial-code-editor"
            className="mb-2 min-w-0 overflow-hidden"
            style={{ height: '280px' }}
          >
            <CodeEditor
              code={code}
              onCodeChange={onCodeChange}
              height="280px"
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
            className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700"
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
            <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 sm:h-48 dark:border-gray-700 dark:bg-gray-800">
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
              complexity={complexity}
            />
          </div>
        </Suspense>
      </div>

      {/* Step Indicator - Sticky */}
      {isAutoPlaying &&
        steps.length > 0 &&
        currentStepIndex !== null &&
        currentStepIndex < steps.length && (
          <div className="sticky top-2 z-40 mb-2">
            <Suspense
              fallback={
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
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

      {/* Input Dialog - Interactive step-by-step mode */}
      {(() => {
        // Show dialog when waiting for input in interactive mode
        const shouldShow = inputState && inputState.waitingForInput === true;

        if (!shouldShow || !inputState) {
          return null;
        }

        // Interactive mode: Single prompt for current input
        const dialogPrompts = [
          {
            prompt: inputState.inputPrompt || 'Enter value',
            inputId: inputState.inputId ?? Date.now(),
          },
        ];

        return (
          <InputDialog
            isOpen={true}
            prompts={dialogPrompts}
            onSubmit={(values) => {
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
