'use client';

import React, { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { FileUploadButtonProps } from '@/types';

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileLoad, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      // ตรวจสอบขนาดไฟล์ (100 KB = 100,000 bytes)
      if (file.size > 100000) {
        toast.error('ไฟล์ใหญ่เกินไป! ขนาดสูงสุด 100 KB');
        return;
      }

      // ตรวจสอบประเภทไฟล์
      if (!file.name.endsWith('.py')) {
        toast.error('กรุณาเลือกไฟล์ .py เท่านั้น');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFileLoad(content, file.name);
          toast.success('โหลดไฟล์สำเร็จ!');
        }
      };
      reader.onerror = () => {
        toast.error('เกิดข้อผิดพลาดในการอ่านไฟล์');
      };
      reader.readAsText(file);
    },
    [onFileLoad],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Upload .py
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".py"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </>
  );
};

export default FileUploadButton;
