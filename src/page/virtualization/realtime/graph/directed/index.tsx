'use client';

import React, { useState } from 'react';
import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import DirectedGraphRealtimeVisualization from '@/components/playground/realtime/visualization/DirectedGraph';
import useRealtimeDirectedGraph from '@/hooks/realtime/useDirectedGraph';
import { directedGraphCodeTemplate } from '@/data';

const Page = () => {
  const [code, setCode] = useState(directedGraphCodeTemplate);
  const { data, isExecuting, error, securityStatus } = useRealtimeDirectedGraph(code);

  return (
    <RealtimeLayout
      dataStructure="directed-graph"
      code={code}
      onCodeChange={setCode}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={DirectedGraphRealtimeVisualization}
    />
  );
};

export default Page;
