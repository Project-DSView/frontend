import { requestApproval, getQueueJobs, claimQueueJob, completeReview } from '@/api';
import {
  RequestApprovalRequest,
  RequestApprovalResponse,
  QueueJobsResponse,
  ClaimJobResponse,
  CompleteReviewRequest,
  CompleteReviewResponse,
  QueueJobFilters,
} from '@/types/services/queue.types';

const QueueService = {
  // Request approval for a material
  requestApproval: async (
    token: string,
    materialId: string,
    data: RequestApprovalRequest,
  ): Promise<RequestApprovalResponse> => {
    return requestApproval(token, materialId, data);
  },

  // Get queue jobs with filters
  getQueueJobs: async (
    token: string,
    filters: QueueJobFilters = {},
  ): Promise<QueueJobsResponse> => {
    return getQueueJobs(token, filters);
  },

  // Claim a queue job
  claimQueueJob: async (token: string, jobId: string): Promise<ClaimJobResponse> => {
    return claimQueueJob(token, jobId);
  },

  // Complete review for a queue job
  completeReview: async (
    token: string,
    jobId: string,
    data: CompleteReviewRequest,
  ): Promise<CompleteReviewResponse> => {
    return completeReview(token, jobId, data);
  },
};

export default QueueService;















