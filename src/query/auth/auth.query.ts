import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService } from '@/services';

export const useGoogleAuthUrl = () => {
  return useQuery({
    queryKey: ['auth', 'google-url'],
    queryFn: AuthService.getGoogleAuthUrl,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Clear any cached data on logout
      // This will be handled by the query client
    },
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: AuthService.refreshToken,
  });
};
