'use client';

import React, { useState } from 'react';
import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import UndirectedGraphRealtimeVisualization from '@/components/playground/realtime/visualization/UndirectedGraph';
import useRealtimeUndirectedGraph from '@/hooks/realtime/useUndirectedGraph';
import { undirectedGraphCodeTemplate } from '@/data';

const Page = () => {
  const [code, setCode] = useState(undirectedGraphCodeTemplate);
  const { data, isExecuting, error, securityStatus } = useRealtimeUndirectedGraph(code);

  return (
    <RealtimeLayout
      dataStructure="undirected-graph"
      code={code}
      onCodeChange={setCode}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={UndirectedGraphRealtimeVisualization}
    />
  );
};

export default Page;
