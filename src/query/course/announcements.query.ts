import { useQuery } from '@tanstack/react-query';

import { AnnouncementsService } from '@/services';
import { AnnouncementsParams } from '@/types';

// Get announcements for a course
const useAnnouncements = (token: string | null, courseId: string, params?: AnnouncementsParams) => {
  return useQuery({
    queryKey: ['announcements', token, courseId, params],
    queryFn: () => AnnouncementsService.getAnnouncements(token!, courseId, params),
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

export { useAnnouncements };
