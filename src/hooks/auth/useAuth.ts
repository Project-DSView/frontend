import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, UseAuthReturn } from '@/types';
import { ProfileService, AuthService } from '@/services';
import {
  secureSessionUtils,
  logError,
  isTokenExpired,
  RATE_LIMIT_CONFIGS,
  isRateLimited,
  initializeCSRFProtection,
} from '@/lib';

const useAuth = (): UseAuthReturn => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize CSRF protection
  useEffect(() => {
    initializeCSRFProtection();
  }, []);

  // Initialize session securely on hook mount
  useEffect(() => {
    const sessionData = secureSessionUtils.loadSession();
    if (sessionData && secureSessionUtils.isSessionValid()) {
      setAccessToken(sessionData.token);
      setProfile(sessionData.profile);
    } else {
      // Clear invalid session
      secureSessionUtils.clearSession();
    }
    setIsInitialized(true);
  }, []);

  const loadSession = useCallback(() => {
    const sessionData = secureSessionUtils.loadSession();
    if (sessionData && secureSessionUtils.isSessionValid()) {
      setAccessToken(sessionData.token);
      setProfile(sessionData.profile);
      return sessionData;
    }
    return null;
  }, []);

  // ฟังก์ชัน refresh token with rate limiting
  const handleRefreshToken = useCallback(async () => {
    // Check rate limit
    if (isRateLimited(RATE_LIMIT_CONFIGS.TOKEN_REFRESH)) {
      throw new Error('Too many token refresh attempts. Please try again later.');
    }

    try {
      // Validate current token before refresh
      if (accessToken && !isTokenExpired(accessToken)) {
        return accessToken;
      }

      const newToken = await AuthService.refreshToken();

      // Validate new token
      if (!newToken || isTokenExpired(newToken)) {
        throw new Error('Invalid token received from server');
      }

      setAccessToken(newToken);

      if (profile) {
        secureSessionUtils.saveSession(newToken, profile);
      }

      return newToken;
    } catch (error) {
      logError('Refresh failed:', error);
      setProfile(null);
      setAccessToken(null);
      secureSessionUtils.clearSession();
      return null;
    }
  }, [profile, accessToken]);

  // ฟังก์ชัน fetch profile with auto refresh and validation
  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      // Validate token before making request
      if (!token || isTokenExpired(token)) {
        throw new Error('Invalid or expired token');
      }

      const profileData = await ProfileService.fetchProfile(token);

      // Validate profile data
      if (!profileData || !profileData.user_id) {
        throw new Error('Invalid profile data received');
      }

      secureSessionUtils.saveSession(token, profileData);
      setProfile(profileData);
      return profileData;
    } catch (error) {
      logError('Failed to fetch profile:', error);
      throw error;
    }
  }, []);

  const setAuthData = useCallback((token: string, userProfile: UserProfile) => {
    // Validate inputs
    if (!token || !userProfile || !userProfile.user_id) {
      throw new Error('Invalid token or user profile data');
    }

    if (isTokenExpired(token)) {
      throw new Error('Token is expired');
    }

    setAccessToken(token);
    setProfile(userProfile);
    secureSessionUtils.saveSession(token, userProfile);
  }, []);

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setProfile(null);
    secureSessionUtils.clearSession();
  }, []);

  return {
    accessToken,
    profile,
    isInitialized,
    setIsInitialized,
    loadSession,
    handleRefreshToken,
    fetchUserProfile,
    setAuthData,
    clearAuthData,
  };
};

export default useAuth;
