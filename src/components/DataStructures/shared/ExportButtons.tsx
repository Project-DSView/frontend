import React, { useState } from 'react';
import { toast } from 'sonner';
import { ExportUtils } from '@/lib/export.utils';

interface ExportButtonsProps {
  visualizationRef: React.RefObject<HTMLDivElement | null>;
  pythonCode: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  visualizationRef,
  pythonCode,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    if (!visualizationRef.current) {
      toast.error('Visualization element not found');
      return;
    }

    try {
      setIsExporting(true);
      toast.loading('กำลัง export PNG...', { id: 'export-png' });
      
      await ExportUtils.exportAsPNG(visualizationRef, {
        filename: 'doubly-linked-list-visualization',
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

  const handleExportPython = () => {
    try {
      toast.loading('กำลัง export Python code...', { id: 'export-python' });
      
      ExportUtils.exportAsPython(pythonCode, {
        filename: 'doubly-linked-list-code',
      });
      
      toast.success('Export Python code สำเร็จ!', { id: 'export-python' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export Python code';
      toast.error(`Export Python code ไม่สำเร็จ: ${errorMessage}`, { id: 'export-python' });
    }
  };

  const handleCopyCode = async () => {
    try {
      const success = await ExportUtils.copyToClipboard(pythonCode);
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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleExportPNG}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/50 disabled:bg-primary/50"
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
        {isExporting ? 'Exporting...' : 'Export PNG'}
      </button>

      <button
        onClick={handleExportPython}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white transition-colors hover:bg-secondary/50 disabled:bg-secondary/50"
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export Python
      </button>

      <button
        onClick={handleCopyCode}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-lg bg-neutral px-4 py-2 text-white transition-colors hover:bg-neutral/50 disabled:bg-neutral/50"
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
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Copy Code
      </button>
    </div>
  );
};

export default ExportButtons;
