import axios from 'axios';
import {
  createMaterial as apiCreateMaterial,
  updateMaterial as apiUpdateMaterial,
  deleteMaterial as apiDeleteMaterial,
} from '@/api';
import type { MaterialResponse } from '@/types';
import { AuthService } from '../auth/auth.service';

class MaterialService {
  /**
   * Create a new course material
   */
  static async createMaterial(
    token: string,
    courseId: string,
    type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement',
    title: string,
    description?: string | null,
    week?: number,
    isPublic?: boolean,
    // Document fields
    file?: File,
    // Video fields
    videoUrl?: string,
    // Exercise fields
    totalPoints?: number,
    deadline?: string | null,
    problemStatement?: string,
    constraints?: string | null,
    hints?: string | null,
    // Code exercise test cases
    testCases?: Array<{ input_data: string; expected_output: string; display_name?: string }>,
    // Announcement fields
    content?: string,
  ): Promise<MaterialResponse> {
    try {
      return await apiCreateMaterial(
        token,
        courseId,
        type,
        title,
        description,
        week,
        isPublic,
        file,
        videoUrl,
        totalPoints,
        deadline,
        problemStatement,
        constraints,
        hints,
        testCases,
        content,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiCreateMaterial(
            newToken,
            courseId,
            type,
            title,
            description,
            week,
            isPublic,
            file,
            videoUrl,
            totalPoints,
            deadline,
            problemStatement,
            constraints,
            hints,
            testCases,
            content,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Update a course material
   */
  static async updateMaterial(
    token: string,
    materialId: string,
    updates: {
      title?: string;
      description?: string;
      week?: number;
      isPublic?: boolean;
      videoUrl?: string;
      content?: string;
    },
  ): Promise<MaterialResponse> {
    try {
      return await apiUpdateMaterial(token, materialId, updates);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiUpdateMaterial(newToken, materialId, updates);
        }
      }
      throw error;
    }
  }

  /**
   * Delete a course material
   */
  static async deleteMaterial(token: string, materialId: string): Promise<void> {
    try {
      return await apiDeleteMaterial(token, materialId);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await AuthService.refreshToken();
        if (newToken) {
          return await apiDeleteMaterial(newToken, materialId);
        }
      }
      throw error;
    }
  }
}

export default MaterialService;
