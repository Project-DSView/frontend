'use client';

import React from 'react';
import { FileText, Eye, Download, X, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

import { SubmittedPDFCardProps } from '@/types';
import { SUBMISSION_STATUS_CONFIG } from '@/data';
import { useSubmissionDownloadUrl, useCancelSubmission } from '@/query';
import {
  formatDate,
  getDisplayFilename,
  formatFileSize,
  openFilePreview,
  downloadFileDirect,
} from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SubmittedPDFCard: React.FC<SubmittedPDFCardProps> = ({ submission, accessToken }) => {
  const statusConfig =
    SUBMISSION_STATUS_CONFIG[submission.status] || SUBMISSION_STATUS_CONFIG.pending;
  const cancelMutation = useCancelSubmission();

  // Format date safely
  const getFormattedDate = () => {
    if (!submission.submitted_at) {
      return 'ไม่ระบุวันที่';
    }
    try {
      return formatDate(submission.submitted_at);
    } catch {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // Get download URL
  const { data: downloadData, isLoading: isDownloadLoading } = useSubmissionDownloadUrl(
    accessToken,
    submission.submission_id,
  );

  // Handle preview
  const handlePreview = () => {
    if (downloadData?.data?.download_url) {
      openFilePreview(downloadData.data.download_url);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (downloadData?.data?.download_url) {
      downloadFileDirect(downloadData.data.download_url, submission.file_name || 'submission.pdf');
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        token: accessToken,
        submissionId: submission.submission_id,
      });
    } catch (error) {
      console.error('Cancel submission error:', error);
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (submission.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            งานที่ส่งแล้ว
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File information */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {getDisplayFilename(submission.file_url, submission.file_name)}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                  {submission.file_size && <span>{formatFileSize(submission.file_size)}</span>}
                  <span>ส่งเมื่อ {getFormattedDate()}</span>
                  {submission.is_late_submission && (
                    <span className="font-medium text-yellow-600">ส่งสาย</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score and feedback (if graded) */}
          {submission.status === 'completed' && (
            <div className="space-y-3">
              {submission.score !== undefined && (
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      คะแนน: {submission.score} คะแนน
                    </span>
                  </div>
                </div>
              )}

              {submission.feedback && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-blue-900">ความคิดเห็นจากอาจารย์</h4>
                  <p className="text-sm whitespace-pre-wrap text-blue-800">{submission.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Error feedback (if rejected) */}
          {submission.status === 'error' && submission.feedback && (
            <div className="rounded-lg bg-red-50 p-4">
              <h4 className="mb-2 text-sm font-medium text-red-900">ข้อเสนอแนะ</h4>
              <p className="text-sm whitespace-pre-wrap text-red-800">{submission.feedback}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isDownloadLoading}
            >
              {isDownloadLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              ดูไฟล์ที่ส่ง
            </Button>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isDownloadLoading}
            >
              {isDownloadLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              ดาวน์โหลด
            </Button>

            {/* Cancel button (for all submissions) */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2 text-white"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 text-white" />
                  )}
                  ยกเลิกการส่ง
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการยกเลิกการส่งงาน</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการส่งงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                    และคุณจะต้องส่งงานใหม่
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                    ยืนยันยกเลิก
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Status information */}
          <div className="text-xs text-gray-500">
            {submission.status === 'pending' && (
              <p>งานของคุณอยู่ในระหว่างการตรวจสอบ กรุณารอผลการตรวจ</p>
            )}
            {submission.status === 'completed' && submission.graded_at && (
              <p>ตรวจแล้วเมื่อ {formatDate(submission.graded_at)}</p>
            )}
            {submission.status === 'error' && (
              <p>งานของคุณไม่ผ่านการตรวจสอบ กรุณาดูข้อเสนอแนะและส่งใหม่</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmittedPDFCard;
