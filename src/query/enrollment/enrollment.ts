import { useQuery, useMutation } from '@tanstack/react-query';
import { EnrollmentService } from '@/services';
import { EnrollmentRequest } from '@/types';

// Get my enrollment status
const useMyEnrollment = (token: string | null, courseId: string) => {
  return useQuery({
    queryKey: ['myEnrollment', token, courseId],
    queryFn: () => EnrollmentService.getMyEnrollment(token!, courseId),
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
    }) => EnrollmentService.enrollInCourse(token, courseId, enrollmentData),
  });
};

// Unenroll from course mutation
const useUnenrollFromCourse = () => {
  return useMutation({
    mutationFn: ({
      token,
      courseId,
    }: {
      token: string;
      courseId: string;
    }) => EnrollmentService.unenrollFromCourse(token, courseId),
  });
};

export { useMyEnrollment, useEnrollInCourse, useUnenrollFromCourse };