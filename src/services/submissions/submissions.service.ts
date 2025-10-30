import {
  submitPDFExercise,
  submitCodeExercise,
  getMySubmission,
  getSubmission,
  getSubmissionDownloadUrl,
  cancelSubmission,
} from '@/api';
import {
  SubmitPDFResponse,
  SubmitCodeResponse,
  SubmissionResponse,
  DownloadUrlResponse,
  CancelSubmissionResponse,
} from '@/types';

const SubmissionService = {
  // Submit PDF exercise
  submitPDFExercise: async (
    token: string,
    materialId: string,
    file: File,
  ): Promise<SubmitPDFResponse> => {
    return submitPDFExercise(token, materialId, file);
  },

  // Submit code exercise
  submitCodeExercise: async (
    token: string,
    materialId: string,
    code: string,
  ): Promise<SubmitCodeResponse> => {
    return submitCodeExercise(token, materialId, code);
  },

  // Get user's submission for a material
  getMySubmission: async (token: string, materialId: string): Promise<SubmissionResponse> => {
    return getMySubmission(token, materialId);
  },

  // Get specific submission by ID
  getSubmission: async (token: string, submissionId: string): Promise<SubmissionResponse> => {
    return getSubmission(token, submissionId);
  },

  // Get download URL for submission
  getSubmissionDownloadUrl: async (
    token: string,
    submissionId: string,
  ): Promise<DownloadUrlResponse> => {
    return getSubmissionDownloadUrl(token, submissionId);
  },

  // Cancel submission
  cancelSubmission: async (
    token: string,
    submissionId: string,
  ): Promise<CancelSubmissionResponse> => {
    return cancelSubmission(token, submissionId);
  },
};

export default SubmissionService;
