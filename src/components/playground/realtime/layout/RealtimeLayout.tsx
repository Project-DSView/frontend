'use client';

import React, { Suspense, useRef } from 'react';
import { SecurityStatus } from '@/types/realtime/SinglyLinkedList.types';
import CodeEditor from '@/components/playground/shared/CodeEditor';
import ExportPNGButton from '@/components/playground/shared/ExportPNGButton';
import ExportPythonButton from '@/components/playground/shared/ExportPythonButton';
import FileUploadButton from '@/components/playground/shared/FileUploadButton';

interface RealtimeLayoutProps<T = unknown> {
  dataStructure: string;
  code: string;
  onCodeChange: (code: string) => void;
  data: T;
  isExecuting: boolean;
  error: string | null;
  securityStatus: SecurityStatus;
  visualizationComponent: React.ComponentType<{
    data: T;
    isExecuting: boolean;
    error: string | null;
    securityStatus: SecurityStatus;
  }>;
}

const RealtimeLayout = <T,>({
  dataStructure,
  code,
  onCodeChange,
  data,
  isExecuting,
  error,
  securityStatus,
  visualizationComponent: VisualizationComponent,
}: RealtimeLayoutProps<T>) => {
  const visualizationRef = useRef<HTMLDivElement>(null);
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6" suppressHydrationWarning>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-xl font-bold text-gray-800 sm:text-2xl">
              {dataStructure === 'singly-linked-list' && 'Real-time Singly Linked List'}
              {dataStructure === 'doubly-linked-list' && 'Real-time Doubly Linked List'}
              {dataStructure === 'bst' && 'Real-time Binary Search Tree'}
              {dataStructure === 'stack' && 'Real-time Stack'}
              {dataStructure === 'undirected-graph' && 'Real-time Undirected Graph'}
              {dataStructure === 'directed-graph' && 'Real-time Directed Graph'}
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              เขียนโค้ด Python และดูการทำงานแบบ Real Time พร้อม visualization
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2">
              <FileUploadButton onFileLoad={(content) => onCodeChange(content)} />
              <ExportPNGButton visualizationRef={visualizationRef} />
              <ExportPythonButton code={code} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาดในการรันโค้ด</h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="font-mono whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Status */}
      {!securityStatus.isSafe && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Security Warning</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-inside list-disc">
                  {securityStatus.violations.map((violation, index) => (
                    <li key={index}>{violation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-200px)] flex-col gap-4 lg:flex-row">
        {/* Left Side - Code Editor */}
        <div className="w-full rounded-lg bg-white p-3 shadow sm:p-6 lg:w-1/2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h2 className="text-base font-semibold text-gray-800 sm:text-lg">Code Editor</h2>
              <div className="bg-neutral/20 rounded-md px-2 py-1 font-mono text-xs text-black/70 sm:px-3 sm:text-sm">
                playground.py
              </div>
            </div>
          </div>

          <div className="h-[300px] lg:h-[calc(100%-60px)]">
            <CodeEditor
              code={code}
              onCodeChange={onCodeChange}
              height="100%"
              currentStep={null}
              error={error}
            />
          </div>
        </div>

        {/* Right Side - Visualization */}
        <div className="w-full rounded-lg bg-white p-3 shadow sm:p-6 lg:w-1/2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
              {dataStructure === 'singly-linked-list' && 'Singly Linked List Visualization'}
              {dataStructure === 'doubly-linked-list' && 'Doubly Linked List Visualization'}
              {dataStructure === 'bst' && 'Binary Search Tree Visualization'}
              {dataStructure === 'stack' && 'Stack Visualization'}
              {dataStructure === 'undirected-graph' && 'Undirected Graph Visualization'}
              {dataStructure === 'directed-graph' && 'Directed Graph Visualization'}
            </h2>
          </div>

          <div ref={visualizationRef} className="h-[300px] overflow-auto lg:h-[calc(100%-60px)]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading visualization...</p>
                  </div>
                </div>
              }
            >
              <VisualizationComponent
                data={data}
                isExecuting={isExecuting}
                error={error}
                securityStatus={securityStatus}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeLayout;
