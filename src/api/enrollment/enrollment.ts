import {
  MyEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  CourseEnrollmentsResponse,
} from '@/types';
import { api } from '../index';

// Get my enrollment status
const getMyEnrollment = async (token: string, courseId: string): Promise<MyEnrollmentResponse> => {
  const res = await api.get(`/api/courses/${courseId}/my-enrollment`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Enroll in course
const enrollInCourse = async (
  token: string,
  courseId: string,
  enrollmentData: EnrollmentRequest,
): Promise<EnrollmentResponse> => {
  const res = await api.post<EnrollmentResponse>(
    `/api/courses/${courseId}/enroll`,
    enrollmentData,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Unenroll from course
const unenrollFromCourse = async (token: string, courseId: string): Promise<void> => {
  await api.delete(`/api/courses/${courseId}/enroll`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get course enrollments
const getCourseEnrollments = async (
  token: string,
  courseId: string,
): Promise<CourseEnrollmentsResponse> => {
  const res = await api.get(`/api/courses/${courseId}/enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export { getMyEnrollment, enrollInCourse, unenrollFromCourse, getCourseEnrollments };
