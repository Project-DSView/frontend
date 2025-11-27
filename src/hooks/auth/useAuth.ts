import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, UseAuthReturn } from '@/types';
import { ProfileService, AuthService } from '@/services';
import { useGoogleAuthUrl } from '@/query';
import {
  secureSessionUtils,
  getErrorMessage,
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize CSRF protection
  useEffect(() => {
    initializeCSRFProtection();
  }, []);

  // Initialize session securely on hook mount
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      setError(null);

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
        const errorMessage = getErrorMessage(error) || 'Failed to initialize session';
        setError(errorMessage);
        secureSessionUtils.clearSession();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
      const errorMessage = getErrorMessage(error) || 'Failed to load session';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ฟังก์ชัน refresh token with rate limiting
  const handleRefreshToken = useCallback(async () => {
    // Check rate limit
    if (isRateLimited(RATE_LIMIT_CONFIGS.TOKEN_REFRESH)) {
      const errorMessage = 'Too many token refresh attempts. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    setIsLoading(true);
    setError(null);

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
      const errorMessage = getErrorMessage(error) || 'Token refresh failed';
      setError(errorMessage);
      setProfile(null);
      setAccessToken(null);
      secureSessionUtils.clearSession();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [profile, accessToken]);

  // ฟังก์ชัน fetch profile with auto refresh and validation
  const fetchUserProfile = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);

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

      // Debug: Log fetched profile
      console.log('[useAuth] Fetched profile data:', profileData);
      console.log('[useAuth] is_teacher from fetched data:', profileData.is_teacher);

      // Validate profile data
      if (!profileData || !profileData.user_id) {
        throw new Error('Invalid profile data received');
      }

      await secureSessionUtils.saveSession(token, profileData);
      setProfile(profileData);
      console.log('[useAuth] Profile saved to session and state');
      return profileData;
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Failed to fetch profile';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuthData = useCallback(async (token: string, userProfile: UserProfile) => {
    setIsLoading(true);
    setError(null);

    try {
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
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Failed to set auth data';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setProfile(null);
    setError(null);
    secureSessionUtils.clearSession();
  }, []);

  return {
    accessToken,
    profile,
    isInitialized,
    isLoading,
    error,
    setIsInitialized,
    loadSession,
    handleRefreshToken,
    fetchUserProfile,
    setAuthData,
    clearAuthData,
  };
};

const useGoogleAuth = () => {
  return useGoogleAuthUrl();
};

export { useAuth, useGoogleAuth };
