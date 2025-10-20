'use client';

import React from 'react';

import { ExerciseEditorCardProps } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CodeEditor from '@/components/editor/CodeEditor';

const ExerciseEditorCard: React.FC<ExerciseEditorCardProps> = ({
  code,
  onCodeChange,
  isExpired,
  isGraded,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>โค้ดของคุณ</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: 400 }}>
          <CodeEditor code={code} onCodeChange={onCodeChange} height={400} />
        </div>
        <div className="mt-4 flex gap-2">
          {isExpired && !isGraded ? (
            <Button disabled={false} className="bg-yellow-500 hover:bg-yellow-600">
              รันโค้ด (เร็วๆนี้)
            </Button>
          ) : (
            <Button disabled={Boolean(isGraded && isExpired)}>รันโค้ด (เร็วๆนี้)</Button>
          )}
          <Button variant="outline" onClick={() => onCodeChange('')}>
            ล้าง
          </Button>
        </div>
        {isGraded && isExpired && (
          <p className="mt-2 text-sm text-red-600">หมดเวลาส่งงานแล้ว ไม่สามารถส่งได้</p>
        )}
        {isExpired && !isGraded && (
          <p className="mt-2 text-sm text-yellow-600">แบบฝึกหัดฝึกฝน สามารถส่งได้แม้เกินเวลา</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseEditorCard;
