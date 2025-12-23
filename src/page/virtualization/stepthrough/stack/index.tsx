'use client';

import React, { lazy, useMemo, useEffect } from 'react';

import { useStepthroughStack } from '@/hooks';
import { StackData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const StackStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/Stack'),
);

const StepthroughStack: React.FC = () => {
  const hookResult = useStepthroughStack();
  console.log('🔍 useStepthroughStack result:', hookResult);
  console.log('🔍 hookResult.state:', hookResult.state);
  console.log('🔍 hookResult.state.inputState:', hookResult.state?.inputState);
  
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
    handleInputSubmit,
    handleInputCancel,
  } = hookResult;
  
  console.log('🔍 Destructured state.inputState:', state?.inputState);

  console.log('📋 StepthroughStack render - state.inputState:', state?.inputState);
  console.log('📋 Full state:', state);

  // Add useEffect to verify component re-renders when inputState changes
  useEffect(() => {
    console.log('🔄 StepthroughStack - inputState changed:', state?.inputState);
  }, [state?.inputState]);

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
      astPreview={state.astPreview}
      astPreviewLoading={state.astPreviewLoading}
      inputState={state.inputState}
      onInputSubmit={handleInputSubmit}
      onInputCancel={handleInputCancel}
      terminalOutput={state.terminalOutput}
    />
  );
};

export default StepthroughStack;
