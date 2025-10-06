'use client';

import { useState } from 'react';
import RealtimeLayout from '@/components/playground/realtime/layout/RealtimeLayout';
import BSTRealtime from '@/components/playground/realtime/visualization/BST';
import useRealtimeBST from '@/hooks/realtime/useBST';
import { bstCodeTemplate } from '@/data/template/code.data';

const BSTRealtimePage = () => {
  const [code, setCode] = useState(bstCodeTemplate);
  const { data, isExecuting, error, securityStatus } = useRealtimeBST(code);

  return (
    <RealtimeLayout
      dataStructure="bst"
      code={code}
      onCodeChange={setCode}
      data={data}
      isExecuting={isExecuting}
      error={error}
      securityStatus={securityStatus}
      visualizationComponent={BSTRealtime}
    />
  );
};

export default BSTRealtimePage;
