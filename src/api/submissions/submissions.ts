import {
  SubmitPDFResponse,
  SubmitCodeResponse,
  SubmissionResponse,
  DownloadUrlResponse,
  CancelSubmissionResponse,
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

  const res = await api.post<SubmitPDFResponse>(`/api/materials/${materialId}/submit`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
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

export {
  submitPDFExercise,
  submitCodeExercise,
  getMySubmission,
  getSubmission,
  getSubmissionDownloadUrl,
  cancelSubmission,
};
