'use client';

import React, { lazy } from 'react';
import { useDoublyLinkedListStepthrough } from '@/hooks';
import StepthroughLayout from '@/components/virtualization/shared/StepthroughLayout';
import { LinkedListData } from '@/types';

// Lazy load heavy components
const DoublyLinkedListStepthroughVisualization = lazy(
  () =>
    import('@/components/virtualization/stepthrough/linklist/doubly/DoublyLinkedListVisualization'),
);

const StepthroughDoublyLinkedList: React.FC = () => {
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
  } = useDoublyLinkedListStepthrough();

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
      title="Stepthrough Doubly Linked List"
      description="เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization"
      visualizationComponent={DoublyLinkedListStepthroughVisualization}
    />
  );
};

export default StepthroughDoublyLinkedList;
