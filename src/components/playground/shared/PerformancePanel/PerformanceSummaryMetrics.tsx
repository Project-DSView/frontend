import React from 'react';
import { PerformanceSummaryMetricsProps } from '@/types';
import { formatMemory, formatPerformanceTime } from '@/lib';

const PerformanceSummaryMetrics: React.FC<PerformanceSummaryMetricsProps> = ({
  memoryUsage,
  totalExecutionTime,
  complexity,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {/* Memory - Primary (Blue) */}
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8">
          <svg
            className="text-primary h-3.5 w-3.5 sm:h-4 sm:w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <div>
          <p className="text-primary/80 text-[10px] sm:text-xs">Memory</p>
          <p className="text-primary text-xs font-bold sm:text-sm">{formatMemory(memoryUsage)}</p>
        </div>
      </div>

      <div className="bg-border hidden h-8 w-px sm:block" />

      {/* Time - Secondary (Orange) */}
      <div className="flex items-center gap-2">
        <div className="bg-secondary/10 flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8">
          <svg
            className="text-secondary h-3.5 w-3.5 sm:h-4 sm:w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-secondary/80 text-[10px] sm:text-xs">Time</p>
          <p className="text-secondary text-xs font-bold sm:text-sm">
            {formatPerformanceTime(totalExecutionTime)}
          </p>
        </div>
      </div>

      {/* Big O Summary - hidden on small screens */}
      {complexity && (
        <>
          <div className="bg-border hidden h-8 w-px md:block" />
          <div className="hidden items-center gap-2 md:flex">
            <div>
              <p className="text-muted-foreground text-[10px] sm:text-xs">Time O()</p>
              <p className="text-foreground text-xs font-bold sm:text-sm">
                {complexity.timeComplexity}
              </p>
            </div>
          </div>
          <div className="bg-border hidden h-8 w-px md:block" />
          <div className="hidden items-center gap-2 md:flex">
            <div>
              <p className="text-muted-foreground text-[10px] sm:text-xs">Space O()</p>
              <p className="text-foreground text-xs font-bold sm:text-sm">
                {complexity.spaceComplexity}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceSummaryMetrics;
