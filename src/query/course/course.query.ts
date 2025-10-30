import { useQuery } from '@tanstack/react-query';

import { CourseService } from '@/services';
import { CourseQueryParams } from '@/types';

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

export { useCourse, useCourses };
