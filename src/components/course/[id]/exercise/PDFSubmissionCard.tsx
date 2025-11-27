'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useSubmitPDFExercise } from '@/query';
import { formatFileSizeForDisplay, pdfSubmissionSchema } from '@/lib';
import { PDFSubmissionCardProps } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PDFSubmissionCard: React.FC<PDFSubmissionCardProps> = ({
  materialId,
  accessToken,
  isExpired,
  isGraded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const submitMutation = useSubmitPDFExercise();

  // Handle file selection with Zod validation
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate using Zod
    const result = pdfSubmissionSchema.safeParse({ file });
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || 'ไฟล์ไม่ถูกต้อง';
      toast.error(errorMessage);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // File is valid
    setSelectedFile(file);
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('กรุณาเลือกไฟล์ PDF');
      return;
    }

    if (!accessToken) {
      toast.error('กรุณาเข้าสู่ระบบ');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        token: accessToken,
        materialId,
        file: selectedFile,
      });

      // Clear form after successful submission
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Check if can submit
  const canSubmit = !isExpired || !isGraded;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          ส่งงาน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={!canSubmit}
          />

          {/* Selected file preview */}
          {selectedFile ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSizeForDisplay(selectedFile)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={submitMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">ยังไม่ได้เลือกไฟล์</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleFileInputClick}
              variant="outline"
              disabled={!canSubmit || submitMutation.isPending}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์ PDF'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || submitMutation.isPending || !canSubmit}
              className="flex-1"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่งงาน'
              )}
            </Button>
          </div>

          {/* Status messages */}
          {isExpired && isGraded && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>หมดเวลาส่งงานแล้ว ไม่สามารถส่งได้</span>
            </div>
          )}

          {isExpired && !isGraded && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>แบบฝึกหัดฝึกฝน สามารถส่งได้แม้เกินเวลา</span>
            </div>
          )}

          {/* File requirements */}
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p>• ไฟล์ต้องเป็น PDF เท่านั้น</p>
            <p>• ขนาดไฟล์ไม่เกิน 10MB</p>
            <p>• ตรวจสอบไฟล์ให้แน่ใจก่อนส่ง</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFSubmissionCard;
