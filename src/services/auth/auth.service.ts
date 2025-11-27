import axios from 'axios';
import { getGoogleAuthUrl, logout, refreshToken, fetchProfile } from '@/api';
import { AuthResponse, UserProfile } from '@/types';

class AuthService {
  static async getGoogleAuthUrl(): Promise<AuthResponse> {
    return getGoogleAuthUrl();
  }

  static async logout(): Promise<void> {
    return logout();
  }

  static async refreshToken(): Promise<string> {
    return refreshToken();
  }
}

class ProfileService {
  static async fetchProfile(token: string): Promise<UserProfile> {
    try {
      return await fetchProfile(token);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await fetchProfile(newToken);
        }
      }
      throw error;
    }
  }
}

export { AuthService, ProfileService };
