'use client';

import React, { useId } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import { useGoogleAuth, useAuth } from '@/hooks';
import { useLogout } from '@/query';
import { AuthResponse } from '@/types';
import {
  clearAllCookies,
  removeQueryParams,
  getErrorMessage,
  logError,
  RATE_LIMIT_CONFIGS,
  isRateLimited,
} from '@/lib';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AuthButtons: React.FC = () => {
  const { mutate: getGoogleAuth, isPending: isFetching } = useGoogleAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const logoutMutation = useLogout();
  const dropdownId = useId();

  // Prevent hydration issues by only rendering on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

      // Refresh the page after successful logout
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
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

  // Proactive profile fetch if authenticated but no profile
  useEffect(() => {
    const syncProfile = async () => {
      // Only proceed if initialized, no profile, and not currently logging out
      if (!isInitialized || profile || isLoggingOut) return;

      try {
        // Try to fetch profile - if it fails with 401, useAuth should handle cleanup
        const data = await fetchUserProfile();
        if (data) {
          setAuthData(data);
          toast.success(`Welcome back, ${data.firstname}`);
        }
      } catch (error) {
        logError('Proactive profile sync failed:', error);
      }
    };

    syncProfile();
  }, [isInitialized, profile, fetchUserProfile, setAuthData, isLoggingOut]);

  // Handle OAuth callback - Check if we're in callback mode
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!isInitialized) return;

      // Check if we're in OAuth callback mode (has token in URL)
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');

      if (success === 'true') {
        try {
          // In HttpOnly architecture, token is fetched explicitly by cookie
          const profileData = await fetchUserProfile();
          setAuthData(profileData);
          toast.success(`Welcome ${profileData.firstname} ${profileData.lastname}`);

          // Redirect to course page after successful login
          window.location.href = '/course';
        } catch (error) {
          logError('OAuth callback failed:', error);
          toast.error('Authentication failed. Please try again.');
          // Redirect to error page
          window.location.href = '/error?error=Authentication%20failed&code=auth_failed';
        } finally {
          // Clean up URL parameters
          removeQueryParams();
        }
      }
    };

    handleOAuthCallback();
  }, [isInitialized, setAuthData, fetchUserProfile]);

  // Validate existing session in background (delayed) - OPTIMIZED
  useEffect(() => {
    if (!isInitialized || !profile || !accessToken) return;

    const validateSession = async () => {
      try {
        // Fast path: profile valid
        if (profile) return;
        
        // Fallback to validating existing cookie session
        await fetchUserProfile();
      } catch (error) {
        logError('Session validation failed:', error);
        clearAuthData();
      }
    };

    // Delay validation to avoid blocking UI - increased from 2s to 30s
    const timeoutId = setTimeout(validateSession, 30000);
    return () => clearTimeout(timeoutId);
  }, [isInitialized, profile, accessToken, fetchUserProfile, clearAuthData, setAuthData]);

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
      const data = await new Promise<AuthResponse>((resolve, reject) => {
        getGoogleAuth(undefined, {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        });
      });

      if (data?.data.auth_url) {
        toast.success('Redirecting to Google login...');
        window.location.href = data.data.auth_url;
      } else if (data?.success) {
        const profileData = await fetchUserProfile();
        setAuthData(profileData);
        toast.success(`Welcome ${profileData.firstname} ${profileData.lastname}`);
        window.location.href = '/course';
      } else {
        toast.error('No auth URL or token received from server');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logError('Login failed:', error);
      toast.error(errorMessage);
    }
  };

  // Show loading state during hydration
  if (!isMounted || !isInitialized) {
    return (
      <div className="flex items-center space-x-2">
        <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2"></div>
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <Button
        className="bg-primary hover:bg-primary/90 flex items-center space-x-2 rounded-lg px-3 py-1.5 text-white shadow-sm transition-all duration-200 hover:shadow-md sm:px-4"
        onClick={handleLogin}
        disabled={isFetching || isLoggingOut}
      >
        <span>Login with Google</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-muted flex items-center space-x-2 rounded-lg px-3 py-1.5"
          id={`user-menu-trigger-${dropdownId}`}
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
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-muted-foreground text-sm font-medium">
                  {profile.firstname.charAt(0)}
                  {profile.lastname.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-foreground hidden text-sm font-medium sm:inline">
              {profile.firstname} {profile.lastname}
            </span>
          </div>
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" id={`user-menu-content-${dropdownId}`}>
        <div className="text-muted-foreground px-2 py-1.5 text-sm">
          Signed in as <span className="text-foreground font-medium">{profile.email}</span>
        </div>
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
