import { AnnouncementsResponse } from '@/types';
import { api } from '../index';

// Get announcements for a course
const getAnnouncements = async (
  token: string,
  courseId: string,
  params?: {
    week?: number;
    limit?: number;
    offset?: number;
  },
): Promise<AnnouncementsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('course_id', courseId);

  if (params?.week !== undefined) {
    queryParams.append('week', params.week.toString());
  }
  if (params?.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.offset !== undefined) {
    queryParams.append('offset', params.offset.toString());
  }

  const res = await api.get(`/api/announcements?${queryParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export { getAnnouncements };
