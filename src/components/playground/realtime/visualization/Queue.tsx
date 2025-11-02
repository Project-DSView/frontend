import React, { forwardRef, useMemo } from 'react';

import { QueueRealtimeProps } from '@/types';

import ZoomableContainer from '../../shared/ZoomableContainer';

const QueueRealtime = forwardRef<HTMLDivElement, QueueRealtimeProps>(({ data }, ref) => {
  // Get elements for rendering
  const elements = useMemo(() => {
    return data.elements || [];
  }, [data.elements]);

  // Get stats
  const stats = useMemo(() => {
    const length = elements.length;
    return {
      headValue: length > 0 ? elements[0] : null,
      tailValue: length > 0 ? elements[length - 1] : null,
      isEmpty: length === 0,
      length,
    };
  }, [elements]);

  // For realtime mode, dequeued element is not tracked persistently
  // But we can show it if available in data
  const dequeuedElement = useMemo(() => {
    // If data has dequeuedElement field, use it
    if ((data as any).dequeuedElement !== undefined) {
      return (data as any).dequeuedElement;
    }
    return null;
  }, [data]);

  // Check if we need to show multiple queues
  const showMultipleQueues = data.allQueues && Object.keys(data.allQueues).length > 0;

  const renderQueueElement = (value: string, index: number, queueLength: number) => {
    const isFront = index === 0;
    const isBack = index === queueLength - 1;

    return (
      <div key={`${value}-${index}`} className="relative flex flex-col items-center">
        {/* Queue Element - connected horizontally, no gaps, same height */}
        <div
          className={`flex h-16 w-16 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg transition-all duration-500 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl dark:hover:bg-gray-600 ${isFront ? 'border-l-2 border-t-2 border-b-2 border-green-500 rounded-l-lg dark:border-green-400' : ''} ${isBack ? 'border-r-2 border-t-2 border-b-2 border-blue-500 rounded-r-lg dark:border-blue-400' : ''} ${!isFront && !isBack ? 'border-t-2 border-b-2 border-gray-300 dark:border-gray-600' : ''} ${isFront || isBack ? 'ring-2' : ''} ${isFront ? 'ring-green-300 dark:ring-green-600' : isBack ? 'ring-blue-300 dark:ring-blue-600' : ''}`}
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

  const renderSingleQueue = (queueElements: string[], title: string, queueId: string, queueDequeuedElement?: string | null) => {
    const queueStats = {
      headValue: queueElements.length > 0 ? queueElements[0] : null,
      tailValue: queueElements.length > 0 ? queueElements[queueElements.length - 1] : null,
      isEmpty: queueElements.length === 0,
      length: queueElements.length,
    };

    return (
      <div className="flex flex-col">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        {/* แบ่งเป็น 2 ส่วน: ซ้าย (Queue), ขวา (Dequeued) */}
        <div className="flex min-h-[250px] flex-row gap-6">
          {/* ส่วนซ้าย: Queue */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
              Queue
            </div>
            <div className="relative min-h-[120px] w-full overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              {queueElements.length === 0 ? (
                <div className="flex h-24 w-full items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="text-xs font-semibold">Empty Queue</div>
                  </div>
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  {/* Queue Elements - horizontal layout, no gaps, aligned on same baseline */}
                  <div className="z-10 flex items-center">
                    {queueElements.map((element, index) => (
                      <div key={`${queueId}-${element}-${index}`} className="relative flex items-center">
                        {renderQueueElement(element, index, queueElements.length)}
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
            {queueDequeuedElement ? (
              <div className="flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-200 shadow-lg dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-400 dark:border-red-500">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    {queueDequeuedElement}
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

        {/* Queue Info for this queue */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Queue Information</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Elements:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {queueElements.length === 0 ? 'None' : queueElements.join(', ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Front Element:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {queueStats.headValue || 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Back Element:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {queueStats.tailValue || 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">{queueElements.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {queueStats.isEmpty ? 'Yes' : 'No'}
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

  return (
    <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      {/* Queue Container */}
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
        {showMultipleQueues ? (
          <div className="space-y-6 p-6">
            <div className="flex flex-col space-y-6">
              {data.allQueues &&
                Object.entries(data.allQueues).map(([queueName, queueData]) => {
                  // For multiple queues, use main dequeuedElement if this is the first/main queue
                  const queueDequeued = queueName === Object.keys(data.allQueues || {})[0] ? dequeuedElement : null;
                  return renderSingleQueue(queueData.data, `Queue: ${queueName}`, queueName, queueDequeued);
                })}
            </div>
          </div>
        ) : (
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
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-red-100 to-red-200 shadow-lg dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-400 dark:border-red-500">
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
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
        )}
      </ZoomableContainer>

      {!showMultipleQueues && (
        <>
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
                <span className="ml-2 text-gray-800 dark:text-gray-200">{stats.headValue || 'None'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Back Element:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{stats.tailValue || 'None'}</span>
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
        </>
      )}
    </div>
  );
});

QueueRealtime.displayName = 'QueueRealtime';

export default QueueRealtime;
