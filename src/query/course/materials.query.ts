import { useQuery } from '@tanstack/react-query';

import { MaterialService } from '@/services';
import { MaterialsParams } from '@/types';

// Get course materials with pagination
const useCourseMaterials = (token: string | null, courseId: string, params?: MaterialsParams) => {
  return useQuery({
    queryKey: ['course-materials', token, courseId, params],
    queryFn: () => MaterialService.getCourseMaterials(token!, courseId, params),
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
    queryFn: () => MaterialService.getCourseMaterial(token!, materialId),
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

export { useCourseMaterial, useCourseMaterials };
