'use client';

import React, { lazy } from 'react';
import { useStepthroughUndirectedGraph } from '@/hooks';
import { UndirectedGraphData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const UndirectedGraphStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/UndirectedGraph'),
);

const StepthroughUndirectedGraph: React.FC = () => {
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
  } = useStepthroughUndirectedGraph();

  return (
    <StepthroughLayout<UndirectedGraphData>
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
      data={{ nodes: graphData.nodes, edges: graphData.edges } as UndirectedGraphData}
      title="Stepthrough Undirected Graph"
      description="เขียนโค้ด Python และดูการทำงานแบบ step-by-step พร้อม visualization ของ Undirected Graph"
      visualizationComponent={UndirectedGraphStepthroughVisualization}
      error={state.error}
      inputState={state.inputState}
      onInputSubmit={handleInputSubmit}
      onInputCancel={handleInputCancel}
    />
  );
};

export default StepthroughUndirectedGraph;
