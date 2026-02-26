'use client';

import React, { useEffect } from 'react';
import { Loader2, X, Upload, FileX } from 'lucide-react';
import { useForm } from '@tanstack/react-form';

import { useApprovePDFSubmission } from '@/query';
import { gradingSchema } from '@/lib';
import { GradingDialogProps } from '@/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GradingDialog: React.FC<GradingDialogProps> = ({
  submission,
  isOpen,
  onClose,
  courseId,
  accessToken,
  totalPoints,
}) => {
  const approveMutation = useApprovePDFSubmission();

  const form = useForm({
    defaultValues: {
      score: submission.total_score?.toString() || '0',
      maxScore: totalPoints?.toString() || '100',
      comment: submission.feedback || '',
      feedbackFile: null as File | null,
    },
    onSubmit: async ({ value }) => {
      if (!accessToken) return;

      // Validate with zod schema
      const result = gradingSchema.safeParse(value);
      if (!result.success) {
        // Set field errors
        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof typeof value;
          if (fieldName) {
            form.setFieldMeta(fieldName, (meta) => ({
              ...meta,
              errors: [issue.message],
            }));
          }
        });
        return;
      }

      try {
        await approveMutation.mutateAsync({
          token: accessToken,
          submissionId: submission.submission_id,
          score: result.data.score,
          comment: result.data.comment,
          feedbackFile: result.data.feedbackFile || undefined,
          maxScore: result.data.maxScore,
          courseId,
        });
        form.reset();
        onClose();
      } catch (error) {
        // Error is handled by the mutation
        console.error('Failed to approve submission:', error);
      }
    },
  });

  // Reset form when modal opens/closes or submission changes
  useEffect(() => {
    if (isOpen) {
      form.setFieldValue('score', submission.total_score?.toString() || '0');
      form.setFieldValue('maxScore', totalPoints?.toString() || '100');
      form.setFieldValue('comment', submission.feedback || '');
      form.setFieldValue('feedbackFile', null);
    }
  }, [isOpen, submission, totalPoints, form]);

  const handleClose = () => {
    if (!approveMutation.isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ให้คะแนน</DialogTitle>
          <DialogDescription>ให้คะแนนและ feedback สำหรับงานที่ส่ง</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {/* Submission Info */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">ชื่อแบบฝึกหัด</Label>
                  <p className="mt-1 text-sm font-medium">{submission.exercise_title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">คนส่ง</Label>
                  <p className="mt-1 text-sm font-medium">{submission.submitter_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">วันที่ส่ง</Label>
                  <p className="mt-1 text-sm font-medium">
                    {new Date(submission.submitted_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {submission.total_score !== undefined && submission.total_score > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">คะแนนเดิม</Label>
                    <p className="mt-1 text-sm font-medium">
                      {submission.total_score}
                      {totalPoints ? `/${totalPoints}` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Score Input */}
            <form.Field
              name="score"
              validators={{
                onChange: ({ value }) => {
                  const num = parseInt(value, 10);
                  if (isNaN(num)) {
                    return 'กรุณากรอกคะแนน';
                  }
                  if (num < 0) {
                    return 'คะแนนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0';
                  }
                  return undefined;
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <form.Field
                  name="maxScore"
                  validators={{
                    onChange: ({ value }) => {
                      const num = parseInt(value, 10);
                      if (isNaN(num) || num <= 0) {
                        return 'คะแนนเต็มต้องเป็นตัวเลขที่มากกว่า 0';
                      }
                      return undefined;
                    },
                    onChangeAsyncDebounceMs: 500,
                  }}
                >
                  {(maxScoreField) => {
                    // Cross-field validation
                    const scoreNum = parseInt(field.state.value, 10);
                    const maxScoreNum = parseInt(maxScoreField.state.value, 10);
                    const scoreError =
                      !isNaN(scoreNum) && !isNaN(maxScoreNum) && scoreNum > maxScoreNum
                        ? `คะแนนต้องอยู่ระหว่าง 0 และ ${maxScoreNum}`
                        : undefined;

                    return (
                      <div>
                        <Label htmlFor="score">
                          คะแนน <span className="text-red-500">*</span>
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Input
                            id="score"
                            type="number"
                            min="0"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="0"
                            className={`flex-1 ${
                              field.state.meta.errors.length > 0 || scoreError
                                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                          <span className="text-gray-500">/</span>
                          <Input
                            id="max-score"
                            type="number"
                            min="1"
                            value={maxScoreField.state.value}
                            onChange={(e) => maxScoreField.handleChange(e.target.value)}
                            onBlur={maxScoreField.handleBlur}
                            placeholder="100"
                            className={`flex-1 ${
                              maxScoreField.state.meta.errors.length > 0 || scoreError
                                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                        </div>
                        {(field.state.meta.errors.length > 0 ||
                          maxScoreField.state.meta.errors.length > 0 ||
                          scoreError) && (
                          <p className="mt-1 text-xs text-red-500">
                            {field.state.meta.errors[0] ||
                              maxScoreField.state.meta.errors[0] ||
                              scoreError}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          กรุณาใส่คะแนนที่ได้และคะแนนเต็ม
                        </p>
                      </div>
                    );
                  }}
                </form.Field>
              )}
            </form.Field>

            {/* Comment Input */}
            <form.Field
              name="comment"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'กรุณากรอกคำติชม';
                  }
                  if (value.trim().length < 3) {
                    return 'คำติชมต้องมีอย่างน้อย 3 ตัวอักษร';
                  }
                  return undefined;
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="comment">
                    คำติชม <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="comment"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="เขียน feedback สำหรับงานนี้..."
                    className={`mt-1 min-h-[100px] ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                        : ''
                    }`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Feedback File Upload */}
            <form.Field
              name="feedbackFile"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  if (value.type !== 'application/pdf') {
                    return 'ไฟล์ต้องเป็น PDF เท่านั้น';
                  }
                  const maxSize = 10 * 1024 * 1024; // 10MB
                  if (value.size > maxSize) {
                    return 'ไฟล์ใหญ่เกิน 10MB';
                  }
                  return undefined;
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="feedback-file-input">ไฟล์ Feedback (ไม่บังคับ)</Label>
                  <div className="mt-2">
                    {!field.state.value ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id="feedback-file-input"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            field.handleChange(file);
                          }}
                          className={`flex-1 ${
                            field.state.meta.errors.length > 0
                              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                              : ''
                          }`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('feedback-file-input')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center gap-2">
                          <FileX className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium">{field.state.value.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(field.state.value.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            field.handleChange(null);
                            const fileInput = document.getElementById(
                              'feedback-file-input',
                            ) as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = '';
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      อัปโหลดไฟล์ PDF ที่ตรวจแล้ว (สูงสุด 10MB)
                    </p>
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={approveMutation.isPending}
            >
              ยกเลิก
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || approveMutation.isPending || isSubmitting}
                >
                  {approveMutation.isPending || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    'บันทึก'
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GradingDialog;
