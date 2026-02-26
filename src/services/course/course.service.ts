import axios from 'axios';

import {
  getCourses,
  getCourse,
  getCourseMaterials,
  getCourseMaterial,
  getAnnouncements,
  getMyEnrollment as apiGetMyEnrollment,
  enrollInCourse as apiEnrollInCourse,
  unenrollFromCourse as apiUnenrollFromCourse,
  getCourseEnrollments as apiGetCourseEnrollments,
  updateEnrollmentRole as apiUpdateEnrollmentRole,
  requestApproval,
  getQueueJobs,
  claimQueueJob,
  completeReview,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  uploadCourseImage as apiUploadCourseImage,
  submitPDFExercise,
  submitCodeExercise,
  getMySubmission,
  getSubmission,
  getSubmissionDownloadUrl,
  cancelSubmission,
  getCoursePDFSubmissions,
  downloadPDFSubmission,
  downloadFeedbackFile,
  approvePDFSubmission,
  createInvitation as apiCreateInvitation,
  getCourseInvitations as apiGetCourseInvitations,
  enrollViaInvitation as apiEnrollViaInvitation,
  createMaterial as apiCreateMaterial,
  updateMaterial as apiUpdateMaterial,
  deleteMaterial as apiDeleteMaterial,
} from '@/api';

import {
  CourseListResponse,
  CourseResponse,
  CourseQueryParams,
  MaterialsResponse,
  MaterialsParams,
  MaterialResponse,
  AnnouncementsResponse,
  AnnouncementsParams,
  MyEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  CourseEnrollmentsResponse,
  RequestApprovalRequest,
  RequestApprovalResponse,
  QueueJobsResponse,
  ClaimJobResponse,
  CompleteReviewRequest,
  CompleteReviewResponse,
  QueueJobFilters,
  SubmitPDFResponse,
  SubmitCodeResponse,
  SubmissionResponse,
  DownloadUrlResponse,
  CancelSubmissionResponse,
  CoursePDFSubmissionsResponse,
  ApprovePDFSubmissionResponse,
  CreateInvitationResponse,
  GetInvitationsResponse,
} from '@/types';
import { AuthService } from '../auth/auth.service';

class CourseService {
  // ============================================================================
  // Course Methods
  // ============================================================================
  // Get courses with pagination and filtering
  static async getCourses(token: string, params?: CourseQueryParams): Promise<CourseListResponse> {
    try {
      return await getCourses(token, params);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await getCourses(newToken, params);
        }
      }
      throw error;
    }
  }

  // Get single course by ID
  static async getCourse(token: string, courseId: string): Promise<CourseResponse> {
    try {
      return await getCourse(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await getCourse(newToken, courseId);
        }
      }
      throw error;
    }
  }

  // Create a new course
  static async createCourse(
    token: string,
    name: string,
    description: string,
    enroll_key: string,
    image?: File,
  ): Promise<CourseResponse> {
    try {
      return await apiCreateCourse(token, name, description, enroll_key, image);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiCreateCourse(newToken, name, description, enroll_key, image);
        }
      }
      throw error;
    }
  }

  // Update course
  static async updateCourse(
    token: string,
    courseId: string,
    updates: {
      name?: string;
      description?: string;
      status?: 'active' | 'archived';
      enroll_key?: string;
    },
  ): Promise<CourseResponse> {
    try {
      return await apiUpdateCourse(token, courseId, updates);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiUpdateCourse(newToken, courseId, updates);
        }
      }
      throw error;
    }
  }

  // Upload course image
  static async uploadCourseImage(
    token: string,
    courseId: string,
    image: File,
  ): Promise<CourseResponse> {
    try {
      return await apiUploadCourseImage(token, courseId, image);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiUploadCourseImage(newToken, courseId, image);
        }
      }
      throw error;
    }
  }

  // ============================================================================
  // Announcement Methods
  // ============================================================================
  // Get announcements for a course
  static async getAnnouncements(
    token: string,
    courseId: string,
    params?: AnnouncementsParams,
  ): Promise<AnnouncementsResponse | null> {
    try {
      return await getAnnouncements(token, courseId, params);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await getAnnouncements(newToken, courseId, params);
        }
      }
      // Return null if error occurs
      return null;
    }
  }

  // ============================================================================
  // Material Methods
  // ============================================================================
  // Get course materials
  static async getCourseMaterials(
    token: string,
    courseId: string,
    params?: MaterialsParams,
  ): Promise<MaterialsResponse> {
    return getCourseMaterials(token, courseId, params);
  }

  // Get single course material by ID
  static async getCourseMaterial(token: string, materialId: string): Promise<MaterialResponse> {
    return getCourseMaterial(token, materialId);
  }

  /**
   * Create a new course material
   */
  static async createMaterial(
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
  ): Promise<MaterialResponse> {
    try {
      return await apiCreateMaterial(
        token,
        courseId,
        type,
        title,
        description,
        week,
        isPublic,
        file,
        videoUrl,
        totalPoints,
        deadline,
        problemStatement,
        constraints,
        hints,
        testCases,
        content,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiCreateMaterial(
            newToken,
            courseId,
            type,
            title,
            description,
            week,
            isPublic,
            file,
            videoUrl,
            totalPoints,
            deadline,
            problemStatement,
            constraints,
            hints,
            testCases,
            content,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Update a course material
   */
  static async updateMaterial(
    token: string,
    materialId: string,
    updates: {
      title?: string;
      description?: string;
      week?: number;
      isPublic?: boolean;
      videoUrl?: string;
      content?: string;
    },
  ): Promise<MaterialResponse> {
    try {
      return await apiUpdateMaterial(token, materialId, updates);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiUpdateMaterial(newToken, materialId, updates);
        }
      }
      throw error;
    }
  }

  /**
   * Delete a course material
   */
  static async deleteMaterial(token: string, materialId: string): Promise<void> {
    try {
      return await apiDeleteMaterial(token, materialId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiDeleteMaterial(newToken, materialId);
        }
      }
      throw error;
    }
  }

  // ============================================================================
  // Enrollment Methods
  // ============================================================================
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

  // Update enrollment role
  static async updateEnrollmentRole(
    token: string,
    courseId: string,
    userId: string,
    role: 'student' | 'ta',
  ): Promise<EnrollmentResponse> {
    try {
      return await apiUpdateEnrollmentRole(token, courseId, userId, role);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiUpdateEnrollmentRole(newToken, courseId, userId, role);
        }
      }
      throw error;
    }
  }

  // ============================================================================
  // Queue Methods
  // ============================================================================
  // Request approval for a material
  static async requestApproval(
    token: string,
    materialId: string,
    data: RequestApprovalRequest,
  ): Promise<RequestApprovalResponse> {
    return requestApproval(token, materialId, data);
  }

  // Get queue jobs with filters
  static async getQueueJobs(
    token: string,
    filters: QueueJobFilters = {},
  ): Promise<QueueJobsResponse> {
    return getQueueJobs(token, filters);
  }

  // Claim a queue job
  static async claimQueueJob(token: string, jobId: string): Promise<ClaimJobResponse> {
    return claimQueueJob(token, jobId);
  }

  // Complete review for a queue job
  static async completeReview(
    token: string,
    jobId: string,
    data: CompleteReviewRequest,
  ): Promise<CompleteReviewResponse> {
    return completeReview(token, jobId, data);
  }

  // ============================================================================
  // Submission Methods
  // ============================================================================
  // Submit PDF exercise
  static async submitPDFExercise(
    token: string,
    materialId: string,
    file: File,
  ): Promise<SubmitPDFResponse> {
    return submitPDFExercise(token, materialId, file);
  }

  // Submit code exercise
  static async submitCodeExercise(
    token: string,
    materialId: string,
    code: string,
  ): Promise<SubmitCodeResponse> {
    return submitCodeExercise(token, materialId, code);
  }

  // Get user's submission for a material
  static async getMySubmission(token: string, materialId: string): Promise<SubmissionResponse> {
    return getMySubmission(token, materialId);
  }

  // Get specific submission by ID
  static async getSubmission(token: string, submissionId: string): Promise<SubmissionResponse> {
    return getSubmission(token, submissionId);
  }

  // Get download URL for submission
  static async getSubmissionDownloadUrl(
    token: string,
    submissionId: string,
  ): Promise<DownloadUrlResponse> {
    return getSubmissionDownloadUrl(token, submissionId);
  }

  // Cancel submission
  static async cancelSubmission(
    token: string,
    submissionId: string,
  ): Promise<CancelSubmissionResponse> {
    return cancelSubmission(token, submissionId);
  }

  // Get all PDF submissions for a course
  static async getCoursePDFSubmissions(
    token: string,
    courseId: string,
  ): Promise<CoursePDFSubmissionsResponse> {
    return getCoursePDFSubmissions(token, courseId);
  }

  // Download PDF submission file
  static async downloadPDFSubmission(token: string, submissionId: string): Promise<Blob> {
    return downloadPDFSubmission(token, submissionId);
  }

  // Download feedback file
  static async downloadFeedbackFile(token: string, submissionId: string): Promise<Blob> {
    return downloadFeedbackFile(token, submissionId);
  }

  // Approve PDF submission
  static async approvePDFSubmission(
    token: string,
    submissionId: string,
    score: number,
    comment: string,
    feedbackFile?: File,
    maxScore?: number,
  ): Promise<ApprovePDFSubmissionResponse> {
    return approvePDFSubmission(token, submissionId, score, comment, feedbackFile, maxScore);
  }

  // ============================================================================
  // Invitation Methods
  // ============================================================================
  // Create invitation link
  static async createInvitation(
    token: string,
    courseId: string,
  ): Promise<CreateInvitationResponse> {
    try {
      return await apiCreateInvitation(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiCreateInvitation(newToken, courseId);
        }
      }
      throw error;
    }
  }

  // Get course invitations
  static async getCourseInvitations(
    token: string,
    courseId: string,
  ): Promise<GetInvitationsResponse> {
    try {
      return await apiGetCourseInvitations(token, courseId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiGetCourseInvitations(newToken, courseId);
        }
      }
      throw error;
    }
  }

  // Enroll via invitation
  static async enrollViaInvitation(
    token: string,
    invitationToken: string,
  ): Promise<EnrollmentResponse> {
    try {
      return await apiEnrollViaInvitation(token, invitationToken);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiEnrollViaInvitation(newToken, invitationToken);
        }
      }
      throw error;
    }
  }
}

export { CourseService };
