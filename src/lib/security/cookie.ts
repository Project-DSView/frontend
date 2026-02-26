import { CookieOptions } from '@/types';

/**
 * Set a cookie with security options
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  // Auto-detect secure flag based on protocol
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  const {
    expires,
    maxAge,
    path = '/',
    domain,
    secure = isHttps, // Only set Secure flag on HTTPS connections
    sameSite = isHttps ? 'strict' : 'lax', // Use 'lax' on HTTP for cross-origin OAuth redirects
    httpOnly = false, // Cannot be set to true from client-side
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  if (httpOnly) {
    console.warn('httpOnly cannot be set from client-side JavaScript');
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  setCookie(name, '', {
    expires: new Date(0),
    path,
  });
};

/**
 * Clear all cookies (for logout)
 */
export const clearAllCookies = (): void => {
  const cookies = document.cookie.split(';');

  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name) {
      deleteCookie(name);
    }
  });
};

/**
 * Check if cookies are enabled
 */
export const areCookiesEnabled = (): boolean => {
  try {
    setCookie('test', 'test');
    const enabled = getCookie('test') === 'test';
    deleteCookie('test');
    return enabled;
  } catch {
    return false;
  }
};

/**
 * Get all cookies as an object
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(';');

  cookieArray.forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
};
