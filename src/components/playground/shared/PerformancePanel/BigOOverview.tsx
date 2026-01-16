import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BigOOverviewProps } from '@/types';
import { getTimeLevel, getSpaceLevel } from '@/lib';

const BigOOverview: React.FC<BigOOverviewProps> = ({ complexity }) => {
  const timeLevel = getTimeLevel(complexity.timeComplexity);
  const spaceLevel = getSpaceLevel(complexity.spaceComplexity);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <p className="text-secondary text-xs">Time Complexity</p>
            <p className="text-secondary text-2xl font-bold">{complexity.timeComplexity}</p>
            <p className={`text-sm font-medium ${timeLevel.color}`}>{timeLevel.label}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-primary text-xs">Space Complexity</p>
            <p className="text-primary text-2xl font-bold">{complexity.spaceComplexity}</p>
            <p className={`text-sm font-medium ${spaceLevel.color}`}>{spaceLevel.label}</p>
          </CardContent>
        </Card>
      </div>

      {/* Explanations */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">คำอธิบาย</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-secondary font-medium">Time:</p>
            <p className="text-muted-foreground">{complexity.timeExplanation}</p>
          </div>
          <div>
            <p className="text-primary font-medium">Space:</p>
            <p className="text-muted-foreground">{complexity.spaceExplanation}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BigOOverview;
