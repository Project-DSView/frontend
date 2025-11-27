'use client';

import React, { lazy } from 'react';

import { useStepthroughSinglyLinkedList } from '@/hooks';
import { LinkedListData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const SinglyLinkedListStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/SinglyLinkedList'),
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
  } = useStepthroughSinglyLinkedList();

  return (
    <StepthroughLayout<LinkedListData>
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
      data={linkedListData}
      title="Stepthrough Singly Linked List"
      description="เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization"
      visualizationComponent={SinglyLinkedListStepthroughVisualization}
      error={state.error}
    />
  );
};

export default StepthroughSinglyLinkedList;
