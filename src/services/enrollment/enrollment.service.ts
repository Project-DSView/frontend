import axios from 'axios';

import {
  getMyEnrollment as apiGetMyEnrollment,
  enrollInCourse as apiEnrollInCourse,
  unenrollFromCourse as apiUnenrollFromCourse,
  getCourseEnrollments as apiGetCourseEnrollments,
} from '@/api';
import {
  MyEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  CourseEnrollmentsResponse,
} from '@/types';
import AuthService from '../auth/auth.service';

class EnrollmentService {
  // Get my enrollment status
  static async getMyEnrollment(
    token: string,
    courseId: string,
  ): Promise<MyEnrollmentResponse | null> {
    try {
      return await apiGetMyEnrollment(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiGetMyEnrollment(newToken, courseId);
        }
      }
      // Return null if not enrolled (404 or other errors)
      return null;
    }
  }

  // Enroll in course
  static async enrollInCourse(
    token: string,
    courseId: string,
    enrollmentData: EnrollmentRequest,
  ): Promise<EnrollmentResponse> {
    try {
      return await apiEnrollInCourse(token, courseId, enrollmentData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiEnrollInCourse(newToken, courseId, enrollmentData);
        }
      }
      throw error;
    }
  }

  // Unenroll from course
  static async unenrollFromCourse(token: string, courseId: string): Promise<void> {
    try {
      return await apiUnenrollFromCourse(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiUnenrollFromCourse(newToken, courseId);
        }
      }
      throw error;
    }
  }

  // Get course enrollments
  static async getCourseEnrollments(
    token: string,
    courseId: string,
  ): Promise<CourseEnrollmentsResponse | null> {
    try {
      return await apiGetCourseEnrollments(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiGetCourseEnrollments(newToken, courseId);
        }
      }
      // Return null if error (not accessible or other errors)
      return null;
    }
  }
}

export default EnrollmentService;
