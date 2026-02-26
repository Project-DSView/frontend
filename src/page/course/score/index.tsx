'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useCourse, useCourseScore, useSelfProgress, useCourseMaterials } from '@/query';
import { Button } from '@/components/ui/button';
import ScoreSummaryCard from '@/components/course/[id]/score/ScoreSummaryCard';
import ScoreTable from '@/components/course/[id]/score/ScoreTable';
import ScoreByTypeCard from '@/components/course/[id]/score/ScoreByTypeCard';
import ProgressChart from '@/components/course/[id]/ProgressChart';

const ScoreDashboardPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { accessToken, isInitialized } = useAuth();
  const courseId = params.id as string;

  // Fetch data
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = useCourse(accessToken, courseId);

  const {
    data: scoreData,
    isLoading: isScoreLoading,
    error: scoreError,
  } = useCourseScore(accessToken, courseId);

  const {
    data: progressData,
    isLoading: isProgressLoading,
    error: progressError,
  } = useSelfProgress(accessToken, courseId);

  const {
    data: materialsData,
    isLoading: isMaterialsLoading,
    error: materialsError,
  } = useCourseMaterials(accessToken, courseId, { limit: 100, offset: 0 });

  // Wait for auth initialization
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

  // Loading state
  if (isCourseLoading || isScoreLoading || isProgressLoading || isMaterialsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูลคะแนน...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError || scoreError || progressError || materialsError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">เกิดข้อผิดพลาด</h2>
          <p className="mt-2 text-gray-600">ไม่สามารถโหลดข้อมูลได้</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  const course = courseData?.data;
  const totalScore = scoreData?.data?.TotalScore || 0;
  const progress = progressData?.data?.progress || [];
  const materials = materialsData?.data?.materials || [];

  // กรองเฉพาะ exercise materials
  const exerciseMaterials = materials.filter(
    (m) => m.type === 'code_exercise' || m.type === 'pdf_exercise',
  );

  // นับจำนวนงานที่ทำแล้ว (status = completed)
  const completedCount = progress.filter((p) => p.status.toLowerCase() === 'completed').length;

  const totalCount = exerciseMaterials.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              คะแนนของฉัน - {course?.name || 'Course'}
            </h1>
            <p className="mt-2 text-gray-600">{course?.description}</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Summary Card */}
          <ScoreSummaryCard
            totalScore={totalScore}
            completedCount={completedCount}
            totalCount={totalCount}
          />

          {/* Charts and Stats Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProgressChart completedCount={completedCount} totalCount={totalCount} />
            <ScoreByTypeCard progress={progress} materials={materials} />
          </div>

          {/* Score Table */}
          <ScoreTable progress={progress} materials={materials} />
        </div>
      </div>
    </div>
  );
};

export default ScoreDashboardPage;
