import { UserProfile } from '@/types';
import { api } from '../index';

const fetchProfile = async (token: string): Promise<UserProfile> => {
  const res = await api.get<UserProfile>('/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export { fetchProfile };
