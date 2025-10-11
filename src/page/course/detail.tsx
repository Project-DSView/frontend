'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks';
import { useCourse, useAnnouncements } from '@/query';
import { Loader2, AlertCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnnouncementsByWeek from '@/components/announcements/AnnouncementsByWeek';
import { useRouter } from 'next/navigation';

const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { accessToken, profile, isInitialized } = useAuth();
  const courseId = params.id as string;

  // Fetch course data
  const { data: courseData, isLoading: isCourseLoading, error: courseError } = useCourse(
    accessToken,
    courseId
  );

  // Fetch announcements
  const { data: announcementsData, isLoading: isAnnouncementsLoading, error: announcementsError } = useAnnouncements(
    accessToken,
    courseId,
    { limit: 50, offset: 0 }
  );

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

  // Show loading state if no profile (but initialized)
  if (isInitialized && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังเปลี่ยนเส้นทาง...</span>
        </div>
      </div>
    );
  }

  // Show error state for course
  if (courseError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">เกิดข้อผิดพลาด</h2>
          <p className="mt-2 text-gray-600">ไม่สามารถโหลดข้อมูลคอร์สได้</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state for course
  if (isCourseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูลคอร์ส...</span>
        </div>
      </div>
    );
  }

  const course = courseData?.data;
  const announcements = announcementsData?.data.announcements || [];

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบคอร์ส</h2>
          <p className="mt-2 text-gray-600">ไม่พบคอร์สที่ระบุ</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="mt-2 text-gray-600">{course.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">สร้างโดย</p>
              <p className="font-medium">{course.creator.firstname} {course.creator.lastname}</p>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ข้อมูลคอร์ส</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ชื่อคอร์ส</p>
                <p className="font-medium">{course.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">คำอธิบาย</p>
                <p className="font-medium">{course.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">สร้างโดย</p>
                <p className="font-medium">{course.creator.firstname} {course.creator.lastname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">อีเมล</p>
                <p className="font-medium">{course.creator.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements Section */}
        <Card>
          <CardHeader>
            <CardTitle>ประกาศ</CardTitle>
            {isAnnouncementsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังโหลดประกาศ...
              </div>
            )}
            {announcementsError && (
              <div className="text-sm text-red-500">
                เกิดข้อผิดพลาดในการโหลดประกาศ
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!isAnnouncementsLoading && !announcementsError && (
              <AnnouncementsByWeek announcements={announcements} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetailPage;
