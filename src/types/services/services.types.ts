// ============================================================================
// Auth Service Types
// ============================================================================
type AuthResponse = {
  data: {
    auth_url?: string;
    token?: string;
    state?: string;
  };
  success: boolean;
};

interface UserProfile {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_teacher: boolean;
  profile_img: string;
}

interface UseAuthReturn {
  accessToken: string | null;
  profile: UserProfile | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  setIsInitialized: (value: boolean) => void;
  loadSession: () => Promise<{ token: string; profile: UserProfile } | null>;
  handleRefreshToken: () => Promise<string | null>;
  fetchUserProfile: (token: string) => Promise<UserProfile>;
  setAuthData: (token: string, userProfile: UserProfile) => Promise<void>;
  clearAuthData: () => void;
}

// ============================================================================
// Course Service Types
// ============================================================================
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

interface CourseQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'archived';
  search?: string;
}

// ============================================================================
// Enrollment Service Types
// ============================================================================
interface EnrollmentStatus {
  enrollment_id: string;
  course_id: string;
  user_id: string;
  role: 'student' | 'ta' | 'teacher';
  firstname: string;
  lastname: string;
  email: string;
  enrolled_at: string;
}

interface MyEnrollmentResponse {
  success: boolean;
  data: {
    enrollment: EnrollmentStatus;
  };
}

interface EnrollmentRequest {
  enroll_key: string;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    course_id: string;
    user_id: string;
    role: 'student' | 'ta' | 'teacher';
    enrolled_at: string;
  };
}

interface CourseEnrollmentsResponse {
  success: boolean;
  data: {
    enrollments: Array<{
      enrollment_id: string;
      course_id: string;
      user_id: string;
      role: 'student' | 'ta' | 'teacher';
      firstname: string;
      lastname: string;
      email: string;
    }>;
  };
}

// ============================================================================
// Invitation Service Types
// ============================================================================
interface InvitationResponse {
  invitation_id: string;
  token: string;
  invitation_url: string;
  expires_at: string;
  created_at: string;
  is_expired?: boolean;
}

interface CreateInvitationResponse {
  success: boolean;
  message: string;
  data: InvitationResponse;
}

interface GetInvitationsResponse {
  success: boolean;
  message: string;
  data: InvitationResponse[];
}

// ============================================================================
// Material Service Types
// ============================================================================
interface MaterialCreator {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_teacher: boolean;
  profile_img: string;
  created_at: string;
  updated_at: string;
}

interface Material {
  material_id: string;
  title: string;
  description: string;
  course_id: string;
  week: number;
  type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement';
  submission_type: 'file' | 'code';
  file_name?: string;
  file_size?: number;
  file_url?: string;
  video_url?: string;
  mime_type?: string;
  deadline?: string;
  total_points?: number;
  is_graded?: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: MaterialCreator;
  // Exercise-specific fields
  example_inputs?: string[];
  example_outputs?: string[];
  problem_images?: string[];
  problem_statement?: string;
  constraints?: string;
  hints?: string;
}

interface MaterialsData {
  materials: Material[];
  limit: number;
  offset: number;
  total: number;
}

interface MaterialsResponse {
  success: boolean;
  message: string;
  data: MaterialsData;
}

interface MaterialResponse {
  success: boolean;
  message: string;
  data: Material;
}

interface MaterialsParams {
  limit?: number;
  offset?: number;
}

// ============================================================================
// Announcement Service Types
// ============================================================================
interface Announcement {
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

interface AnnouncementsData {
  announcements: Announcement[];
  limit: number;
  offset: number;
  total: number;
}

interface AnnouncementsResponse {
  success: boolean;
  message: string;
  data: AnnouncementsData;
}

interface AnnouncementsParams {
  week?: number;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Submission Service Types
// ============================================================================
type SubmissionStatus = 'pending' | 'completed' | 'error' | 'running';

interface SubmissionStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

interface TestCaseResult {
  result_id: string;
  test_case_id: string;
  status: 'passed' | 'failed';
  actual_output: unknown;
  expected_output?: unknown;
  display_name?: string;
  is_public?: boolean;
  created_at: string;
}

interface CodeSubmission {
  submission_id: string;
  user_id: string;
  material_id: string;
  code: string;
  passed_count: number;
  failed_count: number;
  total_score: number;
  status: SubmissionStatus;
  is_late_submission: boolean;
  submitted_at: string;
  results?: TestCaseResult[];
  // Queue-related fields
  queue_job_id?: string;
  queue_status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  queue_position?: number; // Position in queue (1-based)
  queue_claimed_by?: string;
  queue_claimed_by_name?: string; // firstname + lastname
  queue_processed_by_user?: {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  review_comment?: string;
  review_status?: 'approved' | 'rejected';
  reviewed_at?: string;
  lab_room?: string;
  table_number?: string;
  // Grading fields
  feedback?: string;
  graded_at?: string;
  graded_by?: string;
  graded_by_user?: {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

interface PDFSubmission {
  submission_id: string;
  user_id: string;
  material_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: SubmissionStatus;
  is_late_submission: boolean;
  feedback?: string;
  feedback_file_url?: string;
  total_score?: number;
  score?: number; // Alias for total_score
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
}

interface SubmitPDFRequest {
  file: File;
}

interface SubmitCodeRequest {
  code: string;
}

interface SubmitPDFResponse {
  success: boolean;
  message: string;
  data: PDFSubmission;
}

interface SubmitCodeResponse {
  success: boolean;
  message: string;
  data: CodeSubmission;
}

interface SubmissionResponse {
  success: boolean;
  message: string;
  data: PDFSubmission | CodeSubmission | null;
}

interface SubmissionListResponse {
  success: boolean;
  message: string;
  data: PDFSubmission[];
}

interface DownloadUrlResponse {
  success: boolean;
  message: string;
  data: {
    download_url: string;
  };
}

interface CancelSubmissionResponse {
  success: boolean;
  message: string;
}

interface CoursePDFSubmission extends PDFSubmission {
  exercise_title: string;
  submitter_name: string;
  feedback_file_url?: string;
}

interface CoursePDFSubmissionsResponse {
  success: boolean;
  message: string;
  data: CoursePDFSubmission[];
}

interface ApprovePDFSubmissionRequest {
  score: number;
  comment: string;
  feedback_file?: File;
}

interface ApprovePDFSubmissionResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Queue Service Types
// ============================================================================
type QueueJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'waiting_approval';

interface QueueJobUser {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_teacher: boolean;
}

interface QueueJobMaterial {
  material_id: string;
  title: string;
  description?: string;
  type: string;
}

interface QueueJob {
  id: string;
  type: 'review' | 'code_execution' | 'file_processing';
  status: QueueJobStatus;
  user_id: string;
  material_id: string | null;
  course_id: string | null;
  submission_id: string | null;
  lab_room: string | null;
  table_number: string | null;
  data: string; // JSON string containing additional data
  created_at: string;
  updated_at: string;
  processed_by: string | null;
  processed_by_user?: QueueJobUser; // User who processed/claimed the job
  claimed_at: string | null;
  user: QueueJobUser;
  course_material?: QueueJobMaterial;
  review_status?: 'approved' | 'rejected'; // Review status from submission
}

interface RequestApprovalRequest {
  lab_room: string;
  table_number: string;
}

interface RequestApprovalResponse {
  success: boolean;
  message: string;
  data: {
    queue_job_id: string;
    lab_room: string;
    table_number: string;
    status: QueueJobStatus;
  };
}

interface QueueJobsResponse {
  success: boolean;
  data: {
    jobs: QueueJob[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

interface ClaimJobResponse {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    claimed_by: string;
    claimed_at: string;
    lab_room: string;
    table_number: string;
  };
}

interface CompleteReviewRequest {
  status: 'approved' | 'rejected';
  comment: string;
}

interface CompleteReviewResponse {
  success: boolean;
  message: string;
  data: {
    job_id: string;
    status: 'approved' | 'rejected';
    reviewed_by: string;
    comment: string;
    completed_at: string;
  };
}

interface QueueJobFilters {
  type?: 'review';
  status?: QueueJobStatus;
  course_id?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Score Service Types
// ============================================================================
interface CourseScore {
  UserID: string;
  CourseID: string;
  TotalScore: number;
  LastUpdated: string;
  CreatedAt: string;
}

interface CourseScoreResponse {
  success: boolean;
  message: string;
  data: CourseScore | null;
}

// ============================================================================
// Progress Service Types
// ============================================================================
interface StudentProgress {
  progress_id: string;
  user_id: string;
  material_id: string;
  material_title: string;
  status: string;
  score: number;
  seat_number: string;
  last_submitted_at: string | null;
  review_status?: 'approved' | 'rejected';
}

interface SelfProgressResponse {
  success: boolean;
  message: string;
  data: {
    progress: StudentProgress[];
  };
}

// ============================================================================
// Exports
// ============================================================================
export type {
  // Auth
  AuthResponse,
  UserProfile,
  UseAuthReturn,
  // Course
  Course,
  CourseCreator,
  CoursePagination,
  CourseListResponse,
  CourseResponse,
  CourseQueryParams,
  // Enrollment
  EnrollmentStatus,
  MyEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  CourseEnrollmentsResponse,
  // Invitation
  InvitationResponse,
  CreateInvitationResponse,
  GetInvitationsResponse,
  // Material
  Material,
  MaterialCreator,
  MaterialsData,
  MaterialsResponse,
  MaterialsParams,
  MaterialResponse,
  // Announcement
  Announcement,
  AnnouncementsData,
  AnnouncementsResponse,
  AnnouncementsParams,
  // Submission
  SubmissionStatus,
  SubmissionStatusConfig,
  TestCaseResult,
  CodeSubmission,
  PDFSubmission,
  SubmitPDFRequest,
  SubmitCodeRequest,
  SubmitPDFResponse,
  SubmitCodeResponse,
  SubmissionResponse,
  SubmissionListResponse,
  DownloadUrlResponse,
  CancelSubmissionResponse,
  CoursePDFSubmission,
  CoursePDFSubmissionsResponse,
  ApprovePDFSubmissionRequest,
  ApprovePDFSubmissionResponse,
  // Queue
  QueueJobStatus,
  QueueJobUser,
  QueueJobMaterial,
  QueueJob,
  RequestApprovalRequest,
  RequestApprovalResponse,
  QueueJobsResponse,
  ClaimJobResponse,
  CompleteReviewRequest,
  CompleteReviewResponse,
  QueueJobFilters,
  // Score
  CourseScore,
  CourseScoreResponse,
  // Progress
  StudentProgress,
  SelfProgressResponse,
};
