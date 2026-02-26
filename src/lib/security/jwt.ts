import { JWTPayload } from '@/types';

/**
 * Decode JWT token without verification (client-side only)
 * Note: This is for display purposes only, server should always verify
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Validate input
    if (!token || typeof token !== 'string') {
      console.error('Invalid token input:', token);
      return null;
    }

    // Clean token
    const cleanToken = token.trim();

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format - parts count:', parts.length);
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Check if JWT token will expire soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: string, minutesThreshold: number = 5): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const thresholdTime = currentTime + minutesThreshold * 60;
  return payload.exp < thresholdTime;
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return payload.exp * 1000; // Convert to milliseconds
};

/**
 * Get time until token expires in minutes
 */
export const getTimeUntilExpiration = (token: string): number | null => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return null;
  }

  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;

  if (timeUntilExpiration <= 0) {
    return 0;
  }

  return Math.floor(timeUntilExpiration / (1000 * 60)); // Convert to minutes
};

/**
 * Validate JWT token format and basic structure
 */
export const isValidJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const cleanToken = token.trim();
  const parts = cleanToken.split('.');

  if (parts.length !== 3) {
    return false;
  }

  // Check if all parts are base64 encoded
  try {
    parts.forEach((part, index) => {
      if (!part || part.length === 0) {
        throw new Error(`Empty part at index ${index}`);
      }
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract user ID from JWT token
 */
export const getUserIdFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.sub || null;
};
