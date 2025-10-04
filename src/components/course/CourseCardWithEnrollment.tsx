'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import CourseCard from './CourseCard';
import { CourseCardWithEnrollmentProps } from '@/types';
import { useMyEnrollment } from '@/query';

const CourseCardWithEnrollment: React.FC<CourseCardWithEnrollmentProps> = ({
  course,
  onEnroll,
  isEnrolling,
  onEnterCourse,
  accessToken,
}) => {
  const { data: enrollmentData, isLoading: isCheckingEnrollment } = useMyEnrollment(
    accessToken,
    course.course_id,
  );
  const isEnrolled = !!(enrollmentData?.success && enrollmentData?.data?.enrollment);

  if (isCheckingEnrollment) {
    return (
      <div className="h-full transition-all duration-200 hover:shadow-lg">
        <div className="p-6">
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <CourseCard
      course={course}
      onEnroll={onEnroll}
      isEnrolling={isEnrolling}
      isEnrolled={isEnrolled}
      onEnterCourse={onEnterCourse}
    />
  );
};

export default CourseCardWithEnrollment;
