'use client';

import React, { lazy, useState } from 'react';

import { singlyLinkedListCodeTemplate } from '@/data';
import { useRealtimeSinglyLinkedList } from '@/hooks';

import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';

// Lazy load heavy components
const SinglyLinkedListRealtimeVisualization = lazy(
  () => import('@/components/playground/realtime/visualization/SinglyLinkedList'),
);

const RealtimeSinglyLinkedList: React.FC = () => {
  const [code, setCode] = useState(singlyLinkedListCodeTemplate);
  const { data, isExecuting, error, securityStatus } = useRealtimeSinglyLinkedList(code);

  return (
    <RealtimeLayout
      dataStructure="singly-linked-list"
      code={code}
      onCodeChange={setCode}
      onReset={() => setCode(singlyLinkedListCodeTemplate)}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={SinglyLinkedListRealtimeVisualization}
    />
  );
};

export default RealtimeSinglyLinkedList;
