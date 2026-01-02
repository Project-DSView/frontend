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
    // [NEW] Animation state from hook
    insertedVertex,
    insertedEdge,
    currentVertex,
  } = useStepthroughUndirectedGraph();

  // Create wrapped visualization component with animation props
  const VisualizationWithAnimation = React.useMemo(() => {
    const Component = React.forwardRef<
      HTMLDivElement,
      {
        steps: unknown[];
        currentStepIndex: number;
        data: UndirectedGraphData;
        isRunning?: boolean;
        error?: string | null;
      }
    >((props, ref) => (
      <UndirectedGraphStepthroughVisualization
        ref={ref}
        steps={props.steps as never}
        currentStepIndex={props.currentStepIndex}
        data={props.data}
        isRunning={props.isRunning ?? false}
        error={props.error}
        insertedVertex={insertedVertex}
        insertedEdge={insertedEdge}
        currentVertex={currentVertex}
      />
    ));
    Component.displayName = 'UndirectedGraphVisualizationWithAnimation';
    return Component;
  }, [insertedVertex, insertedEdge, currentVertex]);

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
      visualizationComponent={VisualizationWithAnimation}
      error={state.error}
      inputState={state.inputState}
      onInputSubmit={handleInputSubmit}
      onInputCancel={handleInputCancel}
    />
  );
};

export default StepthroughUndirectedGraph;
