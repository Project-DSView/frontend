'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { useCourses, useEnrollInCourse } from '@/query';
import CourseCardWithEnrollment from '@/components/course/CourseCardWithEnrollment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const CoursePage: React.FC = () => {
  const router = useRouter();
  const { accessToken, profile, isInitialized } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);

  // Query parameters
  const queryParams = {
    page: currentPage,
    limit: 12,
    search: searchTerm || undefined,
  };

  // Fetch courses
  const { data: coursesData, isLoading, error, refetch } = useCourses(accessToken, queryParams);

  // Enrollment mutation
  const enrollMutation = useEnrollInCourse();

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !profile) {
      router.push('/');
    }
  }, [isInitialized, profile, router]);

  // Handle enrollment
  const handleEnroll = async (courseId: string, enrollKey: string) => {
    if (!accessToken) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setIsEnrolling(courseId);

    try {
      await enrollMutation.mutateAsync({
        token: accessToken,
        courseId,
        enrollmentData: { enroll_key: enrollKey },
      });

      toast.success('ลงทะเบียนสำเร็จ!');
      // Refresh courses data
      refetch();
    } catch (error: unknown) {
      console.error('Enrollment error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          toast.error('คุณได้ลงทะเบียนในคอร์สนี้แล้ว');
        } else if (axiosError.response?.status === 400) {
          toast.error('รหัสลงทะเบียนไม่ถูกต้อง');
        } else {
          toast.error('เกิดข้อผิดพลาดในการลงทะเบียน');
        }
      } else {
        toast.error('เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } finally {
      setIsEnrolling(null);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle enter course
  const handleEnterCourse = (courseId: string) => {
    // Navigate to course detail page or course content
    window.location.href = `/course/${courseId}`;
  };

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

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">เกิดข้อผิดพลาด</h2>
          <p className="mt-2 text-gray-600">ไม่สามารถโหลดข้อมูลคอร์สได้</p>
          <Button onClick={() => refetch()} className="mt-4">
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  const courses = coursesData?.data.courses || [];
  const pagination = coursesData?.data.pagination;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">คอร์สเรียนทั้งหมด</h1>
          <p className="mt-2 text-gray-600">เลือกคอร์สที่คุณสนใจและลงทะเบียนเรียนได้เลย</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาคอร์ส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ค้นหา'}
            </Button>
          </form>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>กำลังโหลดคอร์ส...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">ไม่พบคอร์ส</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ? 'ไม่พบคอร์สที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีคอร์สในระบบ'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="mt-4"
              >
                ล้างการค้นหา
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCardWithEnrollment
                  key={course.course_id}
                  course={course}
                  onEnroll={handleEnroll}
                  isEnrolling={isEnrolling === course.course_id}
                  onEnterCourse={handleEnterCourse}
                  accessToken={accessToken}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  ก่อนหน้า
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total_pages || isLoading}
                >
                  ถัดไป
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
