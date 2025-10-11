import React, { forwardRef, useMemo } from 'react';
import { StackRealtimeProps } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';

const StackRealtime = forwardRef<HTMLDivElement, StackRealtimeProps>(
  ({ data, error, securityStatus }, ref) => {
    // Get elements for rendering
    const elements = useMemo(() => {
      return data.elements || [];
    }, [data.elements]);

    // Check if we're in copyStack mode
    const isCopyStackMode = data.currentOperation === 'copyStack' && data.stacks;

    // Check if we need to show multiple stacks
    const showMultipleStacks = data.allStacks && Object.keys(data.allStacks).length > 0;

    const renderStackElement = (value: string, index: number, stackLength: number) => {
      const isTop = index === stackLength - 1;

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
            className={`bg-neutral/20 flex h-16 w-16 items-center justify-center shadow-lg transition-all duration-500 hover:bg-gray-50 ${isTop ? 'border-2 border-blue-500' : 'border-t-0'} ${isTop ? 'ring-2 ring-blue-300' : ''}`}
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

    const renderSingleStack = (stackElements: string[], title: string, stackId: string) => (
      <div className="flex flex-col items-center">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">{title}</h3>
        <div className="relative min-h-[200px] w-40 overflow-x-auto rounded-lg bg-gray-50 p-4 pt-16">
          <div className="flex min-h-[150px] flex-col items-center justify-end">
            {stackElements.length === 0 ? (
              <div className="flex h-24 w-32 items-center justify-center border-r-2 border-b-2 border-l-2 border-dashed border-gray-300 bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="text-xs font-semibold">Empty</div>
                </div>
              </div>
            ) : (
              <div className="relative w-32">
                {/* Stack Frame */}
                <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black"></div>
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
      </div>
    );

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow">
        {/* Security Status */}
        {!securityStatus.isSafe && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-red-400"
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
              <div className="ml-2">
                <h3 className="text-xs font-medium text-red-800">Security Violation</h3>
                <div className="mt-1 text-xs text-red-700">
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-red-400"
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
              <div className="ml-2">
                <h3 className="text-xs font-medium text-red-800">Error</h3>
                <div className="mt-1 text-xs text-red-700">
                  <p className="font-mono whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stack Container */}
        <ZoomableContainer
          className="min-h-[300px] rounded-lg bg-gray-50"
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
                {data.allStacks &&
                  Object.entries(data.allStacks)
                    .filter(([, stackData]) => stackData.data.length > 0) // กรองเอาเฉพาะ stack ที่มีข้อมูล
                    .map(([stackName, stackData]) => (
                      <div key={stackName}>
                        {renderSingleStack(stackData.data, `Stack ${stackName}`, stackName)}
                      </div>
                    ))}
              </div>
            </div>
          ) : isCopyStackMode ? (
            <div className="space-y-6 p-6">
              <div className="flex justify-center space-x-8">
                <div key="s1">{renderSingleStack(data.stacks!.s1, 'Stack s1', 's1')}</div>
                <div key="s2">{renderSingleStack(data.stacks!.s2, 'Stack s2', 's2')}</div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-end p-6 pt-20">
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
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-semibold text-gray-700">Stack Information</h4>
          {showMultipleStacks ? (
            <div className="space-y-4">
              {data.allStacks &&
                Object.entries(data.allStacks)
                  .filter(([, stackData]) => stackData.data.length > 0)
                  .map(([stackName, stackData]) => (
                    <div key={stackName} className="rounded-lg bg-white p-3">
                      <h5 className="mb-2 font-medium text-gray-700">Stack {stackName}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Elements:</span>
                          <span className="ml-2 text-gray-800">
                            {stackData.data.length === 0 ? 'None' : stackData.data.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Count:</span>
                          <span className="ml-2 text-gray-800">{stackData.size}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Top Element:</span>
                          <span className="ml-2 text-gray-800">{stackData.top || 'None'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Is Empty:</span>
                          <span className="ml-2 text-gray-800">
                            {stackData.isEmpty ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Elements:</span>
                <span className="ml-2 text-gray-800">
                  {elements.length === 0 ? 'None' : elements.join(', ')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Top Element:</span>
                <span className="ml-2 text-gray-800">
                  {elements.length > 0 ? elements[elements.length - 1] : 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Bottom Element:</span>
                <span className="ml-2 text-gray-800">
                  {elements.length > 0 ? elements[0] : 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Is Empty:</span>
                <span className="ml-2 text-gray-800">{elements.length === 0 ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex space-x-6 text-sm text-gray-600">
          <div>
            <span className="font-semibold">จำนวน Elements:</span> {data.count}
          </div>
          <div>
            <span className="font-semibold">Size:</span> {elements.length}
          </div>
          <div>
            <span className="font-semibold">Top Value:</span>{' '}
            {elements.length > 0 ? elements[elements.length - 1] : 'None'}
          </div>
        </div>
      </div>
    );
  },
);

StackRealtime.displayName = 'StackRealtime';

export default StackRealtime;
