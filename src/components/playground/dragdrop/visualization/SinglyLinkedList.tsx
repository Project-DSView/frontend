import React, { forwardRef, useState, useEffect } from 'react';
import { SinglyLinkedListVisualizationProps } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';

const SinglyLinkedListDragDropVisualization = forwardRef<
  HTMLDivElement,
  SinglyLinkedListVisualizationProps
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
    const [highlightedNodeIndex, setHighlightedNodeIndex] = useState(-1);
    const [isAnimating, setIsAnimating] = useState(false);

    // Handle insert/delete/search operations animation
    useEffect(() => {
      if (isRunning && currentOperation && (currentOperation === 'insert' || currentOperation === 'delete' || currentOperation === 'search')) {
        setIsAnimating(true);
        setHighlightedNodeIndex(currentPosition);
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodeIndex(-1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, currentOperation, currentPosition]);

    // Simple animation when isRunning is true (fallback)
    useEffect(() => {
      if (isRunning && !isAnimating && nodes.length > 0) {
        setIsAnimating(true);
        setHighlightedNodeIndex(0); // Highlight first node
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setHighlightedNodeIndex(-1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [isRunning, isAnimating, nodes.length]);

    // Handle traverse animation
    useEffect(() => {
      if (selectedStep !== null && selectedStep !== undefined && currentOperation === 'traverse') {
        setIsTraversing(true);
        setTraverseIndex(0);

        // Start animation from first node
        const interval = setInterval(() => {
          setTraverseIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex >= nodes.length) {
              // Animation finished, stop traversing
              setIsTraversing(false);
              clearInterval(interval);
              return prev; // Keep at last node
            }
            return nextIndex;
          });
        }, 1000); // Move to next node every 1 second

        return () => clearInterval(interval);
      } else {
        // Reset when not traversing
        setIsTraversing(false);
        setTraverseIndex(0);
      }
    }, [selectedStep, currentOperation, nodes.length]);
    

    // Get current position for head pointer animation
    const getCurrentHeadPosition = () => {
      // If running, use the current position from execution
      if (isRunning && currentStep) {
        return getCurrentPosition();
      }

      // If traverse step is selected, show animation
      if (selectedStep !== null && selectedStep !== undefined && currentOperation === 'traverse') {
        // For traverse, we want to show the head moving through each node
        if (nodes.length === 0) return 0;

        // Use traverseIndex for animation only when traversing
        if (isTraversing) {
          return traverseIndex;
        }

        // If not traversing (animation finished), show at first node
        return 0;
      }

      return 0; // Default to first position
    };

    // Get current position for head pointer animation
    const getCurrentPosition = () => {
      if (!isRunning || !currentStep) return 0;

      // For traversal operations, use currentPosition from hook
      if (currentOperation === 'traverse') {
        return currentPosition;
      }

      // For search operations, move head to current position
      if (currentOperation === 'search_value' || currentOperation === 'search_position') {
        if (currentStep.includes('ตรวจสอบ') || currentStep.includes('current.data')) {
          const match = currentStep.match(/ค่า (.+)/);
          if (match) {
            const value = match[1];
            const index = nodes.indexOf(value);
            return index >= 0 ? index : 0;
          }
        }
      }

      return 0; // Default to first position
    };

    const headPosition = getCurrentHeadPosition();

    const renderSinglyLinkedListNode = (value: string, index: number) => {
      const isHighlighted = highlightedNodeIndex === index;
      const isTraverseSelected =
        selectedStep !== null &&
        selectedStep !== undefined &&
        currentOperation === 'traverse' &&
        index === headPosition;
      const isCurrentlyTraversing = isTraversing && index === traverseIndex;
      const isLastNode = index === nodes.length - 1;

      return (
        <div className="flex items-center">
          {/* Node Container - Horizontal Layout */}
          <div
            className={`max-w-[250px] min-w-[160px] rounded-lg border-2 p-3 text-center font-bold transition-all duration-500 ${
              isCurrentlyTraversing
                ? 'border-success bg-success/20 animate-pulse shadow-lg'
                : isHighlighted && isAnimating
                  ? 'scale-105 animate-bounce bg-yellow-50 shadow-lg border-black'
                  : isTraverseSelected
                    ? 'border-black bg-white shadow-lg'
                    : 'border-black bg-white hover:bg-gray-50'
            }`}
          >
            {/* Data Section - Left */}
            <div
              className={`inline-block w-1/2 border-r-2 pr-2 ${
                isCurrentlyTraversing ? 'border-success' : 'border-black'
              }`}
            >
              <div
                className={`font-bold break-words ${
                  isCurrentlyTraversing ? 'text-success' : 'text-black'
                } ${value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-base'}`}
              >
                {value}
              </div>
            </div>
            {/* Pointer Section - Right */}
            <div className="flex inline-block w-1/2 items-center justify-center pl-2">
              {isLastNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`mb-2 h-0.5 w-8 rotate-45 transform ${
                        isCurrentlyTraversing ? 'bg-success' : 'bg-black'
                      }`}
                    ></div>
                    <div
                      className={`absolute mb-2 h-0.5 w-8 -rotate-45 transform ${
                        isCurrentlyTraversing ? 'bg-success' : 'bg-black'
                      }`}
                    ></div>
                  </div>
                </div>
              ) : (
                <div
                  className={`text-xs ${isCurrentlyTraversing ? 'text-success' : 'text-gray-600'}`}
                >
                  next
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Singly Linked List Visualization
        </h2>

        {/* Linked List Visualization */}
        <ZoomableContainer
          className="min-h-[220px] rounded-lg bg-gray-50"
          minZoom={0.5}
          maxZoom={2}
          initialZoom={1}
          enablePan={true}
          enableWheelZoom={true}
          enableKeyboardZoom={true}
          showControls={true}
        >
          {nodes.length === 0 ? (
            <div className="p-6 text-gray-400 italic">Empty linked list</div>
          ) : (
            <div className="flex items-center justify-start space-x-2 p-6 pt-20">
              {/* Nodes with Head Pointer */}
              {nodes.map((value, index) => (
                <React.Fragment key={index}>
                  <div className="relative">
                    {/* Head Label - Always show on first node */}
                    {index === 0 && (
                      <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform">
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600">head</div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-black"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent"></div>
                        </div>
                      </div>
                    )}

                    {/* Current Pointer - Show during traverse */}
                    {index === traverseIndex && currentOperation === 'traverse' && (
                      <div
                        className={`absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 transform ${isTraversing ? 'animate-pulse' : ''}`}
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`border-b-success h-0 w-0 border-r-[4px] border-b-[6px] border-l-[4px] border-r-transparent border-l-transparent ${isTraversing ? 'animate-pulse' : ''}`}
                          ></div>
                          <div
                            className={`bg-success h-4 w-0.5 ${isTraversing ? 'animate-pulse' : ''}`}
                          ></div>
                        </div>
                        <div className="text-success px-2 py-1 text-lg font-semibold">current</div>
                      </div>
                    )}

                    {/* Node */}
                    {renderSinglyLinkedListNode(value, index)}
                  </div>

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
        </ZoomableContainer>

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

SinglyLinkedListDragDropVisualization.displayName = 'SinglyLinkedListDragDropVisualization';

export default SinglyLinkedListDragDropVisualization;
