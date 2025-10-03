import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService } from '@/services';

export const useGoogleAuthUrl = () => {
  return useMutation({
    mutationFn: AuthService.getGoogleAuthUrl,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {},
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: AuthService.refreshToken,
  });
};
