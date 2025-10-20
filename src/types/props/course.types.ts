import { Course } from '../services/course.types';
import { UserProfile } from '../services/auth.types';
import { CourseEnrollmentsResponse } from '../services/enrollment.types';
import { Material } from '../services/material.types';
import { Announcement } from '../services/announcements.types';
import { PDFSubmission } from '../services/submission.types';

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

interface MembersListProps {
  enrollmentsData: CourseEnrollmentsResponse | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface MaterialsByWeekProps {
  materials: Material[];
  userProfile?: UserProfile | null;
}

interface MaterialCardProps {
  material: Material;
}

interface UserRole {
  role: 'teacher' | 'ta' | 'student';
}

interface LatestAnnouncementProps {
  announcements: Announcement[];
}

interface ExerciseProblemCardProps {
  material: Material;
  isExpired: boolean;
  isGraded: boolean;
}

interface PDFSubmissionCardProps {
  materialId: string;
  accessToken: string;
  isExpired: boolean;
  isGraded: boolean;
}

interface ExerciseEditorCardProps {
  code: string;
  onCodeChange: (code: string) => void;
  isExpired: boolean;
  isGraded: boolean;
}

interface SubmittedPDFCardProps {
  submission: PDFSubmission;
  accessToken: string;
}

export type {
  CourseCardProps,
  EnrollmentPopoverProps,
  CourseCardWithEnrollmentProps,
  MembersListProps,
  MaterialsByWeekProps,
  MaterialCardProps,
  UserRole,
  LatestAnnouncementProps,
  ExerciseEditorCardProps,
  ExerciseProblemCardProps,
  PDFSubmissionCardProps,
  SubmittedPDFCardProps,
};
