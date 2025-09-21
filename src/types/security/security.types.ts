import type { UserProfile } from '@/types';

interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}


interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  key: string;
}

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

interface SecureSessionData {
  token: string;
  profile: UserProfile;
  expiresAt: number;
}

export type { CookieOptions, CORSConfig, JWTPayload, RateLimitConfig, RateLimitEntry, SecureSessionData }
