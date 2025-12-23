'use client';

import React from 'react';
import { FileText, Download, X, CheckCircle, Clock, XCircle, Loader2, Eye } from 'lucide-react';

import { SubmittedPDFCardProps } from '@/types';
import { SUBMISSION_STATUS_CONFIG } from '@/data';
import { useCancelSubmission } from '@/query';
import { CourseService } from '@/services';
import {
  formatDate,
  getDisplayFilename,
  formatFileSize,
  downloadFileDirect,
  getErrorMessage,
} from '@/lib';
import { toast } from 'sonner';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SubmittedPDFCard: React.FC<SubmittedPDFCardProps> = ({
  submission,
  accessToken,
  material,
}) => {
  const statusConfig =
    SUBMISSION_STATUS_CONFIG[submission.status] || SUBMISSION_STATUS_CONFIG.pending;
  const cancelMutation = useCancelSubmission();
  const [downloadingFeedback, setDownloadingFeedback] = React.useState(false);
  const [feedbackViewerOpen, setFeedbackViewerOpen] = React.useState(false);
  const [feedbackViewerUrl, setFeedbackViewerUrl] = React.useState<string | null>(null);
  const [submissionViewerOpen, setSubmissionViewerOpen] = React.useState(false);
  const [submissionViewerUrl, setSubmissionViewerUrl] = React.useState<string | null>(null);
  const [loadingSubmission, setLoadingSubmission] = React.useState(false);

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

  // Handle download - call endpoint directly to stream file
  const handleDownload = async () => {
    try {
      const downloadUrl = `/api/submissions/${submission.submission_id}/download`;
      await downloadFileDirect(downloadUrl, submission.file_name || 'submission.pdf', accessToken);
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show a toast/notification here
    }
  };

  // Handle view submission file
  const handleViewSubmission = async () => {
    if (!submission.file_url || !accessToken) return;

    setLoadingSubmission(true);
    try {
      const downloadUrl = `/api/submissions/${submission.submission_id}/download`;
      const blob = await downloadFileDirect(
        downloadUrl,
        submission.file_name || 'submission.pdf',
        accessToken,
        true,
      );
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        setSubmissionViewerUrl(url);
        setSubmissionViewerOpen(true);
      }
    } catch (error) {
      console.error('Error loading submission file:', error);
    } finally {
      setLoadingSubmission(false);
    }
  };

  // Handle download feedback file
  const handleDownloadFeedback = async () => {
    if (!submission.feedback_file_url || !accessToken) return;

    setDownloadingFeedback(true);
    try {
      const blob = await CourseService.downloadFeedbackFile(accessToken, submission.submission_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Extract filename from URL or use default
      const urlParts = submission.feedback_file_url.split('/');
      const filename = urlParts[urlParts.length - 1] || 'feedback.pdf';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Error downloading feedback file';
      toast.error(errorMessage);
    } finally {
      setDownloadingFeedback(false);
    }
  };

  // Handle view feedback file
  const handleViewFeedback = async () => {
    if (!submission.feedback_file_url || !accessToken) return;

    try {
      const blob = await CourseService.downloadFeedbackFile(accessToken, submission.submission_id);
      const url = window.URL.createObjectURL(blob);
      setFeedbackViewerUrl(url);
      setFeedbackViewerOpen(true);
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Error loading feedback file';
      toast.error(errorMessage);
    }
  };

  // Cleanup blob URL when modal closes
  React.useEffect(() => {
    if (!feedbackViewerOpen && feedbackViewerUrl) {
      window.URL.revokeObjectURL(feedbackViewerUrl);
      setFeedbackViewerUrl(null);
    }
  }, [feedbackViewerOpen, feedbackViewerUrl]);

  React.useEffect(() => {
    if (!submissionViewerOpen && submissionViewerUrl) {
      window.URL.revokeObjectURL(submissionViewerUrl);
      setSubmissionViewerUrl(null);
    }
  }, [submissionViewerOpen, submissionViewerUrl]);

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
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
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
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getDisplayFilename(submission.file_url, submission.file_name)}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {submission.file_size && <span>{formatFileSize(submission.file_size)}</span>}
                  <span>ส่งเมื่อ {getFormattedDate()}</span>
                  {submission.is_late_submission && (
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">ส่งสาย</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score and feedback (if graded) */}
          {submission.status === 'completed' && (
            <div className="space-y-3">
              {(submission.total_score !== undefined || submission.score !== undefined) && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-300">
                      คะแนน:{' '}
                      {submission.total_score !== undefined
                        ? `${submission.total_score}${material?.total_points ? `/${material.total_points}` : ''}`
                        : submission.score !== undefined
                          ? `${submission.score}${material?.total_points ? `/${material.total_points}` : ''}`
                          : '0'}
                    </span>
                  </div>
                </div>
              )}

              {submission.feedback && (
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-300">
                    ความคิดเห็นจากอาจารย์
                  </h4>
                  <p className="text-sm whitespace-pre-wrap text-blue-800 dark:text-blue-300">
                    {submission.feedback}
                  </p>
                </div>
              )}

              {/* Show feedback file section if graded (even if no feedback_file_url yet) */}
              {submission.graded_at && (
                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-purple-900 dark:text-purple-300">
                        ไฟล์ Feedback
                      </h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {submission.feedback_file_url
                          ? 'อาจารย์ได้อัปโหลดไฟล์ PDF ที่ตรวจแล้ว'
                          : 'ยังไม่มีไฟล์ Feedback จากอาจารย์'}
                      </p>
                    </div>
                    {submission.feedback_file_url && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewFeedback}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          ดูเอกสาร
                        </Button>
                        <Dialog open={feedbackViewerOpen} onOpenChange={setFeedbackViewerOpen}>
                          <DialogContent className="max-h-[90vh] max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>เอกสาร Feedback</DialogTitle>
                              <DialogDescription>เอกสาร PDF ที่อาจารย์ตรวจแล้ว</DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 h-[70vh] w-full overflow-hidden rounded-lg border">
                              {feedbackViewerUrl && (
                                <iframe
                                  src={feedbackViewerUrl}
                                  className="h-full w-full"
                                  title="Feedback PDF"
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadFeedback}
                          disabled={downloadingFeedback}
                          className="flex items-center gap-2"
                        >
                          {downloadingFeedback ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          ดาวน์โหลด Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error feedback (if rejected) */}
          {submission.status === 'error' && submission.feedback && (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <h4 className="mb-2 text-sm font-medium text-red-900 dark:text-red-300">
                ข้อเสนอแนะ
              </h4>
              <p className="text-sm whitespace-pre-wrap text-red-800 dark:text-red-300">
                {submission.feedback}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleViewSubmission}
              variant="outline"
              disabled={loadingSubmission}
              className="flex items-center gap-2"
            >
              {loadingSubmission ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              ดูเอกสาร
            </Button>
            <Dialog open={submissionViewerOpen} onOpenChange={setSubmissionViewerOpen}>
              <DialogContent className="max-h-[90vh] max-w-4xl">
                <DialogHeader>
                  <DialogTitle>เอกสารที่ส่ง</DialogTitle>
                  <DialogDescription>เอกสาร PDF ที่คุณส่งมา</DialogDescription>
                </DialogHeader>
                <div className="mt-4 h-[70vh] w-full overflow-hidden rounded-lg border">
                  {submissionViewerUrl && (
                    <iframe
                      src={submissionViewerUrl}
                      className="h-full w-full"
                      title="Submission PDF"
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ดาวน์โหลด
            </Button>

            {/* Cancel button - only show if not graded */}
            {submission.status !== 'completed' && !submission.graded_at && (
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
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      ยืนยันยกเลิก
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Status information */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
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
