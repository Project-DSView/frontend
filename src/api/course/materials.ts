import { MaterialsResponse, MaterialsParams } from '@/types';
import { api } from '../index';

// Get course materials with pagination
const getCourseMaterials = async (
  token: string,
  courseId: string,
  params?: MaterialsParams,
): Promise<MaterialsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('course_id', courseId);

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const url = `/api/course-materials?${queryParams.toString()}`;

  const res = await api.get<MaterialsResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export { getCourseMaterials };
