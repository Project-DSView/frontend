'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { isDeadlinePassed } from '@/lib';
import { useAuth } from '@/hooks';
import { useCourseMaterial, useMySubmission } from '@/query';
import { PDFSubmission, CodeSubmission } from '@/types';

import { Button } from '@/components/ui/button';
import PDFExerciseCard from '@/components/course/[id]/exercise/PDFExerciseCard';
import PDFSubmissionCard from '@/components/course/[id]/exercise/PDFSubmissionCard';
import SubmittedPDFCard from '@/components/course/[id]/exercise/SubmittedPDFCard';

// Type guard to check if submission is PDFSubmission
const isPDFSubmission = (
  sub: PDFSubmission | CodeSubmission | null | undefined,
): sub is PDFSubmission => {
  if (!sub || !sub.submission_id) return false;
  return 'file_url' in sub && 'file_name' in sub;
};

const PDFExercisePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { accessToken, profile, isInitialized } = useAuth();
  const materialId = (params as { materialId: string }).materialId ?? (params as { id: string }).id;

  // Fetch material details
  const {
    data: materialData,
    isLoading: isMaterialLoading,
    error: materialError,
  } = useCourseMaterial(accessToken, materialId as string);

  // Fetch user's submission
  const { data: submissionData, isLoading: isSubmissionLoading } = useMySubmission(
    accessToken,
    materialId as string,
  );

  const material = materialData?.data;
  const submission = submissionData?.data;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (isInitialized && !profile) {
      router.push('/');
    }
  }, [isInitialized, profile, router]);

  // Show loading state
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

  // Show error state for material
  if (materialError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            เกิดข้อผิดพลาด
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">ไม่สามารถโหลดข้อมูลโจทย์ได้</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state for material
  if (isMaterialLoading || !material) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูลโจทย์...</span>
        </div>
      </div>
    );
  }

  // Check if this is actually a PDF exercise
  if (material.type !== 'pdf_exercise') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            ไม่พบแบบฝึกหัด
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            หน้านี้ใช้สำหรับแบบฝึกหัดที่เป็นเอกสารเท่านั้น
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  // Check deadline status
  const isExpired = Boolean(material.deadline && isDeadlinePassed(material.deadline));
  const isGraded = material.is_graded ?? true;

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* PDF Exercise Card - Problem Document */}
        <PDFExerciseCard material={material} />

        {/* Submission Section */}
        <div className="mt-6">
          {isSubmissionLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-gray-700 dark:text-gray-300">กำลังโหลดสถานะการส่งงาน...</span>
              </div>
            </div>
          ) : submission && submission.submission_id && isPDFSubmission(submission) ? (
            /* Show submitted status if user has submitted */
            <SubmittedPDFCard
              submission={submission}
              accessToken={accessToken!}
              material={material}
            />
          ) : (
            /* Show submission form if user hasn't submitted */
            <PDFSubmissionCard
              materialId={materialId as string}
              accessToken={accessToken!}
              isExpired={isExpired}
              isGraded={isGraded}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFExercisePage;
