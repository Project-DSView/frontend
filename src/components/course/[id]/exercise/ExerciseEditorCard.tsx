'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Play,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from 'lucide-react';

import { ExerciseEditorCardProps } from '@/types';
import { useSubmitCodeExercise, useRequestApproval } from '@/query';
import { formatDate } from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CodeEditor from '@/components/editor/CodeEditor';
import TestCaseResultCard from './TestCaseResultCard';
import RequestApprovalDialog from './RequestApprovalDialog';

const ExerciseEditorCard: React.FC<ExerciseEditorCardProps> = ({
  code,
  onCodeChange,
  isExpired,
  isGraded,
  submission,
  materialId,
  token,
  material,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitCodeMutation = useSubmitCodeExercise();
  const requestApprovalMutation = useRequestApproval();
  const [isRequestApprovalDialogOpen, setIsRequestApprovalDialogOpen] = useState(false);

  const handleRunCode = () => {
    if (!code.trim()) {
      return;
    }

    if (!materialId) {
      console.error('Material ID is missing');
      return;
    }

    if (!token) {
      console.error('Token is missing');
      return;
    }

    submitCodeMutation.mutate({
      token: token,
      materialId: materialId,
      code: code,
    });
  };

  const handleClearCode = () => {
    onCodeChange('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.py')) {
      alert('กรุณาเลือกไฟล์ .py เท่านั้น');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onCodeChange(content);
    };
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRequestApproval = (data: { lab_room: string; table_number: string }) => {
    if (!token || !materialId) {
      return;
    }

    requestApprovalMutation.mutate(
      {
        token,
        materialId,
        data,
      },
      {
        onSuccess: () => {
          setIsRequestApprovalDialogOpen(false);
        },
      },
    );
  };

  const isLoading = submitCodeMutation.isPending;

  // Extract submission data for TestCaseResultCard
  // Always prioritize mutation data (latest submission) over prop data
  const submissionData = submitCodeMutation.data?.data || submission?.data;
  const isCodeSubmission = submissionData && 'code' in submissionData;
  const testResults = isCodeSubmission ? submissionData.results : undefined;

  // Handle both camelCase (from mutation) and snake_case (from query) formats
  const submissionDataWithCounts = submissionData as typeof submissionData & {
    passedCount?: number;
    failedCount?: number;
  };
  // Prioritize camelCase from mutation response over snake_case from query
  const passedCount = isCodeSubmission
    ? submissionDataWithCounts.passedCount || submissionData.passed_count || 0
    : 0;
  const failedCount = isCodeSubmission
    ? submissionDataWithCounts.failedCount || submissionData.failed_count || 0
    : 0;

  // Extract feedback data
  const feedback = isCodeSubmission
    ? submissionData.feedback || submissionData.review_comment
    : undefined;
  const gradedBy = isCodeSubmission ? submissionData.graded_by : undefined;
  const gradedByUser = isCodeSubmission ? submissionData.graded_by_user : undefined;
  const gradedAt = isCodeSubmission
    ? submissionData.graded_at || submissionData.reviewed_at
    : undefined;
  const reviewStatus = isCodeSubmission
    ? submissionData.review_status || (submissionData.feedback ? 'approved' : undefined)
    : undefined;
  const hasFeedback = Boolean(feedback || gradedBy);

  // Check queue status
  const queueJobId = isCodeSubmission ? submissionData.queue_job_id : undefined;
  const queueStatus = isCodeSubmission ? submissionData.queue_status : undefined;
  const queuePosition = isCodeSubmission ? submissionData.queue_position : undefined;
  const queueProcessedByUser = isCodeSubmission
    ? submissionData.queue_processed_by_user
    : undefined;
  const hasQueueJob = Boolean(
    queueJobId && queueStatus && ['pending', 'processing', 'completed'].includes(queueStatus),
  );
  const isBeingProcessed = hasQueueJob && queueStatus === 'processing' && queueProcessedByUser;

  // Check submission status
  const submissionStatus = isCodeSubmission ? submissionData.status : undefined;
  // Status can be 'pending' (after test cases pass, waiting for review) or 'completed' (after manual review)
  // We allow request approval when status is 'pending' or 'completed' (but not 'running' or 'error')
  const isSubmissionReady = submissionStatus === 'pending' || submissionStatus === 'completed';

  // Check if all test cases passed
  // All tests passed if: no failed tests and at least one passed test
  const allTestsPassed = failedCount === 0 && passedCount > 0;

  // Show request approval button if: all tests passed, submission ready (pending/completed), no existing queue job, and not already graded
  const canRequestApproval =
    allTestsPassed && isSubmissionReady && !hasQueueJob && !hasFeedback && token && materialId;

  // Force re-render when mutation data changes
  const [lastSubmissionId, setLastSubmissionId] = useState<string>('');
  useEffect(() => {
    if (submissionData?.submission_id && submissionData.submission_id !== lastSubmissionId) {
      setLastSubmissionId(submissionData.submission_id);
    }
  }, [submissionData?.submission_id, lastSubmissionId]);

  // Clear mutation data when materialId changes to prevent showing old results
  useEffect(() => {
    if (submitCodeMutation.data) {
      submitCodeMutation.reset();
    }
  }, [materialId, submitCodeMutation]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>โค้ดของคุณ</CardTitle>
            {/* Test Case Results - Top Left */}
            {/* Hide test cases when review_status is 'rejected' */}
            {(testResults || passedCount > 0 || failedCount > 0) && reviewStatus !== 'rejected' && (
              <div className="mt-3">
                <TestCaseResultCard
                  results={testResults}
                  passedCount={passedCount}
                  failedCount={failedCount}
                />
              </div>
            )}
            {/* Review Feedback - Below Test Cases */}
            {hasFeedback && (
              <div className="mt-3">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">ผลการตรวจ:</span>
                        {reviewStatus === 'approved' || (!reviewStatus && feedback) ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            ผ่าน
                          </Badge>
                        ) : reviewStatus === 'rejected' ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            <XCircle className="mr-1 h-3 w-3" />
                            ไม่ผ่าน
                          </Badge>
                        ) : null}
                      </div>
                      {isCodeSubmission && submissionData.total_score !== undefined && (
                        <div>
                          <span className="text-sm font-semibold">คะแนน: </span>
                          <span className="text-sm font-bold text-blue-600">
                            {submissionData.total_score}
                            {material?.total_points ? `/${material.total_points}` : ''}
                          </span>
                        </div>
                      )}
                      {feedback && (
                        <div>
                          <span className="text-sm font-semibold">เหตุผล: </span>
                          <p className="mt-1 text-sm whitespace-pre-wrap text-gray-700">
                            {feedback}
                          </p>
                        </div>
                      )}
                      {gradedByUser ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>
                            ผู้ตรวจ: {gradedByUser.firstname} {gradedByUser.lastname}
                          </span>
                        </div>
                      ) : gradedBy ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>ผู้ตรวจ: {gradedBy}</span>
                        </div>
                      ) : null}
                      {gradedAt && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>วันที่ตรวจ: {formatDate(gradedAt)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Buttons - Top Right */}
          <div className="flex gap-2">
            {/* Hide Run Code, Clear, and Upload buttons when exercise is approved */}
            {reviewStatus !== 'approved' && (
              <>
                <Button
                  onClick={handleRunCode}
                  disabled={isLoading || !code.trim() || Boolean(isGraded && isExpired)}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  รันโค้ด
                </Button>

                <Button
                  onClick={handleClearCode}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  ล้าง
                </Button>

                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Code (.py)
                </Button>
              </>
            )}

            {canRequestApproval ? (
              <Button
                onClick={() => setIsRequestApprovalDialogOpen(true)}
                variant="default"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                เรียกตรวจ
              </Button>
            ) : isBeingProcessed ? (
              <Badge className="bg-blue-100 px-3 py-1.5 text-blue-800 hover:bg-blue-100">
                <User className="mr-1 h-4 w-4" />
                ถูกตรวจโดย {queueProcessedByUser?.firstname} {queueProcessedByUser?.lastname}
              </Badge>
            ) : hasQueueJob && !hasFeedback ? (
              <Badge className="bg-yellow-100 px-3 py-1.5 text-yellow-800 hover:bg-yellow-100">
                <Clock className="mr-1 h-4 w-4" />
                รอการตรวจ
                {queuePosition && queueStatus === 'pending' ? ` (คิวที่ ${queuePosition})` : ''}
              </Badge>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept=".py"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height: 400 }}>
          <CodeEditor code={code} onCodeChange={onCodeChange} height={400} />
        </div>

        {isGraded && isExpired && (
          <p className="mt-2 text-sm text-red-600">หมดเวลาส่งงานแล้ว ไม่สามารถส่งได้</p>
        )}
        {isExpired && !isGraded && (
          <p className="mt-2 text-sm text-yellow-600">แบบฝึกหัดฝึกฝน สามารถส่งได้แม้เกินเวลา</p>
        )}
      </CardContent>

      <RequestApprovalDialog
        isOpen={isRequestApprovalDialogOpen}
        onClose={() => setIsRequestApprovalDialogOpen(false)}
        onSubmit={handleRequestApproval}
        isLoading={requestApprovalMutation.isPending}
      />
    </Card>
  );
};

export default ExerciseEditorCard;
