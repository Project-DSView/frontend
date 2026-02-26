import {
  SubmitPDFResponse,
  SubmitCodeResponse,
  SubmissionResponse,
  DownloadUrlResponse,
  CancelSubmissionResponse,
  CoursePDFSubmissionsResponse,
  ApprovePDFSubmissionResponse,
} from '@/types';
import { api } from '../index';

// Submit PDF exercise
const submitPDFExercise = async (
  token: string,
  materialId: string,
  file: File,
): Promise<SubmitPDFResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  // Don't set Content-Type header - let browser set it with boundary
  // This is critical for multipart/form-data to work correctly
  const res = await api.post<SubmitPDFResponse>(
    `/api/course-materials/${materialId}/submit-pdf`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Increase timeout for file uploads
      timeout: 120000, // 2 minutes
    },
  );
  return res.data;
};

// Submit code exercise
const submitCodeExercise = async (
  token: string,
  materialId: string,
  code: string,
): Promise<SubmitCodeResponse> => {
  const res = await api.post<SubmitCodeResponse>(
    `/api/course-materials/${materialId}/submit`,
    { code },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return res.data;
};

// Get user's submission for a material
const getMySubmission = async (token: string, materialId: string): Promise<SubmissionResponse> => {
  const res = await api.get<SubmissionResponse>(
    `/api/course-materials/${materialId}/submissions/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Get specific submission by ID
const getSubmission = async (token: string, submissionId: string): Promise<SubmissionResponse> => {
  const res = await api.get<SubmissionResponse>(`/api/submissions/${submissionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get download URL for submission
const getSubmissionDownloadUrl = async (
  token: string,
  submissionId: string,
): Promise<DownloadUrlResponse> => {
  const res = await api.get<DownloadUrlResponse>(`/api/submissions/${submissionId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Cancel submission
const cancelSubmission = async (
  token: string,
  submissionId: string,
): Promise<CancelSubmissionResponse> => {
  const res = await api.delete<CancelSubmissionResponse>(
    `/api/submissions/${submissionId}/cancel`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Get all PDF submissions for a course
const getCoursePDFSubmissions = async (
  token: string,
  courseId: string,
): Promise<CoursePDFSubmissionsResponse> => {
  const res = await api.get<CoursePDFSubmissionsResponse>(
    `/api/courses/${courseId}/pdf-submissions`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Download PDF submission file
const downloadPDFSubmission = async (token: string, submissionId: string): Promise<Blob> => {
  const res = await api.get(`/api/submissions/${submissionId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
  return res.data;
};

// Download feedback file
const downloadFeedbackFile = async (token: string, submissionId: string): Promise<Blob> => {
  const res = await api.get(`/api/submissions/${submissionId}/feedback/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
  return res.data;
};

// Approve PDF submission with score, comment, and optional feedback file
const approvePDFSubmission = async (
  token: string,
  submissionId: string,
  score: number,
  comment: string,
  feedbackFile?: File,
  maxScore?: number,
): Promise<ApprovePDFSubmissionResponse> => {
  const formData = new FormData();
  formData.append('score', score.toString());
  formData.append('comment', comment);
  if (maxScore !== undefined) {
    formData.append('maxScore', maxScore.toString());
  }
  if (feedbackFile) {
    formData.append('feedback_file', feedbackFile);
  }

  const res = await api.post<ApprovePDFSubmissionResponse>(
    `/api/submissions/${submissionId}/approve`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 120000, // 2 minutes for file uploads
    },
  );
  return res.data;
};

export {
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
};
