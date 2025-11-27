import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import MaterialService from '@/services/material/material.service';
import { formatErrorForDisplay } from '@/lib';
import type { MaterialResponse } from '@/types';

/**
 * Create material mutation hook
 */
const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      token: string;
      courseId: string;
      type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement';
      title: string;
      description?: string | null;
      week?: number;
      isPublic?: boolean;
      file?: File;
      videoUrl?: string;
      totalPoints?: number;
      deadline?: string | null;
      problemStatement?: string;
      constraints?: string | null;
      hints?: string | null;
      testCases?: Array<{ input_data: string; expected_output: string; display_name?: string }>;
      content?: string;
    }): Promise<MaterialResponse> => {
      return MaterialService.createMaterial(
        params.token,
        params.courseId,
        params.type,
        params.title,
        params.description,
        params.week,
        params.isPublic,
        params.file,
        params.videoUrl,
        params.totalPoints,
        params.deadline,
        params.problemStatement,
        params.constraints,
        params.hints,
        params.testCases,
        params.content,
      );
    },
    onSuccess: () => {
      toast.success('สร้างเนื้อหาสำเร็จ');
      // Invalidate course materials query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['course-materials'],
      });
    },
    onError: (error) => {
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage || 'เกิดข้อผิดพลาดในการสร้างเนื้อหา');
    },
  });
};

/**
 * Update material mutation hook
 */
const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      token: string;
      materialId: string;
      updates: {
        title?: string;
        description?: string;
        week?: number;
        isPublic?: boolean;
        videoUrl?: string;
        content?: string;
      };
    }): Promise<MaterialResponse> => {
      return MaterialService.updateMaterial(params.token, params.materialId, params.updates);
    },
    onSuccess: () => {
      toast.success('อัปเดตเนื้อหาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: ['course-materials'],
      });
    },
    onError: (error) => {
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage || 'เกิดข้อผิดพลาดในการอัปเดตเนื้อหา');
    },
  });
};

/**
 * Delete material mutation hook
 */
const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { token: string; materialId: string }): Promise<void> => {
      return MaterialService.deleteMaterial(params.token, params.materialId);
    },
    onSuccess: () => {
      toast.success('ลบเนื้อหาสำเร็จ');
      queryClient.invalidateQueries({
        queryKey: ['course-materials'],
      });
    },
    onError: (error) => {
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage || 'เกิดข้อผิดพลาดในการลบเนื้อหา');
    },
  });
};

export { useCreateMaterial, useUpdateMaterial, useDeleteMaterial };
