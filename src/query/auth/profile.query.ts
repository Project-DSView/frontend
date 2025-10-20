import { useQuery, useMutation } from '@tanstack/react-query';

import { ProfileService } from '@/services';

const useProfile = (token: string | null) => {
  return useQuery({
    queryKey: ['profile', token],
    queryFn: () => ProfileService.fetchProfile(token!),
    enabled: !!token,
    staleTime: 30 * 60 * 1000, // 30 minutes - increased from 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour - cache time
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchInterval: false, // Disable automatic refetching
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
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

const useFetchProfile = () => {
  return useMutation({
    mutationFn: (token: string) => ProfileService.fetchProfile(token),
  });
};

export { useProfile, useFetchProfile };
