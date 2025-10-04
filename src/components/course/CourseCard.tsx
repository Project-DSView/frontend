'use client';

import React from 'react';
import Image from 'next/image';
import { Users, BookOpen, Calendar, User, LogIn } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnrollmentPopover from '@/components/course/EnrollmentPopover';
import { CourseCardProps } from '@/types';
import { isValidImageUrl, getCourseImageFallback } from '@/lib';

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  isEnrolling = false,
  isEnrolled = false,
  onEnterCourse,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        {/* Course Image */}
        <div className="mb-4">
          {isValidImageUrl(course.image_url) ? (
            <div className="h-48 w-full overflow-hidden rounded-lg">
              <Image
                src={course.image_url!}
                alt={course.name}
                width={300}
                height={192}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className={`h-48 w-full bg-gradient-to-br ${getCourseImageFallback(course.name)} flex items-center justify-center rounded-lg border border-gray-200`}
            >
              <BookOpen className="h-16 w-16 text-blue-500" />
            </div>
          )}
        </div>

        {/* Course Info */}
        <div>
          <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900">
            {course.name}
          </CardTitle>
          <CardDescription className="mt-2 line-clamp-2 text-sm text-gray-600">
            {course.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Course Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>นักเรียน {course.enrollment_count} คน</span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>
              สร้างโดย {course.creator.firstname} {course.creator.lastname}
            </span>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>สร้างเมื่อ {formatDate(course.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="w-full">
          {isEnrolled ? (
            <Button
              onClick={() => onEnterCourse?.(course.course_id)}
              className="bg-secondary/80 hover:bg-secondary/60 w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              เข้าสู่คอร์สเรียน
            </Button>
          ) : (
            <EnrollmentPopover
              courseId={course.course_id}
              courseName={course.name}
              onEnroll={onEnroll}
              isEnrolling={isEnrolling}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
