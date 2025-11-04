import { api } from '../index';
import {
  RequestApprovalRequest,
  RequestApprovalResponse,
  QueueJobsResponse,
  ClaimJobResponse,
  CompleteReviewRequest,
  CompleteReviewResponse,
  QueueJobFilters,
} from '@/types/services/queue.types';

// Request approval for a material
export const requestApproval = async (
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
export const getQueueJobs = async (
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
export const claimQueueJob = async (token: string, jobId: string): Promise<ClaimJobResponse> => {
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
export const completeReview = async (
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

