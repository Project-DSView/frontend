'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Trash2, Loader2, UserCheck } from 'lucide-react';

import { ExerciseEditorCardProps } from '@/types';
import { useSubmitCodeExercise, useRequestApproval } from '@/query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CodeEditor from '@/components/editor/CodeEditor';
import TestCaseResultCard from './TestCaseResultCard';
import RequestApprovalDialog from './RequestApprovalDialog';
import QueueStatusCard from './QueueStatusCard';

const ExerciseEditorCard: React.FC<ExerciseEditorCardProps> = ({
  code,
  onCodeChange,
  isExpired,
  isGraded,
  submission,
  materialId,
  token,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitCodeMutation = useSubmitCodeExercise();
  const requestApprovalMutation = useRequestApproval();

  // State for request approval dialog
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

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

  const handleRequestApproval = () => {
    setIsRequestDialogOpen(true);
  };

  const handleSubmitApproval = (data: {
    lab_room: string;
    table_number: string;
    notes?: string;
  }) => {
    if (!token || !materialId) return;

    requestApprovalMutation.mutate(
      {
        token,
        materialId,
        data,
      },
      {
        onSuccess: () => {
          setIsRequestDialogOpen(false);
        },
      },
    );
  };

  const isLoading = submitCodeMutation.isPending;
  const isRequestingApproval = requestApprovalMutation.isPending;

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

  // Check if all tests passed (can request approval)
  const canRequestApproval = passedCount > 0 && failedCount === 0 && !isExpired;

  // Check if already has queue job (prevent duplicate requests)
  const hasQueueJob =
    isCodeSubmission && submissionData?.queue_job_id && submissionData.queue_status !== 'cancelled';

  // Debug logging
  useEffect(() => {
    if (submissionData) {
      console.log('=== DEBUG SUBMISSION DATA ===');
      console.log('Raw submission data:', submissionData);
      console.log('passedCount (camelCase):', submissionDataWithCounts.passedCount);
      console.log('failedCount (camelCase):', submissionDataWithCounts.failedCount);
      console.log(
        'passed_count (snake_case):',
        (submissionData as { passed_count?: number }).passed_count,
      );
      console.log(
        'failed_count (snake_case):',
        (submissionData as { failed_count?: number }).failed_count,
      );
      console.log('Final passedCount:', passedCount);
      console.log('Final failedCount:', failedCount);
      console.log('Test results:', testResults);
      console.log('=============================');
    }
  }, [submissionData, passedCount, failedCount, testResults, submissionDataWithCounts]);

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
            {(testResults || passedCount > 0 || failedCount > 0) && (
              <div className="mt-3">
                <TestCaseResultCard
                  results={testResults}
                  passedCount={passedCount}
                  failedCount={failedCount}
                />
              </div>
            )}

            {/* Request Approval Button */}
            {canRequestApproval && !hasQueueJob && (
              <div className="mt-3">
                <Button
                  onClick={handleRequestApproval}
                  disabled={isRequestingApproval}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isRequestingApproval ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  เรียกผู้สอน
                </Button>
              </div>
            )}
          </div>

          {/* Buttons - Top Right */}
          <div className="flex gap-2">
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

            <Button onClick={handleClearCode} variant="outline" className="flex items-center gap-2">
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

      {/* Queue Status Card */}
      {hasQueueJob && isCodeSubmission && (
        <div className="px-6 pb-6">
          <QueueStatusCard
            status={submissionData.queue_status}
            labRoom={submissionData.lab_room}
            tableNumber={submissionData.table_number}
            claimedByName={submissionData.queue_claimed_by_name}
            reviewComment={submissionData.review_comment}
            reviewStatus={submissionData.review_status as 'approved' | 'rejected'}
            reviewedAt={submissionData.reviewed_at}
          />
        </div>
      )}

      {/* Request Approval Dialog */}
      <RequestApprovalDialog
        isOpen={isRequestDialogOpen}
        onClose={() => setIsRequestDialogOpen(false)}
        onSubmit={handleSubmitApproval}
        isLoading={isRequestingApproval}
      />
    </Card>
  );
};

export default ExerciseEditorCard;
