import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { QueueService } from '@/services';
import { QueueJobFilters } from '@/types/services/queue.types';

// Request approval mutation
const useRequestApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      materialId,
      data,
    }: {
      token: string;
      materialId: string;
      data: { lab_room: string; table_number: string; notes?: string };
    }) => QueueService.requestApproval(token, materialId, data),
    onSuccess: (data, variables) => {
      // Invalidate submission queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['my-submission', variables.token, variables.materialId],
      });

      // Show success message
      toast.success('ส่งคำขอตรวจสอบสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Request approval error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการส่งคำขอตรวจสอบ';
      toast.error(errorMessage);
    },
  });
};

// Get queue jobs query
const useQueueJobs = (token: string | null, filters: QueueJobFilters = {}) => {
  return useQuery({
    queryKey: ['queue-jobs', token, filters],
    queryFn: () => QueueService.getQueueJobs(token!, filters),
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return false; // Don't retry on auth errors
        }
      }
      return failureCount < 2;
    },
  });
};

// Claim queue job mutation
const useClaimQueueJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, jobId }: { token: string; jobId: string }) =>
      QueueService.claimQueueJob(token, jobId),
    onSuccess: () => {
      // Invalidate queue jobs queries
      queryClient.invalidateQueries({
        queryKey: ['queue-jobs'],
      });

      // Show success message
      toast.success('รับงานตรวจสอบสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Claim queue job error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการรับงานตรวจสอบ';
      toast.error(errorMessage);
    },
  });
};

// Complete review mutation
const useCompleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      jobId,
      data,
    }: {
      token: string;
      jobId: string;
      data: { status: 'approved' | 'rejected'; comment: string };
    }) => QueueService.completeReview(token, jobId, data),
    onSuccess: (data) => {
      // Invalidate queue jobs queries
      queryClient.invalidateQueries({
        queryKey: ['queue-jobs'],
      });

      // Invalidate submission queries to update student's view
      queryClient.invalidateQueries({
        queryKey: ['my-submission'],
      });

      // Show success message
      const statusText = data.data.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
      toast.success(`ตรวจสอบเสร็จสิ้น - ${statusText}`);
    },
    onError: (error: unknown) => {
      console.error('Complete review error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการตรวจสอบ';
      toast.error(errorMessage);
    },
  });
};

export { useRequestApproval, useQueueJobs, useClaimQueueJob, useCompleteReview };
