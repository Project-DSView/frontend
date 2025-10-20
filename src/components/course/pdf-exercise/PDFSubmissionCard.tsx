'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useSubmitPDFExercise } from '@/query';
import { validatePDFFile, formatFileSizeForDisplay } from '@/lib';
import { PDFSubmissionCardProps } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PDFSubmissionCard: React.FC<PDFSubmissionCardProps> = ({
  materialId,
  accessToken,
  isExpired,
  isGraded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useSubmitPDFExercise();

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validatePDFFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setSelectedFile(file);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
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

      // Clear selected file after successful submission
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
          {/* File upload area */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${!canSubmit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={canSubmit ? handleFileInputClick : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={!canSubmit}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile ? 'เปลี่ยนไฟล์' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
                </p>
                <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ PDF ขนาดไม่เกิน 10MB</p>
              </div>
            </div>
          </div>

          {/* Selected file preview */}
          {selectedFile && (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSizeForDisplay(selectedFile)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-2">
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
            {selectedFile && (
              <Button
                variant="outline"
                onClick={handleRemoveFile}
                disabled={submitMutation.isPending}
              >
                ล้าง
              </Button>
            )}
          </div>

          {/* Status messages */}
          {isExpired && isGraded && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>หมดเวลาส่งงานแล้ว ไม่สามารถส่งได้</span>
            </div>
          )}

          {isExpired && !isGraded && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span>แบบฝึกหัดฝึกฝน สามารถส่งได้แม้เกินเวลา</span>
            </div>
          )}

          {/* File requirements */}
          <div className="space-y-1 text-xs text-gray-500">
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
