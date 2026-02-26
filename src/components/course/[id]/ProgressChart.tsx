'use client';

import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChartProps } from '@/types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, PieController);

const ProgressChart: React.FC<ProgressChartProps> = ({ completedCount, totalCount }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS<'doughnut'> | null>(null);

  const notCompletedCount = totalCount - completedCount;
  const completedPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const notCompletedPercentage = totalCount > 0 ? (notCompletedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chartData: ChartData<'doughnut'> = {
      labels: ['ทำแล้ว', 'ยังไม่ทำ'],
      datasets: [
        {
          data: [completedCount, notCompletedCount],
          backgroundColor: ['#10b981', '#e5e7eb'],
          borderWidth: 0,
        },
      ],
    };

    const chartOptions: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(0) : '0';
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      cutout: '70%',
    };

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: chartData,
      options: chartOptions,
    });

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [completedCount, totalCount, notCompletedCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>กราฟความคืบหน้า</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {/* Chart.js Doughnut Chart */}
          <div className="relative h-64 w-full max-w-xs">
            <canvas ref={chartRef} />
            {/* Center text */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
                <p className="text-sm text-gray-600">จาก {totalCount}</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                ทำแล้ว ({completedPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-600">
                ยังไม่ทำ ({notCompletedPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
