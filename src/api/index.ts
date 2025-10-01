import axios from 'axios';
import { getSafeHeaders, getMinimalHeaders } from '@/lib';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
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
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      // Clear session on unauthorized
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        // Redirect to home page instead of login
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  },
);

// API Layer - Direct API calls only
export { fetchProfile } from './auth/profile';
export { executeStepthrough } from './stepthrough/stepthrough';
export { getGoogleAuthUrl, logout, refreshToken } from './auth/auth';
