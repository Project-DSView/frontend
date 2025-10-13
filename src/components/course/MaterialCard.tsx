'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Award } from 'lucide-react';
import { Material } from '@/types';
import {
  getMaterialIcon,
  getMaterialTypeLabel,
  getMaterialTypeColor,
  isMaterialClickable,
  isExercise,
} from '@/data';
import { getEmbedUrl } from '@/lib';

interface MaterialCardProps {
  material: Material;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const materialIsExercise = isExercise(material.type);
  const hasDeadline = material.deadline && materialIsExercise;

  // Handle click to open material
  const handleClick = () => {
    // Open file URL for documents and PDF exercises
    if ((material.type === 'document' || material.type === 'pdf_exercise') && material.file_url) {
      window.open(material.file_url, '_blank', 'noopener,noreferrer');
    }
    // Open video dialog for videos
    else if (material.type === 'video' && material.video_url) {
      setIsVideoDialogOpen(true);
    }
    // For code exercises, you might want to navigate to an exercise page
    // else if (material.type === 'code_exercise') {
    //   // TODO: Navigate to code exercise page
    // }
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
                {material.total_points && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>{material.total_points} คะแนน</span>
                  </div>
                )}
                {hasDeadline && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>ส่งภายใน {formatDate(material.deadline!)}</span>
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
