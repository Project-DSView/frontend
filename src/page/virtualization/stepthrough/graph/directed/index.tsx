'use client';

import React, { lazy } from 'react';
import { useDirectedGraphStepthrough } from '@/hooks';
import StepthroughLayout from '@/components/virtualization/shared/StepthroughLayout';
import { DirectedGraphData } from '@/types';

// Lazy load heavy components
const DirectedGraphStepthroughVisualization = lazy(
  () => import('@/components/virtualization/stepthrough/graph/directed/DirectedGraphVisualization'),
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
  } = useDirectedGraphStepthrough();

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
    />
  );
};

export default StepthroughDirectedGraph;
