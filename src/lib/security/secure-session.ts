import { setCookie, getCookie, deleteCookie, clearAllCookies, areCookiesEnabled } from './cookie';
import { isTokenExpired, isValidJWTFormat, getTimeUntilExpiration } from './jwt';
import { encryptObject, decryptObject, isEncryptionSupported } from './encryption';
import { UserProfile, SecureSessionData } from '@/types';

const secureSessionUtils = {
  saveSession: async (token: string, userProfile: UserProfile): Promise<void> => {
    try {
      // Validate token before saving
      if (!isValidJWTFormat(token)) {
        throw new Error('Invalid token format');
      }

      if (isTokenExpired(token)) {
        throw new Error('Token is already expired');
      }

      // Check if encryption is supported
      if (!isEncryptionSupported()) {
        console.warn('Encryption not supported, storing data without encryption');
        // Fallback to unencrypted storage
        const profileData = {
          ...userProfile,
          savedAt: Date.now(),
        };
        setCookie('userProfile', JSON.stringify(profileData), {
          maxAge: 10800, // 3 hours
          path: '/',
        });
      } else {
        // Store profile in encrypted secure cookie
        const profileData = {
          ...userProfile,
          savedAt: Date.now(),
        };

        // Encrypt profile data before storing
        const encryptedProfile = await encryptObject(profileData);
        setCookie('userProfile', encryptedProfile, {
          maxAge: 10800, // 3 hours
          path: '/',
        });
      }

      // Store token expiration time for client-side checks
      const expirationTime = getTimeUntilExpiration(token);
      if (expirationTime !== null) {
        setCookie('tokenExpiresAt', (Date.now() + expirationTime * 60 * 1000).toString(), {
          maxAge: 10800, // 3 hours
          path: '/',
        });
      }

      // Store authentication status in secure cookie
      setCookie('isAuthenticated', 'true', {
        maxAge: 10800, // 3 hours
        path: '/',
      });

      // Store user ID in secure cookie
      setCookie('userId', userProfile.user_id || '', {
        maxAge: 10800, // 3 hours
        path: '/',
      });

      // Store token in localStorage for client-side access
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
      }
    } catch (error) {
      console.error('Failed to save session securely:', error);
      // Clear any partial data
      secureSessionUtils.clearSession();
    }
  },

  /**
   * Load session data securely with decryption
   * Note: Token should be retrieved from httpOnly cookie by server
   */
  loadSession: async (): Promise<SecureSessionData | null> => {
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

      let profileData;

      // Try to decrypt data first, fallback to plain JSON if decryption fails
      if (isEncryptionSupported()) {
        try {
          profileData = await decryptObject(profileStr);
        } catch (decryptError) {
          console.warn('Failed to decrypt profile data, trying plain JSON:', decryptError);
          // Fallback to plain JSON parsing
          profileData = JSON.parse(profileStr);
        }
      } else {
        // Fallback to plain JSON parsing
        profileData = JSON.parse(profileStr);
      }

      // Check if profile data is not too old (max 3 hours)
      const maxAge = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
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

      // For client-side session management, we need to get the actual token
      // Check if we have a stored token in localStorage as fallback
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken');
      }

      // If no token found, return null to indicate no valid session
      if (!token) {
        console.warn('No valid token found in session');
        return null;
      }

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

      // Clear authentication cookies
      deleteCookie('isAuthenticated');
      deleteCookie('userId');

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }

      // Clear all other cookies (for logout)
      clearAllCookies();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  /**
   * Check if session is valid and not expired
   */
  isSessionValid: async (): Promise<boolean> => {
    try {
      const sessionData = await secureSessionUtils.loadSession();
      if (!sessionData) {
        return false;
      }

      // For client-side session management, we only check if session data exists
      // and if cookie shows user is authenticated
      const isAuthenticated = getCookie('isAuthenticated') === 'true';

      if (!isAuthenticated) {
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
  getUserId: async (): Promise<string | null> => {
    try {
      const sessionData = await secureSessionUtils.loadSession();
      return sessionData?.profile?.user_id || null;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      return null;
    }
  },

  /**
   * Get user role from session profile (secure)
   */
  getUserRole: async (): Promise<string | null> => {
    try {
      const sessionData = await secureSessionUtils.loadSession();
      if (!sessionData) {
        return null;
      }

      // Get role from profile data stored in secure cookie
      const profile = sessionData.profile;
      if (!profile) {
        return null;
      }

      // Return role from profile
      return profile.is_teacher ? 'teacher' : 'student';
    } catch (error) {
      console.error('Failed to get user role from profile:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const isAuthCookie = getCookie('isAuthenticated') === 'true';
      const isSessionValid = await secureSessionUtils.isSessionValid();
      return isAuthCookie && isSessionValid;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  },
};

export { secureSessionUtils };
