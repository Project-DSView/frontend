import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CourseService } from '@/services';
import { getCourseScore, getSelfProgress } from '@/api';
import { formatErrorForDisplay } from '@/lib';
import {
  CourseQueryParams,
  AnnouncementsParams,
  MaterialsParams,
  CourseScoreResponse,
  EnrollmentRequest,
  SelfProgressResponse,
  QueueJobFilters,
  MaterialResponse,
} from '@/types';

// Get courses with pagination and filtering
const useCourses = (token: string | null, params?: CourseQueryParams) => {
  return useQuery({
    queryKey: ['courses', token, params],
    queryFn: () => CourseService.getCourses(token!, params),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Get single course by ID
const useCourse = (token: string | null, courseId: string) => {
  return useQuery({
    queryKey: ['course', token, courseId],
    queryFn: () => CourseService.getCourse(token!, courseId),
    enabled: !!token && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Get announcements for a course
const useAnnouncements = (token: string | null, courseId: string, params?: AnnouncementsParams) => {
  return useQuery({
    queryKey: ['announcements', token, courseId, params],
    queryFn: () => CourseService.getAnnouncements(token!, courseId, params),
    enabled: !!token && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Get course materials with pagination
const useCourseMaterials = (token: string | null, courseId: string, params?: MaterialsParams) => {
  return useQuery({
    queryKey: ['course-materials', token, courseId, params],
    queryFn: () => CourseService.getCourseMaterials(token!, courseId, params),
    enabled: !!token && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Get single material
const useCourseMaterial = (token: string | null, materialId: string) => {
  return useQuery({
    queryKey: ['course-material', token, materialId],
    queryFn: () => CourseService.getCourseMaterial(token!, materialId),
    enabled: !!token && !!materialId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

/**
 * Create material mutation hook
 */
const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      token: string;
      courseId: string;
      type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement';
      title: string;
      description?: string | null;
      week?: number;
      isPublic?: boolean;
      file?: File;
      videoUrl?: string;
      totalPoints?: number;
      deadline?: string | null;
      problemStatement?: string;
      constraints?: string | null;
      hints?: string | null;
      testCases?: Array<{ input_data: string; expected_output: string; display_name?: string }>;
      content?: string;
    }): Promise<MaterialResponse> => {
      return CourseService.createMaterial(
        params.token,
        params.courseId,
        params.type,
        params.title,
        params.description,
        params.week,
        params.isPublic,
        params.file,
        params.videoUrl,
        params.totalPoints,
        params.deadline,
        params.problemStatement,
        params.constraints,
        params.hints,
        params.testCases,
        params.content,
      );
    },
    onSuccess: () => {
      toast.success('สร้างเนื้อหาสำเร็จ');
      // Invalidate course materials query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['course-materials'],
      });
    },
    onError: (error) => {
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage || 'เกิดข้อผิดพลาดในการสร้างเนื้อหา');
    },
  });
};

/**
 * Update material mutation hook
 */
const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      token: string;
      materialId: string;
      updates: {
        title?: string;
        description?: string;
        week?: number;
        isPublic?: boolean;
        videoUrl?: string;
        content?: string;
      };
    }): Promise<MaterialResponse> => {
      return CourseService.updateMaterial(params.token, params.materialId, params.updates);
    },
    onSuccess: () => {
      toast.success('อัปเดตเนื้อหาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: ['course-materials'],
      });
    },
    onError: (error) => {
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage || 'เกิดข้อผิดพลาดในการอัปเดตเนื้อหา');
    },
  });
};

/**
 * Delete material mutation hook
 */
const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { token: string; materialId: string }): Promise<void> => {
      return CourseService.deleteMaterial(params.token, params.materialId);
    },
    onSuccess: () => {
      toast.success('ลบเนื้อหาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: ['course-materials'],
      });
    },
    onError: (error) => {
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage || 'เกิดข้อผิดพลาดในการลบเนื้อหา');
    },
  });
};

const useCourseScore = (token: string | null, courseId: string) => {
  return useQuery<CourseScoreResponse, Error>({
    queryKey: ['courseScore', token, courseId],
    queryFn: () => {
      if (!token) throw new Error('No access token');
      return getCourseScore(token, courseId);
    },
    enabled: !!token && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user's submission for a material
const useMySubmission = (token: string | null, materialId: string) => {
  return useQuery({
    queryKey: ['my-submission', token, materialId],
    queryFn: () => CourseService.getMySubmission(token!, materialId),
    enabled: !!token && !!materialId,
    staleTime: 0, // Always refetch to get latest data
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true,
    // Poll every 2 seconds if submission is still running (async queue processing)
    refetchInterval: (query) => {
      const data = query.state.data;
      const submission = data?.data;

      // Only poll if submission exists and is a code submission
      if (!submission || !('code' in submission)) {
        return false;
      }

      // Poll when status is 'running' (async queue processing in progress)
      if (submission.status === 'running') {
        return 2000; // Poll every 2 seconds
      }

      // Stop polling when:
      // 1. Status is 'pending' (execution completed, results available)
      // 2. Status is 'completed' or 'error'
      // 3. Results are already available
      if (
        submission.status === 'pending' ||
        submission.status === 'completed' ||
        submission.status === 'error' ||
        (submission.results && submission.results.length > 0)
      ) {
        return false; // Stop polling
      }

      return false; // Default: no polling
    },
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false; // Don't retry on auth errors or not found
        }
      }
      return failureCount < 2;
    },
  });
};

// Get specific submission by ID
const useSubmission = (token: string | null, submissionId: string) => {
  return useQuery({
    queryKey: ['submission', token, submissionId],
    queryFn: () => CourseService.getSubmission(token!, submissionId),
    enabled: !!token && !!submissionId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Get download URL for submission
const useSubmissionDownloadUrl = (token: string | null, submissionId: string) => {
  return useQuery({
    queryKey: ['submission-download-url', token, submissionId],
    queryFn: () => CourseService.getSubmissionDownloadUrl(token!, submissionId),
    enabled: !!token && !!submissionId,
    staleTime: 30 * 60 * 1000, // 30 minutes (URLs expire in 1 hour)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

// Submit code exercise mutation
const useSubmitCodeExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      materialId,
      code,
    }: {
      token: string;
      materialId: string;
      code: string;
    }) => CourseService.submitCodeExercise(token, materialId, code),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch submission data
      queryClient.invalidateQueries({
        queryKey: ['my-submission', variables.token, variables.materialId],
      });

      // Show success message
      toast.success('ส่งโค้ดสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Submit code exercise error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการส่งโค้ด';
      toast.error(errorMessage);
    },
  });
};

// Submit PDF exercise mutation
const useSubmitPDFExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, materialId, file }: { token: string; materialId: string; file: File }) =>
      CourseService.submitPDFExercise(token, materialId, file),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch submission data immediately
      queryClient.invalidateQueries({
        queryKey: ['my-submission', variables.token, variables.materialId],
      });

      // Force refetch immediately
      queryClient.refetchQueries({
        queryKey: ['my-submission', variables.token, variables.materialId],
      });

      // Show success message
      toast.success('ส่งงานสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Submit PDF exercise error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการส่งงาน';
      toast.error(errorMessage);
    },
  });
};

// Cancel submission mutation
const useCancelSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, submissionId }: { token: string; submissionId: string }) =>
      CourseService.cancelSubmission(token, submissionId),
    onSuccess: (_data, variables) => {
      // Invalidate submission queries
      queryClient.invalidateQueries({
        queryKey: ['my-submission'],
      });
      queryClient.invalidateQueries({
        queryKey: ['submission', variables.token, variables.submissionId],
      });

      // Show success message
      toast.success('ยกเลิกการส่งงานสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Cancel submission error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการยกเลิกการส่งงาน';
      toast.error(errorMessage);
    },
  });
};

// Get course PDF submissions
const useCoursePDFSubmissions = (token: string | null, courseId: string) => {
  return useQuery({
    queryKey: ['course-pdf-submissions', token, courseId],
    queryFn: () => CourseService.getCoursePDFSubmissions(token!, courseId),
    enabled: !!token && !!courseId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Approve PDF submission mutation
const useApprovePDFSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      submissionId,
      score,
      comment,
      feedbackFile,
      maxScore,
    }: {
      token: string;
      submissionId: string;
      score: number;
      comment: string;
      feedbackFile?: File;
      maxScore?: number;
      courseId?: string;
    }) =>
      CourseService.approvePDFSubmission(
        token,
        submissionId,
        score,
        comment,
        feedbackFile,
        maxScore,
      ),
    onSuccess: (_data, variables) => {
      // Invalidate course submissions query
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ['course-pdf-submissions', variables.token, variables.courseId],
        });
      }

      // Invalidate submission queries
      queryClient.invalidateQueries({
        queryKey: ['submission', variables.token, variables.submissionId],
      });

      // Show success message
      toast.success('ให้คะแนนสำเร็จ');
    },
    onError: (error: unknown) => {
      const errorMessage = formatErrorForDisplay(error) || 'เกิดข้อผิดพลาดในการให้คะแนน';
      toast.error(errorMessage);
    },
  });
};

// Get my enrollment status
const useMyEnrollment = (token: string | null, courseId: string) => {
  return useQuery({
    queryKey: ['myEnrollment', token, courseId],
    queryFn: () => CourseService.getMyEnrollment(token!, courseId),
    enabled: !!token && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Enroll in course mutation
const useEnrollInCourse = () => {
  return useMutation({
    mutationFn: ({
      token,
      courseId,
      enrollmentData,
    }: {
      token: string;
      courseId: string;
      enrollmentData: EnrollmentRequest;
    }) => CourseService.enrollInCourse(token, courseId, enrollmentData),
  });
};

// Unenroll from course mutation
const useUnenrollFromCourse = () => {
  return useMutation({
    mutationFn: ({ token, courseId }: { token: string; courseId: string }) =>
      CourseService.unenrollFromCourse(token, courseId),
  });
};

// Get course enrollments
const useCourseEnrollments = (token: string | null, courseId: string) => {
  return useQuery({
    queryKey: ['courseEnrollments', token, courseId],
    queryFn: () => CourseService.getCourseEnrollments(token!, courseId),
    enabled: !!token && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Update enrollment role mutation
const useUpdateEnrollmentRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      courseId,
      userId,
      role,
    }: {
      token: string;
      courseId: string;
      userId: string;
      role: 'student' | 'ta';
    }) => CourseService.updateEnrollmentRole(token, courseId, userId, role),
    onSuccess: (_data, variables) => {
      // Invalidate course enrollments query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['courseEnrollments', variables.token, variables.courseId],
      });

      // Show success message
      toast.success('อัปเดต role สำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Update enrollment role error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการอัปเดต role';
      toast.error(errorMessage);
    },
  });
};

const useSelfProgress = (token: string | null, courseId?: string) => {
  return useQuery<SelfProgressResponse, Error>({
    queryKey: ['selfProgress', token, courseId],
    queryFn: () => {
      if (!token) throw new Error('No access token');
      return getSelfProgress(token, courseId);
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Request approval mutation
const useRequestApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      materialId,
      data,
    }: {
      token: string;
      materialId: string;
      data: { lab_room: string; table_number: string };
    }) => CourseService.requestApproval(token, materialId, data),
    onSuccess: (_data, variables) => {
      // Invalidate submission queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['my-submission', variables.token, variables.materialId],
      });

      // Show success message
      toast.success('ส่งคำขอตรวจสอบสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Request approval error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการส่งคำขอตรวจสอบ';
      toast.error(errorMessage);
    },
  });
};

// Get queue jobs query
const useQueueJobs = (token: string | null, filters: QueueJobFilters = {}) => {
  return useQuery({
    queryKey: ['queue-jobs', token, filters],
    queryFn: async () => {
      if (!token) {
        throw new Error('No access token provided');
      }
      const result = await CourseService.getQueueJobs(token, filters);
      console.log('Queue Jobs API Response:', result);
      return result;
    },
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return false; // Don't retry on auth errors
        }
      }
      return failureCount < 2;
    },
  });
};

// Claim queue job mutation
const useClaimQueueJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, jobId }: { token: string; jobId: string }) =>
      CourseService.claimQueueJob(token, jobId),
    onSuccess: () => {
      // Invalidate queue jobs queries
      queryClient.invalidateQueries({
        queryKey: ['queue-jobs'],
      });

      // Show success message
      toast.success('รับงานตรวจสอบสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Claim queue job error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการรับงานตรวจสอบ';
      toast.error(errorMessage);
    },
  });
};

// Complete review mutation
const useCompleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      jobId,
      data,
    }: {
      token: string;
      jobId: string;
      data: { status: 'approved' | 'rejected'; comment: string };
    }) => CourseService.completeReview(token, jobId, data),
    onSuccess: (data) => {
      // Invalidate queue jobs queries
      queryClient.invalidateQueries({
        queryKey: ['queue-jobs'],
      });

      // Invalidate submission queries to update student's view
      queryClient.invalidateQueries({
        queryKey: ['my-submission'],
      });

      // Show success message
      const statusText = data.data.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
      toast.success(`ตรวจสอบเสร็จสิ้น - ${statusText}`);
    },
    onError: (error: unknown) => {
      console.error('Complete review error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการตรวจสอบ';
      toast.error(errorMessage);
    },
  });
};

// Create course mutation
const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      name,
      description,
      enroll_key,
      image,
    }: {
      token: string;
      name: string;
      description: string;
      enroll_key: string;
      image?: File;
    }) => CourseService.createCourse(token, name, description, enroll_key, image),
    onSuccess: () => {
      // Invalidate courses query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      });

      // Show success message
      toast.success('สร้างคอร์สสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Create course error:', error);

      // Use formatErrorForDisplay from lib for error handling
      const errorMessage = formatErrorForDisplay(error) || 'เกิดข้อผิดพลาดในการสร้างคอร์ส';
      toast.error(errorMessage);
    },
  });
};

// Update course mutation
const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      courseId,
      updates,
    }: {
      token: string;
      courseId: string;
      updates: {
        name?: string;
        description?: string;
        status?: 'active' | 'archived';
        enroll_key?: string;
      };
    }) => CourseService.updateCourse(token, courseId, updates),
    onSuccess: (_data, variables) => {
      // Invalidate courses query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      });
      // Invalidate specific course query
      queryClient.invalidateQueries({
        queryKey: ['course', variables.token, variables.courseId],
      });

      // Show success message
      const statusMessage =
        variables.updates.status === 'archived' ? 'เก็บคอร์สสำเร็จ' : 'อัปเดตคอร์สสำเร็จ';
      toast.success(statusMessage);
    },
    onError: (error: unknown) => {
      console.error('Update course error:', error);

      // Use formatErrorForDisplay from lib for error handling
      const errorMessage = formatErrorForDisplay(error) || 'เกิดข้อผิดพลาดในการอัปเดตคอร์ส';
      toast.error(errorMessage);
    },
  });
};

const useUploadCourseImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, courseId, image }: { token: string; courseId: string; image: File }) =>
      CourseService.uploadCourseImage(token, courseId, image),
    onSuccess: (_data, variables) => {
      // Invalidate courses query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['courses'],
      });
      // Invalidate specific course query
      queryClient.invalidateQueries({
        queryKey: ['course', variables.token, variables.courseId],
      });

      toast.success('อัปเดตรูปภาพคอร์สสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Upload course image error:', error);

      // Use formatErrorForDisplay from lib for error handling
      const errorMessage = formatErrorForDisplay(error) || 'เกิดข้อผิดพลาดในการอัปเดตรูปภาพคอร์ส';
      toast.error(errorMessage);
    },
  });
};

// Create invitation link
const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, courseId }: { token: string; courseId: string }) =>
      CourseService.createInvitation(token, courseId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course-invitations', variables.token, variables.courseId],
      });
      toast.success('สร้างลิงก์เชิญสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Create invitation error:', error);
      const errorMessage = formatErrorForDisplay(error) || 'เกิดข้อผิดพลาดในการสร้างลิงก์เชิญ';
      toast.error(errorMessage);
    },
  });
};

// Get course invitations
const useCourseInvitations = (token: string | null, courseId: string) => {
  return useQuery({
    queryKey: ['course-invitations', token, courseId],
    queryFn: () => CourseService.getCourseInvitations(token!, courseId),
    enabled: !!token && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Enroll via invitation
const useEnrollViaInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, invitationToken }: { token: string; invitationToken: string }) =>
      CourseService.enrollViaInvitation(token, invitationToken),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['course', variables.token],
      });
      queryClient.invalidateQueries({
        queryKey: ['courses', variables.token],
      });
      queryClient.invalidateQueries({
        queryKey: ['my-enrollment', variables.token],
      });
      toast.success('ลงทะเบียนเรียนสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Enroll via invitation error:', error);
      const errorMessage = formatErrorForDisplay(error) || 'เกิดข้อผิดพลาดในการลงทะเบียนเรียน';
      toast.error(errorMessage);
    },
  });
};

export {
  useCourse,
  useCourses,
  useAnnouncements,
  useCourseMaterial,
  useCourseMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  useCourseScore,
  useMySubmission,
  useSubmission,
  useSubmissionDownloadUrl,
  useSubmitCodeExercise,
  useSubmitPDFExercise,
  useCancelSubmission,
  useCoursePDFSubmissions,
  useApprovePDFSubmission,
  useMyEnrollment,
  useEnrollInCourse,
  useUnenrollFromCourse,
  useCourseEnrollments,
  useUpdateEnrollmentRole,
  useSelfProgress,
  useRequestApproval,
  useQueueJobs,
  useClaimQueueJob,
  useCompleteReview,
  useCreateCourse,
  useUpdateCourse,
  useUploadCourseImage,
  useCreateInvitation,
  useCourseInvitations,
  useEnrollViaInvitation,
};
