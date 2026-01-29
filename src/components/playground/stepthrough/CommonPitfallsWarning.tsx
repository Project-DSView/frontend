'use client';

import React from 'react';

import { CommonPitfallsWarningProps } from '@/types';

const CommonPitfallsWarning: React.FC<CommonPitfallsWarningProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="h-5 w-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={`${warning.type}-${index}`}
          className={`animate-in slide-in-from-top-2 flex items-start gap-3 rounded-lg border p-3 transition-all duration-300 ${getSeverityStyles(warning.severity)}`}
        >
          <div className="mt-0.5 flex-shrink-0">{getSeverityIcon(warning.severity)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{warning.message}</p>
            {warning.tip && (
              <p className="mt-1 text-xs opacity-80">
                <span className="font-medium">Tip:</span> {warning.tip}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommonPitfallsWarning;
