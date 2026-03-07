import { AuthResponse, UserProfile } from '@/types';
import { api } from '../index';

const getGoogleAuthUrl = async (): Promise<AuthResponse> => {
  const res = await api.get<AuthResponse>('/api/auth/google');
  return res.data;
};

const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

const refreshToken = async (): Promise<string> => {
  await api.post('/api/auth/refresh');
  return 'cookie-managed';
};

const fetchProfile = async (): Promise<UserProfile> => {
  const res = await api.get<UserProfile>('/api/profile');

  return res.data;
};

export { getGoogleAuthUrl, logout, refreshToken, fetchProfile };
