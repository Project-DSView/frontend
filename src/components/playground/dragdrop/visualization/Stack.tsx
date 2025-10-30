import React, { forwardRef, useState, useEffect } from 'react';

import { StackVisualizationProps } from '@/types';

import ZoomableContainer from '../../shared/ZoomableContainer';

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

    // Check if we need to show multiple stacks for push/pop operations
    const showMultipleStacks =
      ((currentOperation === 'push' || currentOperation === 'pop') &&
        ((stackS1?.length || 0) > 0 || (stackS2?.length || 0) > 0)) ||
      (currentOperation === 'copyStack' && stacks);

    // Handle animation based on current operation
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

    // Simple animation when isRunning is true (fallback) - show latest added element
    useEffect(() => {
      if (isRunning && !isAnimating && elements.length > 0) {
        setIsAnimating(true);
        // Highlight the most recently added element (top of stack)
        setHighlightedElementIndex(elements.length - 1);
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedElementIndex(-1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, isAnimating, elements.length]);

    const renderStackElement = (
      value: string,
      index: number,
      stackLength: number,
    ): React.ReactNode => {
      const isHighlighted = highlightedElementIndex === index;
      const isTop = index === stackLength - 1;

      return (
        <div key={`${value}-${index}`} className="relative flex flex-col items-center">
          {/* Top indicator */}
          {isTop && (
            <div className="mb-1 flex flex-col items-center">
              {/* เส้นตั้งตรงกลาง */}
              <div className="h-4 w-0.5 bg-blue-500 dark:bg-blue-600"></div>
              {/* สามเหลี่ยมชี้ลง */}
              <div className="mt-0.5 h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-t-blue-500 border-r-transparent border-l-transparent dark:border-t-blue-600"></div>
              <span className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">Top</span>
            </div>
          )}

          {/* Stack Element */}
          <div
            className={`flex h-16 w-16 items-center justify-center bg-gray-100 shadow-lg transition-all duration-500 dark:bg-gray-700 ${isHighlighted && isAnimating ? 'scale-110 ring-4 ring-blue-400 dark:ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-600'} ${isTop ? 'border-2 border-blue-500 dark:border-blue-400' : 'border-t-0'} ${isTop ? 'ring-2 ring-blue-300 dark:ring-blue-600' : ''}`}
          >
            <span
              className={`font-bold text-gray-900 dark:text-gray-100 ${value.length > 6 ? 'text-sm' : 'text-lg'}`}
            >
              {value}
            </span>
          </div>

          {/* Index indicator */}
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
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-xs font-semibold">Empty</div>
              </div>
            </div>
          ) : (
            <div className="relative w-32">
              {/* Stack Frame */}
              <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black dark:border-gray-300"></div>
              {/* Stack Elements */}
              <div className="flex flex-col-reverse">
                {stackElements.map((element, index) => (
                  <div key={`${stackId}-${element}-${index}`} className="relative">
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Stack Visualization
          </h3>
        </div>

        {/* Stack Container */}
        <ZoomableContainer
          className="min-h-[300px] rounded-lg bg-gray-50 dark:bg-gray-900"
          minZoom={0.5}
          maxZoom={2}
          initialZoom={1}
          enablePan={true}
          enableWheelZoom={true}
          enableKeyboardZoom={true}
          showControls={true}
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
                    <div className="text-sm">Add elements using Push operation</div>
                  </div>
                </div>
              ) : (
                <div className="relative w-36">
                  {/* Stack Frame - กรอบสี่เหลี่ยมไม่มีเส้นด้านบน */}
                  <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black dark:border-gray-300"></div>

                  {/* Stack Elements - อยู่ติดกันไม่มีช่องว่าง */}
                  <div className="flex flex-col-reverse">
                    {elements.map((element, index) => (
                      <div key={`${element}-${index}`} className="relative">
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
          <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Stack Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Elements:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {elements.length === 0 ? 'None' : elements.join(', ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Top Element:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {stats.headValue || 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Bottom Element:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {stats.tailValue || 'None'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
              <span className="ml-2 text-gray-800 dark:text-gray-200">
                {stats.isEmpty ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Operation Status */}
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
