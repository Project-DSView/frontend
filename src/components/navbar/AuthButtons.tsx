'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGoogleAuth, useAuth } from '@/hooks';
import { useLogout } from '@/query';
import {
  clearAllCookies,
  removeQueryParams,
  getErrorMessage,
  logError,
  RATE_LIMIT_CONFIGS,
  isRateLimited,
  isTokenExpired,
  isValidJWTFormat,
  getTokenExpirationTime,
} from '@/lib';
import { User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AuthButtons: React.FC = () => {
  const { refetch, isFetching } = useGoogleAuth();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutMutation = useLogout();

  const { profile, accessToken, isInitialized, fetchUserProfile, setAuthData, clearAuthData } =
    useAuth();

  // ฟังก์ชัน logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutMutation.mutateAsync();
      clearAuthData();
      clearAllCookies();

      toast.success('Logged out successfully');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logError('Logout failed:', error);
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1000);
    }
  };

  // Handle token from URL - SECURITY RISK: Remove this in production
  useEffect(() => {
    const handleTokenFromUrl = async () => {
      if (!isInitialized || !tokenFromUrl) return;

      // SECURITY WARNING: Token in URL is a security risk
      console.warn(
        'SECURITY WARNING: Token received via URL parameter. This should be avoided in production.',
      );

      try {
        // Validate token format first
        if (!isValidJWTFormat(tokenFromUrl)) {
          throw new Error('Invalid token format');
        }

        // Check if token is expired
        if (isTokenExpired(tokenFromUrl)) {
          throw new Error('Token is expired');
        }

        const profileData = await fetchUserProfile(tokenFromUrl);
        setAuthData(tokenFromUrl, profileData);
        toast.success(`Welcome back ${profileData.firstname} ${profileData.lastname}`);
      } catch (error) {
        logError('Failed to fetch profile from URL token:', error);
        toast.error('Failed to login with provided token');
      } finally {
        // Always remove token from URL for security
        removeQueryParams();
      }
    };

    handleTokenFromUrl();
  }, [isInitialized, tokenFromUrl, fetchUserProfile, setAuthData]);

  // Validate existing session in background (delayed) - OPTIMIZED
  useEffect(() => {
    if (!isInitialized || !profile || !accessToken || tokenFromUrl) return;

    const validateSession = async () => {
      try {
        // Only validate if token is close to expiry (within 5 minutes)
        const tokenExpiry = getTokenExpirationTime(accessToken);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (tokenExpiry && tokenExpiry - now > fiveMinutes) {
          // Token is still valid for more than 5 minutes, skip validation
          return;
        }

        await fetchUserProfile(accessToken);
      } catch (error) {
        logError('Session validation failed:', error);
        clearAuthData();
      }
    };

    // Delay validation to avoid blocking UI - increased from 2s to 30s
    const timeoutId = setTimeout(validateSession, 30000);
    return () => clearTimeout(timeoutId);
  }, [isInitialized, profile, accessToken, tokenFromUrl, fetchUserProfile, clearAuthData]);

  const handleMyProfile = () => {
    // TODO: Navigate to profile page
    toast.info('Profile page coming soon!');
  };

  const handleLogin = async () => {
    if (isLoggingOut) {
      toast.info('Please wait, logging out...');
      return;
    }

    // Check rate limit
    if (isRateLimited(RATE_LIMIT_CONFIGS.LOGIN)) {
      toast.error('Too many login attempts. Please try again later.');
      return;
    }

    try {
      const { data } = await refetch();

      if (data?.data.token) {
        // Validate token before using
        if (!isValidJWTFormat(data.data.token)) {
          throw new Error('Invalid token format received from server');
        }

        if (isTokenExpired(data.data.token)) {
          throw new Error('Token is already expired');
        }

        const profileData = await fetchUserProfile(data.data.token);
        setAuthData(data.data.token, profileData);
        toast.success(`Welcome ${profileData.firstname} ${profileData.lastname}`);
      } else if (data?.data.auth_url) {
        toast.success('Redirecting to Google login...');
        window.location.href = data.data.auth_url;
      } else {
        toast.error('No auth URL or token received from server');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logError('Login failed:', error);
      toast.error(errorMessage);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <Button
        className="flex items-center space-x-2 rounded-lg bg-gray-900 px-3 py-1.5 text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md sm:px-4"
        onClick={handleLogin}
        disabled={isFetching || isLoggingOut}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full">
          <User size={20} />
        </div>
        <span>Login with Google</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 rounded-lg px-3 py-1.5 hover:bg-gray-100"
        >
          <div className="flex items-center space-x-2">
            {profile.profile_img ? (
              <Image
                src={profile.profile_img}
                alt={`${profile.firstname} ${profile.lastname}`}
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  {profile.firstname.charAt(0)}
                  {profile.lastname.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {profile.firstname} {profile.lastname}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm text-gray-500">
          Signed in as <span className="font-medium text-gray-900">{profile.email}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleMyProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border border-red-600 border-t-transparent"></div>
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <span>Logout</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButtons;
