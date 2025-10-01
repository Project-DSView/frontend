/**
 * Generate a random CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token securely
 */
export const storeCSRFToken = (token: string): void => {
  try {
    // Store in sessionStorage (not localStorage for security)
    sessionStorage.setItem('csrfToken', token);
  } catch (error) {
    console.error('Failed to store CSRF token:', error);
  }
};

/**
 * Get CSRF token from storage
 */
export const getCSRFToken = (): string | null => {
  try {
    return sessionStorage.getItem('csrfToken');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
};

/**
 * Clear CSRF token
 */
export const clearCSRFToken = (): void => {
  try {
    sessionStorage.removeItem('csrfToken');
  } catch (error) {
    console.error('Failed to clear CSRF token:', error);
  }
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  if (!storedToken || !token) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(storedToken, token);
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Initialize CSRF protection
 */
export const initializeCSRFProtection = (): string => {
  const token = generateCSRFToken();
  storeCSRFToken(token);
  return token;
};

/**
 * Get CSRF headers for API requests
 * Only include CSRF token if available and not in development mode
 */
export const getCSRFHeaders = (): Record<string, string> => {
  const token = getCSRFToken();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, only include basic headers to avoid CORS issues
  if (isDevelopment) {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'dsview-api-key': process.env.NEXT_PUBLIC_API_KEY || (() => {
        throw new Error('NEXT_PUBLIC_API_KEY is required');
      })(),
    };
  }

  // In production, include CSRF token if available
  if (!token) {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'dsview-api-key': process.env.NEXT_PUBLIC_API_KEY || (() => {
        throw new Error('NEXT_PUBLIC_API_KEY is required');
      })(),
    };
  }

  return {
    'X-CSRF-Token': token,
    'X-Requested-With': 'XMLHttpRequest',
    'dsview-api-key': process.env.NEXT_PUBLIC_API_KEY || (() => {
      throw new Error('NEXT_PUBLIC_API_KEY is required');
    })(),
  };
};

/**
 * Get minimal headers for development (CORS-safe)
 */
export const getMinimalHeaders = (): Record<string, string> => {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'dsview-api-key': process.env.NEXT_PUBLIC_API_KEY || (() => {
      throw new Error('NEXT_PUBLIC_API_KEY is required');
    })(),
  };
};
