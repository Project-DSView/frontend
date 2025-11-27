'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useCompleteReview } from '@/query';
import { toast } from 'sonner';
import { ReviewScoreDialogProps } from '@/types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ReviewScoreDialog: React.FC<ReviewScoreDialogProps> = ({
  isOpen,
  onClose,
  jobId,
  token,
  onSuccess,
}) => {
  const [status, setStatus] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const completeReviewMutation = useCompleteReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('ไม่พบ access token');
      return;
    }

    if (!comment.trim()) {
      setError('กรุณากรอกเหตุผล');
      return;
    }

    if (comment.trim().length < 10) {
      setError('เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setError('');

    try {
      await completeReviewMutation.mutateAsync({
        token,
        jobId,
        data: {
          status,
          comment: comment.trim(),
        },
      });

      // Reset form
      setStatus('approved');
      setComment('');
      setError('');

      // Close modal and refresh
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Review submission error:', error);
    }
  };

  const handleClose = () => {
    if (!completeReviewMutation.isPending) {
      setStatus('approved');
      setComment('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ให้คะแนน</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ผลการตรวจ</Label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as 'approved' | 'rejected')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="cursor-pointer font-normal">
                  ผ่าน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <Label htmlFor="rejected" className="cursor-pointer font-normal">
                  ไม่ผ่าน
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              เหตุผล <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="กรอกเหตุผลในการให้คะแนน..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-gray-500">
              ต้องมีอย่างน้อย 10 ตัวอักษร ({comment.length}/10)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={completeReviewMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={completeReviewMutation.isPending}>
              {completeReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่ง'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewScoreDialog;
