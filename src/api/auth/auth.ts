import { AuthResponse } from '@/types';
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

export { getGoogleAuthUrl, logout, refreshToken };
