'use client';

import React from 'react';
import { toast } from 'sonner';

import { ExportUtils } from '@/lib';
import { CopyAndExportButtonProps } from '@/types';

const ExportPythonButton: React.FC<CopyAndExportButtonProps> = ({ code, disabled = false }) => {
  const handleExportPython = () => {
    try {
      toast.loading('กำลัง export Python code...', { id: 'export-python' });

      ExportUtils.exportAsPython(code, {
        filename: 'playground',
      });

      toast.success('Export Python code สำเร็จ!', { id: 'export-python' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export Python code';
      toast.error(`Export Python code ไม่สำเร็จ: ${errorMessage}`, { id: 'export-python' });
    }
  };

  return (
    <button
      onClick={handleExportPython}
      disabled={disabled}
      className="bg-neutral/20 hover:bg-neutral/80 inline-flex items-center justify-center gap-2 rounded px-3 py-2 text-xs text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm md:px-5 md:py-2.5 md:text-sm lg:px-6 lg:py-3 lg:text-base"
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Export Python
    </button>
  );
};

export default ExportPythonButton;
