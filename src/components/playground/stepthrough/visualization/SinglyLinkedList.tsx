import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { StepthroughVisualizationProps, LinkedListData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';

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

      // Check if this is a traverse operation
      if (message.includes('traverse') || message.includes('current.data')) {
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
        else if (message.includes('delete') || message.includes('Delete') || 
                 message.includes('ลบ') || message.includes('removing') ||
                 message.includes('removed')) {
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
    const isLast = index === nodes.length - 1;

    return (
      <div className="flex items-center" key={index}>
        {/* Node Container - Horizontal Layout */}
        <div
          className={`max-w-[250px] min-w-[160px] rounded-lg border-2 border-black bg-white p-3 text-center font-bold transition-all duration-700 ease-in-out ${
            isHighlighted 
              ? 'shadow-lg scale-105 animate-bounce bg-yellow-50' 
              : isTransitioning
                ? 'scale-105 animate-pulse bg-blue-50'
                : 'hover:bg-gray-50 hover:scale-105'
          } ${isTransitioning ? 'animate-pulse' : ''}`}
        >
          {/* Data Section - Left */}
          <div className="inline-block w-1/2 border-r-2 border-black pr-2">
            <div
              className={`font-bold break-words text-black ${
                value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-base'
              }`}
            >
              {value}
            </div>
          </div>
          {/* Pointer Section - Right */}
          <div className="flex inline-block w-1/2 items-center justify-center pl-2">
            {isLast ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="mb-2 h-0.5 w-8 rotate-45 transform bg-black"></div>
                  <div className="absolute mb-2 h-0.5 w-8 -rotate-45 transform bg-black"></div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-600">next</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Singly Linked List Visualization</h2>
        {isRunning && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <span>Running...</span>
          </div>
        )}
      </div>

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
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 p-6">
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
              return (
                <Fragment key={index}>
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
                    {index === traverseIndex &&
                      (message.includes('traverse') ||
                        message.includes('current.data') ||
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
                      <div className="h-0.5 w-6 bg-black"></div>
                      <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[8px] border-t-transparent border-b-transparent border-l-black"></div>
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

SinglyLinkedListStepthroughVisualization.displayName = 'SinglyLinkedListStepthroughVisualization';

export default SinglyLinkedListStepthroughVisualization;
