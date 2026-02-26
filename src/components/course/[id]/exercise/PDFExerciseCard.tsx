'use client';

import React from 'react';
import { FilePen, Eye, Loader2 } from 'lucide-react';

import { MaterialCardProps } from '@/types';
import { formatDate, isDeadlinePassed, formatFileSize, transformFileUrl } from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PDFExerciseCard: React.FC<MaterialCardProps> = ({ material }) => {
  const hasDeadline = material.deadline;
  const isExpired = hasDeadline && isDeadlinePassed(material.deadline!);
  const isGraded = material.is_graded ?? true;
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerUrl, setViewerUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleView = async () => {
    if (!material.file_url) return;

    setLoading(true);
    try {
      // Transform MinIO URLs to use HTTPS proxy
      const transformedUrl = transformFileUrl(material.file_url);
      setViewerUrl(transformedUrl);
      setViewerOpen(true);
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup when modal closes
  React.useEffect(() => {
    if (!viewerOpen && viewerUrl && viewerUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
    }
  }, [viewerOpen, viewerUrl]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-error/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <FilePen className="text-error h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {material.title}
              </CardTitle>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {material.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {hasDeadline && (
              <div
                className={`flex items-center gap-1 ${
                  isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-error text-base font-medium dark:text-red-400">
                  {isExpired ? 'หมดเวลาแล้ว' : `ส่งภายใน ${formatDate(material.deadline!)}`}
                </span>
                {isExpired && !isGraded && (
                  <span className="ml-1 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Practice
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Exercise metadata */}
          <div className="flex items-center gap-4 text-sm">
            {material.total_points && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <span>{material.total_points} คะแนน</span>
              </div>
            )}
          </div>

          {/* File information */}
          {material.file_name && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <FilePen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {material.file_name}
                  </p>
                  {material.file_size && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(material.file_size)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleView}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              ดูเอกสาร
            </Button>
            <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
              <DialogContent className="max-h-[90vh] max-w-4xl">
                <DialogHeader>
                  <DialogTitle>โจทย์แบบฝึกหัด</DialogTitle>
                  <DialogDescription>{material.title}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 h-[70vh] w-full overflow-hidden rounded-lg border">
                  {viewerUrl && (
                    <iframe src={viewerUrl} className="h-full w-full" title="Exercise PDF" />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Instructions */}
          <div className="bg-info/10 dark:bg-info/20 rounded-lg p-4">
            <h4 className="text-info mb-2 text-sm font-semibold dark:text-blue-400">
              วิธีการส่งงาน
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>• อ่านโจทย์ในไฟล์ PDF ด้านบน</li>
              <li>• ทำการบ้านตามที่กำหนด</li>
              <li>• บันทึกเป็นไฟล์ PDF</li>
              <li>• อัพโหลดไฟล์ในส่วนส่งงานด้านล่าง</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFExerciseCard;
