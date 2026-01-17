import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatMemory, formatPerformanceTime } from '@/lib';
import { PerformanceMetricsCardsProps } from '@/types';

const PerformanceMetricsCards: React.FC<PerformanceMetricsCardsProps> = ({
  memoryUsage,
  maxMemoryUsed,
  totalExecutionTime,
  stepCount,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <p className="text-primary/80 text-[10px] sm:text-xs">Current Memory</p>
          <p className="text-primary text-sm font-bold sm:text-lg">{formatMemory(memoryUsage)}</p>
        </CardContent>
      </Card>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <p className="text-primary/80 text-[10px] sm:text-xs">Peak Memory</p>
          <p className="text-primary text-sm font-bold sm:text-lg">{formatMemory(maxMemoryUsed)}</p>
        </CardContent>
      </Card>
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-3">
          <p className="text-secondary/80 text-[10px] sm:text-xs">Total Time</p>
          <p className="text-secondary text-sm font-bold sm:text-lg">
            {formatPerformanceTime(totalExecutionTime)}
          </p>
          <p className="text-secondary/70 hidden text-xs sm:block">
            {totalExecutionTime < 0.01
              ? 'เร็วมาก!'
              : totalExecutionTime < 0.1
                ? 'เร็วดี'
                : totalExecutionTime < 1
                  ? 'ปานกลาง'
                  : totalExecutionTime < 5
                    ? 'ค่อนข้างช้า'
                    : 'ช้ามาก'}
          </p>
        </CardContent>
      </Card>
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-3">
          <p className="text-secondary/80 text-[10px] sm:text-xs">Avg Time/Step</p>
          <p className="text-secondary text-sm font-bold sm:text-lg">
            {formatPerformanceTime(stepCount > 0 ? totalExecutionTime / stepCount : 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetricsCards;
