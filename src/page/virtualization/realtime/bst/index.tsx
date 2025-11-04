'use client';

import { useState } from 'react';

import { useRealtimeBST } from '@/hooks';
import { bstCodeTemplate } from '@/data';

import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import BSTRealtime from '@/components/playground/realtime/visualization/BST';

const BSTRealtimePage = () => {
  const [code, setCode] = useState(bstCodeTemplate);
  const { data, isExecuting, error, securityStatus } = useRealtimeBST(code);

  return (
    <RealtimeLayout
      dataStructure="bst"
      code={code}
      onCodeChange={setCode}
      onReset={() => setCode(bstCodeTemplate)}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={BSTRealtime}
    />
  );
};

export default BSTRealtimePage;
