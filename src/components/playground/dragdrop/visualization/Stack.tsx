'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { StackVisualizationProps } from '@/types';

import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';

const StackDragDropVisualization = forwardRef<HTMLDivElement, StackVisualizationProps>(
  (
    {
      elements,
      stats,
      isRunning = false,
      currentOperation,
      currentStep,
      stacks,
      mainStack,
      stackS1,
      stackS2,
    },
    ref,
  ) => {
    const [highlightedElementIndex, setHighlightedElementIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);

    // show 3 stacks UI only when needed
    const showMultipleStacks =
      ((currentOperation === 'push' || currentOperation === 'pop') &&
        ((stackS1?.length || 0) > 0 || (stackS2?.length || 0) > 0)) ||
      (currentOperation === 'copyStack' && stacks);

    // run animations
    useEffect(() => {
      if (
        isRunning &&
        currentOperation &&
        (currentOperation === 'push' || currentOperation === 'pop' || currentOperation === 'peek')
      ) {
        setIsAnimating(true);
        setHighlightedElementIndex(elements.length - 1);

        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedElementIndex(-1);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [isRunning, currentOperation, elements.length]);

    // fallback animation
    useEffect(() => {
      if (isRunning && !isAnimating && elements.length > 0) {
        setIsAnimating(true);
        setHighlightedElementIndex(elements.length - 1);

        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedElementIndex(-1);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [isRunning, isAnimating, elements.length]);

    const renderStackElement = (value: string, index: number, stackLength: number) => {
      const isHighlighted = highlightedElementIndex === index;
      const isTop = index === stackLength - 1;

      return (
        <div key={`${value}-${index}`} className="relative flex flex-col items-center">
          {/* TOP indicator */}
          {isTop && (
            <div className="mb-1 flex flex-col items-center">
              <div className="h-4 w-0.5 bg-blue-500 dark:bg-blue-600"></div>
              <div className="mt-0.5 h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-t-blue-500 border-r-transparent border-l-transparent dark:border-t-blue-600"></div>
              <span className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">Top</span>
            </div>
          )}

          <div
            className={`flex h-16 w-16 items-center justify-center bg-gray-100 shadow-lg transition-all dark:bg-gray-700 ${isHighlighted && isAnimating ? 'scale-110 ring-4 ring-blue-400 dark:ring-blue-500' : ''} ${isTop ? 'border-2 border-blue-500 ring-2 ring-blue-300 dark:border-blue-400 dark:ring-blue-600' : ''} `}
          >
            <span
              className={`font-bold text-gray-900 dark:text-gray-100 ${
                value.length > 6 ? 'text-sm' : 'text-lg'
              }`}
            >
              {value}
            </span>
          </div>

          <div className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">[{index}]</div>
        </div>
      );
    };

    const renderSingleStack = (stackElements: string[], title: string, stackId: string) => (
      <div className="flex flex-col items-center">
        <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>

        <div className="flex min-h-[200px] flex-col items-center justify-end">
          {stackElements.length === 0 ? (
            <div className="flex h-24 w-32 items-center justify-center border-r-2 border-b-2 border-l-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                Empty
              </div>
            </div>
          ) : (
            <div className="relative w-32">
              <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black dark:border-gray-300"></div>

              <div className="flex flex-col-reverse">
                {stackElements.map((element, index) => (
                  <div key={`${stackId}-${element}-${index}`}>
                    {renderStackElement(element, index, stackElements.length)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between"></div>

        <ZoomableContainer
          className="min-h-[300px] rounded-lg bg-gray-50 dark:bg-gray-900"
          minZoom={0.5}
          maxZoom={2}
          initialZoom={1}
          enablePan
          enableWheelZoom
          enableKeyboardZoom
          showControls
        >
          {showMultipleStacks ? (
            <div className="space-y-6 p-6">
              <div className="flex justify-center space-x-8">
                {renderSingleStack(mainStack || elements, 'Main Stack', 'main')}
                {renderSingleStack(stackS1 || [], 'Stack s1', 's1')}
                {renderSingleStack(stackS2 || [], 'Stack s2', 's2')}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-end p-6">
              {elements.length === 0 ? (
                <div className="flex h-32 w-40 items-center justify-center border-r-2 border-b-2 border-l-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="font-semibold">Stack is Empty</div>
                    <div className="text-sm">Add elements using Push</div>
                  </div>
                </div>
              ) : (
                <div className="relative w-36">
                  <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black dark:border-gray-300"></div>

                  <div className="flex flex-col-reverse">
                    {elements.map((element, index) => (
                      <div key={`${element}-${index}`}>
                        {renderStackElement(element, index, elements.length)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ZoomableContainer>

        {/* Stack Info */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Stack Info</h4>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Elements:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {elements.length ? elements.join(', ') : 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Top:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {stats.headValue || 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Bottom:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {stats.tailValue || 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Empty:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {stats.isEmpty ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {isRunning && currentStep && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                Executing: {currentOperation}
              </span>
            </div>

            <p className="text-sm text-blue-700 dark:text-blue-300">{currentStep}</p>
          </div>
        )}
      </div>
    );
  },
);

StackDragDropVisualization.displayName = 'StackDragDropVisualization';

export default StackDragDropVisualization;
