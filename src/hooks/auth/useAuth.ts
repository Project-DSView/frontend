import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, UseAuthReturn } from '@/types';
import { ProfileService, AuthService } from '@/services';
import { useGoogleAuthUrl } from '@/query';
import {
  secureSessionUtils,
  getErrorMessage,
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
          setAccessToken('cookie-managed');
          setProfile(sessionData.profile);
        } else {
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
        setAccessToken('cookie-managed');
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
      // We don't need to manually pass a token parameter anymore
      await AuthService.refreshToken();

      const newProfileData = await ProfileService.fetchProfile();
      setAccessToken('cookie-managed');

      if (profile) {
        await secureSessionUtils.saveSession('cookie-managed', newProfileData || profile);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Token refresh failed';
      setError(errorMessage);
      setProfile(null);
      setAccessToken(null);
      secureSessionUtils.clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // ฟังก์ชัน fetch profile with auto refresh and validation
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileData = await ProfileService.fetchProfile();

      // Validate profile data
      if (!profileData || !profileData.user_id) {
        throw new Error('Invalid profile data received');
      }

      await secureSessionUtils.saveSession('cookie-managed', profileData);
      setProfile(profileData);

      return profileData;
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Failed to fetch profile';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuthData = useCallback(async (userProfile: UserProfile) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!userProfile || !userProfile.user_id) {
        throw new Error('Invalid user profile data');
      }

      setAccessToken('cookie-managed');
      setProfile(userProfile);
      await secureSessionUtils.saveSession('cookie-managed', userProfile);
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
