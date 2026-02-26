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

interface ExecutionResult<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

interface CodeExecutionConfig<T> {
  service: unknown; // Service class for executing operations
  initialData: T;
  parseCode: (code: string) => { operations: unknown[]; isValid: boolean; errors: string[] };
  executeOperations: (operations: unknown[]) => T;
}

interface SecurityStatus {
  isSafe: boolean;
  violations: string[];
  warnings: string[];
}

interface CodeValidationConfig {
  dangerousImports?: string[];
  dangerousFunctions?: string[];
  allowedImports?: string[];
  allowedFunctions?: string[];
}

export type {
  CookieOptions,
  CORSConfig,
  JWTPayload,
  RateLimitConfig,
  RateLimitEntry,
  SecureSessionData,
  ExecutionResult,
  CodeExecutionConfig,
  SecurityStatus,
  CodeValidationConfig,
};
