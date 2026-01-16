// Animations
export * from './utils/animations';

// Drag Drop
export {
  delay,
  createExecutionStep,
  addToExecutionHistory,
  validateOperationInput,
  formatExecutionMessage,
} from './dragdrop/execution';

// Query
export { devUtils, devToolsConfig } from './query/dev-tools';

export { createQueryClient } from './query/query-client';

// Security
export { sessionUtils, clearAllCookies, removeQueryParams } from './security/auth';

// Error
export {
  getErrorMessage,
  getStatusErrorMessage,
  getErrorDetails,
  isNetworkError,
  isAuthError,
  isValidationError,
  formatErrorForDisplay,
  logError,
} from './error/error';

export {
  setCookie,
  getCookie,
  deleteCookie,
  clearAllCookies as clearAllCookiesSecure,
  areCookiesEnabled,
  getAllCookies,
} from './security/cookie';

export {
  getSafeHeaders,
  isOriginAllowed,
  getAllowedHeaders,
  getAllowedMethods,
  shouldIncludeCredentials,
  generateCORSHeaders,
  handleCORSPreflight,
  DEFAULT_CORS_CONFIG,
} from './security/cors';

export {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  clearCSRFToken,
  validateCSRFToken,
  initializeCSRFProtection,
  getCSRFHeaders,
  getMinimalHeaders,
} from './security/csrf';

export {
  decodeJWT,
  isTokenExpired,
  isTokenExpiringSoon,
  isValidJWTFormat,
  getUserIdFromToken,
  getTokenExpirationTime,
  getTimeUntilExpiration,
} from './security/jwt';

export {
  isRateLimited,
  getRemainingAttempts,
  getTimeUntilReset,
  clearRateLimit,
  clearAllRateLimits,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
  cleanupExpiredEntries,
} from './security/rate-limit';

export { secureSessionUtils } from './security/secure-session';

export {
  validateCodeSecurity,
  validatePythonCodeSecurity,
  validateJSCodeSecurity,
} from './security/code-validation';

export {
  executeCodeSafely,
  createCodeExecutor,
  executeCodeWithService,
  executeCodeBatch,
  executeCodeWithTimeout,
} from './security/code-execution';

// Utils
export { ExportUtils } from './utils/export';
export {
  isValidImageUrl,
  getCourseImageFallback,
  transformImageUrl,
  transformFileUrl,
} from './utils/image';
export { default as cn } from './utils/utils';
export { getEmbedUrl, isSupportedVideoPlatform, getVideoPlatform } from './utils/video';
export { getRoleBadgeStyle, getRoleDisplayName, isValidRole } from './utils/role';
export {
  downloadFile,
  shouldDownloadFile,
  getFileExtension,
  getSafeFilename,
} from './utils/download';
export { formatDate, formatDateShort, formatTime, isDeadlinePassed } from './utils/date';
export {
  getDisplayFilename,
  formatFileSize,
  formatFileSizeForDisplay,
  openFilePreview,
  downloadFileDirect,
} from './utils/file';

export { getFlattenedLinks, getProcessedPlaygroundItems } from './utils/playground';
export {
  MEMORY_LIMIT_BYTES,
  SIGNIFICANT_MEMORY_THRESHOLD,
  SIGNIFICANT_TIME_THRESHOLD,
  formatMemory,
  formatTime as formatPerformanceTime,
  truncateCode,
  getTimeLevel,
  getSpaceLevel,
} from './utils/performance';

// Schemas
export { pdfSubmissionSchema } from './schemas/pdf-submission.schema';
export { gradingSchema } from './schemas/grading.schema';
export { courseSchema } from './schemas/course.schema';
export {
  materialSchema,
  documentMaterialSchema,
  videoMaterialSchema,
  codeExerciseMaterialSchema,
  pdfExerciseMaterialSchema,
} from './schemas/material.schema';
