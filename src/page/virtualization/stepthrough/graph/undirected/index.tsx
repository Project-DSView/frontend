'use client';

import React, { lazy } from 'react';
import { useUndirectedGraphStepthrough } from '@/hooks';
import StepthroughLayout from '@/components/virtualization/shared/StepthroughLayout';
import { UndirectedGraphData } from '@/types';

// Lazy load heavy components
const UndirectedGraphStepthroughVisualization = lazy(
  () =>
    import('@/components/virtualization/stepthrough/graph/undirected/UndirectedGraphVisualization'),
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
  } = useUndirectedGraphStepthrough();

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
    />
  );
};

export default StepthroughUndirectedGraph;
