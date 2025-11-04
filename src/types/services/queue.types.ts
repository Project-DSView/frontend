// Queue job status types
export type QueueJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'waiting_approval';

// Queue job user information
export interface QueueJobUser {
  user_id: string;
  name: string;
  email: string;
}

// Main queue job structure
export interface QueueJob {
  id: string;
  type: 'review';
  status: QueueJobStatus;
  user_id: string;
  material_id: string;
  course_id: string;
  submission_id: string;
  lab_room: string;
  table_number: string;
  data: string; // JSON string containing additional data
  created_at: string;
  claimed_by?: string;
  claimed_at?: string;
  user: QueueJobUser;
}

// Request approval request body
export interface RequestApprovalRequest {
  lab_room: string;
  table_number: string;
  notes?: string;
}

// Request approval response
export interface RequestApprovalResponse {
  success: boolean;
  message: string;
  data: {
    queue_job_id: string;
    lab_room: string;
    table_number: string;
    status: QueueJobStatus;
  };
}

// Queue jobs list response
export interface QueueJobsResponse {
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

// Claim job response
export interface ClaimJobResponse {
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

// Complete review request
export interface CompleteReviewRequest {
  status: 'approved' | 'rejected';
  comment: string;
}

// Complete review response
export interface CompleteReviewResponse {
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

// Queue job filters
export interface QueueJobFilters {
  type?: 'review';
  status?: QueueJobStatus;
  course_id?: string;
  page?: number;
  limit?: number;
}
