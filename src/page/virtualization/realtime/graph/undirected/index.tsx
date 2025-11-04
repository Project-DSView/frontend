'use client';

import React, { useState } from 'react';

import { useRealtimeUndirectedGraph } from '@/hooks';
import { undirectedGraphCodeTemplate } from '@/data';

import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import UndirectedGraphRealtimeVisualization from '@/components/playground/realtime/visualization/UndirectedGraph';

const Page = () => {
  const [code, setCode] = useState(undirectedGraphCodeTemplate);
  const { data, isExecuting, error, securityStatus } = useRealtimeUndirectedGraph(code);

  return (
    <RealtimeLayout
      dataStructure="undirected-graph"
      code={code}
      onCodeChange={setCode}
      onReset={() => setCode(undirectedGraphCodeTemplate)}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={UndirectedGraphRealtimeVisualization}
    />
  );
};

export default Page;
