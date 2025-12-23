import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { StepthroughVisualizationProps, LinkedListData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';
import StepIndicator from '../../shared/StepIndicator';
import { gsap } from 'gsap';

const DoublyLinkedListStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<LinkedListData>
>(({ steps, currentStepIndex, data, isRunning, error }, ref) => {
  const [highlightedNodeIndex, setHighlightedNodeIndex] = useState(-1);
  const [, setHeadPosition] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [isReverseTraversing, setIsReverseTraversing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [enteringNodes, setEnteringNodes] = useState<Set<number>>(new Set());
  const [exitingNodes, setExitingNodes] = useState<Set<string>>(new Set());
  const [nodesToRender, setNodesToRender] = useState<string[]>(data.nodes);

  // Use ref to store nodes to prevent unnecessary re-renders
  const nodesRef = useRef(data.nodes);
  const previousNodesRef = useRef<string[]>(data.nodes);
  const [nodes, setNodes] = useState(data.nodes);

  // Update nodes when data.nodes actually changes and detect insert/delete
  useEffect(() => {
    if (JSON.stringify(nodesRef.current) !== JSON.stringify(data.nodes)) {
      const previousNodes = previousNodesRef.current;
      const currentNodes = data.nodes;

      // Detect changes: compare previous and current arrays
      const newEnteringNodes = new Set<number>();
      const newExitingNodes = new Set<string>();

      // Find nodes that were deleted (in previous but not in current)
      previousNodes.forEach((prevNode) => {
        if (!currentNodes.includes(prevNode)) {
          newExitingNodes.add(prevNode);
        }
      });

      // Find nodes that were inserted (in current but not in previous)
      currentNodes.forEach((currentNode, index) => {
        if (!previousNodes.includes(currentNode)) {
          newEnteringNodes.add(index);
        } else {
          // Check if this is a new occurrence (duplicate values)
          const prevCount = previousNodes.filter((n) => n === currentNode).length;
          const currentCount = currentNodes.filter((n) => n === currentNode).length;
          if (currentCount > prevCount) {
            // This is a new occurrence
            const occurrencesBefore = currentNodes
              .slice(0, index)
              .filter((n) => n === currentNode).length;
            if (occurrencesBefore >= prevCount) {
              newEnteringNodes.add(index);
            }
          }
        }
      });

      // For exit animation: keep exiting nodes temporarily in render
      if (newExitingNodes.size > 0) {
        // Keep exiting nodes in render temporarily
        const nodesWithExiting = [...currentNodes];
        previousNodes.forEach((node) => {
          if (newExitingNodes.has(node) && !nodesWithExiting.includes(node)) {
            // Find where this node was in previous array
            const prevIndex = previousNodes.indexOf(node);
            // Try to insert it at a similar position for animation
            nodesWithExiting.splice(prevIndex, 0, node);
          }
        });
        setNodesToRender(nodesWithExiting);
        setExitingNodes(newExitingNodes);

        // Remove exiting nodes after animation
        setTimeout(() => {
          setNodesToRender(currentNodes);
          setExitingNodes(new Set());
        }, 1200);
      } else {
        setNodesToRender(currentNodes);
      }

      // Set entering nodes
      if (newEnteringNodes.size > 0) {
        setEnteringNodes(newEnteringNodes);
        // Clear entering animation after duration
        setTimeout(() => {
          setEnteringNodes((prev) => {
            const updated = new Set(prev);
            newEnteringNodes.forEach((idx) => updated.delete(idx));
            return updated;
          });
        }, 2000);
      }

      setIsTransitioning(true);
      previousNodesRef.current = [...currentNodes];
      nodesRef.current = data.nodes;
      setNodes(currentNodes);

      // Stop transition animation after duration
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [data.nodes]);

  // Handle traverse animation - just pulse, no movement
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
        // Just set traversing flag for pulse animation, no index movement
        if (
          message.includes('traverseReverse') ||
          message.includes('reverse') ||
          code.includes('traverseReverse()')
        ) {
          setIsReverseTraversing(true);
          setIsTraversing(false);
        } else {
          setIsTraversing(true);
          setIsReverseTraversing(false);
        }
        // Don't change traverseIndex - it's not used for current pointer anymore
      } else {
        // Reset when not traversing
        setIsTraversing(false);
        setIsReverseTraversing(false);
      }
    } else {
      setIsTraversing(false);
      setIsReverseTraversing(false);
    }
  }, [steps, currentStepIndex]);

  // Determine which node should be highlighted based on current step
  // Current node should be the node where the latest operation occurred
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;

      // Priority 1: Check step_detail for current_node, inserted_node, or deleted_node
      let targetNodeValue: string | null = null;

      if (stepDetail) {
        // Check for current_node (most common)
        if (stepDetail.current_node && typeof stepDetail.current_node === 'string') {
          targetNodeValue = String(stepDetail.current_node);
        }
        // Check for inserted_node
        else if (stepDetail.inserted_node && typeof stepDetail.inserted_node === 'string') {
          targetNodeValue = String(stepDetail.inserted_node);
        }
        // Check for deleted_node
        else if (stepDetail.deleted_node && typeof stepDetail.deleted_node === 'string') {
          targetNodeValue = String(stepDetail.deleted_node);
        }
      }

      // Priority 2: If no step_detail, try to extract from message
      if (!targetNodeValue && currentStep.state?.message) {
        const message = currentStep.state.message;

        // Look for patterns like "node at index 0", "position 1", etc.
        const indexMatch = message.match(/(?:index|position)\s+(\d+)/i);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          if (index >= 0 && index < nodes.length) {
            targetNodeValue = nodes[index];
          }
        }

        // Look for node values in the message
        if (!targetNodeValue) {
          for (let i = 0; i < nodes.length; i++) {
            if (message.includes(nodes[i])) {
              targetNodeValue = nodes[i];
              break;
            }
          }
        }
      }

      // Find the index of the target node
      if (targetNodeValue) {
        const nodeIndex = nodes.findIndex((node) => node === targetNodeValue);
        if (nodeIndex !== -1) {
          setHighlightedNodeIndex(nodeIndex);
          setHeadPosition(0);
          return;
        }
      }

      // For traverse operations, don't set current node (just pulse)
      if (currentStep.state?.message) {
        const message = currentStep.state.message;
        if (message.includes('traverse') || message.includes('current.data')) {
          setHeadPosition(0);
          setHighlightedNodeIndex(-1); // Don't highlight during traverse
          return;
        }
      }

      // Default: no highlight
      setHighlightedNodeIndex(-1);
      setHeadPosition(0);
    } else {
      setHighlightedNodeIndex(-1);
      setHeadPosition(0);
    }
  }, [steps, currentStepIndex, nodes]);

  // Refs for GSAP animations
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // GSAP animations for entering nodes
  useEffect(() => {
    enteringNodes.forEach((index) => {
      const node = nodesToRender[index];
      if (node) {
        const element = nodeRefs.current.get(`${node}-${index}`);
        if (element) {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              scale: 0.2,
              y: 50,
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
  }, [enteringNodes, nodesToRender]);

  // GSAP animations for exiting nodes
  useEffect(() => {
    exitingNodes.forEach((value) => {
      // Find all nodes with this value
      nodesToRender.forEach((node, index) => {
        if (node === value) {
          const element = nodeRefs.current.get(`${node}-${index}`);
          if (element) {
            gsap.to(element, {
              opacity: 0,
              scale: 0.2,
              y: 40,
              duration: 1.2,
              ease: 'power2.in',
            });
          }
        }
      });
    });
  }, [exitingNodes, nodesToRender]);

  // Render a single node
  const renderNode = (value: string, index: number) => {
    const isHighlighted = highlightedNodeIndex === index;
    // Current node is the one where latest operation occurred (not traverse)
    const isCurrentNode = highlightedNodeIndex === index && !isTraversing && !isReverseTraversing;
    // For traverse, all nodes should pulse
    const isTraversePulse = isTraversing || isReverseTraversing;
    const isFirst = index === 0;
    const isLast = index === nodesToRender.length - 1;
    const isExiting = exitingNodes.has(value);

    const nodeKey = `${value}-${index}`;

    return (
      <div
        className="flex items-center"
        key={nodeKey}
        ref={(el) => {
          if (el) {
            nodeRefs.current.set(nodeKey, el);
          } else {
            nodeRefs.current.delete(nodeKey);
          }
        }}
      >
        {/* Node Container - 3 Section Layout like in dragdrop */}
        <div
          className={`flex h-16 w-40 rounded-lg border-4 transition-all duration-700 ease-in-out ${
            isExiting
              ? 'opacity-0'
              : isCurrentNode
                ? 'scale-105 animate-pulse border-blue-500 bg-blue-50 shadow-lg'
                : isTraversePulse
                  ? 'animate-pulse border-black bg-blue-50 dark:border-gray-300 dark:bg-blue-900/30'
                  : isHighlighted
                    ? 'scale-105 animate-bounce border-black bg-yellow-50 shadow-lg dark:border-gray-300 dark:bg-yellow-900/20'
                    : isTransitioning
                      ? 'scale-105 animate-pulse border-black bg-blue-50 dark:border-gray-300 dark:bg-blue-900/30'
                      : 'border-black bg-white hover:scale-105 hover:bg-gray-50 dark:border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
          } ${isTransitioning ? 'animate-pulse' : ''}`}
        >
          {/* Prev Section - Left */}
          <div
            className={`flex w-1/3 items-center justify-center rounded-l-lg bg-white dark:bg-gray-700 ${
              isCurrentNode
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : isHighlighted
                  ? 'bg-yellow-100 dark:bg-yellow-900/20'
                  : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {isFirst ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`h-1 w-10 rotate-45 transform ${
                      isCurrentNode ? 'bg-blue-500 dark:bg-blue-400' : 'bg-black dark:bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute h-1 w-10 -rotate-45 transform ${
                      isCurrentNode ? 'bg-blue-500 dark:bg-blue-400' : 'bg-black dark:bg-gray-300'
                    }`}
                  ></div>
                </div>
              </div>
            ) : (
              <span
                className={`text-xs font-bold ${isCurrentNode ? 'text-blue-700 dark:text-blue-300' : 'text-black dark:text-gray-100'}`}
              >
                Prev
              </span>
            )}
          </div>

          {/* Data Section - Center */}
          <div
            className={`flex w-1/3 items-center justify-center border-x ${
              isCurrentNode
                ? 'border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30'
                : isHighlighted
                  ? 'border-black bg-yellow-100 dark:border-gray-300 dark:bg-yellow-900/20'
                  : 'border-black bg-white dark:border-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`font-bold ${
                isCurrentNode ? 'text-blue-700 dark:text-blue-300' : 'text-black dark:text-gray-100'
              } ${value.length > 6 ? 'text-sm' : 'text-lg'}`}
            >
              {value}
            </span>
          </div>

          {/* Next Section - Right */}
          <div
            className={`flex w-1/3 items-center justify-center rounded-r-lg bg-white dark:bg-gray-700 ${
              isCurrentNode
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : isHighlighted
                  ? 'bg-yellow-100 dark:bg-yellow-900/20'
                  : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {isLast ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`h-1 w-10 rotate-45 transform ${
                      isCurrentNode ? 'bg-blue-500 dark:bg-blue-400' : 'bg-black dark:bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute h-1 w-10 -rotate-45 transform ${
                      isCurrentNode ? 'bg-blue-500 dark:bg-blue-400' : 'bg-black dark:bg-gray-300'
                    }`}
                  ></div>
                </div>
              </div>
            ) : (
              <span
                className={`text-xs font-bold ${isCurrentNode ? 'text-blue-700 dark:text-blue-300' : 'text-black dark:text-gray-100'}`}
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
    <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Doubly Linked List Visualization
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
        <div className="bg-info/10 mb-4 rounded-lg p-3">
          <div className="text-info/90 text-sm font-medium">
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

        {nodesToRender.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-gray-400 dark:text-gray-500">
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
            {nodesToRender.map((value, index) => {
              const isExiting = exitingNodes.has(value);
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
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
                          head
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-1 bg-black dark:bg-gray-300"></div>
                          <div className="h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-t-black border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
                        </div>
                      </div>
                    )}

                    {/* Current Pointer - Show for latest operation (not during traverse) */}
                    {highlightedNodeIndex !== -1 &&
                      index === highlightedNodeIndex &&
                      !isTraversing &&
                      !isReverseTraversing && (
                        <div className="absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 transform">
                          <div className="flex flex-col items-center">
                            <div className="h-0 w-0 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-blue-500 border-l-transparent"></div>
                            <div className="h-4 w-1 bg-blue-500"></div>
                          </div>
                          <div className="px-2 py-1 text-lg font-semibold text-blue-600">
                            current
                          </div>
                        </div>
                      )}

                    {/* Tail Label - Always show on last node */}
                    {index === nodesToRender.length - 1 && (
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
                          <div className="h-4 w-1 bg-black dark:bg-gray-300"></div>
                          <div className="h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-t-black border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
                        </div>
                      </div>
                    )}

                    {/* Node */}
                    {renderNode(value, index)}
                  </div>

                  {index < nodesToRender.length - 1 &&
                    !isExiting &&
                    !exitingNodes.has(nodesToRender[index + 1]) && (
                      <div
                        className="mx-2 flex items-center"
                        style={{
                          opacity: isExiting ? 0 : 1,
                          transition: isExiting ? 'opacity 500ms ease-in' : 'none',
                        }}
                      >
                        <svg width="80" height="40" viewBox="0 0 80 40" key={`connector-${index}`}>
                          <rect width="80" height="40" fill="#ffffff" />
                          <defs>
                            <marker
                              id={`arrowRight-dll-${index}-${value}`}
                              markerWidth="4"
                              markerHeight="4"
                              refX="3"
                              refY="2"
                              orient="auto"
                            >
                              <path d="M0,0 L4,2 L0,4 Z" fill="#000000" />
                            </marker>
                            <marker
                              id={`arrowLeft-dll-${index}-${value}`}
                              markerWidth="4"
                              markerHeight="4"
                              refX="1"
                              refY="2"
                              orient="auto"
                            >
                              <path d="M0,0 L3,2 L0,4 Z" fill="#000000" />
                            </marker>
                          </defs>
                          {/* forward (right) */}
                          <line
                            x1="8"
                            y1="12"
                            x2="72"
                            y2="12"
                            stroke="#000000"
                            strokeWidth="4"
                            markerEnd={`url(#arrowRight-dll-${index}-${value})`}
                          />
                          {/* backward (left) */}
                          <line
                            x1="72"
                            y1="28"
                            x2="8"
                            y2="28"
                            stroke="#000000"
                            strokeWidth="4"
                            markerEnd={`url(#arrowLeft-dll-${index}-${value})`}
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

      {/* Console Output */}
      <div className="mt-4 overflow-hidden rounded-lg bg-gray-900 shadow-inner dark:bg-black">
        <div className="border-b border-gray-700 bg-gray-800 px-4 py-2 dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-mono text-sm font-semibold text-gray-300">Console Output</span>
          </div>
        </div>
        <div className="max-h-40 min-h-[60px] overflow-y-auto p-4 font-mono text-sm">
          {(() => {
            const currentStep = steps.length > 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;
            const printOutput = currentStep?.state?.print_output as string[] | undefined;

            if (!printOutput || printOutput.length === 0) {
              return <div className="italic text-gray-600 dark:text-gray-600">No output generated...</div>;
            }

            return printOutput.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap text-green-400">
                <span className="mr-2 text-gray-600 select-none">$</span>
                {line}
              </div>
            ));
          })()}
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
