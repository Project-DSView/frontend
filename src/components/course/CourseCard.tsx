'use client';

import React from 'react';
import Image from 'next/image';
import { Users, BookOpen, Calendar, User, LogIn } from 'lucide-react';

import { CourseCardProps } from '@/types';
import { isValidImageUrl, getCourseImageFallback } from '@/lib';

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

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  isEnrolling = false,
  isEnrolled = false,
  onEnterCourse,
  userProfile,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      className={`h-full transition-all duration-200 hover:shadow-lg ${course.status === 'archived' ? 'opacity-50' : ''}`}
    >
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
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div
              className={`h-48 w-full bg-gradient-to-br ${getCourseImageFallback(course.name)} flex items-center justify-center rounded-lg border border-gray-200`}
            >
              <BookOpen className="text-info h-16 w-16" />
            </div>
          )}
        </div>

        {/* Course Info */}
        <div>
          <CardTitle className="line-clamp-2 text-lg font-semibold text-black">
            {course.name}
          </CardTitle>
          {course.status === 'archived' && (
            <div className="mt-1">
              <span className="bg-error inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white">
                Archived Course
              </span>
            </div>
          )}
          <CardDescription className="text-neutral mt-2 line-clamp-2 text-sm">
            {course.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Course Stats */}
          <div className="text-neutral flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>นักเรียน {course.enrollment_count} คน</span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="text-neutral flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>
              สร้างโดย {course.creator.firstname} {course.creator.lastname}
            </span>
          </div>

          {/* Created Date */}
          <div className="text-neutral flex items-center gap-2 text-sm">
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
          ) : userProfile?.is_teacher ? (
            <Button
              onClick={() => onEnterCourse?.(course.course_id)}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              เข้าคอร์สเรียน
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
