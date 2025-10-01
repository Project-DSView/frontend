'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExportUtils } from '@/lib';
import { ExportPNGButtonProps } from '@/types';

const ExportPNGButton: React.FC<ExportPNGButtonProps> = ({
  visualizationRef,
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    if (!visualizationRef.current) {
      toast.error('ไม่พบ visualization element');
      return;
    }

    try {
      setIsExporting(true);
      toast.loading('กำลัง export PNG...', { id: 'export-png' });

      await ExportUtils.exportAsPNG(visualizationRef, {
        filename: 'visualization',
        quality: 1,
      });

      toast.success('Export PNG สำเร็จ!', { id: 'export-png' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PNG';
      toast.error(`Export PNG ไม่สำเร็จ: ${errorMessage}`, { id: 'export-png' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPNG}
      disabled={disabled || isExporting}
      className="bg-neutral/20 hover:bg-neutral/80 inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm text-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Export PNG
    </button>
  );
};

export default ExportPNGButton;
