import axios from 'axios';
import { fetchProfile as apiFetchProfile } from '@/api';
import { UserProfile } from '@/types';
import AuthService from './auth.service';

class ProfileService {
  static async fetchProfile(token: string): Promise<UserProfile> {
    try {
      return await apiFetchProfile(token);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiFetchProfile(newToken);
        }
      }
      throw error;
    }
  }
}

export default ProfileService;
