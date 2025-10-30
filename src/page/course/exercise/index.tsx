'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { useAuth } from '@/hooks';
import { useCourseMaterial, useMySubmission } from '@/query';
import { Button } from '@/components/ui/button';
import { isDeadlinePassed } from '@/lib';

import ExerciseProblemCard from '@/components/course/exercise/ExerciseProblemCard';
import ExerciseEditorCard from '@/components/course/exercise/ExerciseEditorCard';

const ExerciseDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { accessToken, profile, isInitialized } = useAuth();
  const materialId = (params as { materialId: string }).materialId ?? (params as { id: string }).id;

  const { data, isLoading, error } = useCourseMaterial(accessToken, materialId);
  const { data: submissionData } = useMySubmission(accessToken, materialId);

  const material = data?.data;

  const [code, setCode] = useState<string>('');
  const [isCodeCleared, setIsCodeCleared] = useState<boolean>(false);

  React.useEffect(() => {
    if (isInitialized && !profile) {
      router.push('/');
    }
  }, [isInitialized, profile, router]);

  // Reset code when materialId changes
  useEffect(() => {
    setCode('');
    setIsCodeCleared(false);
  }, [materialId]);

  // Load submitted code into editor only when submission data changes and code is empty
  // Only load code if submission data belongs to current materialId and user hasn't manually cleared it
  useEffect(() => {
    if (submissionData?.data && 'code' in submissionData.data && code === '' && !isCodeCleared) {
      const codeSubmission = submissionData.data as { code: string; material_id?: string };
      // Only load code if it belongs to current materialId
      if (!codeSubmission.material_id || codeSubmission.material_id === materialId) {
        setCode(codeSubmission.code);
      }
    }
  }, [submissionData, code, materialId, isCodeCleared]); // Include isCodeCleared in dependencies

  // Custom setCode function that tracks when user manually clears code
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (newCode === '') {
      setIsCodeCleared(true);
    }
  };

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

  // Check if this is a code exercise
  const isCodeExercise = material.type === 'code_exercise';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ExerciseProblemCard material={material} isExpired={isExpired} isGraded={isGraded} />

        <div className="mt-6">
          {isCodeExercise ? (
            <ExerciseEditorCard
              key={materialId}
              code={code}
              onCodeChange={handleCodeChange}
              isExpired={isExpired}
              isGraded={isGraded}
              submission={submissionData}
              materialId={materialId}
              token={accessToken}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-600">แบบฝึกหัดประเภทนี้ยังไม่รองรับ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailPage;
