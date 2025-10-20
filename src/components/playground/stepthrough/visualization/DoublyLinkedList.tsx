import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { StepthroughVisualizationProps, LinkedListData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';
import StepIndicator from '../../shared/StepIndicator';

const DoublyLinkedListStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<LinkedListData>
>(({ steps, currentStepIndex, data, isRunning, error }, ref) => {
  const [highlightedNodeIndex, setHighlightedNodeIndex] = useState(-1);
  const [, setHeadPosition] = useState(0);
  const [traverseIndex, setTraverseIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [isReverseTraversing, setIsReverseTraversing] = useState(false);
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

      // Check if this is a traverse operation
      if (message.includes('traverse') || message.includes('current.data')) {
        if (message.includes('traverseReverse') || message.includes('reverse')) {
          // Reverse traverse
          setIsReverseTraversing(true);
          setIsTraversing(false);
          setTraverseIndex(nodes.length - 1);

          // Start animation from last node
          const interval = setInterval(() => {
            setTraverseIndex((prev) => {
              const nextIndex = prev - 1;
              if (nextIndex < 0) {
                // Animation finished, stop traversing
                setIsReverseTraversing(false);
                clearInterval(interval);
                return prev; // Keep at first node
              }
              return nextIndex;
            });
          }, 1000); // Move to previous node every 1 second

          return () => clearInterval(interval);
        } else {
          // Forward traverse
          setIsTraversing(true);
          setIsReverseTraversing(false);
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
        }
      } else {
        // Reset when not traversing
        setIsTraversing(false);
        setIsReverseTraversing(false);
        setTraverseIndex(0);
      }
    } else {
      setIsTraversing(false);
      setIsReverseTraversing(false);
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
    const isFirst = index === 0;
    const isLast = index === nodes.length - 1;

    return (
      <div className="flex items-center" key={index}>
        {/* Node Container - 3 Section Layout like in dragdrop */}
        <div
          className={`flex h-16 w-40 rounded-lg border-2 border-black bg-white transition-all duration-700 ease-in-out ${
            isHighlighted
              ? 'scale-105 animate-bounce bg-yellow-50 shadow-lg'
              : isTransitioning
                ? 'scale-105 animate-pulse bg-blue-50'
                : 'hover:scale-105 hover:bg-gray-50'
          } ${isTransitioning ? 'animate-pulse' : ''}`}
        >
          {/* Prev Section - Left */}
          <div
            className={`flex w-1/3 items-center justify-center rounded-l-lg ${
              isHighlighted ? 'bg-yellow-100' : 'bg-gray-100'
            }`}
          >
            {isFirst ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-8 rotate-45 transform bg-black"></div>
                  <div className="absolute h-0.5 w-8 -rotate-45 transform bg-black"></div>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-black">Prev</span>
            )}
          </div>

          {/* Data Section - Center */}
          <div
            className={`flex w-1/3 items-center justify-center border-x border-x-2 border-black ${
              isHighlighted ? 'bg-yellow-100' : 'bg-white'
            }`}
          >
            <span className={`font-bold text-black ${value.length > 6 ? 'text-sm' : 'text-lg'}`}>
              {value}
            </span>
          </div>

          {/* Next Section - Right */}
          <div
            className={`flex w-1/3 items-center justify-center rounded-r-lg ${
              isHighlighted ? 'bg-yellow-100' : 'bg-gray-100'
            }`}
          >
            {isLast ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-8 rotate-45 transform bg-black"></div>
                  <div className="absolute h-0.5 w-8 -rotate-45 transform bg-black"></div>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-black">Next</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Doubly Linked List Visualization</h2>
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

      {/* Visualization Area */}
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
          <div className="flex h-full items-center justify-center p-6 text-gray-400">
            <div className="text-center">
              <div className="text-lg font-semibold">Empty Doubly Linked List</div>
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
            {/* Nodes with Head/Tail Pointers */}
            {nodes.map((value, index) => {
              const message =
                steps.length > 0 && currentStepIndex < steps.length
                  ? steps[currentStepIndex].state?.message || ''
                  : '';
              return (
                <Fragment key={index}>
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
                      (message.includes('traverse') ||
                        message.includes('current.data') ||
                        isTraversing ||
                        isReverseTraversing) && (
                        <div
                          className={`absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 transform ${
                            isTraversing || isReverseTraversing ? 'animate-pulse' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-0 w-0 border-r-[4px] border-b-[6px] border-l-[4px] border-r-transparent border-b-blue-500 border-l-transparent ${
                                isTraversing || isReverseTraversing ? 'animate-pulse' : ''
                              }`}
                            ></div>
                            <div
                              className={`h-4 w-0.5 bg-blue-500 ${
                                isTraversing || isReverseTraversing ? 'animate-pulse' : ''
                              }`}
                            ></div>
                          </div>
                          <div className="px-2 py-1 text-lg font-semibold text-blue-600">
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
                    {renderNode(value, index)}
                  </div>

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
                </Fragment>
              );
            })}
          </div>
        )}
      </ZoomableContainer>

      {/* Stats */}
      <div className="mt-4 flex space-x-6 text-sm text-gray-600">
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

DoublyLinkedListStepthroughVisualization.displayName = 'DoublyLinkedListStepthroughVisualization';

export default DoublyLinkedListStepthroughVisualization;
