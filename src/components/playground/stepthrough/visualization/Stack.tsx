import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { StepthroughVisualizationProps, StackData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';
import StepIndicator from '../../shared/StepIndicator';

const StackStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<StackData>
>(({ steps, currentStepIndex, data, isRunning, error }, ref) => {
  const [highlightedElementIndex, setHighlightedElementIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use ref to store elements to prevent unnecessary re-renders
  const elementsRef = useRef(data.elements);
  const [elements, setElements] = useState(data.elements);

  // Update elements when data.elements actually changes
  useEffect(() => {
    if (JSON.stringify(elementsRef.current) !== JSON.stringify(data.elements)) {
      setIsTransitioning(true);
      elementsRef.current = data.elements;
      setElements(data.elements);

      // Stop transition animation after duration
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [data.elements]);

  // Check if we need to show multiple stacks
  const showMultipleStacks = data.allStacks && Object.keys(data.allStacks).length > 0;

  // Handle animation based on current step
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const message = currentStep.state?.message || '';

      // Check if this is a push operation
      if (message.includes('push') || message.includes('Push')) {
        setIsAnimating(true);
        setHighlightedElementIndex(elements.length - 1);

        // Stop animation after 1 second
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 1000);

        return () => clearTimeout(timer);
      }
      // Check if this is a pop operation
      else if (message.includes('pop') || message.includes('Pop')) {
        setIsAnimating(true);
        setHighlightedElementIndex(elements.length - 1);

        // Stop animation after 1 second
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 1000);

        return () => clearTimeout(timer);
      }
      // Check if this is a peek operation
      else if (
        message.includes('peek') ||
        message.includes('Peek') ||
        message.includes('stackTop')
      ) {
        setIsAnimating(true);
        setHighlightedElementIndex(elements.length - 1);

        // Stop animation after 1 second
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 1000);

        return () => clearTimeout(timer);
      } else {
        setIsAnimating(false);
        setHighlightedElementIndex(-1);
      }
    } else {
      setIsAnimating(false);
      setHighlightedElementIndex(-1);
    }
  }, [steps, currentStepIndex, elements.length]);

  const renderStackElement = (
    value: string,
    index: number,
    stackLength: number,
    isTransitioning: boolean = false,
  ): React.ReactNode => {
    const isHighlighted = highlightedElementIndex === index;
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
          className={`bg-neutral/20 flex h-16 w-16 items-center justify-center shadow-lg transition-all duration-700 ease-in-out ${
            isHighlighted && isAnimating
              ? 'border-accent scale-110 animate-bounce bg-blue-50'
              : isTransitioning
                ? 'scale-105 animate-pulse bg-blue-50'
                : 'hover:scale-105 hover:bg-gray-50'
          } ${isTop ? 'border-2 border-blue-500' : 'border-t-0'} ${isTop ? 'ring-2 ring-blue-300' : ''} ${
            isTransitioning ? 'animate-pulse' : ''
          }`}
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

  const renderSingleStack = (stackData: string[], stackName: string, stackId: string) => {
    return (
      <div key={stackId} className="flex flex-col items-center">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">{stackName}</h4>
        <div className="flex min-h-[200px] flex-col items-center justify-end">
          {stackData.length === 0 ? (
            <div className="flex h-32 w-40 items-center justify-center border-r-2 border-b-2 border-l-2 border-dashed border-gray-300 bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="font-semibold">Empty</div>
                <div className="text-sm">No elements</div>
              </div>
            </div>
          ) : (
            <div className="relative w-36">
              {/* Stack Frame - กรอบสี่เหลี่ยมไม่มีเส้นด้านบน */}
              <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black"></div>

              {/* Stack Elements - อยู่ติดกันไม่มีช่องว่าง */}
              <div className="flex flex-col-reverse">
                {stackData.map((element, index) => (
                  <div key={`${element}-${index}`} className="relative">
                    {renderStackElement(element, index, stackData.length, isTransitioning)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="rounded-lg bg-white p-6 shadow" suppressHydrationWarning>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Stack Visualization</h2>
        {isRunning && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <span>Running...</span>
          </div>
        )}
      </div>

      {/* Current Step Info */}
      {steps.length > 0 && currentStepIndex < steps.length && !error && (
        <div className="bg-info/10 mb-4 rounded-lg p-3">
          <div className="text-info/90 text-sm font-medium">
            Step {steps[currentStepIndex].stepNumber}: {steps[currentStepIndex].state.message}
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
        {/* Step Indicator */}
        {isRunning && steps.length > 0 && (
          <StepIndicator
            stepNumber={currentStepIndex + 1}
            totalSteps={steps.length}
            message={steps[currentStepIndex]?.state?.message}
            isAutoPlaying={isRunning}
          />
        )}

        {showMultipleStacks ? (
          <div className="space-y-6 p-6">
            <div className="flex justify-center space-x-8">
              {data.allStacks &&
                Object.entries(data.allStacks)
                  .filter(([, stackData]) => stackData.data.length > 0) // กรองเอาเฉพาะ stack ที่มีข้อมูล
                  .map(([stackName, stackData]) =>
                    renderSingleStack(stackData.data, `Stack ${stackName}`, stackName),
                  )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-end p-6">
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
              <span className="font-medium text-gray-600">Count:</span>
              <span className="ml-2 text-gray-800">{data.count || elements.length}</span>
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
          <span className="font-semibold">จำนวน Elements:</span> {data.count || elements.length}
        </div>
        <div>
          <span className="font-semibold">Size:</span> {elements.length}
        </div>
        <div>
          <span className="font-semibold">Top Value:</span>{' '}
          {elements.length > 0 ? elements[elements.length - 1] : 'None'}
        </div>
      </div>

      {/* Current Operation Status */}
      {isRunning && steps.length > 0 && currentStepIndex < steps.length && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span className="font-semibold text-blue-800">
              Executing: {steps[currentStepIndex].code}
            </span>
          </div>
          <p className="text-sm text-blue-700">{steps[currentStepIndex].state.message}</p>
        </div>
      )}
    </div>
  );
});

StackStepthroughVisualization.displayName = 'StackStepthroughVisualization';

export default StackStepthroughVisualization;
