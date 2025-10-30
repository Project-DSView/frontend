import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { StepthroughVisualizationProps, LinkedListData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';
import StepIndicator from '../../shared/StepIndicator';

const SinglyLinkedListStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<LinkedListData>
>(({ steps, currentStepIndex, data, isRunning, error }, ref) => {
  const [highlightedNodeIndex, setHighlightedNodeIndex] = useState(-1);
  const [, setHeadPosition] = useState(0);
  const [traverseIndex, setTraverseIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use ref to store nodes to prevent unnecessary re-renders
  const nodesRef = useRef(data.nodes);
  const [nodes, setNodes] = useState(data.nodes);

  // Update nodes when data.nodes actually changes
  useEffect(() => {
    if (JSON.stringify(nodesRef.current) !== JSON.stringify(data.nodes)) {
      setIsTransitioning(true);
      nodesRef.current = data.nodes;
      setNodes(data.nodes);

      // Stop transition animation after duration
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [data.nodes]);

  // Handle traverse animation
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const message = currentStep.state?.message || '';
      const code = currentStep.code || '';

      // Check if this is a traverse operation
      if (
        message.includes('traverse') ||
        message.includes('current.data') ||
        code.includes('traverse()')
      ) {
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
    } else {
      setIsTraversing(false);
      setTraverseIndex(0);
    }
  }, [steps, currentStepIndex, nodes.length]);

  // Determine which node should be highlighted based on current step
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];

      // Try to extract node index from step message
      if (currentStep.state?.message) {
        const message = currentStep.state.message;

        // Check if this is a traverse operation
        if (message.includes('traverse') || message.includes('current.data')) {
          // For traverse operations, head stays at position 0, only highlight moves
          setHeadPosition(0);
          setHighlightedNodeIndex(traverseIndex);
          return;
        }
        // Check if this is a delete operation - don't highlight nodes for delete operations
        else if (
          message.includes('delete') ||
          message.includes('Delete') ||
          message.includes('ลบ') ||
          message.includes('removing') ||
          message.includes('removed')
        ) {
          // For delete operations, don't highlight any nodes
          setHeadPosition(0);
          setHighlightedNodeIndex(-1);
          return;
        } else {
          // For non-traverse operations, head stays at position 0
          setHeadPosition(0);

          // Look for patterns like "node at index 0", "position 1", etc.
          const indexMatch = message.match(/(?:index|position)\s+(\d+)/i);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            if (index >= 0 && index < nodes.length) {
              setHighlightedNodeIndex(index);
              return;
            }
          }

          // Look for node values in the message (but not for delete operations)
          for (let i = 0; i < nodes.length; i++) {
            if (message.includes(nodes[i])) {
              setHighlightedNodeIndex(i);
              return;
            }
          }
        }
      }

      // Default to first node if no specific match
      setHighlightedNodeIndex(0);
      setHeadPosition(0);
    } else {
      setHighlightedNodeIndex(-1);
      setHeadPosition(0);
    }
  }, [steps, currentStepIndex, nodes, traverseIndex]);

  // Render a single node
  const renderNode = (value: string, index: number) => {
    const isHighlighted = highlightedNodeIndex === index;
    const isCurrentNode = index === traverseIndex && isTraversing;
    const isLast = index === nodes.length - 1;

    return (
      <div className="flex items-center" key={index}>
        {/* Node Container - Horizontal Layout */}
        <div
          className={`max-w-[250px] min-w-[160px] rounded-lg border-2 p-3 text-center font-bold transition-all duration-700 ease-in-out ${
            isCurrentNode
              ? 'scale-105 animate-pulse border-blue-500 bg-blue-50 shadow-lg dark:border-blue-400 dark:bg-blue-900/30'
              : isHighlighted
                ? 'scale-105 animate-bounce border-gray-900 bg-yellow-50 shadow-lg dark:border-gray-300 dark:bg-yellow-900/20'
                : isTransitioning
                  ? 'scale-105 animate-pulse border-gray-900 bg-blue-50 dark:border-gray-300 dark:bg-blue-900/30'
                  : 'border-gray-900 bg-white hover:scale-105 hover:bg-gray-50 dark:border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
          } ${isTransitioning ? 'animate-pulse' : ''}`}
        >
          {/* Data Section - Left */}
          <div
            className={`inline-block w-1/2 border-r-2 pr-2 ${
              isCurrentNode
                ? 'border-blue-500 dark:border-blue-400'
                : 'border-gray-900 dark:border-gray-300'
            }`}
          >
            <div
              className={`font-bold break-words ${
                isCurrentNode
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-gray-100'
              } ${value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-base'}`}
            >
              {value}
            </div>
          </div>
          {/* Pointer Section - Right */}
          <div className="flex inline-block w-1/2 items-center justify-center pl-2">
            {isLast ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`mb-2 h-0.5 w-8 rotate-45 transform ${
                      isCurrentNode
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-900 dark:bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute mb-2 h-0.5 w-8 -rotate-45 transform ${
                      isCurrentNode
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-900 dark:bg-gray-300'
                    }`}
                  ></div>
                </div>
              </div>
            ) : (
              <div
                className={`text-xs ${
                  isCurrentNode
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
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
    <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Singly Linked List Visualization
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

      {/* Visualization Area */}
      <ZoomableContainer
        className="min-h-[220px] rounded-lg bg-gray-50 dark:bg-gray-800"
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

        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-lg font-semibold">Empty Linked List</div>
              {steps.length > 0 ? (
                <div className="text-sm">
                  Executing step {currentStepIndex + 1} of {steps.length}
                </div>
              ) : (
                <div className="text-sm">Run your code to see the visualization</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-start space-x-2 p-6 pt-20">
            {/* Nodes with Head Pointer */}
            {nodes.map((value, index) => {
              const message =
                steps.length > 0 && currentStepIndex < steps.length
                  ? steps[currentStepIndex].state?.message || ''
                  : '';
              const code =
                steps.length > 0 && currentStepIndex < steps.length
                  ? steps[currentStepIndex].code || ''
                  : '';
              return (
                <Fragment key={index}>
                  <div className="relative">
                    {/* Head Label - Always show on first node */}
                    {index === 0 && (
                      <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform">
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
                          head
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-gray-900 dark:bg-gray-300"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-gray-900 border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
                        </div>
                      </div>
                    )}

                    {/* Current Pointer - Show during traverse */}
                    {index === traverseIndex &&
                      (message.includes('traverse') ||
                        message.includes('current.data') ||
                        code.includes('traverse()') ||
                        isTraversing) && (
                        <div
                          className={`absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 transform ${isTraversing ? 'animate-pulse' : ''}`}
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-0 w-0 border-r-[4px] border-b-[6px] border-l-[4px] border-r-transparent border-b-blue-500 border-l-transparent ${isTraversing ? 'animate-pulse' : ''}`}
                            ></div>
                            <div
                              className={`h-4 w-0.5 bg-blue-500 ${isTraversing ? 'animate-pulse' : ''}`}
                            ></div>
                          </div>
                          <div className="px-2 py-1 text-lg font-semibold text-blue-600">
                            current
                          </div>
                        </div>
                      )}

                    {/* Node */}
                    {renderNode(value, index)}
                  </div>

                  {index < nodes.length - 1 && (
                    <div className="mx-2 flex items-center">
                      <div className="h-0.5 w-6 bg-gray-900 dark:bg-gray-300"></div>
                      <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-300"></div>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </ZoomableContainer>

      {/* Stats */}
      <div className="mt-4 flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-semibold">จำนวน Nodes:</span> {nodes.length}
        </div>
        <div>
          <span className="font-semibold">Head Value:</span> {data.head || 'None'}
        </div>
        <div>
          <span className="font-semibold">Tail Value:</span> {data.tail || 'None'}
        </div>
      </div>

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
});

SinglyLinkedListStepthroughVisualization.displayName = 'SinglyLinkedListStepthroughVisualization';

export default SinglyLinkedListStepthroughVisualization;
