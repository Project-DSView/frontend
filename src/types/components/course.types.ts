import { Course } from '../services/course.types';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string, enrollKey: string) => void;
  isEnrolling?: boolean;
  isEnrolled?: boolean;
  onEnterCourse?: (courseId: string) => void;
}

interface EnrollmentPopoverProps {
  courseId: string;
  courseName: string;
  onEnroll?: (courseId: string, enrollKey: string) => void;
  isEnrolling?: boolean;
}

interface CourseCardWithEnrollmentProps {
  course: Course;
  onEnroll: (courseId: string, enrollKey: string) => void;
  isEnrolling: boolean;
  onEnterCourse: (courseId: string) => void;
  accessToken: string | null;
}

export type { CourseCardProps, EnrollmentPopoverProps, CourseCardWithEnrollmentProps };
