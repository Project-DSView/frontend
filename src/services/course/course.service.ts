import axios from 'axios';
import { getCourses as apiGetCourses, getCourse as apiGetCourse } from '@/api';
import { CourseListResponse, CourseResponse, CourseQueryParams } from '@/types';
import { AuthService } from '../auth/auth.service';

export class CourseService {
  // Get courses with pagination and filtering
  static async getCourses(token: string, params?: CourseQueryParams): Promise<CourseListResponse> {
    try {
      return await apiGetCourses(token, params);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiGetCourses(newToken, params);
        }
      }
      throw error;
    }
  }

  // Get single course by ID
  static async getCourse(token: string, courseId: string): Promise<CourseResponse> {
    try {
      return await apiGetCourse(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiGetCourse(newToken, courseId);
        }
      }
      throw error;
    }
  }
}
