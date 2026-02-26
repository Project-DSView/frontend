'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

import { TestCaseResultCardProps } from '@/types';

import { Badge } from '@/components/ui/badge';

const TestCaseResultCard: React.FC<TestCaseResultCardProps> = ({
  results = [],
  passedCount = 0,
  failedCount = 0,
}) => {
  if (results.length === 0 && passedCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">ผลการทดสอบ:</span>
        <div className="flex items-center gap-2">
          {passedCount > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="mr-1 h-3 w-3" />
              ผ่าน {passedCount}
            </Badge>
          )}
          {failedCount > 0 && (
            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
              <XCircle className="mr-1 h-3 w-3" />
              ไม่ผ่าน {failedCount}
            </Badge>
          )}
          {passedCount === 0 && failedCount === 0 && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              ยังไม่ได้ทดสอบ
            </Badge>
          )}
        </div>
      </div>

      {/* Individual test cases */}
      {results.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">รายละเอียด:</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.map((result, index) => (
              <div
                key={result.result_id}
                className={`flex items-center gap-2 rounded-lg p-2 ${
                  result.status === 'passed' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {result.status === 'passed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {result.display_name || `Test Case ${index + 1}`}
                </span>
                <Badge
                  variant={result.status === 'passed' ? 'default' : 'destructive'}
                  className={`text-xs ${
                    result.status === 'passed'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }`}
                >
                  {result.status === 'passed' ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseResultCard;
