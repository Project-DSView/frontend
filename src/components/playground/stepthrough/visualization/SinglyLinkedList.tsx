import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

import { StepthroughVisualizationProps, LinkedListData, StepNodeState, ViewMode } from '@/types';
import { generateMemoryAddress } from '@/lib';

import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';
import StepIndicator from '@/components/playground/shared/action/StepIndicator';
import ConsoleOutput from '@/components/playground/stepthrough/ConsoleOutput';
import PerformanceAnalysisPanel from '@/components/playground/shared/PerformancePanel/PerformanceAnalysisPanel';
import MemoryAddress from '@/components/playground/shared/common/MemoryAddress';
import VariableStatePanel from '@/components/playground/stepthrough/VariableStatePanel';
import CommonPitfallsWarning from '@/components/playground/stepthrough/CommonPitfallsWarning';
import StepInfoPanel from '@/components/playground/stepthrough/StepInfoPanel';
import PitfallPopup from '@/components/playground/stepthrough/PitfallPopup';
import ConceptualAnalogyPanel from '@/components/playground/shared/analogy/ConceptualAnalogyPanel';
import VisualizationViewControls from '@/components/playground/shared/common/VisualizationViewControls';

const SinglyLinkedListStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<LinkedListData>
>(({ steps, currentStepIndex, data, isRunning, error, complexity, code }, ref) => {
  const [viewMode, setViewMode] = useState<ViewMode>('technical');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [enteringNodes, setEnteringNodes] = useState<Set<number>>(new Set());
  const [exitingNodes, setExitingNodes] = useState<Set<string>>(new Set());
  const [nodesToRender, setNodesToRender] = useState<string[]>(data.nodes);
  const [isInstantiated, setIsInstantiated] = useState(false);
  const [pendingNodes, setPendingNodes] = useState<Array<{ variable: string; value: string }>>([]);
  const [pendingDeleteNode, setPendingDeleteNode] = useState<string | null>(null);
  const [showMemoryAddress, setShowMemoryAddress] = useState(false);
  const [, setCurrentInsertedValue] = useState<string | null>(null);
  const [nodes, setNodes] = useState(data.nodes);
  const [operationPointerIndex, setOperationPointerIndex] = useState(-1);
  const [operationPointerLabel, setOperationPointerLabel] = useState('');
  const [pendingConnectionToHead, setPendingConnectionToHead] = useState<{
    fromValue: string;
    toValue: string;
    pendingVariable: string;
  } | null>(null);
  const [pendingConnectionToStartNext, setPendingConnectionToStartNext] = useState<{
    fromValue: string;
    toValue: string;
    pendingVariable: string;
    startNodePosition: number;
    targetPosition: number;
  } | null>(null);

  const currentInsertedValueRef = useRef<string | null>(null);
  const insertHistoryRef = useRef<string[]>([]);
  const nodesRef = useRef(data.nodes);
  const previousNodesRef = useRef<string[]>(data.nodes);
  const stepStateCache = useRef<Map<number, StepNodeState>>(new Map());
  const previousStepIndexRef = useRef<number>(currentStepIndex);
  const isInitializedRef = useRef<boolean>(false);
  const pendingNodesRef = useRef<Array<{ variable: string; value: string }>>([]);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const arrowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
      // Restore pending nodes from cache
      setPendingNodes(cachedState.pendingNodes || []);
      pendingNodesRef.current = cachedState.pendingNodes || [];
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
        pendingNodes: pendingNodesRef.current,
      });

      isInitializedRef.current = true;
    }

    // Update previous step index
    previousStepIndexRef.current = currentStepIndex;
  }, [data.nodes, currentStepIndex]);

  // Track operation pointer from backend step_detail
  // Shows pointer position for ALL operations (insert, delete, search, traverse)
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as
        | {
            operation?: string;
            pointer_position?: number;
            pointer_variable_name?: string;
            is_loop_iteration?: boolean;
            is_pointer_movement?: boolean;
          }
        | undefined;

      if (stepDetail?.pointer_position !== undefined) {
        setOperationPointerIndex(stepDetail.pointer_position);
        // Use pointer_variable_name, fallback to 'current'
        setOperationPointerLabel(stepDetail.pointer_variable_name || 'current');
      } else {
        setOperationPointerIndex(-1);
        setOperationPointerLabel('');
      }
    } else {
      setOperationPointerIndex(-1);
      setOperationPointerLabel('');
    }
  }, [steps, currentStepIndex]);

  // [NEW] Track pending connection from pNew.next to head (for intermediate step visualization)
  // This shows an arrow from the pending node to the head before head is reassigned
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as
        | {
            operation?: string;
            next_points_to_head?: boolean;
            pending_node_value?: string;
            pending_node_variable?: string;
            target_head_value?: string;
          }
        | undefined;

      if (stepDetail?.next_points_to_head && stepDetail?.pending_node_value) {
        setPendingConnectionToHead({
          fromValue: stepDetail.pending_node_value,
          toValue:
            stepDetail.target_head_value || (nodesToRender.length > 0 ? nodesToRender[0] : ''),
          pendingVariable: stepDetail.pending_node_variable || 'pNew',
        });
      } else {
        setPendingConnectionToHead(null);
      }
    } else {
      setPendingConnectionToHead(null);
    }
  }, [steps, currentStepIndex, nodesToRender]);

  // [NEW] Track pending connection from pNew.next to start.next (for insertBefore intermediate step)
  // This shows an arrow from the pending node below the list pointing to target node
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as
        | {
            operation?: string;
            next_points_to_start_next?: boolean;
            pending_node_value?: string;
            pending_node_variable?: string;
            start_node_position?: number;
            target_next_value?: string;
            target_next_position?: number;
          }
        | undefined;

      if (stepDetail?.next_points_to_start_next && stepDetail?.pending_node_value) {
        setPendingConnectionToStartNext({
          fromValue: stepDetail.pending_node_value,
          toValue: stepDetail.target_next_value || '',
          pendingVariable: stepDetail.pending_node_variable || 'pNew',
          startNodePosition: stepDetail.start_node_position ?? -1,
          targetPosition: stepDetail.target_next_position ?? -1,
        });
      } else {
        setPendingConnectionToStartNext(null);
      }
    } else {
      setPendingConnectionToStartNext(null);
    }
  }, [steps, currentStepIndex]);

  // Check if the list has been instantiated (SinglyLinkedList.__init__ was called)
  useEffect(() => {
    if (steps.length === 0) {
      setIsInstantiated(false);
      return;
    }

    // Check up to current step for instantiation
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const step = steps[i];
      const stepDetail = step.state?.step_detail;

      // Check for instantiate operation
      if (stepDetail?.operation === 'instantiate') {
        setIsInstantiated(true);
        return;
      }

      // Also check if there are instances (already created list)
      if (step.state?.instances && Object.keys(step.state.instances).length > 0) {
        setIsInstantiated(true);
        return;
      }
    }

    setIsInstantiated(false);
  }, [steps, currentStepIndex]);

  useEffect(() => {
    if (steps.length === 0) {
      setPendingNodes([]);
      pendingNodesRef.current = [];
      return;
    }

    const currentFloating = new Map<string, { variable: string; value: string }>();

    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const step = steps[i];
      const stepDetail = step.state?.step_detail as
        | {
            operation?: string;
            node_variable?: string;
            node_value?: string;
          }
        | undefined;

      // 1. Check for Node Creation -> Add to floating
      if (stepDetail?.operation === 'node_creation') {
        const nodeValue = stepDetail.node_value || '';
        if (nodeValue) {
          currentFloating.set(nodeValue, { variable: nodeValue, value: nodeValue });
        }
      }

      // 2. Check for Node Landing (Appearance in List) -> Remove from floating
      const instances = step.state?.instances || {};
      const nodesInList = new Set<string>();

      Object.values(instances).forEach((val: unknown) => {
        const instance = val as { type?: string; nodes?: string[] };
        if (instance.type === 'LinkedList' && Array.isArray(instance.nodes)) {
          instance.nodes.forEach((nodeVal: string) => nodesInList.add(nodeVal));
        }
      });

      // If a floating node is now in the list, it's no longer floating
      nodesInList.forEach((nodeVal) => {
        if (currentFloating.has(nodeVal)) {
          currentFloating.delete(nodeVal);
        }
      });
    }

    // Convert map to array
    const result = Array.from(currentFloating.values());

    // Final check against CURRENT data.nodes just in case
    const finalPending = result.filter((p) => !data.nodes.includes(p.value));

    // Update ref and state
    pendingNodesRef.current = finalPending;
    setPendingNodes(finalPending);

    // Update the cache with current pending nodes
    const cachedState = stepStateCache.current.get(currentStepIndex);
    if (cachedState) {
      cachedState.pendingNodes = finalPending;
    }
  }, [steps, currentStepIndex, data.nodes]);

  // Detect pending deletion - show yellow highlight before node is deleted
  useEffect(() => {
    if (steps.length === 0 || currentStepIndex >= steps.length) {
      setPendingDeleteNode(null);
      return;
    }

    const currentStep = steps[currentStepIndex];
    const stepDetail = currentStep.state.step_detail as
      | {
          operation?: string;
          method_name?: string;
          parameters?: string;
          delete_value?: string;
        }
      | undefined;

    // Check if this step is a delete operation
    const isDeleteOperation =
      stepDetail?.operation === 'delete' ||
      stepDetail?.operation === 'node_deletion' ||
      stepDetail?.method_name === 'delete' ||
      stepDetail?.method_name === 'remove' ||
      stepDetail?.method_name === 'deleteFront' ||
      stepDetail?.method_name === 'deleteLast';

    if (isDeleteOperation) {
      // Try to extract the node value being deleted
      const deleteValue = stepDetail?.delete_value;
      const parameters = stepDetail?.parameters;

      if (deleteValue) {
        setPendingDeleteNode(deleteValue);
      } else if (parameters) {
        // Extract value from parameters like "Tony" or 'Tony'
        const valueMatch = parameters.match(/['"]([^'"]+)['"]/);
        if (valueMatch) {
          setPendingDeleteNode(valueMatch[1]);
        }
      } else if (stepDetail?.method_name === 'deleteFront' && nodes.length > 0) {
        // For deleteFront, the head node will be deleted
        setPendingDeleteNode(nodes[0]);
      } else if (stepDetail?.method_name === 'deleteLast' && nodes.length > 0) {
        // For deleteLast, the tail node will be deleted
        setPendingDeleteNode(nodes[nodes.length - 1]);
      }
    } else {
      setPendingDeleteNode(null);
    }
  }, [steps, currentStepIndex, nodes]);

  // GSAP animations for arrows when new nodes are added
  useEffect(() => {
    enteringNodes.forEach((index) => {
      // Animate the arrow that points TO this node (arrow from index-1 to index)
      if (index > 0) {
        const arrowIndex = index - 1;
        const arrowElement = arrowRefs.current.get(arrowIndex);
        if (arrowElement) {
          // Animate the arrow growing from left to right
          gsap.fromTo(
            arrowElement,
            {
              scaleX: 0,
              transformOrigin: 'left center',
            },
            {
              scaleX: 1,
              duration: 0.6,
              ease: 'power2.out',
            },
          );
        }
      }
      // Also animate the arrow from root to first node if index is 0
      if (index === 0) {
        const rootArrowElement = document.getElementById('root-to-first-arrow');
        if (rootArrowElement) {
          gsap.fromTo(
            rootArrowElement,
            {
              scaleY: 0,
              transformOrigin: 'top center',
            },
            {
              scaleY: 1,
              duration: 0.5,
              ease: 'power2.out',
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

  // Render a single node with enhanced color coding:
  // Green: Newly created node (entering animation)
  // Blue: Current pointer node
  // Yellow: Pending deletion
  // Red: Being deleted (exiting animation)
  const renderNode = (value: string, index: number) => {
    // Check node states for color coding
    const isNewlyCreated = enteringNodes.has(index); // Orange - just created
    const isBeingDeleted = exitingNodes.has(value); // Red - fade out
    const isPendingDelete = pendingDeleteNode === value; // Yellow - about to be deleted

    // Operation pointer - shows purple highlight for current pointer position
    const isOperationPointerNode = operationPointerIndex === index;
    const isLast = index === nodesToRender.length - 1;
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
        {/* Node Container */}
        <div>
          {/* Node Box Wrapper - For pointer positioning */}
          <div className="relative">
            {/* Operation Pointer - Shows current pointer position during operations */}
            {operationPointerIndex === index && (
              <div
                className="absolute -bottom-20 left-1/2 z-20 -translate-x-1/2 transform"
                style={{ animation: 'bounceIn 0.5s ease-out forwards' }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-0 w-0 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-purple-500 border-l-transparent"></div>
                  <div className="h-6 w-1 bg-purple-500"></div>
                </div>
                <div className="px-1 py-0.5 text-sm font-bold whitespace-nowrap text-purple-600">
                  {operationPointerLabel || 'current'}
                </div>
              </div>
            )}

            {/* Node Box */}
            <div
              className={`inline-flex rounded-lg border-4 transition-all duration-300 ${
                // Red - Being deleted (highest priority with fade animation)
                isBeingDeleted
                  ? 'scale-90 border-red-500 bg-red-100 opacity-50 shadow-lg dark:border-red-400 dark:bg-red-900/30'
                  : // Yellow - Pending deletion
                    isPendingDelete
                    ? 'animate-pulse border-amber-500 bg-amber-100 shadow-lg dark:border-amber-400 dark:bg-amber-900/30'
                    : // Orange - Newly created
                      isNewlyCreated
                      ? 'scale-105 border-orange-500 bg-orange-100 shadow-lg dark:border-orange-400 dark:bg-orange-900/30'
                      : // Purple - Operation pointer (current pointer position)
                        isOperationPointerNode
                        ? 'border-purple-500 bg-purple-100 shadow-lg dark:border-purple-400 dark:bg-purple-900/30'
                        : // Default
                          isTransitioning
                          ? 'animate-pulse border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/30'
                          : 'border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700'
              }`}
            >
              {/* Data Section - Left */}
              <div
                className={`flex min-w-[60px] items-center justify-center border-r-4 px-4 py-2 ${
                  isOperationPointerNode
                    ? 'border-purple-500 dark:border-purple-400'
                    : 'border-gray-900 dark:border-gray-300'
                }`}
              >
                <span
                  className={`font-bold ${
                    isOperationPointerNode
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-gray-900 dark:text-gray-100'
                  } ${value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-lg'}`}
                >
                  {value}
                </span>
              </div>
              {/* Pointer Section - Right */}
              <div className="flex min-w-[50px] items-center justify-center px-4 py-2">
                {isLast ? (
                  /* X mark for null - last node */
                  <div className="relative h-6 w-6">
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform ${
                        isOperationPointerNode
                          ? 'bg-purple-500 dark:bg-purple-400'
                          : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform ${
                        isOperationPointerNode
                          ? 'bg-purple-500 dark:bg-purple-400'
                          : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                  </div>
                ) : (
                  /* Dot for pointer - same as root head section */
                  <div
                    className={` ${isOperationPointerNode ? 'bg-purple-500 dark:bg-purple-400' : ''}`}
                  ></div>
                )}
              </div>
            </div>
          </div>

          {/* Labels below node - always show to maintain consistent height */}
          <div className="flex text-sm text-gray-600 dark:text-gray-400" style={{ width: '100%' }}>
            <div className="w-1/2"></div>
            <div className={`w-1/2 text-center ${isLast ? 'invisible' : ''}`}>
              {data.classMetadata?.next_attr || 'next'}
            </div>
          </div>

          {/* Memory Address - shown when toggle is enabled */}
          <MemoryAddress address={generateMemoryAddress(index)} isVisible={showMemoryAddress} />
        </div>
      </div>
    );
  };

  // State for Variable State Panel visibility
  const [showVariablePanel, setShowVariablePanel] = useState(true);

  // State for Pitfall Popup
  const [isPitfallPopupOpen, setIsPitfallPopupOpen] = useState(false);

  // Extract warnings from current step
  const currentWarnings =
    steps.length > 0 && currentStepIndex < steps.length
      ? (
          steps[currentStepIndex].state?.step_detail as {
            warnings?: Array<{
              type: string;
              severity: 'info' | 'warning' | 'error';
              message: string;
              tip: string;
            }>;
          }
        )?.warnings || []
      : [];

  return (
    <div ref={ref} className="rounded-lg bg-white p-3 shadow sm:p-6 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100">
          Singly Linked List Visualization
        </h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Variable Panel Toggle */}
          <button
            id="tutorial-variables-toggle"
            onClick={() => setShowVariablePanel(!showVariablePanel)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              showVariablePanel
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
            title="Toggle Variable State Panel"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="hidden sm:inline">Variables</span>
          </button>

          {/* View Controls (Mode Switcher + Memory Address Toggle) */}
          <div className="mx-0 sm:mx-2">
            <VisualizationViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showMemoryAddress={showMemoryAddress}
              onToggleMemoryAddress={setShowMemoryAddress}
            />
          </div>

          {isRunning && (
            <div className="hidden items-center space-x-2 text-sm text-blue-600 sm:flex dark:text-blue-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Running...</span>
            </div>
          )}

          {/* Common Errors Button */}
          <button
            id="tutorial-common-errors"
            onClick={() => setIsPitfallPopupOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
            title="ดูข้อผิดพลาดที่พบบ่อย"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="hidden sm:inline">Common Errors</span>
            <span className="sm:hidden">Errors</span>
          </button>
        </div>
      </div>

      {/* Pitfall Warnings - Show if any */}
      {currentWarnings.length > 0 && (
        <div className="mb-4">
          <CommonPitfallsWarning warnings={currentWarnings} />
        </div>
      )}

      {/* Current Step Info */}
      {steps.length > 0 && currentStepIndex < steps.length && !error && (
        <StepInfoPanel
          stepNumber={steps[currentStepIndex].stepNumber}
          message={steps[currentStepIndex].state.message}
          userCommand={steps[currentStepIndex].state.step_detail?.user_command}
        />
      )}

      {/* Main Content - Flex layout with Variable Panel */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left Side - Variable State Panel */}
        {showVariablePanel && (
          <div className="w-full flex-shrink-0 lg:w-auto">
            <VariableStatePanel steps={steps} currentStepIndex={currentStepIndex} nodes={nodes} />
          </div>
        )}

        {/* Right Side - Visualization Area */}
        <div className="min-w-0 flex-1">
          {viewMode === 'analogy' ? (
            <ConceptualAnalogyPanel
              type="linked-list"
              data={{ nodes: nodesToRender }}
              className="min-h-[320px]"
              isVisible={isInstantiated}
            />
          ) : (
            <ZoomableContainer
              className="min-h-[320px] rounded-lg bg-gray-50 dark:bg-gray-800"
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
              <div className="p-6 pb-[200px]">
                {/* Empty State - Show when list is not yet instantiated */}
                {!isInstantiated && (
                  <div className="flex min-h-[150px] items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium">Empty Singly Linked List</p>
                      <p className="mt-1 text-sm">
                        Run your code to see Singly Linked List visualization
                      </p>
                    </div>
                  </div>
                )}

                {/* Root Node Section - Only show after list is instantiated */}
                {isInstantiated && (
                  <div className="mb-2">
                    {/* Root Label - Use dynamic class name or fallback */}
                    <div className="mb-1 text-lg font-bold text-gray-800 dark:text-gray-200">
                      {data.classMetadata?.list_class || 'Head'}
                    </div>

                    {/* Root Node Box */}
                    <div className="inline-flex rounded-lg border-4 border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/20">
                      {/* Count Section */}
                      <div className="flex min-w-[60px] flex-col items-center justify-center border-r-4 border-gray-900 px-4 py-2 dark:border-gray-300">
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {nodesToRender.length}
                        </span>
                      </div>
                      {/* Head Pointer Section */}
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

                    {/* Labels below Root Node - Use dynamic attribute names */}
                    <div
                      className="flex text-sm text-gray-600 dark:text-gray-400"
                      style={{ width: '130px' }}
                    >
                      <div className="w-1/2 text-center">
                        {data.classMetadata?.count_attr || 'count'}
                      </div>
                      <div className="w-1/2 text-center">
                        {data.classMetadata?.head_attr || 'head'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Connector from Root to First Node */}
                {/* When pendingConnectionToHead exists, use longer diagonal line to point to original head */}
                {isInstantiated &&
                  nodesToRender.length > 0 &&
                  (pendingConnectionToHead ? (
                    /* Extended diagonal connector when pNew.next = self.head */
                    <div className="mb-2 flex" style={{ marginLeft: '85px' }}>
                      <div id="root-to-first-arrow" className="flex items-end">
                        {/* Diagonal line using SVG for precise control */}
                        <svg width="180" height="70" className="overflow-visible">
                          <defs>
                            {/* Arrow head marker that auto-rotates with line direction */}
                            <marker
                              id="arrowhead"
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill="currentColor"
                                className="text-gray-900 dark:text-gray-300"
                              />
                            </marker>
                          </defs>
                          {/* Diagonal line from head to Tony */}
                          <line
                            x1="0"
                            y1="0"
                            x2="170"
                            y2="60"
                            stroke="currentColor"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                            className="text-gray-900 dark:text-gray-300"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    /* Normal vertical connector */
                    <div className="mb-2 ml-[85px] flex">
                      <div id="root-to-first-arrow" className="flex flex-col items-center">
                        <div className="h-8 w-0.5 bg-gray-900 dark:bg-gray-300"></div>
                        {/* Arrow pointing down */}
                        <div className="h-0 w-0 border-t-[6px] border-r-[5px] border-l-[5px] border-t-gray-900 border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
                      </div>
                    </div>
                  ))}

                {/* Data Nodes Row - Horizontal */}
                <div
                  className={`flex flex-row flex-nowrap items-center ${nodesToRender.length === 0 && pendingNodes.length > 0 ? 'mt-8' : ''}`}
                >
                  {/* Pending nodes with connection to head - Display BEFORE connected nodes (on the left) */}
                  {pendingConnectionToHead && pendingNodes.length > 0 && (
                    <>
                      {pendingNodes
                        .filter((pn) => pn.value === pendingConnectionToHead.fromValue)
                        .map((pendingNode, index) => (
                          <motion.div
                            key={`pending-to-head-${pendingNode.variable}-${index}`}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -50, scale: 0.5 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <div className="relative">
                              {/* Variable name label above the node */}
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-green-600 dark:text-green-400">
                                {pendingConnectionToHead.pendingVariable}
                              </div>

                              {/* Node Box - Green accent (connected to head) */}
                              <div className="inline-flex animate-pulse rounded-lg border-4 border-green-500 bg-green-100 shadow-lg dark:border-green-400 dark:bg-green-900/30">
                                {/* Data Section - Left */}
                                <div className="flex min-w-[60px] items-center justify-center border-r-4 border-green-500 px-4 py-2 dark:border-green-400">
                                  <span className="font-bold text-green-700 dark:text-green-300">
                                    {pendingNode.value}
                                  </span>
                                </div>
                                {/* Pointer Section - Right - indicates connected */}
                                <div className="flex min-w-[50px] items-center justify-center px-4 py-2"></div>
                              </div>

                              {/* Labels below node */}
                              <div
                                className="flex text-sm text-green-600 dark:text-green-400"
                                style={{ width: '100%' }}
                              >
                                <div className="w-1/2 text-center">
                                  {data.classMetadata?.data_attr || 'Name'}
                                </div>
                                <div className="w-1/2 text-center">
                                  {data.classMetadata?.next_attr || 'Next'}
                                </div>
                              </div>
                            </div>

                            {/* Arrow pointing RIGHT to head node */}
                            {nodesToRender.length > 0 && (
                              <motion.div
                                className="mx-2 mb-5 flex flex-shrink-0 items-center"
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{
                                  delay: 0.3,
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 20,
                                }}
                                style={{ transformOrigin: 'left' }}
                              >
                                <div className="relative flex items-center">
                                  {/* Dashed line */}
                                  <div className="h-1.5 w-12 border-t-[3px] border-dashed border-green-600 dark:border-green-400"></div>
                                  {/* Arrow head pointing RIGHT */}
                                  <div className="mb-4= h-0 w-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-green-600 dark:border-l-green-400"></div>
                                  {/* Label below arrow */}
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap text-green-700 dark:text-green-300">
                                    .next → head
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                    </>
                  )}

                  {nodesToRender.map((value, index) => {
                    const isExiting = exitingNodes.has(value);
                    return (
                      <Fragment key={`${value}-${index}`}>
                        {/* Node - pointer indicators are now inside renderNode */}
                        {/* Node - pointer indicators are now inside renderNode */}
                        {pendingConnectionToStartNext &&
                        index === pendingConnectionToStartNext.startNodePosition ? (
                          <div className="relative">
                            {renderNode(value, index)}

                            {/* InsertBefore Intermediate Step: Dynamic Positioning with Animation */}
                            {(() => {
                              const isFirstNode =
                                pendingConnectionToStartNext.startNodePosition === 0;
                              return (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5, y: isFirstNode ? -20 : 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className={`absolute left-[80px] flex items-center ${
                                    isFirstNode
                                      ? 'top-full mt-24 flex-col' // Below list: Increased mt-24 to avoid overlaps
                                      : 'bottom-full mb-16 flex-col-reverse' // Above list
                                  }`}
                                  style={{
                                    width: '100%',
                                    minWidth: '150px',
                                    marginLeft: '-20px',
                                    zIndex: 20,
                                  }}
                                >
                                  {/* SVG Connector */}
                                  <svg
                                    width="150"
                                    height="100"
                                    className={`absolute left-[50%] overflow-visible ${
                                      isFirstNode ? '-top-[80px]' : '-bottom-[80px]'
                                    }`}
                                    style={{ zIndex: 0 }}
                                  >
                                    <defs>
                                      <marker
                                        id="arrowhead-green"
                                        markerWidth="5"
                                        markerHeight="3.5"
                                        refX="8"
                                        refY="3.5"
                                        orient="auto"
                                        viewBox="0 0 10 7"
                                      >
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#15803d" />
                                      </marker>
                                    </defs>
                                    <motion.path
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.5, delay: 0.2 }}
                                      d={
                                        isFirstNode
                                          ? 'M 50 90 C 70 90, 90 70, 95 30' // Smoother Cubic Bezier for Up-Right
                                          : 'M 50 10 C 70 10, 90 30, 95 70' // Smoother Cubic Bezier for Down-Right
                                      }
                                      stroke="#15803d"
                                      strokeWidth="3"
                                      strokeDasharray="6,3"
                                      fill="none"
                                      markerEnd="url(#arrowhead-green)"
                                    />
                                    <motion.text
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.4 }}
                                      x={isFirstNode ? 105 : 105}
                                      y={isFirstNode ? 50 : 50}
                                      fontSize="14"
                                      fill="#15803d"
                                      fontWeight="bold"
                                      className="dark:fill-green-400"
                                    >
                                      .next
                                    </motion.text>
                                  </svg>

                                  {/* pNew Node Box */}
                                  <div className="relative z-10">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-green-600 dark:text-green-400">
                                      {pendingConnectionToStartNext.pendingVariable}
                                    </div>
                                    <div className="inline-flex animate-pulse rounded-lg border-4 border-green-600 bg-green-50 shadow-xl shadow-green-200 dark:border-green-400 dark:bg-green-900/40 dark:shadow-none">
                                      <div className="flex min-w-[60px] items-center justify-center border-r-4 border-green-600 px-4 py-2 dark:border-green-400">
                                        <span className="text-sm font-bold text-green-700 dark:text-green-300">
                                          {pendingConnectionToStartNext.fromValue}
                                        </span>
                                      </div>
                                      <div className="flex min-w-[50px] items-center justify-center px-4 py-2"></div>
                                    </div>
                                    <div
                                      className="flex text-sm text-green-600 dark:text-green-400"
                                      style={{ width: '100%' }}
                                    >
                                      <div className="w-1/2 text-center">
                                        {data.classMetadata?.data_attr || 'Name'}
                                      </div>
                                      <div className="w-1/2 text-center">
                                        {data.classMetadata?.next_attr || 'Next'}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })()}
                          </div>
                        ) : (
                          renderNode(value, index)
                        )}

                        {/* Arrow between nodes */}
                        {index < nodesToRender.length - 1 && !isExiting && (
                          <div
                            className={`mx-2 flex flex-shrink-0 items-center ${showMemoryAddress ? 'mb-10' : 'mb-5'}`}
                            ref={(el) => {
                              if (el) {
                                arrowRefs.current.set(index, el);
                              } else {
                                arrowRefs.current.delete(index);
                              }
                            }}
                          >
                            <div className="h-1 w-8 bg-gray-900 dark:bg-gray-300"></div>
                            <div className="h-0 w-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-300"></div>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}

                  {/* Floating Nodes - Displayed inline without arrows, same spacing as connected nodes */}
                  {pendingNodes.filter(
                    (pn) =>
                      pendingConnectionToHead?.fromValue !== pn.value &&
                      pendingConnectionToStartNext?.fromValue !== pn.value,
                  ).length > 0 && (
                    <>
                      {/* Same spacing as arrow between nodes */}
                      {nodesToRender.length > 0 && (
                        <div className="mx-2 mb-5 flex w-[50px] flex-shrink-0 items-center"></div>
                      )}
                      {pendingNodes
                        .filter(
                          (pn) =>
                            pendingConnectionToHead?.fromValue !== pn.value &&
                            pendingConnectionToStartNext?.fromValue !== pn.value,
                        )
                        .map((pendingNode, index, filteredArray) => (
                          <div
                            key={`floating-${pendingNode.variable}-${index}`}
                            className="flex items-center"
                          >
                            <div className="relative">
                              {/* Node Box - Orange accent (not yet connected) */}
                              <div className="inline-flex animate-pulse rounded-lg border-4 border-orange-500 bg-orange-100 shadow-lg dark:border-orange-400 dark:bg-orange-900/30">
                                {/* Data Section - Left */}
                                <div className="flex min-w-[60px] items-center justify-center border-r-4 border-orange-500 px-4 py-2 dark:border-orange-400">
                                  <span className="font-bold text-orange-700 dark:text-orange-300">
                                    {pendingNode.value}
                                  </span>
                                </div>
                                {/* Pointer Section - Right - X mark for null (not connected) */}
                                <div className="flex min-w-[50px] items-center justify-center px-4 py-2">
                                  <div className="relative h-6 w-6">
                                    <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform bg-orange-500 dark:bg-orange-400"></div>
                                    <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform bg-orange-500 dark:bg-orange-400"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Labels below node */}
                              <div
                                className="flex text-sm text-orange-600 dark:text-orange-400"
                                style={{ width: '100%' }}
                              >
                                <div className="w-1/2 text-center">
                                  {data.classMetadata?.data_attr || 'Name'}
                                </div>
                                <div className="w-1/2 text-center">
                                  {data.classMetadata?.next_attr || 'Next'}
                                </div>
                              </div>
                            </div>

                            {/* Same spacing as arrow between nodes (only if not last) */}
                            {index < filteredArray.length - 1 && (
                              <div className="mx-2 mb-5 flex w-[50px] flex-shrink-0 items-center"></div>
                            )}
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            </ZoomableContainer>
          )}
        </div>
      </div>
      {/* Stats */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-semibold">จำนวน Nodes:</span> {nodes.length}
          </div>
          <div>
            <span className="font-semibold">Head Value:</span>{' '}
            {nodes.length > 0 ? nodes[0] : 'None'}
          </div>
          <div>
            <span className="font-semibold">Tail Value:</span>{' '}
            {nodes.length > 0 ? nodes[nodes.length - 1] : 'None'}
          </div>
        </div>

        {/* Color Legend */}
        <section className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Node ปกติ</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-orange-500 bg-orange-100 dark:border-orange-400 dark:bg-orange-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">สร้างใหม่</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-purple-500 bg-purple-100 dark:border-purple-400 dark:bg-purple-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">pointer</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-amber-500 bg-amber-100 dark:border-amber-400 dark:bg-amber-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">กำลังจะลบ</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">ถูกลบ</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-green-500 bg-green-100 dark:border-green-400 dark:bg-green-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">.next → head</span>
          </div>
        </section>
      </div>

      {/* Console Output */}
      <ConsoleOutput steps={steps} currentStepIndex={currentStepIndex} />

      {/* Big O Analysis */}
      <PerformanceAnalysisPanel
        steps={steps}
        currentStepIndex={currentStepIndex}
        complexity={complexity}
        code={code}
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

      {/* Pitfall Popup */}
      <PitfallPopup isOpen={isPitfallPopupOpen} onClose={() => setIsPitfallPopupOpen(false)} />
    </div>
  );
});

SinglyLinkedListStepthroughVisualization.displayName = 'SinglyLinkedListStepthroughVisualization';

export default SinglyLinkedListStepthroughVisualization;
