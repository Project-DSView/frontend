import { CORSConfig } from '@/types';

/**
 * Default CORS configuration
 */
export const DEFAULT_CORS_CONFIG: CORSConfig = {
  allowedOrigins: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3001',
    'https://localhost:3001',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
};

/**
 * Get safe headers for API requests based on environment
 */
export const getSafeHeaders = (): Record<string, string> => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const baseHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // In development, only include basic headers to avoid CORS issues
  if (isDevelopment) {
    return baseHeaders;
  }

  // In production, include additional security headers
  return {
    ...baseHeaders,
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };
};

/**
 * Check if origin is allowed
 */
export const isOriginAllowed = (origin: string): boolean => {
  return DEFAULT_CORS_CONFIG.allowedOrigins.includes(origin);
};

/**
 * Get allowed headers for CORS preflight
 */
export const getAllowedHeaders = (): string[] => {
  return DEFAULT_CORS_CONFIG.allowedHeaders;
};

/**
 * Get allowed methods for CORS preflight
 */
export const getAllowedMethods = (): string[] => {
  return DEFAULT_CORS_CONFIG.allowedMethods;
};

/**
 * Check if credentials should be included
 */
export const shouldIncludeCredentials = (): boolean => {
  return DEFAULT_CORS_CONFIG.credentials;
};

/**
 * Generate CORS headers for server response
 */
export const generateCORSHeaders = (origin?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': DEFAULT_CORS_CONFIG.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': DEFAULT_CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': DEFAULT_CORS_CONFIG.credentials.toString(),
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
};

/**
 * Handle CORS preflight request
 */
export const handleCORSPreflight = (
  origin?: string,
): { statusCode: number; headers: Record<string, string> } => {
  return {
    statusCode: 200,
    headers: generateCORSHeaders(origin),
  };
};
