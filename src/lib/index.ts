// Animations
export * from './animations';

// Drag Drop
export {
  delay,
  createExecutionStep,
  addToExecutionHistory,
  validateOperationInput,
  formatExecutionMessage,
} from './dragdrop/execution.utils';

// Query
export { devUtils, devToolsConfig } from './query/dev-tools';

export { createQueryClient } from './query/query-client';

// Security
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
  decodeJWT,
  isTokenExpired,
  isTokenExpiringSoon,
  isValidJWTFormat,
  getUserIdFromToken,
  getTokenExpirationTime,
  getTimeUntilExpiration,
} from './security/jwt.utils';

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

export { secureSessionUtils } from './security/secure-session.utils';

export {
  validateCodeSecurity,
  validatePythonCodeSecurity,
  validateJSCodeSecurity,
} from './security/code-validation.utils';

export {
  executeCodeSafely,
  createCodeExecutor,
  executeCodeWithService,
  executeCodeBatch,
  executeCodeWithTimeout,
} from './security/code-execution.utils';

// Utils
export { ExportUtils } from './utils/export.utils';

export { isValidImageUrl, getCourseImageFallback } from './utils/image.utils';

export { default as cn } from './utils/utils';

// Video
export { 
  getEmbedUrl, 
  isSupportedVideoPlatform, 
  getVideoPlatform 
} from './video';
