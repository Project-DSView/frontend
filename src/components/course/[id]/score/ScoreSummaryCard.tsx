'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CheckCircle2, Target } from 'lucide-react';

interface ScoreSummaryCardProps {
  totalScore: number;
  completedCount: number;
  totalCount: number;
}

const ScoreSummaryCard: React.FC<ScoreSummaryCardProps> = ({
  totalScore,
  completedCount,
  totalCount,
}) => {
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>สรุปคะแนน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* คะแนนรวม */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">คะแนนรวม</p>
              <p className="text-2xl font-bold text-gray-900">{totalScore}</p>
            </div>
          </div>

          {/* จำนวนงานที่ทำ */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">งานที่ทำแล้ว</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedCount} / {totalCount}
              </p>
            </div>
          </div>

          {/* เปอร์เซ็นต์ความคืบหน้า */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ความคืบหน้า</p>
              <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreSummaryCard;
