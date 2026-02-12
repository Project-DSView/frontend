import axios from 'axios';
import { getSafeHeaders, getMinimalHeaders } from '@/lib';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 90000, // 90 second timeout
  headers: {
    [process.env.NEXT_PUBLIC_API_KEY_NAME || 'dsview-api-key']:
      process.env.NEXT_PUBLIC_API_KEY || '',
  },
});

// Add smart service routing and safe headers to all requests
api.interceptors.request.use(
  (config) => {
    // Smart Service Routing:
    // Some endpoints belong to FastAPI, others to Go backend.
    // Traefik expects /fastapi/api/... or /go/api/...
    if (config.url && !config.url.startsWith('http')) {
      const isFastAPI =
        config.url.startsWith('/api/playground') ||
        config.url.startsWith('/api/complexity') ||
        config.url.startsWith('/api/exec');

      const prefix = isFastAPI ? '/fastapi' : '/go';

      // Only prefix if not already prefixed (to avoid double prefixing on retries)
      if (!config.url.startsWith('/go') && !config.url.startsWith('/fastapi')) {
        config.url = `${prefix}${config.url}`;
      }
    }

    // Use minimal headers in development to avoid CORS issues
    const isDevelopment = process.env.NODE_ENV === 'development';
    const headers = isDevelopment ? getMinimalHeaders() : getSafeHeaders();
    Object.assign(config.headers, headers);

    // Add Authorization header if token exists in sessionStorage
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
          // Redirect to home page instead of login
          window.location.href = '/';
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
