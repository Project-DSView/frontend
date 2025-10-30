import { useQuery } from '@tanstack/react-query';
import { getCourseLeaderboard } from '@/api';
import { LeaderboardResponse } from '@/types';

export const useCourseLeaderboard = (
  token: string | null,
  courseId: string,
  limit: number = 100,
) => {
  return useQuery<LeaderboardResponse, Error>({
    queryKey: ['courseLeaderboard', token, courseId, limit],
    queryFn: () => {
      if (!token) throw new Error('No access token');
      return getCourseLeaderboard(token, courseId, limit);
    },
    enabled: !!token && !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
