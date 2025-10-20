'use client';

import React from 'react';
import { FilePen, Download, Eye } from 'lucide-react';

import { MaterialCardProps } from '@/types';
import {
  formatDate,
  isDeadlinePassed,
  downloadFile,
  getSafeFilename,
  openFilePreview,
  formatFileSize,
} from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PDFExerciseCard: React.FC<MaterialCardProps> = ({ material }) => {
  const hasDeadline = material.deadline;
  const isExpired = hasDeadline && isDeadlinePassed(material.deadline!);
  const isGraded = material.is_graded ?? true;

  const handlePreview = () => {
    if (material.file_url) {
      openFilePreview(material.file_url);
    }
  };

  const handleDownload = () => {
    if (material.file_url) {
      const filename = getSafeFilename(material.file_url, material.file_name);
      downloadFile(material.file_url, filename);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-error/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <FilePen className="text-error h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">{material.title}</CardTitle>
              <p className="mt-1 text-sm text-gray-600">{material.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {hasDeadline && (
              <div
                className={`flex items-center gap-1 ${
                  isExpired ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <span>
                  {isExpired ? 'หมดเวลาแล้ว' : `ส่งภายใน ${formatDate(material.deadline!)}`}
                </span>
                {isExpired && !isGraded && (
                  <span className="ml-1 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
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
              <div className="flex items-center gap-1 text-gray-600">
                <span>{material.total_points} คะแนน</span>
              </div>
            )}
          </div>

          {/* File information */}
          {material.file_name && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <FilePen className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{material.file_name}</p>
                  {material.file_size && (
                    <p className="text-xs text-gray-500">{formatFileSize(material.file_size)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              ดูโจทย์
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ดาวน์โหลด
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-info/10 rounded-lg p-4">
            <h4 className="text-info mb-2 text-sm font-semibold">วิธีการส่งงาน</h4>
            <ul className="space-y-1 text-sm text-blue-800">
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
