import React from 'react';
import { ConsoleOutputProps } from '@/types';
import MemoryUsagePanel from './MemoryUsagePanel';

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ steps, currentStepIndex }) => {
  const currentStep =
    steps.length > 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  // Use stdout if available, otherwise fallback to print_output for backward compatibility
  const rawOutput: unknown = currentStep?.state?.stdout || currentStep?.state?.print_output;

  // Ensure output is always an array
  let output: string[];
  if (!rawOutput) {
    output = [];
  } else if (Array.isArray(rawOutput)) {
    output = rawOutput as string[];
  } else if (typeof rawOutput === 'string') {
    // If it's a string, split by newlines or wrap in array
    output = rawOutput.split('\n').filter((line: string) => line.length > 0);
  } else {
    // Fallback: convert to string and wrap
    output = [String(rawOutput)];
  }

  return (
    <div className="space-y-4">
      {/* Console Output Section */}
      <div className="overflow-hidden rounded-lg bg-gray-100 shadow-inner dark:bg-gray-900">
        <div className="border-b border-gray-300 bg-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
              Console Output
            </span>
          </div>
        </div>
        <div className="max-h-40 min-h-[60px] overflow-y-auto p-4 font-mono text-sm">
          {output.length === 0 ? (
            <div className="text-gray-500 italic dark:text-gray-500">No output generated...</div>
          ) : (
            output.map((line, idx) => (
              <div
                key={idx}
                className="font-bold whitespace-pre-wrap text-gray-800 dark:text-cyan-300"
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Memory Usage Panel */}
      <MemoryUsagePanel steps={steps} currentStepIndex={currentStepIndex} />
    </div>
  );
};

export default ConsoleOutput;
