import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@/services';

const useGoogleAuthUrl = () => {
  return useMutation({
    mutationFn: AuthService.getGoogleAuthUrl,
  });
};

const useLogout = () => {
  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {},
  });
};

const useRefreshToken = () => {
  return useMutation({
    mutationFn: AuthService.refreshToken,
  });
};

export { useGoogleAuthUrl, useLogout, useRefreshToken };
