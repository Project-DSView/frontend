import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PerformanceChartProps } from '@/types';
import { formatMemory, formatPerformanceTime } from '@/lib';

const PerformanceChart: React.FC<PerformanceChartProps> = ({ steps, currentStepIndex }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  if (steps.length <= 1) return null;

  const chartData = steps.map((step, index) => ({
    index,
    memory: (step?.state?.memory as number) || 0,
    time: (step?.state?.execution_time as number) || 0,
  }));

  const maxMem = Math.max(...chartData.map((d) => d.memory), 1);
  const maxTime = Math.max(...chartData.map((d) => d.time), 0.001);

  const chartWidth = 500;
  const chartHeight = 140;
  const padding = { top: 20, right: 10, bottom: 25, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / (chartData.length - 1)) * innerWidth;
  const yScaleMem = (v: number) => padding.top + innerHeight - (v / maxMem) * innerHeight;
  const yScaleTime = (v: number) => padding.top + innerHeight - (v / maxTime) * innerHeight;

  const memAreaPath =
    `M ${xScale(0)} ${chartHeight - padding.bottom} ` +
    chartData.map((d, i) => `L ${xScale(i)} ${yScaleMem(d.memory)}`).join(' ') +
    ` L ${xScale(chartData.length - 1)} ${chartHeight - padding.bottom} Z`;

  const memLinePath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleMem(d.memory)}`)
    .join(' ');

  const timeLinePath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleTime(d.time)}`)
    .join(' ');

  const gridLines = [0.25, 0.5, 0.75].map((ratio) => ({
    y: padding.top + innerHeight * (1 - ratio),
  }));

  const activeStepIdx = hoveredStep !== null ? hoveredStep : currentStepIndex;
  const activeData = chartData[activeStepIdx] || chartData[0];

  return (
    <Card className="border-border bg-card" onMouseLeave={() => setHoveredStep(null)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Graph</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="bg-primary/60 h-2 w-4 rounded"></div>
              <span className="text-primary text-[10px]">Memory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-secondary h-0.5 w-4 rounded"></div>
              <span className="text-secondary text-[10px]">Time</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="bg-muted/50 mb-2 flex items-center justify-center gap-4 rounded-md px-3 py-1.5 text-xs">
          <span className="text-muted-foreground font-semibold">Step {activeStepIdx + 1}</span>
          <span className="text-primary">
            Memory: <span className="font-medium">{formatMemory(activeData.memory)}</span>
          </span>
          <span className="text-secondary">
            Time: <span className="font-medium">{formatPerformanceTime(activeData.time)}</span>
          </span>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ maxHeight: '140px' }}
        >
          {gridLines.map((line, idx) => (
            <line
              key={idx}
              x1={padding.left}
              y1={line.y}
              x2={chartWidth - padding.right}
              y2={line.y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
          ))}
          {/* Memory Gradient */}
          <path d={memAreaPath} fill="url(#memoryGradientPerf)" opacity={0.6} />
          <path
            d={memLinePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d={timeLinePath}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />
          {activeStepIdx < chartData.length && (
            <>
              <line
                x1={xScale(activeStepIdx)}
                y1={padding.top}
                x2={xScale(activeStepIdx)}
                y2={chartHeight - padding.bottom}
                stroke={hoveredStep !== null ? 'var(--color-primary)' : 'var(--color-secondary)'}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
              <circle
                cx={xScale(activeStepIdx)}
                cy={yScaleMem(chartData[activeStepIdx].memory)}
                r={hoveredStep !== null ? 6 : 4}
                fill="var(--color-primary)"
                stroke="white"
                strokeWidth={2}
              />
              <circle
                cx={xScale(activeStepIdx)}
                cy={yScaleTime(chartData[activeStepIdx].time)}
                r={hoveredStep !== null ? 6 : 4}
                fill="var(--color-secondary)"
                stroke="white"
                strokeWidth={2}
              />
            </>
          )}
          {chartData.map((_, i) => {
            const stepWidth = innerWidth / (chartData.length - 1 || 1);
            const x =
              i === 0
                ? padding.left
                : i === chartData.length - 1
                  ? xScale(i) - stepWidth / 2
                  : xScale(i) - stepWidth / 2;
            const width = i === 0 || i === chartData.length - 1 ? stepWidth / 2 + 5 : stepWidth;
            return (
              <rect
                key={i}
                x={x}
                y={padding.top}
                width={width}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredStep(i)}
              />
            );
          })}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          <text x={padding.left} y={chartHeight - 8} fontSize="9" fill="currentColor" opacity={0.5}>
            Step 1
          </text>
          <text
            x={chartWidth - padding.right}
            y={chartHeight - 8}
            fontSize="9"
            fill="currentColor"
            opacity={0.5}
            textAnchor="end"
          >
            Step {chartData.length}
          </text>
          <defs>
            <linearGradient id="memoryGradientPerf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-muted-foreground mt-2 flex justify-between text-[10px]">
          <span>Peak: {formatMemory(maxMem)}</span>
          <span>Max Time/Step: {formatPerformanceTime(maxTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
