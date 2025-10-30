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
  queue_claimed_by?: string;
  queue_claimed_by_name?: string; // firstname + lastname
  review_comment?: string;
  review_status?: 'approved' | 'rejected';
  reviewed_at?: string;
  lab_room?: string;
  table_number?: string;
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

export type {
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
};
