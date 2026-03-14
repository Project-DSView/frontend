import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { BigOChartProps } from '@/types';
import BigOComplexityTable from './BigOComplexityTable';

const BigOChart: React.FC<BigOChartProps> = ({ timeComplexity }) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">โค้ดของคุณอยู่ตรงไหน?</CardTitle>
          <button
            onClick={() => setShowTable((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              showTable
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label="ดูรายละเอียด Big O"
          >
            <Info className="h-3.5 w-3.5" />
            ดูรายละเอียด
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden">
          <svg viewBox="0 0 400 180" className="h-auto w-full">
            <defs>
              <pattern id="gridPerf" width="30" height="18" patternUnits="userSpaceOnUse">
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
              width="400"
              height="180"
              fill="url(#gridPerf)"
              className="text-gray-400 dark:text-gray-500"
            />
            {/* Axes */}
            <path
              d="M 30 145 L 390 145"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-500 dark:text-gray-400"
            />
            <path
              d="M 30 145 L 30 10"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-500 dark:text-gray-400"
            />
            {/* Axis Arrows */}
            <path
              d="M 390 145 L 385 142 M 390 145 L 385 148"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-gray-500 dark:text-gray-400"
            />
            <path
              d="M 30 10 L 27 15 M 30 10 L 33 15"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-gray-500 dark:text-gray-400"
            />
            <text
              x="200"
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
              Operations
            </text>
            <path d="M 30 145 L 330 140" fill="none" stroke="#10b981" strokeWidth="2" />
            <text x="335" y="142" className="fill-emerald-500 font-medium" fontSize="10">
              O(1)
            </text>
            <path d="M 30 145 C 145 115, 285 110, 330 110" fill="none" stroke="#14b8a6" strokeWidth="2" />
            <text x="335" y="113" className="fill-teal-500 font-medium" fontSize="10">
              O(log n)
            </text>
            <path d="M 30 145 L 330 70" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <text x="335" y="73" className="fill-blue-500 font-medium" fontSize="10">
              O(n)
            </text>
            <path d="M 45 145 L 300 55" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="285" y="45" className="fill-amber-500 font-medium" fontSize="10">
              O(n log n)
            </text>
            <path d="M 30 145 C 120 135, 170 80, 200 20" fill="none" stroke="#f97316" strokeWidth="2" />
            <text x="205" y="18" className="fill-orange-500 font-medium" fontSize="10">
              O(n²)
            </text>
            <path d="M 30 145 C 90 135, 120 80, 140 20" fill="none" stroke="#ea580c" strokeWidth="2" />
            <text x="145" y="18" className="fill-orange-600 font-medium" fontSize="10">
              O(n³)
            </text>
            <path d="M 30 145 C 70 135, 90 80, 100 20" fill="none" stroke="#dc2626" strokeWidth="2" />
            <text x="105" y="18" className="fill-red-600 font-medium" fontSize="10">
              O(n⁴⁺)
            </text>
            <path d="M 30 145 C 55 135, 70 80, 80 20" fill="none" stroke="#ef4444" strokeWidth="2" />
            <text
              x="80"
              y="18"
              className="fill-red-500 font-medium"
              textAnchor="middle"
              fontSize="10"
            >
              O(2ⁿ)
            </text>
            <path d="M 30 145 C 40 135, 50 80, 60 20" fill="none" stroke="#ef4444" strokeWidth="2" />
            <text
              x="55"
              y="18"
              className="fill-red-500 font-medium"
              textAnchor="middle"
              fontSize="10"
            >
              O(n!)
            </text>
            {(() => {
              let cx = 180,
                cy = 107.5;
              let indicatorColor = '#3b82f6';
              if (timeComplexity.includes('O(1)')) {
                cx = 180;
                cy = 143.5;
                indicatorColor = '#10b981';
              } else if (timeComplexity.toLowerCase().includes('log') && !timeComplexity.toLowerCase().includes('n log')) {
                // Handle O(log n), O(log² n), O(log³ n), etc.
                cx = 250;
                cy = 111.5;
                indicatorColor = '#14b8a6';
              } else if (timeComplexity === 'O(n)') {
                cx = 240;
                cy = 92.5;
                indicatorColor = '#3b82f6';
              } else if (timeComplexity.includes('n log n')) {
                cx = 191;
                cy = 93.5;
                indicatorColor = '#f59e0b';
              } else if (timeComplexity.includes('n²') || timeComplexity === 'O(n^2)') {
                cx = 153;
                cy = 87;
                indicatorColor = '#f97316';
              } else if (timeComplexity.includes('n³') || timeComplexity === 'O(n^3)') {
                cx = 110;
                cy = 87;
                indicatorColor = '#ea580c';
              } else if (
                timeComplexity.includes('n⁴') || 
                timeComplexity.includes('n⁵') || 
                timeComplexity.includes('n⁶') ||
                timeComplexity.match(/O\(n\^?[4-9]\d*\)/)
              ) {
                cx = 83;
                cy = 87;
                indicatorColor = '#dc2626';
              } else if (timeComplexity.includes('2^n') || timeComplexity.includes('2ⁿ')) {
                cx = 65;
                cy = 87;
                indicatorColor = '#ef4444';
              } else if (timeComplexity.includes('n!')) {
                cx = 48;
                cy = 87;
                indicatorColor = '#ef4444';
              }
              return (
                <g>
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
                  <circle
                    cx={cx}
                    cy={cy}
                    r="6"
                    fill={indicatorColor}
                    stroke="white"
                    strokeWidth="2"
                  />
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
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
            <span className="text-emerald-500">● ดีมาก</span>
            <span className="text-teal-500">● ดี</span>
            <span className="text-blue-500">● ปกติ</span>
            <span className="text-amber-500">● ปานกลาง</span>
            <span className="text-orange-500">● ช้า</span>
            <span className="text-red-500">● ช้ามาก</span>
          </div>
          {showTable && (
            <BigOComplexityTable
              currentComplexity={timeComplexity}
              onClose={() => setShowTable(false)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BigOChart;
