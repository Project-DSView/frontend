// Announcement types
export interface Announcement {
  announcement_id: string;
  title: string;
  content: string;
  course_id: string;
  week: number;
  is_pinned: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementsData {
  announcements: Announcement[];
  limit: number;
  offset: number;
  total: number;
}

export interface AnnouncementsResponse {
  success: boolean;
  message: string;
  data: AnnouncementsData;
}

export interface AnnouncementsParams {
  week?: number;
  limit?: number;
  offset?: number;
}
