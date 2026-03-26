import axios from 'axios';
import { getSafeHeaders } from '@/lib';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 90000, // 90 second timeout
  headers: {
    [process.env.NEXT_PUBLIC_API_KEY_NAME || 'dsview-api-key']:
      process.env.NEXT_PUBLIC_API_KEY || '',
  },
});

api.interceptors.request.use(
  (config) => {
    // getSafeHeaders() จัดการเรื่อง environment อยู่แล้วในตัวมันเอง
    const safeHeaders = getSafeHeaders();

    // If we're sending FormData, don't force Content-Type to application/json
    // This allows Axios/browser to set the correct multipart/form-data boundary
    // Check if data is FormData (robust check)
    const isFormData =
      config.data &&
      (config.data instanceof FormData ||
        config.data.constructor?.name === 'FormData' ||
        (typeof config.data.append === 'function' &&
          typeof config.data.get === 'function' &&
          typeof config.data.delete === 'function'));

    if (isFormData) {
      // Remove all variations of Content-Type from safeHeaders
      delete safeHeaders['Content-Type'];
      delete safeHeaders['content-type'];
      delete safeHeaders['CONTENT-TYPE'];

      // Remove all variations from config.headers as well
      if (config.headers) {
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
          config.headers.delete('CONTENT-TYPE');
        } else if (typeof config.headers === 'object') {
          delete (config.headers as Record<string, unknown>)['Content-Type'];
          delete (config.headers as Record<string, unknown>)['content-type'];
          delete (config.headers as Record<string, unknown>)['CONTENT-TYPE'];
        }
      }
    }

    // Apply headers from standard config
    if (config.headers) {
      Object.assign(config.headers, safeHeaders);
    }

    // Prevent sending the cookie-managed placeholder token as a Bearer string
    // This fixes "Invalid JWT token: failed to parse token... invalid number of segments" 401 errors
    if (config.headers && config.headers.Authorization === 'Bearer cookie-managed') {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for security
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors globally - but only for auth-related endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      // Only redirect for auth endpoints, not for playground/run
      if (url.includes('/auth/') || url.includes('/profile')) {
        // Don't redirect if this is a callback endpoint (to avoid infinite loops)
        if (url.includes('/callback')) {
          return Promise.reject(error);
        }

        // Clear session on unauthorized
        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          localStorage.removeItem('accessToken');
          // Only redirect to home if not already there to prevent infinite loops
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

// API Layer - Direct API calls only
export {
  getCourses,
  getCourse,
  deleteCourse,
  getCourseMaterials,
  getCourseMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getCourseScore,
  getAnnouncements,
  getMyEnrollment,
  enrollInCourse,
  unenrollFromCourse,
  getCourseEnrollments,
  updateEnrollmentRole,
  getSelfProgress,
  requestApproval,
  getQueueJobs,
  claimQueueJob,
  completeReview,
  createCourse,
  updateCourse,
  uploadCourseImage,
  createInvitation,
  getCourseInvitations,
  enrollViaInvitation,
} from './course';
export { executeStepthrough, analyzePerformance, analyzeWithLLM } from './playground';
export { getGoogleAuthUrl, logout, refreshToken, fetchProfile } from './auth';

// Submissions
export {
  submitPDFExercise,
  submitCodeExercise,
  getMySubmission,
  getSubmission,
  getSubmissionDownloadUrl,
  cancelSubmission,
  getCoursePDFSubmissions,
  downloadPDFSubmission,
  downloadFeedbackFile,
  approvePDFSubmission,
} from './submissions';
