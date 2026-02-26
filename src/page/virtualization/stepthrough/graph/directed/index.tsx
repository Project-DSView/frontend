'use client';

import React, { lazy } from 'react';

import { useStepthroughDirectedGraph } from '@/hooks';
import { DirectedGraphData } from '@/types';

import StepthroughLayout from '@/components/playground/stepthrough/layout/StepthroughLayout';
// Lazy load heavy components
const DirectedGraphStepthroughVisualization = lazy(
  () => import('@/components/playground/stepthrough/visualization/DirectedGraph'),
);

// Wrapper component to pass animation props
const DirectedGraphVisualizationWrapper = React.forwardRef<
  HTMLDivElement,
  {
    steps: unknown[];
    currentStepIndex: number;
    data: DirectedGraphData;
    isRunning?: boolean;
    error?: string | null;
    insertedVertex?: string | null;
    insertedEdge?: string | null;
    currentVertex?: string | null;
  }
>((props, ref) => (
  <DirectedGraphStepthroughVisualization
    ref={ref}
    steps={props.steps as never}
    currentStepIndex={props.currentStepIndex}
    data={props.data}
    isRunning={props.isRunning ?? false}
    error={props.error}
    insertedVertex={props.insertedVertex}
    insertedEdge={props.insertedEdge}
    currentVertex={props.currentVertex}
  />
));
DirectedGraphVisualizationWrapper.displayName = 'DirectedGraphVisualizationWrapper';

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
    // [NEW] Animation state from hook
    insertedVertex,
    insertedEdge,
    currentVertex,
  } = useStepthroughDirectedGraph();

  // Create wrapped visualization component with animation props
  const VisualizationWithAnimation = React.useMemo(() => {
    const Component = React.forwardRef<
      HTMLDivElement,
      {
        steps: unknown[];
        currentStepIndex: number;
        data: DirectedGraphData;
        isRunning?: boolean;
        error?: string | null;
        complexity?: unknown;
        code?: string;
      }
    >((props, ref) => (
      <DirectedGraphStepthroughVisualization
        ref={ref}
        steps={props.steps as never}
        currentStepIndex={props.currentStepIndex}
        data={props.data}
        isRunning={props.isRunning ?? false}
        error={props.error}
        insertedVertex={insertedVertex}
        insertedEdge={insertedEdge}
        currentVertex={currentVertex}
        complexity={props.complexity as never}
        code={props.code}
      />
    ));
    Component.displayName = 'VisualizationWithAnimation';
    return Component;
  }, [insertedVertex, insertedEdge, currentVertex]);

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
      visualizationComponent={VisualizationWithAnimation}
      error={state.error}
      inputState={state.inputState}
      onInputSubmit={handleInputSubmit}
      onInputCancel={handleInputCancel}
      complexity={state.complexity}
    />
  );
};

export default StepthroughDirectedGraph;
