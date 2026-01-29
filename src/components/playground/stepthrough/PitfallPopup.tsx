'use client';

import React, { useState } from 'react';

import { COMMON_ERRORS } from '@/data';
import { PitfallPopupProps, type CommonError } from '@/types';

const PitfallPopup: React.FC<PitfallPopupProps> = ({ isOpen, onClose }) => {
  const [selectedError, setSelectedError] = useState<CommonError | null>(null);

  if (!isOpen) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      case 'warning':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ข้อผิดพลาดที่พบบ่อย
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Common Errors ในการเขียนโค้ด Linked List
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex max-h-[60vh] overflow-hidden">
          {/* Error List */}
          <div className="w-1/3 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            {COMMON_ERRORS.map((error: CommonError) => (
              <button
                key={error.id}
                onClick={() => setSelectedError(error)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedError?.id === error.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${getSeverityBadge(error.severity)}`}
                  >
                    {error.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {error.titleTh}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{error.title}</p>
              </button>
            ))}
          </div>

          {/* Error Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedError ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedError.titleTh}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedError.title}</p>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    คำอธิบาย
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedError.descriptionTh}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ตัวอย่างโค้ด
                  </h4>
                  <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                    <code>{selectedError.example}</code>
                  </pre>
                </div>

                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <h4 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-200">
                    วิธีแก้ไข
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {selectedError.solutionTh}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-gray-400">
                <div>
                  <svg
                    className="mx-auto h-12 w-12 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm">เลือกข้อผิดพลาดจากรายการด้านซ้าย</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 dark:border-gray-700">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            คำเตือนเหล่านี้จะแสดงอัตโนมัติเมื่อระบบตรวจพบ pattern ที่เสี่ยง
          </p>
        </div>
      </div>
    </div>
  );
};

export default PitfallPopup;
