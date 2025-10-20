'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { useAuth } from '@/hooks';
import { useCourseMaterial } from '@/query';
import { Button } from '@/components/ui/button';
import { isDeadlinePassed } from '@/lib';

import ExerciseProblemCard from '@/components/course/exercise/ExerciseProblemCard';
import ExerciseEditorCard from '@/components/course/exercise/ExerciseEditorCard';

const ExerciseDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { accessToken, profile, isInitialized } = useAuth();
  const materialId = (params as { materialId: string }).materialId ?? (params as { id: string }).id;

  const { data, isLoading, error } = useCourseMaterial(accessToken, materialId as string);

  const material = data?.data;

  const [code, setCode] = useState<string>('');

  React.useEffect(() => {
    if (isInitialized && !profile) {
      router.push('/');
    }
  }, [isInitialized, profile, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">เกิดข้อผิดพลาด</h2>
          <p className="mt-2 text-gray-600">ไม่สามารถโหลดข้อมูลโจทย์ได้</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !material) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูลโจทย์...</span>
        </div>
      </div>
    );
  }

  // Check deadline status
  const isExpired = Boolean(material.deadline && isDeadlinePassed(material.deadline));
  const isGraded = material.is_graded ?? true; // default to graded for safety

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ExerciseProblemCard material={material} isExpired={isExpired} isGraded={isGraded} />

        <div className="mt-6">
          <ExerciseEditorCard
            code={code}
            onCodeChange={setCode}
            isExpired={isExpired}
            isGraded={isGraded}
          />
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
