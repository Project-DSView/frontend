import { AuthResponse } from '@/types';
import { api } from '../index';

export const getGoogleAuthUrl = async (): Promise<AuthResponse> => {
  const res = await api.get<AuthResponse>('/auth/google');
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshToken = async (): Promise<string> => {
  const res = await api.post('/auth/refresh');
  return res.data.data.token;
};
