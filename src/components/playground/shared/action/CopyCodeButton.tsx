'use client';

import React from 'react';
import { toast } from 'sonner';

import { ExportUtils } from '@/lib';
import { CopyAndExportButtonProps } from '@/types';

const CopyCodeButton: React.FC<CopyAndExportButtonProps> = ({ code, disabled = false }) => {
  const handleCopyCode = async () => {
    try {
      const success = await ExportUtils.copyToClipboard(code);
      if (success) {
        toast.success('Copy code สำเร็จ!', { id: 'copy-code' });
      } else {
        toast.error('Copy code ไม่สำเร็จ', { id: 'copy-code' });
      }
    } catch {
      toast.error('Copy code ไม่สำเร็จ', { id: 'copy-code' });
    }
  };

  return (
    <button
      onClick={handleCopyCode}
      disabled={disabled}
      className="bg-neutral/20 dark:bg-neutral/80 hover:bg-neutral/80 dark:hover:bg-neutral/40 inline-flex items-center justify-center gap-1 rounded px-2 py-1 text-xs text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5 sm:py-1.5 sm:text-xs dark:text-gray-200"
    >
      <svg
        className="h-3 w-3 sm:h-4 sm:w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      Copy Code
    </button>
  );
};

export default CopyCodeButton;
