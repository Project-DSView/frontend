import { UserProfile } from '@/types';
import { api } from '../index';

export const fetchProfile = async (token: string): Promise<UserProfile> => {
  const res = await api.get<UserProfile>('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
