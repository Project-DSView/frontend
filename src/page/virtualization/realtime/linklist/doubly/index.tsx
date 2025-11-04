'use client';

import React, { useState } from 'react';

import { doublyLinkedListCodeTemplate } from '@/data';
import { useRealtimeDoublyLinkedList } from '@/hooks';

import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import DoublyLinkedListRealtime from '@/components/playground/realtime/visualization/DoublyLinkedList';

const DoublyLinkedListRealtimePage: React.FC = () => {
  const [code, setCode] = useState(doublyLinkedListCodeTemplate);

  const { data, isExecuting, error, securityStatus } = useRealtimeDoublyLinkedList(code);

  return (
    <RealtimeLayout
      dataStructure="doubly-linked-list"
      code={code}
      onCodeChange={setCode}
      onReset={() => setCode(doublyLinkedListCodeTemplate)}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={DoublyLinkedListRealtime}
    />
  );
};

export default DoublyLinkedListRealtimePage;
