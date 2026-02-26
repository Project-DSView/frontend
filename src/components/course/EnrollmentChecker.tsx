'use client';

import React, { useEffect } from 'react';
import { useMyEnrollment } from '@/query';

interface EnrollmentCheckerProps {
  courseId: string;
  accessToken: string | null;
  onEnrollmentStatusChange: (courseId: string, isEnrolled: boolean) => void;
}

const EnrollmentChecker: React.FC<EnrollmentCheckerProps> = ({
  courseId,
  accessToken,
  onEnrollmentStatusChange,
}) => {
  const { data: enrollmentData } = useMyEnrollment(accessToken, courseId);
  const isEnrolled = !!(enrollmentData?.success && enrollmentData?.data?.enrollment);

  useEffect(() => {
    onEnrollmentStatusChange(courseId, isEnrolled);
  }, [courseId, isEnrolled, onEnrollmentStatusChange]);

  return null; // This component doesn't render anything
};

export default EnrollmentChecker;
