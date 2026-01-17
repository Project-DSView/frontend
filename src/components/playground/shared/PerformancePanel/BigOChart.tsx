import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BigOChartProps } from '@/types';

const BigOChart: React.FC<BigOChartProps> = ({ timeComplexity }) => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">โค้ดของคุณอยู่ตรงไหน?</CardTitle>
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
              Time
            </text>
            <path d="M 30 145 L 330 145" fill="none" stroke="#10b981" strokeWidth="2" />
            <text x="335" y="148" className="fill-emerald-500 font-medium" fontSize="10">
              O(1)
            </text>
            <path d="M 30 145 Q 120 135, 330 120" fill="none" stroke="#14b8a6" strokeWidth="2" />
            <text x="335" y="123" className="fill-teal-500 font-medium" fontSize="10">
              O(log n)
            </text>
            <path d="M 30 145 L 330 70" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <text x="335" y="73" className="fill-blue-500 font-medium" fontSize="10">
              O(n)
            </text>
            <path d="M 30 145 Q 120 120, 280 20" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="285" y="18" className="fill-amber-500 font-medium" fontSize="10">
              O(n log n)
            </text>
            <path d="M 30 145 Q 80 140, 200 20" fill="none" stroke="#f97316" strokeWidth="2" />
            <text x="205" y="18" className="fill-orange-500 font-medium" fontSize="10">
              O(n²)
            </text>
            <path d="M 30 145 Q 60 145, 120 20" fill="none" stroke="#ef4444" strokeWidth="2" />
            <text
              x="110"
              y="18"
              className="fill-red-500 font-medium"
              textAnchor="middle"
              fontSize="10"
            >
              O(2^n)
            </text>
            {(() => {
              let cx = 180,
                cy = 107.5;
              let indicatorColor = '#3b82f6';
              if (timeComplexity.includes('O(1)')) {
                cx = 180;
                cy = 145;
                indicatorColor = '#10b981';
              } else if (timeComplexity.includes('log n') && !timeComplexity.includes('n log')) {
                cx = 180;
                cy = 127.5;
                indicatorColor = '#14b8a6';
              } else if (timeComplexity === 'O(n)') {
                cx = 180;
                cy = 107.5;
                indicatorColor = '#3b82f6';
              } else if (timeComplexity.includes('n log n')) {
                cx = 165;
                cy = 85;
                indicatorColor = '#f59e0b';
              } else if (timeComplexity.includes('n²')) {
                cx = 145;
                cy = 75;
                indicatorColor = '#f97316';
              } else if (timeComplexity.includes('n³')) {
                cx = 120;
                cy = 60;
                indicatorColor = '#f97316';
              } else if (timeComplexity.includes('2^n') || timeComplexity.includes('n!')) {
                cx = 95;
                cy = 80;
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
        </div>
      </CardContent>
    </Card>
  );
};

export default BigOChart;
