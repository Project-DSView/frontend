import { getCourseMaterials, getCourseMaterial } from '@/api';
import { MaterialsResponse, MaterialsParams, MaterialResponse } from '@/types';

const MaterialService = {
  getCourseMaterials: async (
    token: string,
    courseId: string,
    params?: MaterialsParams,
  ): Promise<MaterialsResponse> => {
    return getCourseMaterials(token, courseId, params);
  },
  getCourseMaterial: async (token: string, materialId: string): Promise<MaterialResponse> => {
    return getCourseMaterial(token, materialId);
  },
};

export default MaterialService;
