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
import { StepthroughLayoutProps, StepthroughData } from '@/types';

// Lazy load heavy components
const TutorialModal = lazy(() => import('@/components/tutorial/TutorialModal'));
const StepIndicator = lazy(() => import('@/components/playground/shared/StepIndicator'));

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
}: StepthroughLayoutProps<TData>) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const visualizationRef = useRef<HTMLDivElement | null>(null);
  const stepControlRef = useRef<HTMLDivElement | null>(null);
  const [codeEditorHeight, setCodeEditorHeight] = React.useState<string>('320px');

  // Show toast notification when error occurs
  useEffect(() => {
    if (error) {
      toast.error('เกิดข้อผิดพลาดในการรันโค้ด', {
        description: error,
        duration: 5000,
      });
    }
  }, [error]);

  // Update code editor height based on step control height
  React.useEffect(() => {
    const updateHeight = () => {
      if (stepControlRef.current && typeof window !== 'undefined') {
        const stepControlHeight = stepControlRef.current.offsetHeight;
        // Responsive padding: smaller on mobile, larger on desktop
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024; // lg breakpoint

        let padding, minHeight;
        if (isMobile) {
          padding = 20; // 20px for mobile
          minHeight = 120; // 120px for mobile
        } else if (isTablet) {
          padding = 32; // 32px for tablet
          minHeight = 180; // 180px for tablet
        } else {
          padding = 48; // 48px for desktop
          minHeight = 200; // 200px for desktop
        }

        const newHeight = Math.max(stepControlHeight - padding, minHeight);
        setCodeEditorHeight(`${newHeight}px`);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      // Reset height first to prevent accumulation
      setCodeEditorHeight('320px');

      // Update height on mount and when steps change
      updateHeight();

      // Update height when window resizes
      window.addEventListener('resize', updateHeight);

      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [steps.length, currentStepIndex]);

  // Reset height when step changes to prevent height accumulation
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Reset to default height when step changes
      setCodeEditorHeight('320px');

      // Then recalculate after a short delay
      const timer = setTimeout(() => {
        if (stepControlRef.current) {
          const stepControlHeight = stepControlRef.current.offsetHeight;
          const isMobile = window.innerWidth < 640;
          const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

          let padding, minHeight;
          if (isMobile) {
            padding = 20;
            minHeight = 120;
          } else if (isTablet) {
            padding = 32;
            minHeight = 180;
          } else {
            padding = 48;
            minHeight = 200;
          }

          const newHeight = Math.max(stepControlHeight - padding, minHeight);
          setCodeEditorHeight(`${newHeight}px`);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

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
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <FileUploadButton onFileLoad={onFileLoad} disabled={isLoading} />
              <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />
              <ExportPythonButton code={code} disabled={isLoading} />
              <CopyCodeButton code={code} disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert removed - now using toast notification */}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-2">
        {/* Left Side - Code Editor */}
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

          <div style={{ height: codeEditorHeight }}>
            <CodeEditor
              code={code}
              onCodeChange={onCodeChange}
              height={codeEditorHeight}
              currentStep={
                steps.length > 0 && currentStepIndex < steps.length
                  ? {
                      line: steps[currentStepIndex]?.line || 1,
                      stepNumber: steps[currentStepIndex]?.stepNumber || currentStepIndex + 1,
                    }
                  : null
              }
              error={error}
            />
          </div>
        </div>

        {/* Right Side - Step Control */}
        <div
          ref={stepControlRef}
          className="rounded-lg bg-white p-3 shadow sm:p-6 dark:bg-gray-800"
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
          />
        </div>
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
        <div ref={visualizationRef}>
          <VisualizationComponent
            steps={steps}
            currentStepIndex={currentStepIndex}
            data={data}
            isRunning={isRunning}
            error={error}
          />
        </div>
      </Suspense>

      {/* Tutorial Modal */}
      <Suspense
        fallback={
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        }
      >
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          playgroundMode="stepthrough"
        />
      </Suspense>
    </div>
  );
};

export default StepthroughLayout;
