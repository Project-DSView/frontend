import type { UserProfile } from '@/types';

/**
 * Session Storage Helpers
 */
const sessionUtils = {
  saveSession: (token: string, userProfile: UserProfile): void => {
    try {
      sessionStorage.setItem('accessToken', token);
      sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  clearSession: (): void => {
    try {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  loadSession: (): { token: string; profile: UserProfile } | null => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const profileStr = sessionStorage.getItem('userProfile');

      if (token && profileStr) {
        const userProfile = JSON.parse(profileStr);
        return { token, profile: userProfile };
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      sessionUtils.clearSession();
    }
    return null;
  },
};

/**
 * Cookie Helpers
 */
const clearAllCookies = (): void => {
  document.cookie.split(';').forEach((c) => {
    const eqPos = c.indexOf('=');
    const name = eqPos > -1 ? c.substring(0, eqPos) : c;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  });
};

/**
 * URL Helpers
 */
const removeQueryParams = (): void => {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, '', url);
};

export { sessionUtils, clearAllCookies, removeQueryParams };
