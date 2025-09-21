import { getGoogleAuthUrl, logout, refreshToken } from '@/api';
import { AuthResponse } from '@/types';

export class AuthService {
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