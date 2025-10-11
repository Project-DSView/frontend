import axios from 'axios';
import { getAnnouncements as apiGetAnnouncements } from '@/api';
import { AnnouncementsResponse, AnnouncementsParams } from '@/types';
import AuthService from '../auth/auth.service';

class AnnouncementsService {
  // Get announcements for a course
  static async getAnnouncements(
    token: string,
    courseId: string,
    params?: AnnouncementsParams,
  ): Promise<AnnouncementsResponse | null> {
    try {
      return await apiGetAnnouncements(token, courseId, params);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiGetAnnouncements(newToken, courseId, params);
        }
      }
      // Return null if error occurs
      return null;
    }
  }
}

export default AnnouncementsService;
