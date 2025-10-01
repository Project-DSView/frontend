// Dev Tools
export { devUtils, devToolsConfig } from './dev-tools';

// Drag Drop
export {
  delay,
  createExecutionStep,
  addToExecutionHistory,
  validateOperationInput,
  formatExecutionMessage,
} from './dragdrop/execution.utils';

// Export utilities
export { ExportUtils } from './export.utils';

// Security utilities
export {
  decodeJWT,
  isTokenExpired,
  isTokenExpiringSoon,
  isValidJWTFormat,
  getUserIdFromToken,
  getTokenExpirationTime,
  getTimeUntilExpiration,
} from './security/jwt.utils';

export {
  sessionUtils,
  clearAllCookies,
  removeQueryParams,
  getErrorMessage,
  logError,
} from './security/auth.utils';

export {
  setCookie,
  getCookie,
  deleteCookie,
  clearAllCookies as clearAllCookiesSecure,
  areCookiesEnabled,
  getAllCookies,
} from './security/cookie.utils';

export { secureSessionUtils } from './security/secure-session.utils';

export {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  clearCSRFToken,
  validateCSRFToken,
  initializeCSRFProtection,
  getCSRFHeaders,
  getMinimalHeaders,
} from './security/csrf.utils';

export {
  isRateLimited,
  getRemainingAttempts,
  getTimeUntilReset,
  clearRateLimit,
  clearAllRateLimits,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
  cleanupExpiredEntries,
} from './security/rate-limit.utils';

export {
  getSafeHeaders,
  isOriginAllowed,
  getAllowedHeaders,
  getAllowedMethods,
  shouldIncludeCredentials,
  generateCORSHeaders,
  handleCORSPreflight,
  DEFAULT_CORS_CONFIG,
} from './security/cors.utils';

// Query Client
export { createQueryClient } from './query-client';

// Utils
export { default as cn } from './utils';
