'use client';

import React, { useState, useMemo } from 'react';
import { MemoryUsagePanelProps } from '@/types';

// Memory limit for comparison (256 MB default, matching backend)
const MEMORY_LIMIT_BYTES = 256 * 1024 * 1024;

// Threshold for significant memory change (1KB)
const SIGNIFICANT_MEMORY_THRESHOLD = 1024;

// Threshold for significant time (0.001s = 1ms)
const SIGNIFICANT_TIME_THRESHOLD = 0.001;

const MemoryUsagePanel: React.FC<MemoryUsagePanelProps> = ({ steps, currentStepIndex }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [activeTab, setActiveTab] = useState<'memory' | 'time'>('memory');
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const currentStep =
    steps.length > 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  // Get memory usage from current step
  const memoryUsage: number = (currentStep?.state?.memory as number) || 0;

  // Calculate max memory across all steps
  const maxMemoryUsed = steps.reduce((max, step) => {
    const mem = (step?.state?.memory as number) || 0;
    return mem > max ? mem : max;
  }, 0);

  // Calculate total execution time
  const totalExecutionTime = steps.reduce((total, step) => {
    const time = (step?.state?.execution_time as number) || 0;
    return total + time;
  }, 0);

  // Format memory for display
  const formatMemory = (bytes: number): string => {
    const absBytes = Math.abs(bytes);
    const sign = bytes < 0 ? '-' : '';
    if (absBytes === 0) return '0 Bytes';
    if (absBytes < 1024) return `${sign}${absBytes} Bytes`;
    if (absBytes < 1024 * 1024) return `${sign}${(absBytes / 1024).toFixed(1)} KB`;
    return `${sign}${(absBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0 ms';
    if (seconds < 1) return `${(seconds * 1000).toFixed(3)} ms`;
    return `${seconds.toFixed(3)} s`;
  };

  // Truncate code for display
  const truncateCode = (code: string, maxLen: number = 35): string => {
    if (!code) return '';
    const trimmed = code.trim();
    if (trimmed.length <= maxLen) return trimmed;
    return trimmed.substring(0, maxLen) + '...';
  };

  // Memory Hotspots - top 5 steps with highest memory increase
  const memoryHotspots = useMemo(() => {
    return steps
      .map((step, index) => ({
        step,
        index,
        delta: (step?.state?.memory_delta as number) || 0,
        memory: (step?.state?.memory as number) || 0,
        time: (step?.state?.execution_time as number) || 0,
        line: step?.line || 0,
        code: step?.code || '',
      }))
      .filter((item) => item.delta > SIGNIFICANT_MEMORY_THRESHOLD)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);
  }, [steps]);

  // Time Hotspots - top 5 slowest steps
  const timeHotspots = useMemo(() => {
    return steps
      .map((step, index) => ({
        step,
        index,
        delta: (step?.state?.memory_delta as number) || 0,
        memory: (step?.state?.memory as number) || 0,
        time: (step?.state?.execution_time as number) || 0,
        line: step?.line || 0,
        code: step?.code || '',
      }))
      .filter((item) => item.time > SIGNIFICANT_TIME_THRESHOLD)
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
  }, [steps]);

  // Filtered steps for timeline view
  const filteredSteps = useMemo(() => {
    const mapped = steps.map((step, index) => ({
      step,
      index,
      delta: (step?.state?.memory_delta as number) || 0,
      memory: (step?.state?.memory as number) || 0,
      time: (step?.state?.execution_time as number) || 0,
      line: step?.line || 0,
      code: step?.code || '',
    }));

    if (showAllSteps) return mapped;

    // Filter based on active tab
    if (activeTab === 'memory') {
      return mapped.filter((item) => Math.abs(item.delta) > SIGNIFICANT_MEMORY_THRESHOLD);
    } else {
      return mapped.filter((item) => item.time > SIGNIFICANT_TIME_THRESHOLD);
    }
  }, [steps, showAllSteps, activeTab]);

  // Calculate percentage for progress bar
  const memoryPercentage = Math.min((memoryUsage / MEMORY_LIMIT_BYTES) * 100, 100);

  if (steps.length === 0) {
    return null;
  }

  return (
    <>
      {/* Performance Panel - Combined Memory & Time */}
      <div className="overflow-hidden rounded-lg bg-gradient-to-r from-purple-50 via-indigo-50 to-cyan-50 shadow-md dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Memory */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-800">
                  <svg
                    className="h-4 w-4 text-purple-600 dark:text-purple-300"
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
                  <p className="text-xs text-purple-600 dark:text-purple-400">Memory</p>
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                    {formatMemory(memoryUsage)}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

              {/* Time */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-800">
                  <svg
                    className="h-4 w-4 text-cyan-600 dark:text-cyan-300"
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
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">Time</p>
                  <p className="text-sm font-bold text-cyan-900 dark:text-cyan-100">
                    {formatTime(totalExecutionTime)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(true)}
              className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-700 hover:to-cyan-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Performance Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Performance Analysis
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Summary Cards - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/30">
                  <p className="text-xs text-purple-600 dark:text-purple-400">Current Memory</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {formatMemory(memoryUsage)}
                  </p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/30">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Peak Memory</p>
                  <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                    {formatMemory(maxMemoryUsed)}
                  </p>
                </div>
                <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-900/30">
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">Total Time</p>
                  <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">
                    {formatTime(totalExecutionTime)}
                  </p>
                  <p className="text-xs text-cyan-500 dark:text-cyan-400">
                    {totalExecutionTime < 0.01
                      ? 'เร็วมาก!'
                      : totalExecutionTime < 0.1
                        ? 'เร็วดี'
                        : totalExecutionTime < 1
                          ? 'ปานกลาง'
                          : totalExecutionTime < 5
                            ? 'ค่อนข้างช้า'
                            : 'ช้ามาก - ควรปรับปรุง'}
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-900/30">
                  <p className="text-xs text-teal-600 dark:text-teal-400">Avg Time/Step</p>
                  <p className="text-lg font-bold text-teal-900 dark:text-teal-100">
                    {formatTime(steps.length > 0 ? totalExecutionTime / steps.length : 0)}
                  </p>
                </div>
              </div>

              {/* Performance Chart */}
              {steps.length > 1 && (() => {
                const chartData = steps.map((step, index) => ({
                  index,
                  memory: (step?.state?.memory as number) || 0,
                  time: (step?.state?.execution_time as number) || 0,
                }));
                
                const maxMem = Math.max(...chartData.map(d => d.memory), 1);
                const maxTime = Math.max(...chartData.map(d => d.time), 0.001);
                
                const chartWidth = 380;
                const chartHeight = 140;
                const padding = { top: 20, right: 10, bottom: 25, left: 10 };
                const innerWidth = chartWidth - padding.left - padding.right;
                const innerHeight = chartHeight - padding.top - padding.bottom;
                
                const xScale = (i: number) => padding.left + (i / (chartData.length - 1)) * innerWidth;
                const yScaleMem = (v: number) => padding.top + innerHeight - (v / maxMem) * innerHeight;
                const yScaleTime = (v: number) => padding.top + innerHeight - (v / maxTime) * innerHeight;
                
                // Create path for memory area
                const memAreaPath = `M ${xScale(0)} ${chartHeight - padding.bottom} ` +
                  chartData.map((d, i) => `L ${xScale(i)} ${yScaleMem(d.memory)}`).join(' ') +
                  ` L ${xScale(chartData.length - 1)} ${chartHeight - padding.bottom} Z`;
                
                // Create path for memory line
                const memLinePath = chartData.map((d, i) => 
                  `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleMem(d.memory)}`
                ).join(' ');
                
                // Create path for time line
                const timeLinePath = chartData.map((d, i) => 
                  `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleTime(d.time)}`
                ).join(' ');
                
                // Grid lines Y
                const gridLines = [0.25, 0.5, 0.75].map(ratio => ({
                  y: padding.top + innerHeight * (1 - ratio),
                }));

                // Active step (hovered or current)
                const activeStepIdx = hoveredStep !== null ? hoveredStep : currentStepIndex;
                const activeData = chartData[activeStepIdx] || chartData[0];

                return (
                  <div 
                    className="rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 p-4 dark:from-slate-900/30 dark:to-gray-900/30"
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Performance Graph
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-4 rounded bg-purple-500/60"></div>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400">Memory</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-0.5 w-4 rounded bg-cyan-500"></div>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400">Time</span>
                        </div>
                      </div>
                    </div>

                    {/* Tooltip */}
                    <div className="mb-2 flex items-center justify-center gap-4 rounded-md bg-white/80 px-3 py-1.5 text-xs dark:bg-gray-800/80">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        Step {activeStepIdx + 1}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">
                        Memory: <span className="font-medium">{formatMemory(activeData.memory)}</span>
                      </span>
                      <span className="text-cyan-600 dark:text-cyan-400">
                        Time: <span className="font-medium">{formatTime(activeData.time)}</span>
                      </span>
                    </div>

                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="w-full"
                      style={{ maxHeight: '140px' }}
                    >
                      {/* Grid lines */}
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
                      
                      {/* Memory area fill */}
                      <path
                        d={memAreaPath}
                        fill="url(#memoryGradient)"
                        opacity={0.6}
                      />
                      
                      {/* Memory line */}
                      <path
                        d={memLinePath}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                      
                      {/* Time line */}
                      <path
                        d={timeLinePath}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeDasharray="6 3"
                      />
                      
                      {/* Active step indicator (hovered or current) */}
                      {activeStepIdx < chartData.length && (
                        <>
                          <line
                            x1={xScale(activeStepIdx)}
                            y1={padding.top}
                            x2={xScale(activeStepIdx)}
                            y2={chartHeight - padding.bottom}
                            stroke={hoveredStep !== null ? "#3b82f6" : "#f59e0b"}
                            strokeWidth={2}
                            strokeOpacity={0.6}
                          />
                          <circle
                            cx={xScale(activeStepIdx)}
                            cy={yScaleMem(chartData[activeStepIdx].memory)}
                            r={hoveredStep !== null ? 6 : 4}
                            fill="#a855f7"
                            stroke="white"
                            strokeWidth={2}
                            className="transition-all duration-150"
                          />
                          <circle
                            cx={xScale(activeStepIdx)}
                            cy={yScaleTime(chartData[activeStepIdx].time)}
                            r={hoveredStep !== null ? 6 : 4}
                            fill="#06b6d4"
                            stroke="white"
                            strokeWidth={2}
                            className="transition-all duration-150"
                          />
                        </>
                      )}

                      {/* Hover zones - invisible rectangles for each data point */}
                      {chartData.map((d, i) => {
                        const stepWidth = innerWidth / (chartData.length - 1 || 1);
                        const x = i === 0 
                          ? padding.left 
                          : i === chartData.length - 1 
                            ? xScale(i) - stepWidth / 2
                            : xScale(i) - stepWidth / 2;
                        const width = i === 0 || i === chartData.length - 1 
                          ? stepWidth / 2 + 5
                          : stepWidth;
                        
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
                      
                      {/* X axis */}
                      <line
                        x1={padding.left}
                        y1={chartHeight - padding.bottom}
                        x2={chartWidth - padding.right}
                        y2={chartHeight - padding.bottom}
                        stroke="currentColor"
                        strokeOpacity={0.2}
                      />
                      
                      {/* X axis labels */}
                      <text
                        x={padding.left}
                        y={chartHeight - 8}
                        fontSize="9"
                        fill="currentColor"
                        opacity={0.5}
                      >
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
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span>Peak: {formatMemory(maxMem)}</span>
                      <span>Max Time/Step: {formatTime(maxTime)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Tabs for Memory/Time */}
              <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                <button
                  onClick={() => setActiveTab('memory')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    activeTab === 'memory'
                      ? 'bg-white text-purple-700 shadow dark:bg-gray-600 dark:text-purple-300'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Memory Hotspots
                </button>
                <button
                  onClick={() => setActiveTab('time')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    activeTab === 'time'
                      ? 'bg-white text-cyan-700 shadow dark:bg-gray-600 dark:text-cyan-300'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Time Hotspots
                </button>
              </div>

              {/* Hotspots Display */}
              {activeTab === 'memory' ? (
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-900/20 dark:to-red-900/20">
                  <h3 className="mb-3 text-sm font-semibold text-orange-800 dark:text-orange-200">
                    บรรทัดที่กิน Memory มาก
                  </h3>
                  {memoryHotspots.length === 0 ? (
                    <p className="py-4 text-center text-sm text-orange-600 dark:text-orange-400">
                      ไม่มีบรรทัดที่ใช้ memory มากผิดปกติ
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {memoryHotspots.map((item, idx) => (
                        <div key={idx} className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="rounded bg-orange-200 px-2 py-0.5 font-mono text-xs font-medium text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                                L{item.line}
                              </span>
                              <span className="truncate text-xs text-gray-600 dark:text-gray-400">
                                {truncateCode(item.code, 30)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              +{formatMemory(item.delta)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 p-4 dark:from-amber-900/20 dark:to-yellow-900/20">
                  <h3 className="mb-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
                    บรรทัดที่ใช้เวลานาน
                  </h3>
                  {timeHotspots.length === 0 ? (
                    <p className="py-4 text-center text-sm text-amber-600 dark:text-amber-400">
                      ไม่มีบรรทัดที่ใช้เวลานานผิดปกติ
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {timeHotspots.map((item, idx) => (
                        <div key={idx} className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="rounded bg-amber-200 px-2 py-0.5 font-mono text-xs font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                                L{item.line}
                              </span>
                              <span className="truncate text-xs text-gray-600 dark:text-gray-400">
                                {truncateCode(item.code, 30)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                              {formatTime(item.time)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-900/30 dark:to-cyan-900/30">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    Timeline
                  </h3>
                  <label className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <input
                      type="checkbox"
                      checked={showAllSteps}
                      onChange={(e) => setShowAllSteps(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    Show all
                  </label>
                </div>

                {filteredSteps.length === 0 ? (
                  <p className="py-4 text-center text-sm text-blue-600 dark:text-blue-400">
                    ไม่มี steps ที่มีการเปลี่ยนแปลงมาก
                  </p>
                ) : (
                  <div className="max-h-40 space-y-1.5 overflow-y-auto">
                    {filteredSteps.map((item, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-2 text-xs ${
                          item.index === currentStepIndex
                            ? 'bg-blue-200 dark:bg-blue-800'
                            : 'bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              L{item.line}
                            </span>
                            <span className="truncate text-gray-600 dark:text-gray-400">
                              {truncateCode(item.code, 20)}
                            </span>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <span className="text-purple-600 dark:text-purple-400">
                              {formatMemory(item.memory)}
                            </span>
                            <span className="text-cyan-600 dark:text-cyan-400">
                              {formatTime(item.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Memory Usage Bar */}
              <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Memory Limit</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
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
                          ? memoryPercentage * 25 // 0-1% = 0-25% bar
                          : memoryPercentage < 25
                            ? 25 + ((memoryPercentage - 1) / 24) * 15 // 1-25% = 25-40% bar
                            : memoryPercentage < 50
                              ? 40 + ((memoryPercentage - 25) / 25) * 20 // 25-50% = 40-60% bar
                              : memoryPercentage < 75
                                ? 60 + ((memoryPercentage - 50) / 25) * 20 // 50-75% = 60-80% bar
                                : 80 + ((Math.min(memoryPercentage, 100) - 75) / 25) * 20, // 75-100% = 80-100% bar
                        3,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  {memoryPercentage < 1
                    ? 'ใช้ memory น้อยมาก - เยี่ยม!'
                    : memoryPercentage < 25
                      ? 'ใช้ memory น้อย - โค้ดมีประสิทธิภาพ!'
                      : memoryPercentage < 50
                        ? 'ใช้ memory ปานกลาง'
                        : memoryPercentage < 75
                          ? 'ใช้ memory ค่อนข้างมาก'
                          : 'ใช้ memory มาก - ควรปรับปรุง'}
                </p>
              </div>

              {/* Time Usage Bar */}
              <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Time Limit (5s)</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatTime(totalExecutionTime)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalExecutionTime > 1
                        ? 'bg-red-500'
                        : totalExecutionTime > 0.1
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.max(
                        totalExecutionTime < 0.1
                          ? (totalExecutionTime / 0.1) * 25 // 0-100ms = 0-25%
                          : totalExecutionTime < 1
                            ? 25 + ((totalExecutionTime - 0.1) / 0.9) * 35 // 100ms-1s = 25-60%
                            : 60 + ((Math.min(totalExecutionTime, 5) - 1) / 4) * 40, // 1-5s = 60-100%
                        3,
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  {totalExecutionTime < 0.1
                    ? 'เร็วมาก - เยี่ยม!'
                    : totalExecutionTime < 1
                      ? 'เร็วดี - โค้ดมีประสิทธิภาพ!'
                      : totalExecutionTime < 3
                        ? 'ใช้เวลาปานกลาง'
                        : totalExecutionTime < 5
                          ? 'ใช้เวลาค่อนข้างนาน'
                          : 'ใช้เวลานานมาก - ควรปรับปรุง'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-cyan-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MemoryUsagePanel;
