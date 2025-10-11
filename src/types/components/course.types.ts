import { Course } from '../services/course.types';
import { UserProfile } from '../services/auth.types';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string, enrollKey: string) => void;
  isEnrolling?: boolean;
  isEnrolled?: boolean;
  onEnterCourse?: (courseId: string) => void;
  userProfile?: UserProfile | null;
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
  userProfile?: UserProfile | null;
}

export type { CourseCardProps, EnrollmentPopoverProps, CourseCardWithEnrollmentProps };
