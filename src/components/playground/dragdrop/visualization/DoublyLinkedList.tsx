import React, { forwardRef, useState, useEffect, useMemo } from 'react';

import { DoublyLinkedListVisualizationProps } from '@/types';

import ZoomableContainer from '../../shared/action/ZoomableContainer';

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
      currentOperationData,
    },
    ref,
  ) => {
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);
    const [highlightedNodeIndex, setHighlightedNodeIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);

    // Memoize operation data to prevent unnecessary re-renders
    const operationData = useMemo(
      () => ({
        type: currentOperationData?.type,
        value: currentOperationData?.value,
        position: currentOperationData?.position,
        newValue: currentOperationData?.newValue,
      }),
      [
        currentOperationData?.type,
        currentOperationData?.value,
        currentOperationData?.position,
        currentOperationData?.newValue,
      ],
    );

    // Handle insert/delete/search operations animation
    useEffect(() => {
      if (
        isRunning &&
        currentOperation &&
        (currentOperation === 'insert_beginning' ||
          currentOperation === 'insert_end' ||
          currentOperation === 'insert_position' ||
          currentOperation === 'delete_beginning' ||
          currentOperation === 'delete_end' ||
          currentOperation === 'delete_value' ||
          currentOperation === 'delete_position' ||
          currentOperation === 'search' ||
          currentOperation === 'update_value' ||
          currentOperation === 'update_position')
      ) {
        setIsAnimating(true);

        // Calculate the correct position based on operation type
        let targetPosition = -1;

        if (operationData.type) {
          if (currentOperation === 'insert_beginning' || currentOperation === 'delete_beginning') {
            targetPosition = 0; // Head position
          } else if (currentOperation === 'insert_end' || currentOperation === 'delete_end') {
            targetPosition = nodes.length - 1; // Tail position
          } else if (
            currentOperation === 'insert_position' ||
            currentOperation === 'delete_position' ||
            currentOperation === 'update_position'
          ) {
            // Use the position from operation data
            const position = parseInt(operationData.position || '0');
            targetPosition = Math.min(Math.max(0, position), nodes.length - 1);
          } else if (
            currentOperation === 'delete_value' ||
            currentOperation === 'search' ||
            currentOperation === 'update_value'
          ) {
            // Find the node with the matching value
            const targetValue = operationData.value;
            targetPosition = nodes.findIndex((node) => node === targetValue);
          }
        }

        setHighlightedNodeIndex(targetPosition);
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodeIndex(-1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, currentOperation, operationData, nodes]);

    // Simple animation when isRunning is true (fallback) - show correct position based on operation
    useEffect(() => {
      if (isRunning && !isAnimating && nodes.length > 0) {
        setIsAnimating(true);

        // Calculate the correct position based on operation type for fallback
        let targetPosition = -1;

        if (operationData.type) {
          if (currentOperation === 'insert_beginning' || currentOperation === 'delete_beginning') {
            targetPosition = 0; // Head position
          } else if (currentOperation === 'insert_end' || currentOperation === 'delete_end') {
            targetPosition = nodes.length - 1; // Tail position
          } else if (
            currentOperation === 'insert_position' ||
            currentOperation === 'delete_position' ||
            currentOperation === 'update_position'
          ) {
            // Use the position from operation data
            const position = parseInt(operationData.position || '0');
            targetPosition = Math.min(Math.max(0, position), nodes.length - 1);
          } else if (
            currentOperation === 'delete_value' ||
            currentOperation === 'search' ||
            currentOperation === 'update_value'
          ) {
            // Find the node with the matching value
            const targetValue = operationData.value;
            targetPosition = nodes.findIndex((node) => node === targetValue);
          } else {
            // Default to last node for other operations
            targetPosition = nodes.length - 1;
          }
        } else {
          // Default to last node if no operation data
          targetPosition = nodes.length - 1;
        }

        setHighlightedNodeIndex(targetPosition);
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodeIndex(-1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, isAnimating, nodes.length, currentOperation, operationData, nodes]);

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

    const headPosition = getCurrentHeadPosition();

    const renderDoublyLinkedListNode = (value: string, index: number): React.ReactNode => {
      const isTraverseSelected =
        selectedStep !== null &&
        selectedStep !== undefined &&
        (currentOperation === 'traverse_forward' || currentOperation === 'traverse_backward') &&
        index === headPosition;
      const isCurrentlyTraversing = isTraversing && index === traverseIndex;
      const isHighlighted = highlightedNodeIndex === index && !isCurrentlyTraversing;
      const isFirstNode = index === 0;
      const isLastNode = index === nodes.length - 1;

      return (
        <div className="flex items-center">
          {/* Node Container - 3 Section Layout like in the image */}
          <div
            className={`flex h-16 w-40 rounded-lg border-2 transition-all duration-500 ${
              isCurrentlyTraversing
                ? 'animate-pulse border-green-500 bg-green-100 shadow-lg dark:border-green-400 dark:bg-green-900/30'
                : isHighlighted && isAnimating
                  ? 'scale-105 border-gray-900 bg-yellow-50 shadow-lg dark:border-gray-300 dark:bg-yellow-900/20'
                  : isTraverseSelected
                    ? 'border-gray-900 bg-white shadow-lg dark:border-gray-300 dark:bg-gray-700'
                    : 'border-gray-900 bg-white hover:bg-gray-50 dark:border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            {/* Pre Section - Left */}
            <div
              className={`flex w-1/3 items-center justify-center rounded-l-lg ${
                isCurrentlyTraversing
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : isHighlighted && isAnimating
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {isFirstNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`h-0.5 w-8 rotate-45 transform ${
                        isCurrentlyTraversing
                          ? 'bg-green-600 dark:bg-green-400'
                          : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`absolute h-0.5 w-8 -rotate-45 transform ${
                        isCurrentlyTraversing
                          ? 'bg-green-600 dark:bg-green-400'
                          : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                <span
                  className={`text-xs font-bold ${
                    isCurrentlyTraversing
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  Pre
                </span>
              )}
            </div>

            {/* Data Section - Center */}
            <div
              className={`flex w-1/3 items-center justify-center border-x border-x-2 ${
                isCurrentlyTraversing
                  ? 'border-green-500 bg-green-100 dark:border-green-400 dark:bg-green-900/30'
                  : isHighlighted && isAnimating
                    ? 'border-gray-900 bg-yellow-50 dark:border-gray-300 dark:bg-yellow-900/20'
                    : 'border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`font-bold ${
                  isCurrentlyTraversing
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-gray-100'
                } ${value.length > 6 ? 'text-sm' : 'text-lg'}`}
              >
                {value}
              </span>
            </div>

            {/* Next Section - Right */}
            <div
              className={`flex w-1/3 items-center justify-center rounded-r-lg ${
                isCurrentlyTraversing
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : isHighlighted && isAnimating
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {isLastNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`h-0.5 w-8 rotate-45 transform ${
                        isCurrentlyTraversing
                          ? 'bg-green-600 dark:bg-green-400'
                          : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`absolute h-0.5 w-8 -rotate-45 transform ${
                        isCurrentlyTraversing
                          ? 'bg-green-600 dark:bg-green-400'
                          : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                <span
                  className={`text-xs font-bold ${
                    isCurrentlyTraversing
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-900 dark:text-gray-100'
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
      <div ref={ref} className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        {/* Linked List Visualization */}
        <ZoomableContainer
          className="min-h-[220px] rounded-lg bg-gray-50 dark:bg-gray-900"
          minZoom={0.5}
          maxZoom={2}
          initialZoom={1}
          enablePan={true}
          enableWheelZoom={true}
          enableKeyboardZoom={true}
          showControls={true}
        >
          {nodes.length === 0 && !isRunning && !currentStep ? (
            <div className="p-6 text-gray-400 italic dark:text-gray-500">
              Empty doubly linked list
            </div>
          ) : (
            <div className="flex items-center justify-start space-x-2 p-6 pt-20">
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
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
                          head
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-black dark:bg-gray-300"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
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
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
                          tail
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-black dark:bg-gray-300"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
                        </div>
                      </div>
                    )}

                    {/* Node */}
                    {renderDoublyLinkedListNode(value, index)}
                  </div>

                  {/* Connections to next node */}
                  {index < nodes.length - 1 && (
                    <div className="mx-2 flex items-center">
                      <svg width="80" height="40" viewBox="0 0 80 40">
                        <rect width="80" height="40" fill="#ffffff" />
                        <defs>
                          <marker
                            id="arrowRight"
                            markerWidth="8"
                            markerHeight="8"
                            refX="6"
                            refY="4"
                            orient="auto"
                          >
                            <path d="M0,0 L8,4 L0,8 Z" fill="#000000" />
                          </marker>
                          <marker
                            id="arrowLeft"
                            markerWidth="8"
                            markerHeight="8"
                            refX="2"
                            refY="4"
                            orient="auto"
                          >
                            <path d="M0,0 L6,4 L0,8 Z" fill="#000000" />
                          </marker>
                        </defs>
                        {/* forward (right) */}
                        <line
                          x1="8"
                          y1="12"
                          x2="72"
                          y2="12"
                          stroke="#000000"
                          strokeWidth="2"
                          markerEnd="url(#arrowRight)"
                        />
                        {/* backward (left) */}
                        <line
                          x1="72"
                          y1="28"
                          x2="8"
                          y2="28"
                          stroke="#000000"
                          strokeWidth="2"
                          markerEnd="url(#arrowLeft)"
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </ZoomableContainer>

        {/* Stats */}
        <div className="mt-4 flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
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
