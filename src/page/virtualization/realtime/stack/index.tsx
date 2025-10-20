'use client';

import React, { useState } from 'react';

import { stackCodeTemplate } from '@/data';
import useRealtimeStack from '@/hooks/realtime/useStack';

import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import StackRealtime from '@/components/playground/realtime/visualization/Stack';

const StackRealtimePage: React.FC = () => {
  const [code, setCode] = useState(stackCodeTemplate);

  const { data, isExecuting, error, securityStatus } = useRealtimeStack(code);

  return (
    <RealtimeLayout
      dataStructure="stack"
      code={code}
      onCodeChange={setCode}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={StackRealtime}
    />
  );
};

export default StackRealtimePage;
