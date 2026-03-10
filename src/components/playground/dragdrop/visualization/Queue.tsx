'use client';

import React, { forwardRef, useState, useEffect, useMemo } from 'react';
import { QueueVisualizationProps } from '@/types';

import ZoomableContainer from '../../shared/action/ZoomableContainer';

const QueueDragDropVisualization = forwardRef<HTMLDivElement, QueueVisualizationProps>(
  ({ elements, stats, isRunning = false, currentOperation, dequeuedElement }, ref) => {

    const [highlightedElementIndex, setHighlightedElementIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);

    /*
    ⭐ preview node ก่อนใส่ค่า
    */
    const previewElements = useMemo(() => {

      if (elements.length > 0) return elements;

      if (currentOperation === 'enqueue') {
        return ['?'];
      }

      return elements;

    }, [elements, currentOperation]);

    // animation
    useEffect(() => {

      if (isRunning && currentOperation) {

        setIsAnimating(true);

        if (currentOperation === 'enqueue') {
          setHighlightedElementIndex(previewElements.length - 1);
        }
        else if (currentOperation === 'dequeue') {
          setHighlightedElementIndex(0);
        }
        else if (currentOperation === 'front') {
          setHighlightedElementIndex(0);
        }

        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedElementIndex(-1);
        }, 1500);

        return () => clearTimeout(timer);
      }

      setIsAnimating(false);
      setHighlightedElementIndex(-1);

    }, [isRunning, currentOperation, previewElements.length]);

    const renderQueueElement = (
      value: string,
      index: number,
      queueLength: number,
    ): React.ReactNode => {

      const isHighlighted = highlightedElementIndex === index;
      const isFront = index === 0;
      const isBack = index === queueLength - 1;

      return (
        <div key={`${value}-${index}`} className="relative flex flex-col items-center">

          <div
            className={`flex h-16 w-16 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg transition-all duration-500 dark:from-gray-700 dark:to-gray-800
            ${isHighlighted && isAnimating ? 'z-10 animate-pulse bg-yellow-100 shadow-xl ring-4 ring-yellow-400 dark:bg-yellow-900/30 dark:ring-yellow-500' : 'hover:shadow-xl dark:hover:bg-gray-600'}
            ${isFront ? 'rounded-l-lg border-t-2 border-b-2 border-l-2 border-green-500 dark:border-green-400' : ''}
            ${isBack ? 'rounded-r-lg border-t-2 border-r-2 border-b-2 border-blue-500 dark:border-blue-400' : ''}
            ${!isFront && !isBack ? 'border-t-2 border-b-2 border-gray-300 dark:border-gray-600' : ''}
            ${isFront || isBack ? 'ring-2' : ''}
            ${isFront ? 'ring-green-300 dark:ring-green-600' : isBack ? 'ring-blue-300 dark:ring-blue-600' : ''}`}
          >
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {value}
            </span>
          </div>

        </div>
      );
    };

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">

        <ZoomableContainer
          className="min-h-[300px] rounded-lg bg-gray-50 dark:bg-gray-800"
          minZoom={0.5}
          maxZoom={2}
          initialZoom={1}
          enablePan
          enableWheelZoom
          enableKeyboardZoom
          showControls
        >

          <div className="p-6">

            <div className="flex min-h-[250px] flex-row gap-6">

              {/* Queue */}
              <div className="flex flex-1 flex-col items-center justify-center">

                <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Queue
                </div>

                <div className="relative min-h-[120px] w-full overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

                  {previewElements.length === 0 ? (

                    <div className="flex h-24 w-full items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Empty Queue
                      </div>
                    </div>

                  ) : (

                    <div className="flex items-center justify-center">

                      {previewElements.map((element, index) => (
                        <div key={`${element}-${index}`}>
                          {renderQueueElement(element, index, previewElements.length)}
                        </div>
                      ))}

                    </div>

                  )}

                </div>

              </div>

              {/* Dequeued */}
              <div className="flex flex-1 flex-col items-center justify-center">

                <div className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Dequeued Element
                </div>

                {dequeuedElement ? (

                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-red-400 bg-red-100">
                    <span className="font-bold">{dequeuedElement}</span>
                  </div>

                ) : (

                  <div className="flex h-20 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <span className="text-xs text-gray-500">
                      No element dequeued
                    </span>
                  </div>

                )}

              </div>

            </div>

          </div>

        </ZoomableContainer>

      </div>
    );
  },
);

QueueDragDropVisualization.displayName = 'QueueDragDropVisualization';

export default QueueDragDropVisualization;