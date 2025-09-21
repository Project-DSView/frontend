import {
  setCookie,
  getCookie,
  deleteCookie,
  clearAllCookies,
  areCookiesEnabled,
} from './cookie.utils';
import {
  isTokenExpired,
  isTokenExpiringSoon,
  isValidJWTFormat,
  getTimeUntilExpiration,
} from './jwt.utils';
import { UserProfile, SecureSessionData } from '@/types';

/**
 * Secure Session Storage using cookies for sensitive data
 */
const secureSessionUtils = {
  /**
   * Save session data securely
   * Token is stored in httpOnly cookie (set by server)
   * Profile data is stored in secure cookie with short expiration
   */
  saveSession: (token: string, userProfile: UserProfile): void => {
    try {
      // Validate token before saving
      if (!isValidJWTFormat(token)) {
        throw new Error('Invalid token format');
      }

      if (isTokenExpired(token)) {
        throw new Error('Token is already expired');
      }

      // Store profile in secure cookie with short expiration (1 hour)
      const profileData = {
        ...userProfile,
        savedAt: Date.now(),
      };

      setCookie('userProfile', JSON.stringify(profileData), {
        maxAge: 3600, // 1 hour
        secure: true,
        sameSite: 'strict',
        path: '/',
      });

      // Store token expiration time for client-side checks
      const expirationTime = getTimeUntilExpiration(token);
      if (expirationTime !== null) {
        setCookie('tokenExpiresAt', (Date.now() + expirationTime * 60 * 1000).toString(), {
          maxAge: 3600,
          secure: true,
          sameSite: 'strict',
          path: '/',
        });
      }

      // Store non-sensitive data in sessionStorage for performance
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userId', userProfile.user_id || '');
      sessionStorage.setItem('userRole', String(userProfile.is_teacher || false));
    } catch (error) {
      console.error('Failed to save session securely:', error);
      // Clear any partial data
      secureSessionUtils.clearSession();
    }
  },

  /**
   * Load session data securely
   * Note: Token should be retrieved from httpOnly cookie by server
   */
  loadSession: (): SecureSessionData | null => {
    try {
      // Check if cookies are enabled
      if (!areCookiesEnabled()) {
        console.warn('Cookies are disabled. Session cannot be maintained securely.');
        return null;
      }

      // Get profile from secure cookie
      const profileStr = getCookie('userProfile');
      if (!profileStr) {
        return null;
      }

      const profileData = JSON.parse(profileStr);

      // Check if profile data is not too old (max 1 hour)
      const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
      if (Date.now() - profileData.savedAt > maxAge) {
        console.warn('Profile data is too old, clearing session');
        secureSessionUtils.clearSession();
        return null;
      }

      // Get token expiration info
      const expiresAtStr = getCookie('tokenExpiresAt');
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0;

      // Check if token is expired
      if (expiresAt && Date.now() > expiresAt) {
        console.warn('Token is expired, clearing session');
        secureSessionUtils.clearSession();
        return null;
      }

      // Note: Actual token should be retrieved from httpOnly cookie by server
      // This is a placeholder for the token
      const token = 'retrieved-from-httpOnly-cookie';

      return {
        token,
        profile: profileData,
        expiresAt,
      };
    } catch (error) {
      console.error('Failed to load session:', error);
      secureSessionUtils.clearSession();
      return null;
    }
  },

  /**
   * Clear all session data
   */
  clearSession: (): void => {
    try {
      // Clear secure cookies
      deleteCookie('userProfile');
      deleteCookie('tokenExpiresAt');

      // Clear sessionStorage
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userRole');

      // Clear all other cookies (for logout)
      clearAllCookies();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  /**
   * Check if session is valid and not expired
   */
  isSessionValid: (): boolean => {
    try {
      const sessionData = secureSessionUtils.loadSession();
      if (!sessionData) {
        return false;
      }

      // Check if token is expiring soon (within 5 minutes)
      if (isTokenExpiringSoon(sessionData.token, 5)) {
        console.warn('Token is expiring soon, should refresh');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  },

  /**
   * Get user ID from session
   */
  getUserId: (): string | null => {
    try {
      const sessionData = secureSessionUtils.loadSession();
      return sessionData?.profile?.user_id || null;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      return null;
    }
  },

  /**
   * Get user role from session
   */
  getUserRole: (): string | null => {
    try {
      return sessionStorage.getItem('userRole');
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    try {
      return (
        sessionStorage.getItem('isAuthenticated') === 'true' && secureSessionUtils.isSessionValid()
      );
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  },
};

export { secureSessionUtils };
