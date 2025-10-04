import { CourseListResponse, CourseResponse, CourseQueryParams } from '@/types';
import { api } from '../index';

// Get courses with pagination and filtering
const getCourses = async (
  token: string,
  params?: CourseQueryParams,
): Promise<CourseListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/api/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const res = await api.get<CourseListResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get single course by ID
const getCourse = async (token: string, courseId: string): Promise<CourseResponse> => {
  const res = await api.get<CourseResponse>(`/api/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export { getCourses, getCourse };
