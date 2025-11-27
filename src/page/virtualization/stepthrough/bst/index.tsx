'use client';

import React, { lazy } from 'react';
import { useStepthroughBST } from '@/hooks';
import { BSTData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const BSTStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/BST'),
);

const StepthroughBST: React.FC = () => {
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
  } = useStepthroughBST();

  return (
    <StepthroughLayout<BSTData>
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
      data={linkedListData as BSTData}
      title="Stepthrough Binary Search Tree"
      description="เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization"
      visualizationComponent={BSTStepthroughVisualization}
      error={state.error}
    />
  );
};

export default StepthroughBST;
