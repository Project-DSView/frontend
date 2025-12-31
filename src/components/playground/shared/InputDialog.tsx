'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface InputDialogProps {
  isOpen: boolean;
  prompts: Array<{ prompt: string; inputId: number }> | null;
  totalInputs: number;
  onSubmit: (values: string[]) => void;
  onCancel: () => void;
}

const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  prompts,
  totalInputs,
  onSubmit,
  onCancel,
}) => {
  const [inputText, setInputText] = useState<string>('');

  // Reset input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setInputText('');
    }
  }, [isOpen]);

  const parseInputValues = (text: string): string[] => {
    // Split by newlines first, then by commas if no newlines
    let values: string[] = [];

    if (text.includes('\n')) {
      // Split by newlines
      values = text
        .split('\n')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    } else if (text.includes(',')) {
      // Split by commas
      values = text
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    } else {
      // Single value
      const trimmed = text.trim();
      if (trimmed) {
        values = [trimmed];
      }
    }

    return values;
  };

  const handleSubmit = () => {
    const values = parseInputValues(inputText);

    // Validate we have the correct number of inputs
    if (values.length < totalInputs) {
      // If user entered fewer values, pad with empty strings
      while (values.length < totalInputs) {
        values.push('');
      }
    }

    // Validate all inputs are filled
    if (values.some((v) => !v.trim())) {
      return; // Don't submit if any input is empty
    }

    onSubmit(values);
    setInputText('');
  };

  const handleCancel = () => {
    setInputText('');
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  const parsedValues = parseInputValues(inputText);
  const isValid =
    parsedValues.length >= totalInputs && parsedValues.every((v) => v.trim().length > 0);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>กรุณาใส่ Input Values</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            ระบบตรวจพบ input() {totalInputs} แห่ง แต่อาจมีมากกว่านี้หากมีการวนลูป
            <br />
            กรุณากรอกค่าทั้งหมดทีละบรรทัด หรือคั่นด้วยเครื่องหมายจุลภาค (,)
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {prompts && prompts.length === 1 && prompts[0].prompt && (
            <div className="rounded-md border border-blue-100 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Input Requested:</strong> {prompts[0].prompt}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="input-textarea" className="text-sm font-medium">
              {prompts && prompts.length === 1
                ? 'Value'
                : `Input Values (Filled ${parsedValues.length})`}
            </Label>
            <Textarea
              id="input-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                prompts && prompts.length === 1
                  ? `Enter value for '${prompts[0].prompt}'`
                  : `Example: 5, 10, area\nOr:\n5\n10\narea`
              }
              autoFocus
              className="min-h-[120px] resize-none border-gray-300 font-mono focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              rows={4}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {prompts && prompts.length === 1
                  ? 'Press Ctrl+Enter to submit'
                  : 'Separate with commas or newlines • Ctrl+Enter to submit'}
              </p>
              {parsedValues.length < totalInputs && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {totalInputs === 1 ? 'Required' : `Need at least ${totalInputs} values`}
                </p>
              )}
              {parsedValues.length >= totalInputs && (
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  Ready to submit
                </p>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            ส่งทั้งหมด
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InputDialog;
