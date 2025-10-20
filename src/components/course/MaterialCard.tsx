'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { MaterialCardProps } from '@/types';
import {
  getMaterialIcon,
  getMaterialTypeLabel,
  getMaterialTypeColor,
  isMaterialClickable,
  isExercise,
} from '@/data';
import {
  getEmbedUrl,
  downloadFile,
  shouldDownloadFile,
  getSafeFilename,
  formatDate,
  isDeadlinePassed,
} from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const router = useRouter();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // Handle escape key to close video dialog
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoDialogOpen) {
        setIsVideoDialogOpen(false);
      }
    };

    if (isVideoDialogOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVideoDialogOpen]);

  const materialIsExercise = isExercise(material.type);
  const hasDeadline = material.deadline && materialIsExercise;
  const isExpired = hasDeadline && isDeadlinePassed(material.deadline!);
  const isGraded = material.is_graded ?? true; // default to graded for safety

  // Handle click to open material
  const handleClick = () => {
    // Navigate to exercise page for code exercises
    if (material.type === 'code_exercise') {
      router.push(`/course/${material.course_id}/exercise/${material.material_id}`);
      return;
    }
    // Navigate to PDF exercise page for PDF exercises
    if (material.type === 'pdf_exercise') {
      router.push(`/course/${material.course_id}/pdf-exercise/${material.material_id}`);
      return;
    }
    // Download image files instead of opening them
    if (material.type === 'document' && material.file_url) {
      if (shouldDownloadFile(material.file_url, material.mime_type)) {
        const filename = getSafeFilename(material.file_url, material.file_name);
        downloadFile(material.file_url, filename);
      } else {
        // Open other files in new tab
        window.open(material.file_url, '_blank', 'noopener,noreferrer');
      }
    }
    // Open video dialog for videos
    else if (material.type === 'video' && material.video_url) {
      setIsVideoDialogOpen(true);
    }
  };

  const isClickable = isMaterialClickable(material);

  return (
    <>
      <Card
        className={`mb-4 transition-shadow ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
        onClick={isClickable ? handleClick : undefined}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getMaterialIcon(material.type)}
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {material.title}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">{material.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getMaterialTypeColor(material.type)}`}
              >
                {getMaterialTypeLabel(material.type)}
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                Week {material.week}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Exercise specific info */}
            {materialIsExercise && (
              <div className="flex items-center gap-4 text-sm">
                {hasDeadline && (
                  <div
                    className={`flex items-center gap-1 ${
                      isExpired ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    <span className="text-error">
                      {isExpired ? 'หมดเวลาแล้ว' : `กำหนดส่ง ${formatDate(material.deadline!)}`}
                    </span>
                    {isExpired && !isGraded && (
                      <span className="ml-1 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
                        Practice
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File info for documents */}
            {material.type === 'document' && material.file_name && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">ไฟล์:</span> {material.file_name}
                {material.file_size && (
                  <span className="ml-2">({(material.file_size / 1024 / 1024).toFixed(1)} MB)</span>
                )}
              </div>
            )}

            {/* Video info */}
            {material.type === 'video' && material.video_url && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">วิดีโอ:</span> {material.video_url}
              </div>
            )}
            {material.total_points && (
              <div className="flex items-center gap-1">
                <span>{material.total_points} คะแนน</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Dialog */}
      {material.type === 'video' && material.video_url && isVideoDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={() => setIsVideoDialogOpen(false)}
        >
          <div
            className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black"
              onClick={() => setIsVideoDialogOpen(false)}
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative isolate z-[1] size-full overflow-hidden rounded-2xl border-2 border-white">
              <iframe
                src={getEmbedUrl(material.video_url)}
                title={material.title}
                className="size-full rounded-2xl"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialCard;
