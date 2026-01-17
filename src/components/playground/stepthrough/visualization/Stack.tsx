import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { StepthroughVisualizationProps, StackData } from '@/types';
import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';
import StepIndicator from '@/components/playground/shared/action/StepIndicator';
import ConsoleOutput from '@/components/playground/stepthrough/ConsoleOutput';
import PerformanceAnalysisPanel from '@/components/playground/shared/PerformancePanel/PerformanceAnalysisPanel';
import { gsap } from 'gsap';

const StackStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<StackData>
>(
  (
    {
      steps,
      currentStepIndex,
      data,
      isRunning,
      error,
      complexity,
    }: StepthroughVisualizationProps<StackData>,
    ref,
  ) => {
    const [highlightedElementIndex, setHighlightedElementIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [enteringElements, setEnteringElements] = useState<Set<number>>(new Set());
    const [exitingElements, setExitingElements] = useState<Set<string>>(new Set());
    const [elementsToRender, setElementsToRender] = useState<string[]>(data.elements);

    // Use ref to store elements to prevent unnecessary re-renders
    const elementsRef = useRef(data.elements);
    const previousElementsRef = useRef<string[]>(data.elements);
    const elementRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [elements, setElements] = useState(data.elements);

    // Update elements when data.elements actually changes and detect push/pop
    useEffect(() => {
      if (JSON.stringify(elementsRef.current) !== JSON.stringify(data.elements)) {
        const previousElements = previousElementsRef.current;
        const currentElements = data.elements;

        // Detect changes: compare previous and current arrays
        const newEnteringElements = new Set<number>();
        const newExitingElements = new Set<string>();

        // Find elements that were deleted (pop operation)
        previousElements.forEach((prevElement) => {
          if (!currentElements.includes(prevElement)) {
            newExitingElements.add(prevElement);
          }
        });

        // Find elements that were inserted (push operation)
        currentElements.forEach((currentElement, index) => {
          if (!previousElements.includes(currentElement)) {
            newEnteringElements.add(index);
          } else {
            // Check if this is a new occurrence (duplicate values)
            const prevCount = previousElements.filter((e) => e === currentElement).length;
            const currentCount = currentElements.filter((e) => e === currentElement).length;
            if (currentCount > prevCount) {
              // This is a new occurrence
              const occurrencesBefore = currentElements
                .slice(0, index)
                .filter((e) => e === currentElement).length;
              if (occurrencesBefore >= prevCount) {
                newEnteringElements.add(index);
              }
            }
          }
        });

        // For exit animation: keep exiting elements temporarily in render
        if (newExitingElements.size > 0) {
          // Keep exiting elements in render temporarily
          const elementsWithExiting = [...currentElements];
          previousElements.forEach((element) => {
            if (newExitingElements.has(element) && !elementsWithExiting.includes(element)) {
              // Find where this element was in previous array (should be at top)
              const prevIndex = previousElements.indexOf(element);
              // Try to insert it at a similar position for animation
              elementsWithExiting.splice(prevIndex, 0, element);
            }
          });
          setElementsToRender(elementsWithExiting);
          setExitingElements(newExitingElements);

          // Remove exiting elements after animation
          setTimeout(() => {
            setElementsToRender(currentElements);
            setExitingElements(new Set());
          }, 1200);
        } else {
          setElementsToRender(currentElements);
        }

        // Set entering elements
        if (newEnteringElements.size > 0) {
          setEnteringElements(newEnteringElements);
          // Clear entering animation after duration
          setTimeout(() => {
            setEnteringElements((prev) => {
              const updated = new Set(prev);
              newEnteringElements.forEach((idx) => updated.delete(idx));
              return updated;
            });
          }, 2000);
        }

        setIsTransitioning(true);
        previousElementsRef.current = [...currentElements];
        elementsRef.current = data.elements;
        setElements(currentElements);

        // Stop transition animation after duration
        setTimeout(() => setIsTransitioning(false), 800);
      }
    }, [data.elements]);

    // GSAP animations for entering elements
    useEffect(() => {
      enteringElements.forEach((index) => {
        const element = elementsToRender[index];
        if (element) {
          const elementKey = `${element}-${index}`;
          const elementRef = elementRefs.current.get(elementKey);
          if (elementRef) {
            gsap.fromTo(
              elementRef,
              {
                opacity: 0,
                scale: 0.2,
                y: -50, // Slide down from top for stack
              },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1.8,
                ease: 'back.out(1.7)',
              },
            );
          }
        }
      });
    }, [enteringElements, elementsToRender]);

    // GSAP animations for exiting elements
    useEffect(() => {
      exitingElements.forEach((value) => {
        // Find all elements with this value
        elementsToRender.forEach((element, index) => {
          if (element === value) {
            const elementKey = `${element}-${index}`;
            const elementRef = elementRefs.current.get(elementKey);
            if (elementRef) {
              gsap.to(elementRef, {
                opacity: 0,
                scale: 0.2,
                y: -40, // Slide up for stack (opposite of entering)
                duration: 1.2,
                ease: 'power2.in',
              });
            }
          }
        });
      });
    }, [exitingElements, elementsToRender]);

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

    // Get current step for error detection
    const currentStep =
      steps.length > 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

    // Detect underflow/overflow errors
    const detectUnderflowOverflow = () => {
      if (!currentStep?.state?.error) return null;
      const error = currentStep.state.error.toLowerCase();
      if (error.includes('underflow')) {
        return {
          type: 'underflow',
          message: 'Underflow: Cannot pop from empty stack',
        };
      }
      if (error.includes('overflow')) {
        return {
          type: 'overflow',
          message: 'Overflow: Stack is full',
        };
      }
      return null;
    };

    const errorInfo = detectUnderflowOverflow();

    const renderStackElement = (
      value: string,
      index: number,
      stackLength: number,
      isTransitioning: boolean = false,
    ): React.ReactNode => {
      const isHighlighted = highlightedElementIndex === index;
      const isTop = index === stackLength - 1;
      const elementKey = `${value}-${index}`;

      return (
        <div key={elementKey} className="relative flex flex-col items-center">
          {/* Top indicator */}
          {isTop && (
            <div className="mb-1 flex flex-col items-center">
              {/* เส้นตั้งตรงกลาง */}
              <div className="h-4 w-0.5 bg-blue-500 dark:bg-blue-400"></div>
              {/* สามเหลี่ยมชี้ลง */}
              <div className="mt-0.5 h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-t-blue-500 border-r-transparent border-l-transparent dark:border-t-blue-400"></div>
              <span className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">Top</span>
            </div>
          )}

          {/* Stack Element */}
          <div
            ref={(el) => {
              if (el) {
                elementRefs.current.set(elementKey, el);
              } else {
                elementRefs.current.delete(elementKey);
              }
            }}
            className={`flex h-16 w-16 items-center justify-center bg-gray-100 shadow-lg transition-all duration-700 ease-in-out dark:bg-gray-700 ${
              isHighlighted && isAnimating
                ? 'border-accent scale-110 animate-bounce bg-blue-50 dark:bg-blue-900/30'
                : isTransitioning
                  ? 'scale-105 animate-pulse bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-600'
            } ${isTop ? 'border-2 border-blue-500 dark:border-blue-400' : 'border-t-0 border-gray-300 dark:border-gray-600'} ${isTop ? 'ring-2 ring-blue-300 dark:ring-blue-600' : ''} ${
              isTransitioning ? 'animate-pulse' : ''
            }`}
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

    const renderSingleStack = (stackData: string[], stackName: string, stackId: string) => {
      return (
        <div key={stackId} className="flex flex-col items-center">
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {stackName}
          </h4>
          <div className="flex min-h-[200px] flex-col items-center justify-end">
            {stackData.length === 0 ? (
              <div className="flex h-32 w-40 items-center justify-center border-r-2 border-b-2 border-l-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="font-semibold">Empty</div>
                  <div className="text-sm">No elements</div>
                </div>
              </div>
            ) : (
              <div className="relative w-36">
                {/* Stack Frame - กรอบสี่เหลี่ยมไม่มีเส้นด้านบน */}
                <div className="pointer-events-none absolute inset-0 border-r-2 border-b-2 border-l-2 border-black dark:border-gray-300"></div>

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
      <div
        ref={ref}
        className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        suppressHydrationWarning
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Stack Visualization
          </h2>
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Running...</span>
            </div>
          )}
        </div>

        {/* Current Step Info */}
        {steps.length > 0 && currentStepIndex < steps.length && !error && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Step {steps[currentStepIndex].stepNumber}: {steps[currentStepIndex].state.message}
            </div>
          </div>
        )}

        {/* Underflow/Overflow Warning Banner */}
        {errorInfo && (
          <div className="mb-4 animate-pulse rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold text-red-800 dark:text-red-200">
                {errorInfo.message}
              </span>
            </div>
          </div>
        )}

        {/* Stack Container */}
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
                  Object.entries(data.allStacks).map(([stackName, stackData]) =>
                    renderSingleStack(stackData.data, `Stack ${stackName}`, stackName),
                  )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-end p-6">
              {elementsToRender.length === 0 ? (
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
                    {elementsToRender.map((element, index) => {
                      const isExiting = exitingElements.has(element);
                      // Don't render exiting elements after animation
                      if (isExiting && !isTransitioning) {
                        return null;
                      }
                      return (
                        <div key={`${element}-${index}`} className="relative">
                          {renderStackElement(element, index, elementsToRender.length)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </ZoomableContainer>

        {/* Stack Info */}
        <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Stack Information</h4>
          {showMultipleStacks ? (
            <div className="space-y-4">
              {data.allStacks &&
                Object.entries(data.allStacks).map(([stackName, stackData]) => (
                  <div key={stackName} className="rounded-lg bg-white p-3 dark:bg-gray-700">
                    <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                      Stack {stackName}
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Elements:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
                          {stackData.data.length === 0 ? 'None' : stackData.data.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Count:</span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
                          {stackData.size}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Top Element:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
                          {stackData.top || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Is Empty:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
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
                <span className="font-medium text-gray-600 dark:text-gray-400">Elements:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {elements.length === 0 ? 'None' : elements.join(', ')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Count:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {data.count || elements.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Top Element:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {elements.length > 0 ? elements[elements.length - 1] : 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Bottom Element:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {elements.length > 0 ? elements[0] : 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {elements.length === 0 ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
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

        {/* Console Output */}
        <ConsoleOutput steps={steps} currentStepIndex={currentStepIndex} />

        {/* Performance Analysis Panel */}
        <PerformanceAnalysisPanel
          steps={steps}
          currentStepIndex={currentStepIndex}
          complexity={complexity}
        />

        {/* Current Operation Status */}
        {isRunning && steps.length > 0 && currentStepIndex < steps.length && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                Executing: {steps[currentStepIndex].code}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {steps[currentStepIndex].state.message}
            </p>
          </div>
        )}
      </div>
    );
  },
);

StackStepthroughVisualization.displayName = 'StackStepthroughVisualization';

export default StackStepthroughVisualization;
