'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, BookOpen, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks';
import { useCourse, useAnnouncements, useCourseMaterials, useMyEnrollment, useUnenrollFromCourse } from '@/query';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import LatestAnnouncement from '@/components/announcements';
import MaterialsByWeek from '@/components/course/MaterialsByWeek';


const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, profile, isInitialized } = useAuth();
  const courseId = params.id as string;

  // Fetch course data
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = useCourse(accessToken, courseId);

  // Fetch announcements
  const {
    data: announcementsData,
  } = useAnnouncements(accessToken, courseId, { limit: 50, offset: 0 });

  // Fetch course materials
  const {
    data: materialsData,
    isLoading: isMaterialsLoading,
    error: materialsError,
  } = useCourseMaterials(accessToken, courseId, { limit: 100, offset: 0 });

  // Fetch enrollment status
  const {
    data: enrollmentData,
  } = useMyEnrollment(accessToken, courseId);

  // Unenroll mutation
  const unenrollMutation = useUnenrollFromCourse();

  // Handle unenroll
  const handleUnenroll = async () => {
    if (!accessToken || !courseId) return;
    
    try {
      await unenrollMutation.mutateAsync({
        token: accessToken,
        courseId: courseId,
      });
      
      // Invalidate enrollment queries to refresh the cache
      await queryClient.invalidateQueries({
        queryKey: ['myEnrollment', accessToken, courseId],
      });
      
      // Also invalidate any course-related queries
      await queryClient.invalidateQueries({
        queryKey: ['courses'],
      });
      
      toast.success('ออกจากคอร์สสำเร็จ');
      router.push('/course');
    } catch (error) {
      console.error('Failed to unenroll from course:', error);
      toast.error('เกิดข้อผิดพลาดในการออกจากคอร์ส');
    }
  };

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
  const materials = materialsData?.data.materials || [];

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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            <p className="mt-2 text-gray-600">{course.description}</p>
          </div>
        </div>

        {/* Course Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ข้อมูลคอร์ส</CardTitle>
              {enrollmentData?.data?.enrollment && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={unenrollMutation.isPending}
                      className="flex items-center gap-2 text-white text-[16px] bg-error"
                    >
                      {unenrollMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      ออกจากคอร์ส
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการออกจากคอร์ส</AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณแน่ใจหรือไม่ว่าต้องการออกจากคอร์ส &quot;{course.name}&quot;? 
                        การกระทำนี้ไม่สามารถย้อนกลับได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="hover:bg-neutral">ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleUnenroll}
                        className="bg-error hover:bg-red-700"
                      >
                        ออกจากคอร์ส
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">ชื่อคอร์ส</p>
                <p className="font-medium">{course.name}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">คำอธิบาย</p>
                <p className="font-medium">{course.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest/Pinned Announcement Card */}
        <LatestAnnouncement announcements={announcements} />

        {/* Materials Section */}
        <Card>
          <CardHeader>
            <CardTitle>เนื้อหาคอร์ส</CardTitle>
            {isMaterialsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังโหลดเนื้อหา...
              </div>
            )}
            {materialsError && (
              <div className="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดเนื้อหา</div>
            )}
          </CardHeader>
          <CardContent>
            {!isMaterialsLoading && !materialsError && (
              <MaterialsByWeek materials={materials} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetailPage;
