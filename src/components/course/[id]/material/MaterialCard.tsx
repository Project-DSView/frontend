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
  getSafeFilename,
  formatDate,
  isDeadlinePassed,
  transformFileUrl,
} from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useUpdateMaterial, useDeleteMaterial } from '@/query/material/material.query';
import CreateMaterialDialog from './CreateMaterialDialog';

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const router = useRouter();
  const { accessToken, profile } = useAuth();
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  // Check if user can edit/delete (must be teacher and creator)
  const canEdit = profile?.is_teacher && material.created_by === profile.user_id;
  const editableTypes: ('announcement' | 'document' | 'video' | 'code_exercise' | 'pdf_exercise')[] = [
    'announcement',
    'document',
    'video',
    'code_exercise',
    'pdf_exercise',
  ];
  const showEditDelete =
    canEdit && editableTypes.includes(material.type as 'announcement' | 'document' | 'video' | 'code_exercise' | 'pdf_exercise');

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
    // Open document in modal (similar to PDF exercise)
    if (material.type === 'document' && material.file_url) {
      setIsDocumentDialogOpen(true);
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
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {material.title}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{material.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {showEditDelete && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getMaterialTypeColor(material.type)}`}
                >
                  {getMaterialTypeLabel(material.type)}
                </span>
              </div>
              <span className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
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
                      isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-error dark:text-red-400">
                      {isExpired ? 'หมดเวลาแล้ว' : `กำหนดส่ง ${formatDate(material.deadline!)}`}
                    </span>
                    {isExpired && !isGraded && (
                      <span className="ml-1 rounded bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 text-xs text-yellow-800 dark:text-yellow-300">
                        Practice
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File info for documents */}
            {material.type === 'document' && material.file_name && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">ไฟล์:</span> {material.file_name}
                {material.file_size && (
                  <span className="ml-2">({(material.file_size / 1024 / 1024).toFixed(1)} MB)</span>
                )}
              </div>
            )}

            {/* Video info */}
            {material.type === 'video' && material.video_url && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">วิดีโอ:</span> {material.video_url}
              </div>
            )}
            {material.total_points && (
              <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
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

      {/* Document Dialog */}
      {material.type === 'document' && material.file_url && (
        <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl">
            <DialogHeader>
              <DialogTitle>{material.title}</DialogTitle>
              <DialogDescription>{material.description || 'เอกสาร'}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex flex-col gap-4">
              <div className="h-[70vh] w-full overflow-hidden rounded-lg border">
                {material.file_url && (
                  <iframe
                    src={transformFileUrl(material.file_url)}
                    className="h-full w-full"
                    title={material.title}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (material.file_url) {
                      const filename = getSafeFilename(material.file_url, material.file_name);
                      downloadFile(material.file_url, filename);
                    }
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && accessToken && (
        <CreateMaterialDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          accessToken={accessToken}
          courseId={material.course_id}
          defaultMaterialType={material.type}
          materialToEdit={{
            material_id: material.material_id,
            type: material.type,
            title: material.title,
            description: material.description,
            week: material.week,
            is_public: material.is_public,
            video_url: material.video_url || null,
            content: (material as any).content || null, // For announcements
            file_name: material.file_name || null,
            file_url: material.file_url || null,
            // Code exercise fields
            problem_statement: material.problem_statement || null,
            constraints: material.constraints || null,
            hints: material.hints || null,
            total_points: material.total_points || null,
            deadline: material.deadline || null,
            test_cases: (material as any).test_cases || null,
            problem_images: material.problem_images || null,
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบ "{material.title}"? การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (accessToken) {
                  deleteMutation.mutate(
                    { token: accessToken, materialId: material.material_id },
                    {
                      onSuccess: () => {
                        setIsDeleteDialogOpen(false);
                      },
                    },
                  );
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MaterialCard;
