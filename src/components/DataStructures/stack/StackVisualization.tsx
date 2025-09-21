import React, { forwardRef } from 'react';
import { StackVisualizationProps } from '@/types';

const StackVisualization = forwardRef<HTMLDivElement, StackVisualizationProps>(
  ({ elements, stats, isRunning = false, currentOperation, currentStep }, ref) => {
    // Determine which element should be animated based on current operation
    const getAnimatedElementIndex = () => {
      if (!isRunning || !currentStep) return -1;

      // For push operations, animate the top element with bounce effect
      if (currentOperation === 'push') {
        return elements.length - 1; // Top element
      }

      // For pop operations, animate the top element being removed
      if (currentOperation === 'pop') {
        return elements.length - 1; // Top element
      }

      // For peek operations, animate the top element
      if (currentOperation === 'peek') {
        return elements.length - 1; // Top element
      }

      return -1;
    };

    const animatedElementIndex = getAnimatedElementIndex();

    const renderStackElement = (value: string, index: number): React.ReactNode => {
      const isAnimated = animatedElementIndex === index;
      const isTop = index === elements.length - 1;

      return (
        <div key={`${value}-${index}`} className="relative flex flex-col items-center">
          {/* Top indicator */}
          {isTop && (
            <div className="mb-1 flex flex-col items-center">
              {/* เส้นตั้งตรงกลาง */}
              <div className="h-4 w-0.5 bg-blue-500"></div>
              {/* สามเหลี่ยมชี้ลง */}
              <div className="mt-0.5 h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-t-blue-500 border-r-transparent border-l-transparent"></div>
              <span className="mt-1 text-xs font-bold text-blue-600">Top</span>
            </div>
          )}

          {/* Stack Element */}
          <div
            className={`flex h-16 w-16 items-center justify-center border-r-2 border-b-2 border-l-2 border-black bg-white shadow-lg transition-all duration-500 ${
              isAnimated ? 'border-accent scale-105 bg-blue-50' : 'hover:bg-gray-50'
            } ${isTop ? 'ring-2 ring-blue-300' : ''}`}
            style={{
              borderTop: isTop ? '2px solid #3b82f6' : 'none',
              margin: 0,
              padding: 0,
              marginBottom: 0,
            }}
          >
            <span className={`font-bold text-black ${value.length > 6 ? 'text-sm' : 'text-lg'}`}>
              {value}
            </span>
          </div>

          {/* Index indicator */}
          <div className="mt-1 text-center text-xs text-gray-500">[{index}]</div>
        </div>
      );
    };

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Stack Visualization</h3>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>Size: {stats.length}</span>
            <span>Empty: {stats.isEmpty ? 'Yes' : 'No'}</span>
            {stats.headValue && <span>Top: {stats.headValue}</span>}
          </div>
        </div>

        {/* Stack Container - แบบกรอบสี่เหลี่ยมไม่มีเส้นด้านบน */}
        <div className="flex min-h-[200px] flex-col items-center justify-end">
          {elements.length === 0 ? (
            <div className="flex h-32 w-40 items-center justify-center border-r-2 border-b-2 border-l-2 border-dashed border-gray-300 bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="font-semibold">Stack is Empty</div>
                <div className="text-sm">Add elements using Push operation</div>
              </div>
            </div>
          ) : (
            <div className="relative w-36">
              {/* Stack Frame - กรอบสี่เหลี่ยมไม่มีเส้นด้านบน */}
              <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black"></div>

              {/* Stack Elements - อยู่ติดกันไม่มีช่องว่าง */}
              <div className="flex flex-col-reverse">
                {elements.map((element, index) => (
                  <div key={`${element}-${index}`} className="relative">
                    {renderStackElement(element, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stack Info */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-semibold text-gray-700">Stack Information</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Elements:</span>
              <span className="ml-2 text-gray-800">
                {elements.length === 0 ? 'None' : elements.join(', ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Top Element:</span>
              <span className="ml-2 text-gray-800">{stats.headValue || 'None'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Bottom Element:</span>
              <span className="ml-2 text-gray-800">{stats.tailValue || 'None'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Is Empty:</span>
              <span className="ml-2 text-gray-800">{stats.isEmpty ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Current Operation Status */}
        {isRunning && currentStep && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <span className="font-semibold text-blue-800">Executing: {currentOperation}</span>
            </div>
            <p className="text-sm text-blue-700">{currentStep}</p>
          </div>
        )}
      </div>
    );
  },
);

StackVisualization.displayName = 'StackVisualization';

export default StackVisualization;
