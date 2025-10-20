interface EnrollmentStatus {
  enrollment_id: string;
  course_id: string;
  user_id: string;
  role: 'student' | 'ta' | 'teacher';
  firstname: string;
  lastname: string;
  email: string;
  enrolled_at: string;
}

interface MyEnrollmentResponse {
  success: boolean;
  data: {
    enrollment: EnrollmentStatus;
  };
}

interface EnrollmentRequest {
  enroll_key: string;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    course_id: string;
    user_id: string;
    role: 'student' | 'ta' | 'teacher';
    enrolled_at: string;
  };
}

interface CourseEnrollmentsResponse {
  success: boolean;
  data: {
    enrollments: Array<{
      enrollment_id: string;
      course_id: string;
      user_id: string;
      role: 'student' | 'ta' | 'teacher';
      firstname: string;
      lastname: string;
      email: string;
    }>;
  };
}

export type {
  EnrollmentStatus,
  MyEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
  CourseEnrollmentsResponse,
};
