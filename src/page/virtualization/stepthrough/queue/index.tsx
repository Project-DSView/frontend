'use client';

import React, { useState } from 'react';

import { queueCodeTemplate } from '@/data';
import { useStepthroughQueue } from '@/hooks';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
import QueueStepthrough from '@/components/playground/stepthrough/visualization/Queue';

const QueueStepthroughPage: React.FC = () => {
  const [code, setCode] = useState(queueCodeTemplate);

  const {
    state,
    setCode: setCodeState,
    loadCodeFromFile,
    executeCode,
    setCurrentStep,
    nextStep,
    previousStep,
    toggleAutoPlay,
    reset,
    isLoading,
  } = useStepthroughQueue(code);

  return (
    <StepthroughLayout
      code={code}
      onCodeChange={(newCode) => {
        setCode(newCode);
        setCodeState(newCode);
      }}
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
      data={state.data}
      title="Queue Step Through"
      description="Run your queue code step by step"
      visualizationComponent={QueueStepthrough}
      error={state.error}
    />
  );
};

export default QueueStepthroughPage;
