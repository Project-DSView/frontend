'use client';

import React, { lazy } from 'react';

import { useStackStepthrough } from '@/hooks';
import { StackData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const StackStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/Stack'),
);

const StepthroughStack: React.FC = () => {
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
    stackData,
  } = useStackStepthrough();

  return (
    <StepthroughLayout<StackData>
      code={state.code}
      onCodeChange={setCode}
      onExecute={executeCode}
      onReset={reset}
      onFileLoad={loadCodeFromFile}
      filename={state.filename}
      steps={state.steps}
      currentStepIndex={state.currentStepIndex}
      onStepSelect={setCurrentStep}
      onNext={nextStep}
      onPrevious={previousStep}
      onAutoPlay={toggleAutoPlay}
      isAutoPlaying={state.isAutoPlaying}
      isRunning={state.isRunning}
      isLoading={isLoading}
      data={stackData}
      title="Stepthrough Stack"
      description="เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization"
      visualizationComponent={StackStepthroughVisualization}
      error={state.error}
    />
  );
};

export default StepthroughStack;
