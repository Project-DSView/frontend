'use client';

import React, { useRef, lazy, Suspense } from 'react';
import { useSinglyLinkedListStepthrough } from '@/hooks';
import CodeEditor from '@/components/virtualization/shared/CodeEditor';
import StepControl from '@/components/virtualization/shared/StepControl';
import FileUploadButton from '@/components/virtualization/shared/FileUploadButton';
import CopyCodeButton from '@/components/virtualization/shared/CopyCodeButton';
import ExportPythonButton from '@/components/virtualization/shared/ExportPythonButton';
import ExportPNGButton from '@/components/virtualization/shared/ExportPNGButton';

// Lazy load heavy components
const SinglyLinkedListStepthroughVisualization = lazy(
  () =>
    import('@/components/virtualization/stepthrough/linklist/singly/SinglyLinkedListVisualization'),
);

const StepthroughSinglyLinkedList: React.FC = () => {
  const {
    state,
    setCode,
    loadCodeFromFile,
    executeCode,
    setCurrentStep,
    nextStep,
    previousStep,
    toggleAutoPlay,
    reset,
    isLoading,
    linkedListData,
  } = useSinglyLinkedListStepthrough();

  const visualizationRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Stepthrough Singly Linked List</h1>
          <p className="text-gray-600">
            เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <FileUploadButton onFileLoad={loadCodeFromFile} disabled={isLoading} />

            <ExportPNGButton visualizationRef={visualizationRef} disabled={isLoading} />

            <ExportPythonButton code={state.code} disabled={isLoading} />

            <CopyCodeButton code={state.code} disabled={isLoading} />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side - Code Editor */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Code Editor</h2>
              <div className="bg-neutral/20 rounded-md px-3 py-1 font-mono text-sm text-black/70">
                {state.filename}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={reset}
                disabled={isLoading}
                className="bg-neutral/20 hover:bg-neutral/80 rounded px-4 py-2 text-sm text-black/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset Code
              </button>
              <button
                onClick={executeCode}
                disabled={isLoading || !state.code.trim()}
                className={`rounded px-4 py-2 text-sm text-white transition-colors ${
                  isLoading || !state.code.trim()
                    ? 'bg-neutral/20 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/80'
                }`}
              >
                {isLoading ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          <div className="h-80">
            <CodeEditor
              code={state.code}
              onCodeChange={setCode}
              currentStep={
                state.steps.length > 0 && state.currentStepIndex < state.steps.length
                  ? {
                      line: state.steps[state.currentStepIndex]?.line || 1,
                      stepNumber:
                        state.steps[state.currentStepIndex]?.stepNumber ||
                        state.currentStepIndex + 1,
                    }
                  : null
              }
            />
          </div>
        </div>

        {/* Right Side - Step Control */}
        <div className="rounded-lg bg-white p-6 shadow">
          <StepControl
            steps={state.steps}
            currentStepIndex={state.currentStepIndex}
            onStepSelect={setCurrentStep}
            onNext={nextStep}
            onPrevious={previousStep}
            onAutoPlay={toggleAutoPlay}
            isAutoPlaying={state.isAutoPlaying}
            isRunning={state.isRunning}
          />
        </div>
      </div>

      {/* Visualization */}
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
            Loading visualization...
          </div>
        }
      >
        <SinglyLinkedListStepthroughVisualization
          ref={visualizationRef}
          steps={state.steps}
          currentStepIndex={state.currentStepIndex}
          linkedListData={linkedListData}
          isRunning={state.isRunning}
        />
      </Suspense>
    </div>
  );
};

export default StepthroughSinglyLinkedList;
