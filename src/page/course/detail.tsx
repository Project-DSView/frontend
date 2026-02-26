'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, BookOpen, LogOut, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks';
import {
  useCourse,
  useAnnouncements,
  useCourseMaterials,
  useMyEnrollment,
  useUnenrollFromCourse,
  useCourseEnrollments,
  useQueueJobs,
  useCoursePDFSubmissions,
} from '@/query';
import { useQueryClient } from '@tanstack/react-query';
import { QueueJobStatus } from '@/types/services/services.types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import LatestAnnouncement from '@/components/announcements';
import MaterialsByWeek from '@/components/course/[id]/material/MaterialsByWeek';
import MembersList from '@/components/course/[id]/MembersList';
import QueueTable from '@/components/course/[id]/queue/QueueTable';
import GradingTable from '@/components/course/[id]/grade/GradingTable';
import InvitationLinkCard from '@/components/course/[id]/InvitationLinkCard';
import CreateMaterialDialog from '@/components/course/[id]/material/CreateMaterialDialog';

const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, profile, isInitialized } = useAuth();
  const courseId = params.id as string;

  // State for active tab
  const [activeTab, setActiveTab] = React.useState<'materials' | 'members' | 'queue' | 'grading'>(
    'materials',
  );

  // State for queue status filter
  const [queueStatusFilter, setQueueStatusFilter] = React.useState<string>('all');

  // State for create material dialog
  const [isCreateMaterialDialogOpen, setIsCreateMaterialDialogOpen] = React.useState(false);
  const [defaultMaterialType, setDefaultMaterialType] = React.useState<
    'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement' | ''
  >('');

  // Fetch course data
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = useCourse(accessToken, courseId);

  // Fetch announcements
  const { data: announcementsData } = useAnnouncements(accessToken, courseId, {
    limit: 50,
    offset: 0,
  });

  // Fetch course materials
  const {
    data: materialsData,
    isLoading: isMaterialsLoading,
    error: materialsError,
    refetch: refetchMaterials,
  } = useCourseMaterials(accessToken, courseId, { limit: 100, offset: 0 });

  // Fetch enrollment status
  const { data: enrollmentData } = useMyEnrollment(accessToken, courseId);

  // Fetch course enrollments
  const {
    data: enrollmentsData,
    isLoading: isEnrollmentsLoading,
    error: enrollmentsError,
  } = useCourseEnrollments(accessToken, courseId);

  // Check if user can manage queue (teacher or TA)
  const canManageQueue = profile?.is_teacher || enrollmentData?.data?.enrollment?.role === 'ta';

  // Check if user can grade (teacher or TA)
  const canGrade = canManageQueue;

  // Check if user is the course creator
  const course = courseData?.data;
  const isCreator = course && profile?.user_id === course.created_by && profile?.is_teacher;

  // Fetch all queue jobs (without filter) to calculate queue positions
  const { data: allQueueJobsData } = useQueueJobs(accessToken, {
    course_id: courseId || undefined,
    page: 1,
    limit: 100,
  });

  // Fetch queue jobs for this course with filter
  const {
    data: queueJobsData,
    isLoading: isQueueJobsLoading,
    error: queueJobsError,
    refetch: refetchQueueJobs,
  } = useQueueJobs(accessToken, {
    course_id: courseId || undefined,
    status: queueStatusFilter !== 'all' ? (queueStatusFilter as QueueJobStatus) : undefined,
    page: 1,
    limit: 100,
  });

  // Fetch course PDF submissions for grading tab
  const {
    data: courseSubmissionsData,
    isLoading: isSubmissionsLoading,
    error: submissionsError,
  } = useCoursePDFSubmissions(accessToken, courseId);

  // Create a map of job ID to queue position based on all jobs (sorted by created_at)
  const queuePositionMap = React.useMemo(() => {
    if (!allQueueJobsData?.data?.jobs) return new Map<string, number>();

    // Sort all jobs by created_at to get the queue order
    const sortedJobs = [...allQueueJobsData.data.jobs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const positionMap = new Map<string, number>();
    sortedJobs.forEach((job, index) => {
      positionMap.set(job.id, index + 1);
    });

    return positionMap;
  }, [allQueueJobsData]);

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            เกิดข้อผิดพลาด
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">ไม่สามารถโหลดข้อมูลคอร์สได้</p>
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

  const announcements = announcementsData?.data.announcements || [];
  const materials = materialsData?.data.materials || [];

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">ไม่พบคอร์ส</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">ไม่พบคอร์สที่ระบุ</p>
          <Button onClick={() => router.back()} className="mt-4">
            กลับ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.name}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{course.description}</p>
            </div>
            {enrollmentData?.data?.enrollment && (
              <Button
                onClick={() => router.push(`/course/${courseId}/me`)}
                className="flex items-center gap-2 bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
              >
                คะแนนของฉัน
              </Button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6">
          <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 text-lg font-medium transition-colors ${
                activeTab === 'materials'
                  ? 'border-secondary border-b-4 text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              เนื้อหาคอร์ส
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 text-lg font-medium transition-colors ${
                activeTab === 'members'
                  ? 'border-secondary border-b-4 text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              สมาชิก
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`pb-3 text-lg font-medium transition-colors ${
                activeTab === 'queue'
                  ? 'border-secondary border-b-4 text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              คิวงาน
            </button>
            {canGrade && (
              <button
                onClick={() => setActiveTab('grading')}
                className={`pb-3 text-lg font-medium transition-colors ${
                  activeTab === 'grading'
                    ? 'border-secondary border-b-4 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                ตรวจงาน
              </button>
            )}
          </div>
        </div>

        {/* Course Info and Invitation Link */}
        {profile?.is_teacher ? (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Course Info Card */}
            <Card className="lg:col-span-2">
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
                          className="bg-error flex items-center gap-2 text-[16px] text-white"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">ชื่อคอร์ส</p>
                    <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">คำอธิบาย</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invitation Link Card */}
            <InvitationLinkCard
              courseId={courseId}
              accessToken={accessToken}
              isCreator={isCreator || false}
            />
          </div>
        ) : (
          <div className="mb-8">
            {/* Course Info Card - Full Width for Students */}
            <Card>
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
                          className="bg-error flex items-center gap-2 text-[16px] text-white"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">ชื่อคอร์ส</p>
                    <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">คำอธิบาย</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {course.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Section - Conditional Rendering */}
        {activeTab === 'materials' ? (
          <>
            {/* Latest/Pinned Announcement Card - Only show on Materials tab */}
            <LatestAnnouncement
              announcements={announcements}
              showAddButton={profile?.is_teacher}
              onAddAnnouncement={() => {
                setDefaultMaterialType('announcement');
                setIsCreateMaterialDialogOpen(true);
              }}
            />

            {/* Materials Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>เนื้อหาคอร์ส</CardTitle>
                  {profile?.is_teacher && (
                    <Button
                      onClick={() => setIsCreateMaterialDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      เพิ่ม Material
                    </Button>
                  )}
                </div>
                {isMaterialsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังโหลดเนื้อหา...
                  </div>
                )}
                {materialsError && (
                  <div className="text-sm text-red-500 dark:text-red-400">
                    เกิดข้อผิดพลาดในการโหลดเนื้อหา
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isMaterialsLoading && !materialsError && (
                  <MaterialsByWeek materials={materials} userProfile={profile} />
                )}
              </CardContent>
            </Card>
          </>
        ) : activeTab === 'members' ? (
          /* Members Section */
          <Card>
            <CardHeader>
              <CardTitle>สมาชิกในคอร์ส</CardTitle>
            </CardHeader>
            <CardContent>
              <MembersList
                enrollmentsData={enrollmentsData}
                isLoading={isEnrollmentsLoading}
                error={enrollmentsError}
                isTeacher={profile?.is_teacher}
                courseId={courseId}
                accessToken={accessToken}
              />
            </CardContent>
          </Card>
        ) : activeTab === 'queue' ? (
          /* Queue Section */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>คิวงาน</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={queueStatusFilter} onValueChange={setQueueStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="กรองสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="pending">รอตรวจ</SelectItem>
                      <SelectItem value="processing">กำลังตรวจ</SelectItem>
                      <SelectItem value="completed">ตรวจเสร็จ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchQueueJobs()}
                    disabled={isQueueJobsLoading}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isQueueJobsLoading ? 'animate-spin' : ''}`}
                    />
                    รีเฟรช
                  </Button>
                </div>
              </div>
              {queueJobsError && (
                <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                  เกิดข้อผิดพลาด:{' '}
                  {queueJobsError instanceof Error
                    ? queueJobsError.message
                    : 'ไม่สามารถโหลดข้อมูลคิวได้'}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <QueueTable
                jobs={queueJobsData?.data?.jobs || []}
                isLoading={isQueueJobsLoading}
                canManage={canManageQueue}
                token={accessToken}
                onRefresh={() => refetchQueueJobs()}
                showRefreshButton={false}
                queuePositionMap={queuePositionMap}
              />
            </CardContent>
          </Card>
        ) : (
          /* Grading Section */
          <Card>
            <CardHeader>
              <CardTitle>ตรวจงาน</CardTitle>
              {submissionsError && (
                <div className="mt-2 text-sm text-red-500 dark:text-red-400">
                  เกิดข้อผิดพลาด:{' '}
                  {submissionsError instanceof Error
                    ? submissionsError.message
                    : 'ไม่สามารถโหลดข้อมูลได้'}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <GradingTable
                submissions={courseSubmissionsData?.data || []}
                isLoading={isSubmissionsLoading}
                courseId={courseId}
                accessToken={accessToken}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Material Dialog */}
      <CreateMaterialDialog
        isOpen={isCreateMaterialDialogOpen}
        onClose={() => {
          setIsCreateMaterialDialogOpen(false);
          setDefaultMaterialType('');
        }}
        accessToken={accessToken}
        courseId={courseId}
        defaultMaterialType={defaultMaterialType}
        onSuccess={() => {
          refetchMaterials();
          setIsCreateMaterialDialogOpen(false);
          setDefaultMaterialType('');
        }}
      />
    </div>
  );
};

export default CourseDetailPage;
