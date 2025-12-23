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
    toggleDebugMode,
    setBreakpoint,
    removeBreakpoint,
    stepOver,
    stepInto,
    stepOut,
    continueDebug,
    handleInputSubmit,
    handleInputCancel,
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
      debugState={state.debugState}
      onToggleDebugMode={toggleDebugMode}
      onSetBreakpoint={setBreakpoint}
      onRemoveBreakpoint={removeBreakpoint}
      onStepOver={stepOver}
      onStepInto={stepInto}
      onStepOut={stepOut}
      onContinue={continueDebug}
      inputState={state.inputState}
      onInputSubmit={handleInputSubmit}
      onInputCancel={handleInputCancel}
    />
  );
};

export default QueueStepthroughPage;
