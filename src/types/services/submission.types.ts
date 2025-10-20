type SubmissionStatus = 'pending' | 'completed' | 'error';

interface SubmissionStatusConfig {
  label: string;
  color: string;
  bgColor: string;
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
  score?: number;
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
}

interface SubmitPDFRequest {
  file: File;
}

interface SubmitPDFResponse {
  success: boolean;
  message: string;
  data: PDFSubmission;
}

interface SubmissionResponse {
  success: boolean;
  message: string;
  data: PDFSubmission | null;
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

export type {
  SubmissionStatus,
  SubmissionStatusConfig,
  PDFSubmission,
  SubmitPDFRequest,
  SubmitPDFResponse,
  SubmissionResponse,
  SubmissionListResponse,
  DownloadUrlResponse,
  CancelSubmissionResponse,
};
