interface CourseCreator {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_teacher: boolean;
  profile_img: string;
  created_at: string;
  updated_at: string;
}

interface Course {
  course_id: string;
  name: string;
  description: string;
  image_url?: string;
  created_by: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  enrollment_count: number;
  exercise_count: number;
  creator: CourseCreator;
  enroll_key?: string; // Only visible to teachers/creators
}

interface CoursePagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface CourseListResponse {
  success: boolean;
  data: {
    courses: Course[];
    pagination: CoursePagination;
  };
}

interface CourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

// Course query parameters
interface CourseQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'archived';
  search?: string;
}

// Leaderboard types
interface LeaderboardEntry {
  UserID: string;
  CourseID: string;
  TotalScore: number;
  LastUpdated: string;
  CreatedAt: string;
}

interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: LeaderboardEntry[];
}

export type {
  Course,
  CourseCreator,
  CoursePagination,
  CourseListResponse,
  CourseResponse,
  CourseQueryParams,
  LeaderboardEntry,
  LeaderboardResponse,
};
