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
  const res = await api.post('/api/auth/refresh');
  return res.data.data.token;
};

const fetchProfile = async (token: string): Promise<UserProfile> => {
  const res = await api.get<UserProfile>('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Debug: Log API response
  console.log('[API] Profile response:', res.data);
  console.log('[API] is_teacher from API:', res.data.is_teacher);
  return res.data;
};

export { getGoogleAuthUrl, logout, refreshToken, fetchProfile };
