'use client';

import React, { useState } from 'react';

import { queueCodeTemplate } from '@/data';
import useRealtimeQueue from '@/hooks/realtime/useQueue';

import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import QueueRealtime from '@/components/playground/realtime/visualization/Queue';

const QueueRealtimePage: React.FC = () => {
  const [code, setCode] = useState(queueCodeTemplate);

  const { data, isExecuting, error, securityStatus } = useRealtimeQueue(code);

  return (
    <RealtimeLayout
      dataStructure="queue"
      code={code}
      onCodeChange={setCode}
      onReset={() => setCode(queueCodeTemplate)}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={QueueRealtime}
    />
  );
};

export default QueueRealtimePage;
