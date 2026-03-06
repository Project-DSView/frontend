import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ComplexityAnalysis } from '@/types';

interface BigOSummaryCardsProps {
  complexity: ComplexityAnalysis;
}

const BigOSummaryCards: React.FC<BigOSummaryCardsProps> = ({ complexity }) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-4">
          <p className="text-secondary text-xs">Operations Complexity (Time)</p>
          <p className="text-secondary text-2xl font-bold">{complexity.timeComplexity}</p>
        </CardContent>
      </Card>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-primary text-xs">Space Complexity (Element)</p>
          <p className="text-primary text-2xl font-bold">{complexity.spaceComplexity}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BigOSummaryCards;
