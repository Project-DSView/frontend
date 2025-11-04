import React from 'react';

import { StepthroughVisualizationProps } from '@/types';
import { QueueData } from '@/types/stepthrough/Queue.types';

import ZoomableContainer from '../../shared/ZoomableContainer';

const QueueStepthrough: React.FC<StepthroughVisualizationProps<QueueData>> = ({
  steps,
  currentStepIndex,
  data,
}) => {
  const currentStep = steps[currentStepIndex];
  const queueData = data as QueueData;

  // Get queue elements from step state
  const getQueueElements = (): string[] => {
    if (currentStep?.state?.instances) {
      const instanceEntries = Object.entries(currentStep.state.instances);
      if (instanceEntries.length > 0) {
        const firstInstance = instanceEntries[0][1];
        // Type guard: check if it's an object with data property
        if (
          firstInstance &&
          typeof firstInstance === 'object' &&
          'data' in firstInstance &&
          Array.isArray((firstInstance as { data: unknown }).data)
        ) {
          return (firstInstance as { data: string[] }).data;
        }
        // Type guard: check if it's directly an array
        if (Array.isArray(firstInstance)) {
          return firstInstance as string[];
        }
      }
    }
    return queueData?.elements || [];
  };

  const elements = getQueueElements();

  // Get dequeued element from step state (look for variables.dequeued from response)
  const getDequeuedElement = (): string | null => {
    // First priority: Check variables.dequeued from step state (from backend response)
    if (
      currentStep?.state?.variables?.dequeued !== undefined &&
      currentStep.state.variables.dequeued !== null
    ) {
      return String(currentStep.state.variables.dequeued);
    }

    // Second priority: Try to find return value from current step
    if (currentStep?.state?.returnValue !== undefined && currentStep.state.returnValue !== null) {
      return String(currentStep.state.returnValue);
    }

    // Third priority: Try to find from previous step comparison
    if (currentStepIndex > 0) {
      const previousStep = steps[currentStepIndex - 1];
      const previousElements = (() => {
        if (previousStep?.state?.instances) {
          const instanceEntries = Object.entries(previousStep.state.instances);
          if (instanceEntries.length > 0) {
            const firstInstance = instanceEntries[0][1];
            // Type guard: check if it's an object with data property
            if (
              firstInstance &&
              typeof firstInstance === 'object' &&
              'data' in firstInstance &&
              Array.isArray((firstInstance as { data: unknown }).data)
            ) {
              return (firstInstance as { data: string[] }).data;
            }
            // Type guard: check if it's directly an array
            if (Array.isArray(firstInstance)) {
              return firstInstance as string[];
            }
          }
        }
        return [];
      })();

      // If previous step had more elements, the difference is the dequeued element
      if (previousElements.length > elements.length && previousElements.length > 0) {
        return String(previousElements[0]);
      }
    }

    return null;
  };

  const dequeuedElement = getDequeuedElement();

  // Get stats from step state
  const getStats = () => {
    const length = elements.length;
    return {
      headValue: length > 0 ? elements[0] : null,
      tailValue: length > 0 ? elements[length - 1] : null,
      isEmpty: length === 0,
      length,
    };
  };

  const stats = getStats();

  const renderQueueElement = (value: string, index: number, queueLength: number) => {
    const isFront = index === 0;
    const isBack = index === queueLength - 1;

    return (
      <div key={`${value}-${index}`} className="relative flex flex-col items-center">
        {/* Queue Element - connected horizontally, no gaps, same height */}
        <div
          className={`flex h-16 w-16 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg transition-all duration-500 hover:shadow-xl dark:from-gray-700 dark:to-gray-800 dark:hover:bg-gray-600 ${isFront ? 'rounded-l-lg border-t-2 border-b-2 border-l-2 border-green-500 dark:border-green-400' : ''} ${isBack ? 'rounded-r-lg border-t-2 border-r-2 border-b-2 border-blue-500 dark:border-blue-400' : ''} ${!isFront && !isBack ? 'border-t-2 border-b-2 border-gray-300 dark:border-gray-600' : ''} ${isFront || isBack ? 'ring-2' : ''} ${isFront ? 'ring-green-300 dark:ring-green-600' : isBack ? 'ring-blue-300 dark:ring-blue-600' : ''}`}
        >
          <span
            className={`font-bold text-gray-900 dark:text-gray-100 ${value.length > 6 ? 'text-sm' : 'text-lg'}`}
          >
            {value}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <ZoomableContainer
        className="min-h-[300px] rounded-lg bg-gray-50 dark:bg-gray-800"
        minZoom={0.5}
        maxZoom={2}
        initialZoom={1}
        enablePan={true}
        enableWheelZoom={true}
        enableKeyboardZoom={true}
        showControls={true}
      >
        <div className="p-6">
          {/* แบ่งเป็น 2 ส่วน: ซ้าย (Queue), ขวา (Dequeued) */}
          <div className="flex min-h-[250px] flex-row gap-6">
            {/* ส่วนซ้าย: Queue */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                Queue
              </div>
              <div className="relative min-h-[120px] w-full overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                {elements.length === 0 ? (
                  <div className="flex h-24 w-full items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-xs font-semibold">Empty Queue</div>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    {/* Queue Elements - horizontal layout, no gaps, aligned on same baseline */}
                    <div className="z-10 flex items-center">
                      {elements.map((element, index) => (
                        <div key={`${element}-${index}`} className="relative flex items-center">
                          {renderQueueElement(element, index, elements.length)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ส่วนขวา: Dequeued Element */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                Dequeued Element
              </div>
              {dequeuedElement ? (
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-red-400 bg-gradient-to-br from-red-100 to-red-200 shadow-lg dark:border-red-500 dark:from-red-900/30 dark:to-red-800/30">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {dequeuedElement}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-20 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    No element dequeued
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ZoomableContainer>

      {/* Queue Info */}
      <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
        <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Queue Information</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Elements:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200">
              {elements.length === 0 ? 'None' : elements.join(', ')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Front Element:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200">
              {stats.headValue || 'None'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Back Element:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200">
              {stats.tailValue || 'None'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200">{elements.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200">
              {stats.isEmpty ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-700 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-green-400 bg-green-200 dark:border-green-500 dark:bg-green-700" />
          <span>Head</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-blue-400 bg-blue-200 dark:border-blue-500 dark:bg-blue-700" />
          <span>Tail</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-red-400 bg-red-200 dark:border-red-500 dark:bg-red-700" />
          <span>Dequeue</span>
        </div>
      </div>
    </div>
  );
};

export default QueueStepthrough;
