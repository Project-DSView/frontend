import {
  CourseListResponse,
  CourseResponse,
  CourseQueryParams,
  CourseScoreResponse,
  MaterialsResponse,
  MaterialsParams,
  MaterialResponse,
  AnnouncementsResponse,
  MyEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  CourseEnrollmentsResponse,
  SelfProgressResponse,
  RequestApprovalRequest,
  RequestApprovalResponse,
  QueueJobsResponse,
  ClaimJobResponse,
  CompleteReviewRequest,
  CompleteReviewResponse,
  QueueJobFilters,
  CreateInvitationResponse,
  GetInvitationsResponse,
} from '@/types';
import { api } from '../index';

// Get courses with pagination and filtering
const getCourses = async (
  token: string,
  params?: CourseQueryParams,
): Promise<CourseListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/api/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const res = await api.get<CourseListResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get single course by ID
const getCourse = async (token: string, courseId: string): Promise<CourseResponse> => {
  const res = await api.get<CourseResponse>(`/api/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update course
const updateCourse = async (
  token: string,
  courseId: string,
  updates: {
    name?: string;
    description?: string;
    status?: 'active' | 'archived';
    enroll_key?: string;
  },
): Promise<CourseResponse> => {
  const res = await api.put<CourseResponse>(`/api/courses/${courseId}`, updates, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

// Upload course image
const uploadCourseImage = async (
  token: string,
  courseId: string,
  image: File,
): Promise<CourseResponse> => {
  const formData = new FormData();
  formData.append('image', image);

  const res = await api.post<CourseResponse>(`/api/courses/${courseId}/image`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 120000, // 2 minutes
  });
  return res.data;
};

// Get course materials with pagination
const getCourseMaterials = async (
  token: string,
  courseId: string,
  params?: MaterialsParams,
): Promise<MaterialsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('course_id', courseId);

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const url = `/api/course-materials?${queryParams.toString()}`;

  const res = await api.get<MaterialsResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get single course material by ID
const getCourseMaterial = async (token: string, materialId: string): Promise<MaterialResponse> => {
  const url = `/api/course-materials/${materialId}`;
  const res = await api.get<MaterialResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Create a new course material
 */
const createMaterial = async (
  token: string,
  courseId: string,
  type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement',
  title: string,
  description?: string | null,
  week?: number,
  isPublic?: boolean,
  // Document fields
  file?: File,
  // Video fields
  videoUrl?: string,
  // Exercise fields
  totalPoints?: number,
  deadline?: string | null,
  problemStatement?: string,
  constraints?: string | null,
  hints?: string | null,
  // Code exercise test cases
  testCases?: Array<{ input_data: string; expected_output: string; display_name?: string }>,
  // Announcement fields
  content?: string,
): Promise<MaterialResponse> => {
  const formData = new FormData();
  formData.append('CourseID', courseId);
  formData.append('Title', title);
  formData.append('Type', type);

  if (description) {
    formData.append('Description', description);
  }

  if (week !== undefined) {
    formData.append('Week', week.toString());
  }

  if (isPublic !== undefined) {
    formData.append('IsPublic', isPublic.toString());
  }

  // Type-specific fields
  if (type === 'document' && file) {
    formData.append('File', file);
  }

  if (type === 'video' && videoUrl) {
    formData.append('VideoURL', videoUrl);
  }

  if (type === 'code_exercise' || type === 'pdf_exercise') {
    if (totalPoints !== undefined) {
      formData.append('TotalPoints', totalPoints.toString());
    }

    if (deadline) {
      formData.append('Deadline', deadline);
    }

    if (type === 'code_exercise') {
      if (problemStatement) {
        formData.append('ProblemStatement', problemStatement);
      }
      if (constraints) {
        formData.append('Constraints', constraints);
      }
      if (hints) {
        formData.append('Hints', hints);
      }
      // Optional file for problem images
      if (file) {
        formData.append('File', file);
      }
    }

    if (type === 'pdf_exercise' && file) {
      formData.append('File', file);
    }
  }

  if (type === 'announcement' && content) {
    formData.append('Content', content);
  }

  // Add test cases for code exercises
  if (type === 'code_exercise' && testCases && testCases.length > 0) {
    // Convert test cases to JSON string
    const testCasesJSON = JSON.stringify(
      testCases.map((tc) => ({
        input_data: tc.input_data,
        expected_output: tc.expected_output,
        display_name: tc.display_name || null,
      })),
    );
    formData.append('TestCases', testCasesJSON);
  }

  const res = await api.post<MaterialResponse>(`/api/course-materials`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 120000, // 2 minutes for file uploads
  });

  return res.data;
};

/**
 * Update a course material
 */
const updateMaterial = async (
  token: string,
  materialId: string,
  updates: {
    title?: string;
    description?: string;
    week?: number;
    isPublic?: boolean;
    videoUrl?: string;
    content?: string; // For announcements
    // Code exercise fields
    totalPoints?: number;
    deadline?: string | null;
    problemStatement?: string;
    constraints?: string | null;
    hints?: string | null;
    testCases?: Array<{
      input_data: string;
      expected_output: string;
      display_name?: string | null;
    }>;
    problemImage?: File | null; // For updating problem image
  },
): Promise<MaterialResponse> => {
  // Convert camelCase to snake_case for backend
  const backendUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) {
    backendUpdates.title = updates.title;
  }
  if (updates.description !== undefined) {
    backendUpdates.description = updates.description;
  }
  if (updates.week !== undefined) {
    backendUpdates.week = updates.week;
  }
  if (updates.isPublic !== undefined) {
    backendUpdates.is_public = updates.isPublic;
  }
  if (updates.videoUrl !== undefined) {
    backendUpdates.video_url = updates.videoUrl;
  }
  if (updates.content !== undefined) {
    backendUpdates.content = updates.content;
  }
  if (updates.totalPoints !== undefined) {
    backendUpdates.total_points = updates.totalPoints;
  }
  if (updates.deadline !== undefined) {
    backendUpdates.deadline = updates.deadline;
  }
  if (updates.problemStatement !== undefined) {
    backendUpdates.problem_statement = updates.problemStatement;
  }
  if (updates.constraints !== undefined) {
    backendUpdates.constraints = updates.constraints;
  }
  if (updates.hints !== undefined) {
    backendUpdates.hints = updates.hints;
  }
  if (updates.testCases !== undefined) {
    backendUpdates.test_cases = updates.testCases;
  }

  const res = await api.put<MaterialResponse>(`/api/course-materials/${materialId}`, backendUpdates, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

/**
 * Delete a course material
 */
const deleteMaterial = async (token: string, materialId: string): Promise<void> => {
  await api.delete(`/api/course-materials/${materialId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// Get student course score
const getCourseScore = async (token: string, courseId: string): Promise<CourseScoreResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('course_id', courseId);

  const res = await api.get<CourseScoreResponse>(
    `/api/course-scores/course?${queryParams.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

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

// Get my enrollment status
const getMyEnrollment = async (token: string, courseId: string): Promise<MyEnrollmentResponse> => {
  const res = await api.get(`/api/courses/${courseId}/my-enrollment`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Enroll in course
const enrollInCourse = async (
  token: string,
  courseId: string,
  enrollmentData: EnrollmentRequest,
): Promise<EnrollmentResponse> => {
  const res = await api.post<EnrollmentResponse>(
    `/api/courses/${courseId}/enroll`,
    enrollmentData,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Unenroll from course
const unenrollFromCourse = async (token: string, courseId: string): Promise<void> => {
  await api.delete(`/api/courses/${courseId}/enroll`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get course enrollments
const getCourseEnrollments = async (
  token: string,
  courseId: string,
): Promise<CourseEnrollmentsResponse> => {
  const res = await api.get(`/api/courses/${courseId}/enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update enrollment role
const updateEnrollmentRole = async (
  token: string,
  courseId: string,
  userId: string,
  role: 'student' | 'ta',
): Promise<EnrollmentResponse> => {
  const res = await api.put<EnrollmentResponse>(
    `/api/courses/${courseId}/enrollments/${userId}/role`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data;
};

// Get self progress (optionally filtered by courseId)
const getSelfProgress = async (token: string, courseId?: string): Promise<SelfProgressResponse> => {
  const queryParams = new URLSearchParams();
  if (courseId) {
    queryParams.append('courseId', courseId);
  }

  const url = `/api/students/progress${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const res = await api.get<SelfProgressResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Request approval for a material
const requestApproval = async (
  token: string,
  materialId: string,
  data: RequestApprovalRequest,
): Promise<RequestApprovalResponse> => {
  const res = await api.post<RequestApprovalResponse>(
    `/api/progress/${materialId}/request-approval`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data;
};

// Get queue jobs with filters
const getQueueJobs = async (
  token: string,
  filters: QueueJobFilters = {},
): Promise<QueueJobsResponse> => {
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.course_id) params.append('course_id', filters.course_id);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<QueueJobsResponse>(`/api/queue/jobs?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Claim a queue job
const claimQueueJob = async (token: string, jobId: string): Promise<ClaimJobResponse> => {
  const res = await api.post<ClaimJobResponse>(
    `/api/queue/jobs/${jobId}/claim`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data;
};

// Complete review for a queue job
const completeReview = async (
  token: string,
  jobId: string,
  data: CompleteReviewRequest,
): Promise<CompleteReviewResponse> => {
  const res = await api.post<CompleteReviewResponse>(`/api/queue/jobs/${jobId}/complete`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

// Create a new course
const createCourse = async (
  token: string,
  name: string,
  description: string,
  enroll_key: string,
  image?: File,
): Promise<CourseResponse> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('enroll_key', enroll_key);
  if (image) {
    formData.append('image', image);
  }

  // Don't set Content-Type header - let browser set it with boundary
  // This is critical for multipart/form-data to work correctly
  const res = await api.post<CourseResponse>(`/api/courses`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Increase timeout for file uploads
    timeout: 120000, // 2 minutes
  });
  return res.data;
};

// Create invitation link
const createInvitation = async (
  token: string,
  courseId: string,
): Promise<CreateInvitationResponse> => {
  const res = await api.post<CreateInvitationResponse>(
    `/api/courses/${courseId}/invitations`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Get course invitations
const getCourseInvitations = async (
  token: string,
  courseId: string,
): Promise<GetInvitationsResponse> => {
  const res = await api.get<GetInvitationsResponse>(`/api/courses/${courseId}/invitations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Enroll via invitation
const enrollViaInvitation = async (
  token: string,
  invitationToken: string,
): Promise<EnrollmentResponse> => {
  const res = await api.post<EnrollmentResponse>(
    `/api/courses/invite/${invitationToken}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

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
};
