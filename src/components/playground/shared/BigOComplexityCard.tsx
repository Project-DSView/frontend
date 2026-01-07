'use client';

import React, { useState } from 'react';
import { BigOComplexityCardProps } from '@/types';

/**
 * Simple Big O complexity display with expandable modal details
 * Matches MemoryUsagePanel design pattern
 */
const BigOComplexityCard: React.FC<BigOComplexityCardProps> = ({ complexity, isLoading }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-4 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 shadow-md dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            กำลังวิเคราะห์ Big O...
          </span>
        </div>
      </div>
    );
  }

  if (!complexity) {
    return null;
  }

  // Get performance level and color
  const getTimeLevel = (c: string): { label: string; color: string } => {
    if (c.includes('O(1)') || c.includes('O(log n)'))
      return { label: 'ดีมาก', color: 'text-emerald-600 dark:text-emerald-400' };
    if (c.includes('O(n)') && !c.includes('²') && !c.includes('log'))
      return { label: 'ดี', color: 'text-blue-600 dark:text-blue-400' };
    if (c.includes('O(n log n)'))
      return { label: 'ปานกลาง', color: 'text-amber-600 dark:text-amber-400' };
    if (c.includes('O(n²)')) return { label: 'ช้า', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'ช้ามาก', color: 'text-red-600 dark:text-red-400' };
  };

  const getSpaceLevel = (c: string): { label: string; color: string } => {
    if (c.includes('O(1)'))
      return { label: 'ดีมาก', color: 'text-emerald-600 dark:text-emerald-400' };
    if (c.includes('O(log n)')) return { label: 'ดี', color: 'text-blue-600 dark:text-blue-400' };
    if (c.includes('O(n)') && !c.includes('²'))
      return { label: 'ปานกลาง', color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'มาก', color: 'text-orange-600 dark:text-orange-400' };
  };

  const timeLevel = getTimeLevel(complexity.timeComplexity);
  const spaceLevel = getSpaceLevel(complexity.spaceComplexity);

  return (
    <>
      {/* Summary Bar */}
      <div className="mt-4 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 shadow-md dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Time Complexity */}
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Time</p>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    {complexity.timeComplexity}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

              {/* Space Complexity */}
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-teal-600 dark:text-teal-400">Space</p>
                  <p className="text-sm font-bold text-teal-900 dark:text-teal-100">
                    {complexity.spaceComplexity}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(true)}
              className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-emerald-700 hover:to-teal-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Big O Analysis</h2>
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
              {/* Summary Cards - 2x1 Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/30">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Time Complexity</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {complexity.timeComplexity}
                  </p>
                  <p className={`text-sm font-medium ${timeLevel.color}`}>{timeLevel.label}</p>
                </div>
                <div className="rounded-lg bg-teal-50 p-4 dark:bg-teal-900/30">
                  <p className="text-xs text-teal-600 dark:text-teal-400">Space Complexity</p>
                  <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                    {complexity.spaceComplexity}
                  </p>
                  <p className={`text-sm font-medium ${spaceLevel.color}`}>{spaceLevel.label}</p>
                </div>
              </div>

              {/* Explanations */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  คำอธิบาย
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-300">Time:</p>
                    <p className="text-gray-600 dark:text-gray-400">{complexity.timeExplanation}</p>
                  </div>
                  <div>
                    <p className="font-medium text-teal-700 dark:text-teal-300">Space:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {complexity.spaceExplanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              {complexity.analysisDetails && (
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <h3 className="mb-3 text-sm font-semibold text-blue-800 dark:text-blue-200">
                    รายละเอียดการวิเคราะห์
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {complexity.analysisDetails.loop_count !== undefined && (
                      <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-400">Loops</p>
                        <p className="text-gray-500 dark:text-gray-200">
                          {complexity.analysisDetails.loop_count}
                        </p>
                      </div>
                    )}
                    {complexity.analysisDetails.max_nesting !== undefined && (
                      <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-400">
                          Max Depth
                        </p>
                        <p className="text-gray-500 dark:text-gray-200">
                          {complexity.analysisDetails.max_nesting} ชั้น
                        </p>
                      </div>
                    )}
                    {complexity.analysisDetails.has_recursion !== undefined && (
                      <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-400">
                          Recursion
                        </p>
                        <p className="text-gray-500 dark:text-gray-200">
                          {complexity.analysisDetails.has_recursion ? 'ใช่' : 'ไม่'}
                        </p>
                      </div>
                    )}
                    {complexity.analysisDetails.has_growing_structures !== undefined && (
                      <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-400">
                          Growing Data
                        </p>
                        <p className="text-gray-500 dark:text-gray-200">
                          {complexity.analysisDetails.has_growing_structures ? 'ใช่' : 'ไม่'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Complexity Graph */}
              <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  โค้ดของคุณอยู่ตรงไหน?
                </h3>
                <div className="relative">
                  {/* SVG Graph */}
                  <svg viewBox="0 0 300 180" className="h-auto w-full">
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="30" height="18" patternUnits="userSpaceOnUse">
                        <path
                          d="M 30 0 L 0 0 0 18"
                          fill="none"
                          stroke="currentColor"
                          strokeOpacity="0.1"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="300"
                      height="180"
                      fill="url(#grid)"
                      className="text-gray-400 dark:text-gray-500"
                    />

                    {/* Axis labels */}
                    <text
                      x="150"
                      y="175"
                      textAnchor="middle"
                      className="fill-gray-500 dark:fill-gray-400"
                      fontSize="10"
                    >
                      Input Size (n)
                    </text>
                    <text
                      x="12"
                      y="90"
                      textAnchor="middle"
                      transform="rotate(-90, 12, 90)"
                      className="fill-gray-500 dark:fill-gray-400"
                      fontSize="10"
                    >
                      Time
                    </text>

                    {/* Complexity curves */}
                    {/* O(1) - Constant - Green */}
                    <path
                      d="M 30 140 L 280 140"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={complexity.timeComplexity.includes('O(1)') ? '0' : '0'}
                    />
                    <text
                      x="282"
                      y="143"
                      className="fill-emerald-500"
                      fontSize="9"
                      fontWeight={complexity.timeComplexity.includes('O(1)') ? 'bold' : 'normal'}
                    >
                      O(1)
                    </text>

                    {/* O(log n) - Logarithmic - Teal */}
                    <path
                      d="M 30 140 Q 80 120, 130 105 T 280 85"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2"
                    />
                    <text
                      x="282"
                      y="88"
                      className="fill-teal-500"
                      fontSize="9"
                      fontWeight={
                        complexity.timeComplexity.includes('log n') &&
                        !complexity.timeComplexity.includes('n log')
                          ? 'bold'
                          : 'normal'
                      }
                    >
                      O(log n)
                    </text>

                    {/* O(n) - Linear - Blue */}
                    <path d="M 30 140 L 280 50" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <text
                      x="282"
                      y="53"
                      className="fill-blue-500"
                      fontSize="9"
                      fontWeight={complexity.timeComplexity === 'O(n)' ? 'bold' : 'normal'}
                    >
                      O(n)
                    </text>

                    {/* O(n log n) - Linearithmic - Amber */}
                    <path
                      d="M 30 140 Q 100 110, 180 60 T 280 30"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <text
                      x="282"
                      y="33"
                      className="fill-amber-500"
                      fontSize="9"
                      fontWeight={complexity.timeComplexity.includes('n log n') ? 'bold' : 'normal'}
                    >
                      O(n log n)
                    </text>

                    {/* O(n²) - Quadratic - Orange */}
                    <path
                      d="M 30 140 Q 80 135, 130 110 T 200 40 L 240 15"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                    />
                    <text
                      x="242"
                      y="18"
                      className="fill-orange-500"
                      fontSize="9"
                      fontWeight={complexity.timeComplexity.includes('n²') ? 'bold' : 'normal'}
                    >
                      O(n²)
                    </text>

                    {/* O(2^n) - Exponential - Red */}
                    <path
                      d="M 30 140 Q 60 138, 90 130 T 140 80 L 160 15"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <text
                      x="162"
                      y="18"
                      className="fill-red-500"
                      fontSize="9"
                      fontWeight={
                        complexity.timeComplexity.includes('2^n') ||
                        complexity.timeComplexity.includes('n!')
                          ? 'bold'
                          : 'normal'
                      }
                    >
                      O(2^n)
                    </text>

                    {/* Current complexity indicator */}
                    {(() => {
                      // Calculate indicator position based on complexity
                      let cx = 155,
                        cy = 95; // Default: O(n)
                      let indicatorColor = '#3b82f6';

                      if (complexity.timeComplexity.includes('O(1)')) {
                        cx = 155;
                        cy = 140;
                        indicatorColor = '#10b981';
                      } else if (
                        complexity.timeComplexity.includes('log n') &&
                        !complexity.timeComplexity.includes('n log')
                      ) {
                        cx = 155;
                        cy = 105;
                        indicatorColor = '#14b8a6';
                      } else if (complexity.timeComplexity === 'O(n)') {
                        cx = 155;
                        cy = 95;
                        indicatorColor = '#3b82f6';
                      } else if (complexity.timeComplexity.includes('n log n')) {
                        cx = 155;
                        cy = 60;
                        indicatorColor = '#f59e0b';
                      } else if (complexity.timeComplexity.includes('n²')) {
                        cx = 155;
                        cy = 55;
                        indicatorColor = '#f97316';
                      } else if (complexity.timeComplexity.includes('n³')) {
                        cx = 130;
                        cy = 35;
                        indicatorColor = '#f97316';
                      } else if (
                        complexity.timeComplexity.includes('2^n') ||
                        complexity.timeComplexity.includes('n!')
                      ) {
                        cx = 120;
                        cy = 50;
                        indicatorColor = '#ef4444';
                      }

                      return (
                        <g>
                          {/* Pulsing outer ring */}
                          <circle cx={cx} cy={cy} r="12" fill={indicatorColor} fillOpacity="0.2">
                            <animate
                              attributeName="r"
                              values="8;14;8"
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="fill-opacity"
                              values="0.3;0.1;0.3"
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          {/* Main indicator */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="6"
                            fill={indicatorColor}
                            stroke="white"
                            strokeWidth="2"
                          />
                          {/* Label */}
                          <text
                            x={cx}
                            y={cy - 14}
                            textAnchor="middle"
                            fill={indicatorColor}
                            fontSize="10"
                            fontWeight="bold"
                          >
                            Your Code
                          </text>
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Legend */}
                  <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-emerald-500">● ดีมาก</span>
                    <span className="text-teal-500">● ดี</span>
                    <span className="text-blue-500">● ปกติ</span>
                    <span className="text-amber-500">● ปานกลาง</span>
                    <span className="text-orange-500">● ช้า</span>
                    <span className="text-red-500">● ช้ามาก</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-medium text-white transition-all hover:from-emerald-700 hover:to-teal-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

BigOComplexityCard.displayName = 'BigOComplexityCard';

export default BigOComplexityCard;
