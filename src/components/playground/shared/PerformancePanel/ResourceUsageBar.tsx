import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatMemory, formatPerformanceTime, MEMORY_LIMIT_BYTES } from '@/lib';
import { MemoryUsageBarProps, TimeUsageBarProps } from '@/types';

export const MemoryUsageBar: React.FC<MemoryUsageBarProps> = ({ memoryUsage }) => {
  const memoryPercentage = Math.min((memoryUsage / MEMORY_LIMIT_BYTES) * 100, 100);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Memory Limit</span>
          <span className="font-medium">
            {formatMemory(memoryUsage)} / {formatMemory(MEMORY_LIMIT_BYTES)}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              memoryPercentage > 80
                ? 'bg-red-500'
                : memoryPercentage > 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{
              width: `${Math.max(
                memoryPercentage < 1
                  ? memoryPercentage * 25
                  : memoryPercentage < 25
                    ? 25 + ((memoryPercentage - 1) / 24) * 15
                    : memoryPercentage < 50
                      ? 40 + ((memoryPercentage - 25) / 25) * 20
                      : memoryPercentage < 75
                        ? 60 + ((memoryPercentage - 50) / 25) * 20
                        : 80 + ((Math.min(memoryPercentage, 100) - 75) / 25) * 20,
                3,
              )}%`,
            }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          {memoryPercentage < 1
            ? 'ใช้ memory น้อยมาก - เยี่ยม!'
            : memoryPercentage < 25
              ? 'ใช้ memory น้อย - ดีมาก!'
              : memoryPercentage < 50
                ? 'ใช้ memory ปานกลาง'
                : memoryPercentage < 75
                  ? 'ใช้ memory ค่อนข้างมาก'
                  : 'ใช้ memory มาก - ควรปรับปรุง'}
        </p>
      </CardContent>
    </Card>
  );
};

export const TimeUsageBar: React.FC<TimeUsageBarProps> = ({ totalExecutionTime }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Time Limit (5s)</span>
          <span className="font-medium">{formatPerformanceTime(totalExecutionTime)}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totalExecutionTime > 3
                ? 'bg-red-500'
                : totalExecutionTime > 1
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{
              width: `${Math.max(
                totalExecutionTime < 0.1
                  ? (totalExecutionTime / 0.1) * 25
                  : totalExecutionTime < 1
                    ? 25 + ((totalExecutionTime - 0.1) / 0.9) * 35
                    : 60 + ((Math.min(totalExecutionTime, 5) - 1) / 4) * 40,
                3,
              )}%`,
            }}
          />
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          {totalExecutionTime < 0.1
            ? 'เร็วมาก - เยี่ยม!'
            : totalExecutionTime < 1
              ? 'เร็วดี - ดีมาก!'
              : totalExecutionTime < 3
                ? 'ใช้เวลาปานกลาง'
                : totalExecutionTime < 5
                  ? 'ใช้เวลาค่อนข้างนาน'
                  : 'ใช้เวลานานมาก - ควรปรับปรุง'}
        </p>
      </CardContent>
    </Card>
  );
};
