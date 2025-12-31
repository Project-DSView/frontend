import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { StepthroughVisualizationProps, LinkedListData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';
import StepIndicator from '../../shared/StepIndicator';
import ConsoleOutput from '../../shared/ConsoleOutput';
import { gsap } from 'gsap';

// Type for storing node state at each step
interface StepNodeState {
  nodes: string[];
  currentInsertedValue: string | null;
  insertHistory: string[];
}

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

  // Track the current (last inserted) node and history for when nodes are deleted
  // Using refs to avoid useEffect dependency array size changes
  const currentInsertedValueRef = useRef<string | null>(null);
  const insertHistoryRef = useRef<string[]>([]);
  const [currentInsertedValue, setCurrentInsertedValue] = useState<string | null>(null);

  // Use ref to store nodes to prevent unnecessary re-renders
  const nodesRef = useRef(data.nodes);
  const previousNodesRef = useRef<string[]>(data.nodes);
  const [nodes, setNodes] = useState(data.nodes);

  // *** Store accumulated state for each step to persist across navigation ***
  const stepStateCache = useRef<Map<number, StepNodeState>>(new Map());
  const previousStepIndexRef = useRef<number>(currentStepIndex);
  const isInitializedRef = useRef<boolean>(false);

  // Update nodes when data.nodes changes or step changes - with caching for navigation
  useEffect(() => {
    const isMovingForward = currentStepIndex > previousStepIndexRef.current;
    const isMovingBackward = currentStepIndex < previousStepIndexRef.current;
    const isSameStep = currentStepIndex === previousStepIndexRef.current;

    // Check if we have a cached state for this step
    const cachedState = stepStateCache.current.get(currentStepIndex);

    // If moving backward and we have cached state, restore it without animations
    if (isMovingBackward && cachedState) {
      setNodes(cachedState.nodes);
      setNodesToRender(cachedState.nodes);
      setCurrentInsertedValue(cachedState.currentInsertedValue);
      currentInsertedValueRef.current = cachedState.currentInsertedValue;
      insertHistoryRef.current = cachedState.insertHistory;
      previousNodesRef.current = cachedState.nodes;
      nodesRef.current = cachedState.nodes;
      previousStepIndexRef.current = currentStepIndex;
      // No animations when going backward
      setEnteringNodes(new Set());
      setExitingNodes(new Set());
      setIsTransitioning(false);
      return;
    }

    // Normal processing for forward movement or data changes
    if (JSON.stringify(nodesRef.current) !== JSON.stringify(data.nodes) || !isSameStep) {
      const previousNodes = previousNodesRef.current;
      const currentNodes = data.nodes;

      // Detect changes: compare previous and current arrays
      const newEnteringNodes = new Set<number>();
      const newExitingNodes = new Set<string>();
      const insertedValues: string[] = [];
      const deletedValues: string[] = [];

      // Only detect animations when moving forward or on initial load
      if (isMovingForward || !isInitializedRef.current) {
        // Find nodes that were deleted (in previous but not in current)
        previousNodes.forEach((prevNode) => {
          if (!currentNodes.includes(prevNode)) {
            newExitingNodes.add(prevNode);
            deletedValues.push(prevNode);
          }
        });

        // Find nodes that were inserted (in current but not in previous)
        currentNodes.forEach((currentNode, index) => {
          if (!previousNodes.includes(currentNode)) {
            newEnteringNodes.add(index);
            insertedValues.push(currentNode);
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
                insertedValues.push(currentNode);
              }
            }
          }
        });
      }

      // Update insert history and current value
      let newInsertHistory = insertHistoryRef.current;
      let newCurrentInsertedValue = currentInsertedValueRef.current;

      if (insertedValues.length > 0) {
        // New nodes were inserted - add to history and set as current
        newInsertHistory = [...insertHistoryRef.current, ...insertedValues];
        newCurrentInsertedValue = insertedValues[insertedValues.length - 1];
        insertHistoryRef.current = newInsertHistory;
        currentInsertedValueRef.current = newCurrentInsertedValue;
        setCurrentInsertedValue(newCurrentInsertedValue);
      } else if (deletedValues.length > 0) {
        // Nodes were deleted - check if current was deleted
        newInsertHistory = insertHistoryRef.current.filter((v) => !deletedValues.includes(v));
        if (
          currentInsertedValueRef.current &&
          deletedValues.includes(currentInsertedValueRef.current)
        ) {
          // Current was deleted, go to previous in history
          newCurrentInsertedValue =
            newInsertHistory.length > 0 ? newInsertHistory[newInsertHistory.length - 1] : null;
        }
        insertHistoryRef.current = newInsertHistory;
        currentInsertedValueRef.current = newCurrentInsertedValue;
        setCurrentInsertedValue(newCurrentInsertedValue);
      }

      // For exit animation: keep exiting nodes temporarily in render
      if (newExitingNodes.size > 0 && isMovingForward) {
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

      // Set entering nodes (only when moving forward)
      if (newEnteringNodes.size > 0 && isMovingForward) {
        setEnteringNodes(newEnteringNodes);
        // Clear entering animation after duration (match CSS animation duration)
        setTimeout(() => {
          setEnteringNodes((prev) => {
            const updated = new Set(prev);
            newEnteringNodes.forEach((idx) => updated.delete(idx));
            return updated;
          });
        }, 2000);
      }

      if (isMovingForward) {
        setIsTransitioning(true);
        // Stop transition animation after duration
        setTimeout(() => setIsTransitioning(false), 800);
      }

      previousNodesRef.current = [...currentNodes];
      nodesRef.current = data.nodes;
      setNodes(currentNodes);

      // Cache the current state for this step
      stepStateCache.current.set(currentStepIndex, {
        nodes: currentNodes,
        currentInsertedValue: newCurrentInsertedValue,
        insertHistory: newInsertHistory,
      });

      isInitializedRef.current = true;
    }

    // Update previous step index
    previousStepIndexRef.current = currentStepIndex;
  }, [data.nodes, currentStepIndex]);

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

  // Determine which node should be highlighted based on currentInsertedValue
  // Current node is ALWAYS the last inserted node across ALL steps
  useEffect(() => {
    // Priority: Always use currentInsertedValue if available
    if (currentInsertedValue && nodes.includes(currentInsertedValue)) {
      const nodeIndex = nodes.findIndex((node) => node === currentInsertedValue);
      if (nodeIndex !== -1) {
        setHighlightedNodeIndex(nodeIndex);
        setHeadPosition(0);
        return;
      }
    }

    // Fallback: Check if we're in traverse mode
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      if (currentStep.state?.message) {
        const message = currentStep.state.message;
        if (message.includes('traverse') || message.includes('current.data')) {
          setHeadPosition(0);
          setHighlightedNodeIndex(-1); // Don't highlight during traverse
          return;
        }
      }
    }

    // If no currentInsertedValue yet and nodes exist, highlight first node as fallback
    if (!currentInsertedValue && nodes.length > 0) {
      setHighlightedNodeIndex(0);
      setHeadPosition(0);
    } else {
      // Default: no highlight
      setHighlightedNodeIndex(-1);
      setHeadPosition(0);
    }
  }, [steps, currentStepIndex, nodes, currentInsertedValue]);

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
        {/* Node Container - 3 Section Layout */}
        <div className="relative">
          {/* Node Box */}
          <div
            className={`inline-flex rounded-lg border-4 transition-all duration-300 ${
              isCurrentNode
                ? 'border-blue-500 bg-blue-100 shadow-lg dark:border-blue-400 dark:bg-blue-900/30'
                : isTraversePulse
                  ? 'animate-pulse border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/30'
                  : isHighlighted
                    ? 'border-yellow-500 bg-yellow-100 shadow-lg dark:border-yellow-400 dark:bg-yellow-900/20'
                    : isExiting
                      ? 'opacity-0'
                      : isTransitioning
                        ? 'animate-pulse border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/30'
                        : 'border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700'
            }`}
          >
            {/* Prev Section - Left */}
            <div
              className={`flex min-w-[40px] items-center justify-center px-2 py-2 ${
                isCurrentNode
                  ? 'border-blue-500 dark:border-blue-400'
                  : 'border-gray-900 dark:border-gray-300'
              }`}
            >
              {isFirst ? (
                /* X mark for null - first node has no prev */
                <div className="relative h-5 w-5">
                  <div
                    className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform ${
                      isCurrentNode
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-900 dark:bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform ${
                      isCurrentNode
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-900 dark:bg-gray-300'
                    }`}
                  ></div>
                </div>
              ) : (
                <div className={`h-2 w-2`}></div>
              )}
            </div>

            {/* Data Section - Center */}
            <div
              className={`flex min-w-[60px] items-center justify-center border-x-4 px-4 py-2 ${
                isCurrentNode
                  ? 'border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30'
                  : 'border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`font-bold ${
                  isCurrentNode
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-900 dark:text-gray-100'
                } ${value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-lg'}`}
              >
                {value}
              </span>
            </div>

            {/* Next Section - Right */}
            <div
              className={`flex min-w-[40px] items-center justify-center px-2 py-2 ${
                isCurrentNode
                  ? 'border-blue-500 dark:border-blue-400'
                  : 'border-gray-900 dark:border-gray-300'
              }`}
            >
              {isLast ? (
                /* X mark for null - last node has no next */
                <div className="relative h-5 w-5">
                  <div
                    className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform ${
                      isCurrentNode
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-900 dark:bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform ${
                      isCurrentNode
                        ? 'bg-blue-500 dark:bg-blue-400'
                        : 'bg-gray-900 dark:bg-gray-300'
                    }`}
                  ></div>
                </div>
              ) : (
                <div className={`h-2 w-2`}></div>
              )}
            </div>
          </div>

          {/* Labels below node - always show to maintain consistent height */}
          <div className="flex text-sm text-gray-600 dark:text-gray-400" style={{ width: '100%' }}>
            <div className={`w-1/3 text-center ${isFirst ? 'invisible' : ''}`}>prev</div>
            <div className="w-1/3"></div>
            <div className={`w-1/3 text-center ${isLast ? 'invisible' : ''}`}>next</div>
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
        <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Step {steps[currentStepIndex].stepNumber}: {steps[currentStepIndex].state.message}
          </div>
        </div>
      )}

      {/* Visualization Area */}
      <ZoomableContainer
        className="min-h-[280px] rounded-lg bg-gray-50 dark:bg-gray-800"
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

        {/* Root Node and Data Nodes - Root on top, nodes below */}
        <div className="p-6">
          {/* Root Node Section */}
          <div className="mb-2">
            {/* Root Label */}
            <div className="mb-1 text-lg font-bold text-gray-800 italic dark:text-gray-200">
              root
            </div>

            {/* Root Node Box - 3 sections: head, count, tail */}
            <div className="inline-flex rounded-lg border-4 border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/20">
              {/* Head Pointer Section */}
              <div className="flex min-w-[50px] items-center justify-center border-r-4 border-gray-900 px-4 py-2 dark:border-gray-300">
                {nodesToRender.length > 0 ? (
                  /* Just a dot to indicate pointer exists */
                  <div className="h-3 w-3"></div>
                ) : (
                  /* X mark for null */
                  <div className="relative h-6 w-6">
                    <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform bg-gray-900 dark:bg-gray-300"></div>
                    <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform bg-gray-900 dark:bg-gray-300"></div>
                  </div>
                )}
              </div>
              {/* Count Section - Center */}
              <div className="flex min-w-[60px] flex-col items-center justify-center border-r-4 border-gray-900 px-4 py-2 dark:border-gray-300">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {nodesToRender.length}
                </span>
              </div>
              {/* Tail Pointer Section */}
              <div className="flex min-w-[50px] items-center justify-center px-4 py-2">
                {nodesToRender.length > 0 ? (
                  /* Just a dot to indicate pointer exists */
                  <div className="h-3 w-3"></div>
                ) : (
                  /* X mark for null */
                  <div className="relative h-6 w-6">
                    <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform bg-gray-900 dark:bg-gray-300"></div>
                    <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform bg-gray-900 dark:bg-gray-300"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Labels below Root Node */}
            <div
              className="flex text-sm text-gray-600 dark:text-gray-400"
              style={{ width: '180px' }}
            >
              <div className="w-1/3 text-center">head</div>
              <div className="w-1/3 text-center">count</div>
              <div className="w-1/3 text-center">tail</div>
            </div>
          </div>

          {/* Connector from Root to First Node */}
          {nodesToRender.length > 0 && (
            <div className="mb-2 ml-[25px] flex">
              {/* Vertical line going down */}
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-gray-900 dark:bg-gray-300"></div>
                {/* Arrow pointing down - triangle using border-top */}
                <div className="h-0 w-0 border-t-[6px] border-r-[5px] border-l-[5px] border-t-gray-900 border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
              </div>
            </div>
          )}

          {/* Data Nodes Row - Horizontal */}
          <div className="flex flex-row flex-nowrap items-center">
            {nodesToRender.map((value, index) => {
              const isExiting = exitingNodes.has(value);
              return (
                <Fragment key={`${value}-${index}`}>
                  <div className="relative">
                    {/* Current Pointer */}
                    {index === highlightedNodeIndex && !isTraversing && !isReverseTraversing && (
                      <div className="absolute -bottom-16 left-1/2 z-10 -translate-x-1/2 transform">
                        <div className="flex flex-col items-center">
                          <div className="h-0 w-0 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-blue-500 border-l-transparent"></div>
                          <div className="h-4 w-1 bg-blue-500"></div>
                        </div>
                        <div className="px-2 py-1 text-lg font-semibold text-blue-600">current</div>
                      </div>
                    )}

                    {/* Node */}
                    {renderNode(value, index)}
                  </div>

                  {/* Bidirectional Arrow between nodes */}
                  {index < nodesToRender.length - 1 &&
                    !isExiting &&
                    !exitingNodes.has(nodesToRender[index + 1]) && (
                      <div className="mx-2 mb-5 flex flex-shrink-0 items-center">
                        <svg width="60" height="30" viewBox="0 0 60 30">
                          <defs>
                            <marker
                              id={`arrowRight-dll-step-${index}`}
                              markerWidth="4"
                              markerHeight="4"
                              refX="3"
                              refY="2"
                              orient="auto"
                            >
                              <path
                                d="M0,0 L4,2 L0,4 Z"
                                className="fill-gray-900 dark:fill-gray-300"
                              />
                            </marker>
                            <marker
                              id={`arrowLeft-dll-step-${index}`}
                              markerWidth="4"
                              markerHeight="4"
                              refX="1"
                              refY="2"
                              orient="auto"
                            >
                              <path
                                d="M4,0 L0,2 L4,4 Z"
                                className="fill-gray-900 dark:fill-gray-300"
                              />
                            </marker>
                          </defs>
                          {/* forward (right) arrow - top */}
                          <line
                            x1="5"
                            y1="10"
                            x2="55"
                            y2="10"
                            className="stroke-gray-900 dark:stroke-gray-300"
                            strokeWidth="2"
                            markerEnd={`url(#arrowRight-dll-step-${index})`}
                          />
                          {/* backward (left) arrow - bottom */}
                          <line
                            x1="5"
                            y1="20"
                            x2="55"
                            y2="20"
                            className="stroke-gray-900 dark:stroke-gray-300"
                            strokeWidth="2"
                            markerStart={`url(#arrowLeft-dll-step-${index})`}
                          />
                        </svg>
                      </div>
                    )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </ZoomableContainer>

      {/* Stats */}
      <div className="mt-4 flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-semibold">จำนวน Nodes:</span> {nodes.length}
        </div>
        <div>
          <span className="font-semibold">Head Value:</span> {nodes.length > 0 ? nodes[0] : 'None'}
        </div>
        <div>
          <span className="font-semibold">Tail Value:</span>{' '}
          {nodes.length > 0 ? nodes[nodes.length - 1] : 'None'}
        </div>
      </div>

      {/* Console Output */}
      <ConsoleOutput steps={steps} currentStepIndex={currentStepIndex} />

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

DoublyLinkedListStepthroughVisualization.displayName = 'DoublyLinkedListStepthroughVisualization';

export default DoublyLinkedListStepthroughVisualization;
