'use client';

import React, { lazy } from 'react';

import { useStepthroughDirectedGraph } from '@/hooks';
import { DirectedGraphData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const DirectedGraphStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/DirectedGraph'),
);

const StepthroughDirectedGraph: React.FC = () => {
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
    graphData,
    handleInputSubmit,
    handleInputCancel,
  } = useStepthroughDirectedGraph();

  return (
    <StepthroughLayout<DirectedGraphData>
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
      data={{ nodes: graphData.nodes, edges: graphData.edges } as DirectedGraphData}
      title="Stepthrough Directed Graph"
      description="เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization ของ Directed Graph"
      visualizationComponent={DirectedGraphStepthroughVisualization}
      error={state.error}
      inputState={state.inputState}
      onInputSubmit={handleInputSubmit}
      onInputCancel={handleInputCancel}
    />
  );
};

export default StepthroughDirectedGraph;
