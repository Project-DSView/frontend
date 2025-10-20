import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import SubmissionService from '@/services/submissions/submissions.service';

// Get user's submission for a material
const useMySubmission = (token: string | null, materialId: string) => {
  return useQuery({
    queryKey: ['my-submission', token, materialId],
    queryFn: () => SubmissionService.getMySubmission(token!, materialId),
    enabled: !!token && !!materialId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false; // Don't retry on auth errors or not found
        }
      }
      return failureCount < 2;
    },
  });
};

// Get specific submission by ID
const useSubmission = (token: string | null, submissionId: string) => {
  return useQuery({
    queryKey: ['submission', token, submissionId],
    queryFn: () => SubmissionService.getSubmission(token!, submissionId),
    enabled: !!token && !!submissionId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
};

// Get download URL for submission
const useSubmissionDownloadUrl = (token: string | null, submissionId: string) => {
  return useQuery({
    queryKey: ['submission-download-url', token, submissionId],
    queryFn: () => SubmissionService.getSubmissionDownloadUrl(token!, submissionId),
    enabled: !!token && !!submissionId,
    staleTime: 30 * 60 * 1000, // 30 minutes (URLs expire in 1 hour)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
};

// Submit PDF exercise mutation
const useSubmitPDFExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, materialId, file }: { token: string; materialId: string; file: File }) =>
      SubmissionService.submitPDFExercise(token, materialId, file),
    onSuccess: (data, variables) => {
      // Invalidate and refetch submission data
      queryClient.invalidateQueries({
        queryKey: ['my-submission', variables.token, variables.materialId],
      });

      // Show success message
      toast.success('ส่งงานสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Submit PDF exercise error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการส่งงาน';
      toast.error(errorMessage);
    },
  });
};

// Cancel submission mutation
const useCancelSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, submissionId }: { token: string; submissionId: string }) =>
      SubmissionService.cancelSubmission(token, submissionId),
    onSuccess: (data, variables) => {
      // Invalidate submission queries
      queryClient.invalidateQueries({
        queryKey: ['my-submission'],
      });
      queryClient.invalidateQueries({
        queryKey: ['submission', variables.token, variables.submissionId],
      });

      // Show success message
      toast.success('ยกเลิกการส่งงานสำเร็จ');
    },
    onError: (error: unknown) => {
      console.error('Cancel submission error:', error);

      // Show error message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการยกเลิกการส่งงาน';
      toast.error(errorMessage);
    },
  });
};

export {
  useMySubmission,
  useSubmission,
  useSubmissionDownloadUrl,
  useSubmitPDFExercise,
  useCancelSubmission,
};
