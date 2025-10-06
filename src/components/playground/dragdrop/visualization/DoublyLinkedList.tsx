import React, { forwardRef, useState, useEffect } from 'react';
import { DoublyLinkedListVisualizationProps } from '@/types';

const DoublyLinkedDragDropListVisualization = forwardRef<
  HTMLDivElement,
  DoublyLinkedListVisualizationProps
>(
  (
    {
      nodes,
      stats,
      isRunning = false,
      currentOperation,
      currentStep,
      currentPosition = 0,
      selectedStep,
    },
    ref,
  ) => {
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);

    // Handle traverse animation
    useEffect(() => {
      if (
        selectedStep !== null &&
        selectedStep !== undefined &&
        (currentOperation === 'traverse_forward' || currentOperation === 'traverse_backward')
      ) {
        setIsTraversing(true);

        if (currentOperation === 'traverse_forward') {
          // Forward: start from head (index 0)
          setTraverseIndex(0);
        } else {
          // Backward: start from tail (last index)
          setTraverseIndex(nodes.length - 1);
        }

        const interval = setInterval(() => {
          setTraverseIndex((prev) => {
            if (currentOperation === 'traverse_forward') {
              // Forward: move to next node
              const nextIndex = prev + 1;
              if (nextIndex >= nodes.length) {
                // Animation finished, stop traversing
                setIsTraversing(false);
                clearInterval(interval);
                return prev; // Keep at last node
              }
              return nextIndex;
            } else {
              // Backward: move to previous node
              const prevIndex = prev - 1;
              if (prevIndex < 0) {
                // Animation finished, stop traversing
                setIsTraversing(false);
                clearInterval(interval);
                return prev; // Keep at first node
              }
              return prevIndex;
            }
          });
        }, 1000); // Move to next/previous node every 1 second

        return () => clearInterval(interval);
      } else {
        // Reset when not traversing
        setIsTraversing(false);
        setTraverseIndex(0);
      }
    }, [selectedStep, currentOperation, nodes.length]);
    // Determine which node should be animated based on current operation
    const getAnimatedNodeIndex = () => {
      if (!isRunning || !currentStep) return -1;

      // For traversal operations, animate the current node being visited
      if (currentOperation === 'traverse_forward' || currentOperation === 'traverse_backward') {
        if (currentStep.includes('อ่านค่า') || currentStep.includes('current.data')) {
          const match = currentStep.match(/ค่า (.+)/);
          if (match) {
            const value = match[1];
            return nodes.indexOf(value);
          }
        }
      }

      // For search operations, animate the current node being checked
      if (currentOperation === 'search_value' || currentOperation === 'search_position') {
        if (currentStep.includes('ตรวจสอบ') || currentStep.includes('current.data')) {
          const match = currentStep.match(/ค่า (.+)/);
          if (match) {
            const value = match[1];
            return nodes.indexOf(value);
          }
        }
      }

      // For insert operations, animate the head node
      if (currentOperation === 'insert_beginning') {
        return 0; // Always animate head for insert at beginning
      }

      // For delete operations, animate the node being deleted
      if (currentOperation === 'delete_beginning') {
        return 0; // Animate head for delete from beginning
      }

      return -1;
    };

    // Get current position for head/tail pointer animation
    const getCurrentPosition = () => {
      if (!isRunning || !currentStep) return { head: 0, tail: nodes.length - 1 };

      // For traversal operations, use currentPosition from hook
      if (currentOperation === 'traverse_forward') {
        return { head: currentPosition, tail: nodes.length - 1 };
      }

      if (currentOperation === 'traverse_backward') {
        return { head: 0, tail: nodes.length - 1 - currentPosition };
      }

      // For search operations, move head to current position
      if (currentOperation === 'search_value' || currentOperation === 'search_position') {
        if (currentStep.includes('ตรวจสอบ') || currentStep.includes('current.data')) {
          const match = currentStep.match(/ค่า (.+)/);
          if (match) {
            const value = match[1];
            const index = nodes.indexOf(value);
            return { head: index >= 0 ? index : 0, tail: nodes.length - 1 };
          }
        }
      }

      return { head: 0, tail: nodes.length - 1 }; // Default positions
    };

    // Get current head position for traverse animation
    const getCurrentHeadPosition = () => {
      // If running, use the current position from execution
      if (isRunning && currentStep) {
        return getCurrentPosition().head;
      }

      // If traverse step is selected, show animation
      if (
        selectedStep !== null &&
        selectedStep !== undefined &&
        (currentOperation === 'traverse_forward' || currentOperation === 'traverse_backward')
      ) {
        // For traverse, we want to show the pointer moving through each node
        if (nodes.length === 0) return 0;

        // Use traverseIndex for animation only when traversing
        if (isTraversing) {
          return traverseIndex;
        }

        // If not traversing (animation finished)
        if (currentOperation === 'traverse_forward') {
          return 0; // Show at first node
        } else {
          return nodes.length - 1; // Show at last node
        }
      }

      return 0; // Default to first position
    };

    const animatedNodeIndex = getAnimatedNodeIndex();
    const headPosition = getCurrentHeadPosition();

    const renderDoublyLinkedListNode = (value: string, index: number): React.ReactNode => {
      const isAnimated = animatedNodeIndex === index;
      const isTraverseSelected =
        selectedStep !== null &&
        selectedStep !== undefined &&
        (currentOperation === 'traverse_forward' || currentOperation === 'traverse_backward') &&
        index === headPosition;
      const isCurrentlyTraversing = isTraversing && index === traverseIndex;
      const isFirstNode = index === 0;
      const isLastNode = index === nodes.length - 1;

      return (
        <div className="flex items-center">
          {/* Node Container - 3 Section Layout like in the image */}
          <div
            className={`flex h-16 w-40 rounded-lg border-2 transition-all duration-500 ${
              isCurrentlyTraversing
                ? 'border-success bg-success/20 animate-pulse shadow-lg'
                : isAnimated || isTraverseSelected
                  ? 'border-black bg-white shadow-lg'
                  : 'border-black bg-white hover:bg-gray-50'
            }`}
          >
            {/* Pre Section - Left */}
            <div
              className={`flex w-1/3 items-center justify-center rounded-l-lg ${
                isCurrentlyTraversing ? 'bg-success/10' : 'bg-gray-100'
              }`}
            >
              {isFirstNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`h-0.5 w-8 rotate-45 transform ${
                        isCurrentlyTraversing ? 'bg-success' : 'bg-black'
                      }`}
                    ></div>
                    <div
                      className={`absolute h-0.5 w-8 -rotate-45 transform ${
                        isCurrentlyTraversing ? 'bg-success' : 'bg-black'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                <span
                  className={`text-xs font-bold ${
                    isCurrentlyTraversing ? 'text-success' : 'text-black'
                  }`}
                >
                  Pre
                </span>
              )}
            </div>

            {/* Data Section - Center */}
            <div
              className={`flex w-1/3 items-center justify-center border-x border-x-2 ${
                isCurrentlyTraversing ? 'border-success bg-success/10' : 'border-black bg-gray-100'
              }`}
            >
              <span
                className={`font-bold ${
                  isCurrentlyTraversing ? 'text-success' : 'text-black'
                } ${value.length > 6 ? 'text-sm' : 'text-lg'}`}
              >
                {value}
              </span>
            </div>

            {/* Next Section - Right */}
            <div
              className={`flex w-1/3 items-center justify-center rounded-r-lg ${
                isCurrentlyTraversing ? 'bg-success/10' : 'bg-gray-100'
              }`}
            >
              {isLastNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`h-0.5 w-8 rotate-45 transform ${
                        isCurrentlyTraversing ? 'bg-success' : 'bg-black'
                      }`}
                    ></div>
                    <div
                      className={`absolute h-0.5 w-8 -rotate-45 transform ${
                        isCurrentlyTraversing ? 'bg-success' : 'bg-black'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                <span
                  className={`text-xs font-bold ${
                    isCurrentlyTraversing ? 'text-success' : 'text-black'
                  }`}
                >
                  Next
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Doubly Linked List Visualization
        </h2>
        {/* Linked List Visualization */}
        <div className="relative min-h-[220px] overflow-x-auto rounded-lg bg-gray-50 p-6 pt-20">
          {nodes.length === 0 && !isRunning && !currentStep ? (
            <div className="text-gray-400 italic">Empty doubly linked list</div>
          ) : (
            <div className="flex items-center justify-start space-x-2">
              {/* Nodes with Head/Tail Pointers */}
              {nodes.map((value: string, index: number) => (
                <React.Fragment key={index}>
                  <div className="relative">
                    {/* Head Label - Always show on first node */}
                    {index === 0 && (
                      <div
                        className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform"
                        style={{
                          left: nodes.length === 1 ? '25%' : '50%',
                        }}
                      >
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600">head</div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-black"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent"></div>
                        </div>
                      </div>
                    )}

                    {/* Current Pointer - Show during traverse */}
                    {index === traverseIndex &&
                      (currentOperation === 'traverse_forward' ||
                        currentOperation === 'traverse_backward') && (
                        <div
                          className={`absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 transform ${isTraversing ? 'animate-pulse' : ''}`}
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`border-success h-0 w-0 border-r-[4px] border-b-[6px] border-l-[4px] border-r-transparent border-l-transparent ${isTraversing ? 'animate-pulse' : ''}`}
                            ></div>
                            <div
                              className={`bg-success h-4 w-0.5 ${isTraversing ? 'animate-pulse' : ''}`}
                            ></div>
                          </div>
                          <div className="text-success px-2 py-1 text-lg font-semibold">
                            current
                          </div>
                        </div>
                      )}

                    {/* Tail Label - Always show on last node */}
                    {index === nodes.length - 1 && (
                      <div
                        className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform"
                        style={{
                          left: nodes.length === 1 ? '75%' : '50%',
                        }}
                      >
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600">tail</div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-black"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent"></div>
                        </div>
                      </div>
                    )}

                    {/* Node */}
                    {renderDoublyLinkedListNode(value, index)}
                  </div>

                  {/* Connections to next node */}
                  {index < nodes.length - 1 && (
                    <div className="mx-2 flex items-center">
                      <div className="h-0.5 w-6 bg-black"></div>
                      <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[8px] border-t-transparent border-b-transparent border-l-black"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex space-x-6 text-sm text-gray-600">
          <div>
            <span className="font-semibold">จำนวน Nodes:</span> {stats.length}
          </div>
          <div>
            <span className="font-semibold">Head Value:</span> {stats.headValue || 'None'}
          </div>
          <div>
            <span className="font-semibold">Tail Value:</span> {stats.tailValue || 'None'}
          </div>
        </div>
      </div>
    );
  },
);

DoublyLinkedDragDropListVisualization.displayName = 'DoublyLinkedDragDropListVisualization';

export default DoublyLinkedDragDropListVisualization;
