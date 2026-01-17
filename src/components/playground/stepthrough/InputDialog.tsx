'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputDialogProps } from '@/types';

const InputDialog: React.FC<InputDialogProps> = ({ isOpen, prompts, onSubmit, onCancel }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input and focus when dialog opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      // Focus input after dialog animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      return; // Don't submit empty input
    }

    onSubmit([trimmedValue]);
    setInputValue('');
  };

  const handleCancel = () => {
    setInputValue('');
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  const currentPrompt = prompts?.[0]?.prompt || 'Enter value';
  const isValid = inputValue.trim().length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              ?
            </span>
            กรุณาใส่ค่า Input
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            โปรแกรมต้องการค่า input เพื่อดำเนินการต่อ
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Prompt display */}
          {currentPrompt && currentPrompt !== 'Enter value' && (
            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Prompt:</span> {currentPrompt}
              </p>
            </div>
          )}

          {/* Input field */}
          <div className="space-y-2">
            <Label htmlFor="input-field" className="text-sm font-medium">
              ค่า Input
            </Label>
            <Input
              ref={inputRef}
              id="input-field"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ค่าที่ต้องการ..."
              className="border-gray-300 font-mono text-base focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">กด Enter เพื่อส่งค่า</p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} size="sm">
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} size="sm">
            ส่งค่า
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InputDialog;
