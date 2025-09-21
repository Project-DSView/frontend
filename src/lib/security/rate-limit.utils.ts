import { RateLimitConfig, RateLimitEntry } from '@/types';

/**
 * In-memory rate limiting store
 * In production, this should be backed by a persistent store
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if action is rate limited
 */
const isRateLimited = (config: RateLimitConfig): boolean => {
  const now = Date.now();
  const key = config.key;
  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First attempt
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }

  // Check if window has expired
  if (now > entry.resetTime) {
    // Reset the counter
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }

  // Check if limit exceeded
  if (entry.attempts >= config.maxAttempts) {
    return true;
  }

  // Increment attempts
  entry.attempts++;
  rateLimitStore.set(key, entry);
  return false;
};

/**
 * Get remaining attempts
 */
const getRemainingAttempts = (config: RateLimitConfig): number => {
  const entry = rateLimitStore.get(config.key);
  if (!entry) {
    return config.maxAttempts;
  }

  const now = Date.now();
  if (now > entry.resetTime) {
    return config.maxAttempts;
  }

  return Math.max(0, config.maxAttempts - entry.attempts);
};

/**
 * Get time until reset
 */
const getTimeUntilReset = (config: RateLimitConfig): number => {
  const entry = rateLimitStore.get(config.key);
  if (!entry) {
    return 0;
  }

  const now = Date.now();
  return Math.max(0, entry.resetTime - now);
};

/**
 * Clear rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

/**
 * Clear all rate limits
 */
const clearAllRateLimits = (): void => {
  rateLimitStore.clear();
};

/**
 * Predefined rate limit configurations
 */
const RATE_LIMIT_CONFIGS = {
  // Login attempts: 5 attempts per 15 minutes
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    key: 'login',
  },

  // API calls: 100 requests per minute
  API_CALLS: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    key: 'api_calls',
  },

  // Password reset: 3 attempts per hour
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    key: 'password_reset',
  },

  // Token refresh: 10 attempts per 5 minutes
  TOKEN_REFRESH: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    key: 'token_refresh',
  },
} as const;

/**
 * Rate limit decorator for functions
 */
const withRateLimit = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  config: RateLimitConfig,
): T => {
  return ((...args: unknown[]) => {
    if (isRateLimited(config)) {
      const remainingTime = getTimeUntilReset(config);
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`,
      );
    }

    return fn(...args);
  }) as T;
};

/**
 * Clean up expired entries periodically
 */
const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

export {
  isRateLimited,
  getRemainingAttempts,
  cleanupExpiredEntries,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
  clearAllRateLimits,
  getTimeUntilReset,
};
