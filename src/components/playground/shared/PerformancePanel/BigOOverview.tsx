import React from 'react';
import { BigOOverviewProps } from '@/types';
import BigOSummaryCards from './BigOSummaryCards';
import BigOExplanation from './BigOExplanation';

const BigOOverview: React.FC<BigOOverviewProps> = ({
  complexity,
  onAIExplain,
  isExplaining = false,
  aiExplanation,
  isAuthenticated = false,
  onLogin,
}) => {
  return (
    <>
      {/* Summary Cards */}
      <BigOSummaryCards complexity={complexity} />

      {/* Explanations */}
      <BigOExplanation
        complexity={complexity}
        onAIExplain={onAIExplain}
        isExplaining={isExplaining}
        aiExplanation={aiExplanation}
        isAuthenticated={isAuthenticated}
        onLogin={onLogin}
      />
    </>
  );
};

export default BigOOverview;
