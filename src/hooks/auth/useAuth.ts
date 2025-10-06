import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, UseAuthReturn } from '@/types';
import { ProfileService, AuthService } from '@/services';
import {
  secureSessionUtils,
  logError,
  isTokenExpired,
  isValidJWTFormat,
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
    const initializeSession = async () => {
      try {
        const sessionData = await secureSessionUtils.loadSession();
        const isValid = await secureSessionUtils.isSessionValid();

        if (sessionData && isValid) {
          setAccessToken(sessionData.token);
          setProfile(sessionData.profile);
        } else {
          // Clear invalid session
          secureSessionUtils.clearSession();
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        secureSessionUtils.clearSession();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const sessionData = await secureSessionUtils.loadSession();
      const isValid = await secureSessionUtils.isSessionValid();

      if (sessionData && isValid) {
        setAccessToken(sessionData.token);
        setProfile(sessionData.profile);
        return sessionData;
      }
      return null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
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
        await secureSessionUtils.saveSession(newToken, profile);
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
      // Validate token format first
      if (!token || !isValidJWTFormat(token)) {
        throw new Error('Invalid token format');
      }

      // Validate token before making request
      if (isTokenExpired(token)) {
        throw new Error('Token is expired');
      }

      const profileData = await ProfileService.fetchProfile(token);

      // Validate profile data
      if (!profileData || !profileData.user_id) {
        throw new Error('Invalid profile data received');
      }

      await secureSessionUtils.saveSession(token, profileData);
      setProfile(profileData);
      return profileData;
    } catch (error) {
      logError('Failed to fetch profile:', error);
      throw error;
    }
  }, []);

  const setAuthData = useCallback(async (token: string, userProfile: UserProfile) => {
    // Validate inputs
    if (!token || !userProfile || !userProfile.user_id) {
      throw new Error('Invalid token or user profile data');
    }

    // Validate token format
    if (!isValidJWTFormat(token)) {
      throw new Error('Invalid token format');
    }

    if (isTokenExpired(token)) {
      throw new Error('Token is expired');
    }

    setAccessToken(token);
    setProfile(userProfile);
    await secureSessionUtils.saveSession(token, userProfile);
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
