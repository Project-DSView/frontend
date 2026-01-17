import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FunctionComplexityTable from './FunctionComplexityTable';
import { PerFunctionComplexityProps } from '@/types';

const PerFunctionComplexity: React.FC<PerFunctionComplexityProps> = ({ functionComplexities }) => {
  if (functionComplexities.length === 0) return null;

  const maxRank = Math.max(...functionComplexities.map((f) => f.timeComplexityRank));

  const getBarColor = (rank: number) => {
    if (rank <= 1) return 'bg-emerald-500';
    if (rank <= 2) return 'bg-teal-500';
    if (rank <= 3) return 'bg-blue-500';
    if (rank <= 4) return 'bg-amber-500';
    if (rank <= 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-secondary/20 bg-secondary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-secondary text-sm">Big O แยกตาม Function</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          {[...functionComplexities]
            .sort((a, b) => b.timeComplexityRank - a.timeComplexityRank)
            .map((func) => {
              const widthPercent = maxRank > 0 ? (func.timeComplexityRank / maxRank) * 100 : 50;
              return (
                <div
                  key={`${func.functionName}-${func.lineStart}`}
                  className="flex items-center gap-2"
                >
                  <div className="text-foreground w-24 truncate text-xs font-medium">
                    {func.functionName}()
                  </div>
                  <div className="bg-muted relative h-5 flex-1 overflow-hidden rounded-full">
                    <div
                      className={`h-full ${getBarColor(func.timeComplexityRank)} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(widthPercent, 15)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                      {func.timeComplexity}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <FunctionComplexityTable data={functionComplexities} />
      </CardContent>
    </Card>
  );
};

export default PerFunctionComplexity;
