import axios from 'axios';
import { getSafeHeaders, getMinimalHeaders } from '@/lib';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    [process.env.NEXT_PUBLIC_API_KEY_NAME || 'dsview-api-key']:
      process.env.NEXT_PUBLIC_API_KEY || '',
  },
});

// Add safe headers to all requests
api.interceptors.request.use(
  (config) => {
    // Use minimal headers in development to avoid CORS issues
    const isDevelopment = process.env.NODE_ENV === 'development';
    const headers = isDevelopment ? getMinimalHeaders() : getSafeHeaders();
    Object.assign(config.headers, headers);

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
export { fetchProfile } from './auth/profile';
export { getCourses, getCourse } from './course/course';
export { getCourseMaterials, getCourseMaterial } from './course/materials';
export {
  getMyEnrollment,
  enrollInCourse,
  unenrollFromCourse,
  getCourseEnrollments,
} from './enrollment/enrollment';
export { getAnnouncements } from './announcements/announcements';
export { executeStepthrough } from './stepthrough/stepthrough';
export { getGoogleAuthUrl, logout, refreshToken } from './auth/auth';

// Submissions
export {
  submitPDFExercise,
  getMySubmission,
  getSubmission,
  getSubmissionDownloadUrl,
  cancelSubmission,
} from './submissions/submissions';
