import { getCourseMaterials } from '@/api';
import { MaterialsResponse, MaterialsParams } from '@/types';

const MaterialService = {
  getCourseMaterials: async (
    token: string,
    courseId: string,
    params?: MaterialsParams,
  ): Promise<MaterialsResponse> => {
    return getCourseMaterials(token, courseId, params);
  },
};

export default MaterialService;
