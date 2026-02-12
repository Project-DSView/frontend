import { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { StepthroughVisualizationProps, LinkedListData, StepNodeState, ViewMode } from '@/types';

import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';
import StepIndicator from '@/components/playground/shared/action/StepIndicator';
import ConsoleOutput from '@/components/playground/stepthrough/ConsoleOutput';
import PerformanceAnalysisPanel from '@/components/playground/shared/PerformancePanel/PerformanceAnalysisPanel';
import MemoryAddress from '@/components/playground/shared/common/MemoryAddress';
import { generateMemoryAddress } from '@/lib/utils/memory';
import VisualizationViewControls from '@/components/playground/shared/common/VisualizationViewControls';
import VariableStatePanel from '@/components/playground/stepthrough/VariableStatePanel';
import CommonPitfallsWarning from '@/components/playground/stepthrough/CommonPitfallsWarning';
import PitfallPopup from '@/components/playground/stepthrough/PitfallPopup';
import StepInfoPanel from '@/components/playground/stepthrough/StepInfoPanel';
import { gsap } from 'gsap';
import ConceptualAnalogyPanel from '@/components/playground/shared/analogy/ConceptualAnalogyPanel';

const DoublyLinkedListStepthroughVisualization = forwardRef<
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
  const [showVariablePanel, setShowVariablePanel] = useState(true);
  const [isPitfallPopupOpen, setIsPitfallPopupOpen] = useState(false);

  const currentInsertedValueRef = useRef<string | null>(null);
  const insertHistoryRef = useRef<string[]>([]);
  const nodesRef = useRef(data.nodes);
  const previousNodesRef = useRef<string[]>(data.nodes);
  const stepStateCache = useRef<Map<number, StepNodeState>>(new Map());
  const previousStepIndexRef = useRef<number>(currentStepIndex);
  const isInitializedRef = useRef<boolean>(false);
  const pendingNodesRef = useRef<Array<{ variable: string; value: string }>>([]);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const _arrowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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

  // Operation pointer tracking from backend step_detail
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;

      if (stepDetail) {
        const pointerPos = stepDetail.pointer_position as number | undefined;
        const pointerVar = stepDetail.pointer_variable_name as string | undefined;

        if (pointerPos !== undefined && pointerPos >= 0) {
          setOperationPointerIndex(pointerPos);
          setOperationPointerLabel(pointerVar || 'current');
        } else {
          setOperationPointerIndex(-1);
          setOperationPointerLabel('');
        }
      } else {
        setOperationPointerIndex(-1);
        setOperationPointerLabel('');
      }
    } else {
      setOperationPointerIndex(-1);
      setOperationPointerLabel('');
    }
  }, [steps, currentStepIndex]);

  // Pending connection to head (pNew.next = self.head)
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;

      if (stepDetail?.next_points_to_head) {
        const pendingVal = (stepDetail.pending_node_value as string) || 'new';
        const targetVal =
          (stepDetail.target_head_value as string) || (nodes.length > 0 ? nodes[0] : '');
        const pendingVar = (stepDetail.pending_node_variable as string) || 'pNew';
        setPendingConnectionToHead({
          fromValue: pendingVal,
          toValue: targetVal,
          pendingVariable: pendingVar,
        });
      } else {
        setPendingConnectionToHead(null);
      }

      if (stepDetail?.next_points_to_start_next) {
        const pendingVal = (stepDetail.pending_node_value as string) || 'new';
        const targetVal = (stepDetail.target_next_value as string) || '';
        const pendingVar = (stepDetail.pending_node_variable as string) || 'pNew';
        const startPos = (stepDetail.start_node_position as number) ?? 0;
        const targetPos = (stepDetail.target_next_position as number) ?? startPos + 1;
        setPendingConnectionToStartNext({
          fromValue: pendingVal,
          toValue: targetVal,
          pendingVariable: pendingVar,
          startNodePosition: startPos,
          targetPosition: targetPos,
        });
      } else {
        setPendingConnectionToStartNext(null);
      }
    } else {
      setPendingConnectionToHead(null);
      setPendingConnectionToStartNext(null);
    }
  }, [steps, currentStepIndex, nodes]);

  // Pending node tracking (node_creation steps)
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;

      if (stepDetail?.operation === 'node_creation') {
        const nodeVal = (stepDetail.node_value as string) || 'new';
        const nodeVar = (stepDetail.node_variable as string) || 'pNew';
        const newPending = [{ variable: nodeVar, value: nodeVal }];
        setPendingNodes(newPending);
        pendingNodesRef.current = newPending;
      } else if (
        stepDetail?.operation === 'chained_pointer_assignment' ||
        stepDetail?.operation === 'pointer_assignment'
      ) {
        // Keep pending nodes visible during connection steps
      } else {
        setPendingNodes([]);
        pendingNodesRef.current = [];
      }
    } else {
      setPendingNodes([]);
      pendingNodesRef.current = [];
    }
  }, [steps, currentStepIndex]);

  // Pending delete detection
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;
      const operation = stepDetail?.operation as string | undefined;
      const message = currentStep.state?.message || '';

      if (
        operation === 'delete' ||
        message.toLowerCase().includes('delete') ||
        message.toLowerCase().includes('ลบ')
      ) {
        // Look ahead to find which node will be removed
        if (currentStepIndex + 1 < steps.length) {
          const nextStep = steps[currentStepIndex + 1];
          const nextInstances = nextStep.state?.instances as
            | Record<string, { nodes?: string[] }>
            | undefined;
          if (nextInstances) {
            const nextLinkedList = Object.values(nextInstances).find((inst) =>
              Array.isArray((inst as Record<string, unknown>)?.nodes),
            ) as { nodes?: string[] } | undefined;
            if (nextLinkedList?.nodes) {
              const currentNodes = nodes;
              const removedNode = currentNodes.find((n) => !nextLinkedList.nodes!.includes(n));
              if (removedNode) {
                setPendingDeleteNode(removedNode);
                return;
              }
            }
          }
        }
      }
      setPendingDeleteNode(null);
    } else {
      setPendingDeleteNode(null);
    }
  }, [steps, currentStepIndex, nodes]);

  // Instantiation tracking
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      for (let i = 0; i <= currentStepIndex; i++) {
        const step = steps[i];
        const stepDetail = step.state?.step_detail as Record<string, unknown> | undefined;
        if (stepDetail?.operation === 'instantiate' || step.state?.instances) {
          setIsInstantiated(true);
          return;
        }
      }
      setIsInstantiated(false);
    }
  }, [steps, currentStepIndex]);

  // Reset all states when steps are cleared
  useEffect(() => {
    if (steps.length === 0) {
      setOperationPointerIndex(-1);
      setOperationPointerLabel('');
      setPendingConnectionToHead(null);
      setPendingConnectionToStartNext(null);
      setPendingNodes([]);
      setPendingDeleteNode(null);
      setIsInstantiated(false);
      pendingNodesRef.current = [];
    }
  }, [steps.length]);

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

  // Render a single node with enhanced color coding
  const renderNode = (value: string, index: number) => {
    // Check node states for color coding
    const isNewlyCreated = enteringNodes.has(index);
    const isBeingDeleted = exitingNodes.has(value);
    const isPendingDelete = pendingDeleteNode === value;
    const isOperationPointer = operationPointerIndex === index;
    const isFirst = index === 0;
    const isLast = index === nodesToRender.length - 1;
    const isExiting = exitingNodes.has(value);

    const nodeKey = `${value}-${index}`;

    // Determine border/bg color
    const getNodeClasses = () => {
      if (isBeingDeleted)
        return 'scale-90 border-red-500 bg-red-100 opacity-50 shadow-lg dark:border-red-400 dark:bg-red-900/30';
      if (isPendingDelete)
        return 'animate-pulse border-amber-500 bg-amber-100 shadow-lg dark:border-amber-400 dark:bg-amber-900/30';
      if (isNewlyCreated)
        return 'scale-105 border-orange-500 bg-orange-100 shadow-lg dark:border-orange-400 dark:bg-orange-900/30';
      if (isOperationPointer)
        return 'border-purple-500 bg-purple-100 shadow-lg dark:border-purple-400 dark:bg-purple-900/30';
      if (isExiting) return 'opacity-0';
      if (isTransitioning)
        return 'animate-pulse border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/30';
      return 'border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700';
    };

    const getAccentColor = () => {
      if (isBeingDeleted) return 'border-red-500 dark:border-red-400';
      if (isPendingDelete) return 'border-amber-500 dark:border-amber-400';
      if (isNewlyCreated) return 'border-orange-500 dark:border-orange-400';
      if (isOperationPointer) return 'border-purple-500 dark:border-purple-400';
      return 'border-gray-900 dark:border-gray-300';
    };

    const getTextColor = () => {
      if (isBeingDeleted) return 'text-red-700 dark:text-red-300';
      if (isPendingDelete) return 'text-amber-700 dark:text-amber-300';
      if (isNewlyCreated) return 'text-orange-700 dark:text-orange-300';
      if (isOperationPointer) return 'text-purple-700 dark:text-purple-300';
      return 'text-gray-900 dark:text-gray-100';
    };

    const getXColor = () => {
      if (isOperationPointer) return 'bg-purple-500 dark:bg-purple-400';
      if (isNewlyCreated) return 'bg-orange-500 dark:bg-orange-400';
      return 'bg-gray-900 dark:bg-gray-300';
    };

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
            {/* Operation Pointer - Backend-driven indicator */}
            {isOperationPointer && (
              <div className="absolute -bottom-14 left-1/2 z-10 -translate-x-1/2 transform">
                <div className="flex flex-col items-center">
                  <div className="h-0 w-0 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-purple-500 border-l-transparent"></div>
                  <div className="h-4 w-1 bg-purple-500"></div>
                </div>
                <div className="px-2 py-1 text-lg font-semibold text-purple-600">
                  {operationPointerLabel || 'current'}
                </div>
              </div>
            )}

            {/* Node Box */}
            <div
              className={`inline-flex rounded-lg border-4 transition-all duration-300 ${getNodeClasses()}`}
            >
              {/* Prev Section - Left */}
              <div
                className={`flex min-w-[40px] items-center justify-center px-2 py-2 ${getAccentColor()}`}
              >
                {isFirst ? (
                  <div className="relative h-5 w-5">
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform ${getXColor()}`}
                    ></div>
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform ${getXColor()}`}
                    ></div>
                  </div>
                ) : (
                  <div className="h-2 w-2"></div>
                )}
              </div>

              {/* Data Section - Center */}
              <div
                className={`flex min-w-[60px] items-center justify-center border-x-4 px-4 py-2 ${getAccentColor()} ${
                  isOperationPointer
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : isNewlyCreated
                      ? 'bg-orange-100 dark:bg-orange-900/30'
                      : 'bg-white dark:bg-gray-700'
                }`}
              >
                <span
                  className={`font-bold ${getTextColor()} ${value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-lg'}`}
                >
                  {value}
                </span>
              </div>

              {/* Next Section - Right */}
              <div
                className={`flex min-w-[40px] items-center justify-center px-2 py-2 ${getAccentColor()}`}
              >
                {isLast ? (
                  <div className="relative h-5 w-5">
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform ${getXColor()}`}
                    ></div>
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform ${getXColor()}`}
                    ></div>
                  </div>
                ) : (
                  <div className="h-2 w-2"></div>
                )}
              </div>
            </div>
          </div>

          {/* Labels below node */}
          <div className="flex text-sm text-gray-600 dark:text-gray-400" style={{ width: '100%' }}>
            <div className={`w-1/3 text-center ${isFirst ? 'invisible' : ''}`}>
              {data.classMetadata?.prev_attr || 'prev'}
            </div>
            <div className="w-1/3 text-center">{data.classMetadata?.data_attr || 'data'}</div>
            <div className={`w-1/3 text-center ${isLast ? 'invisible' : ''}`}>
              {data.classMetadata?.next_attr || 'next'}
            </div>
          </div>

          {/* Memory Address */}
          <MemoryAddress address={generateMemoryAddress(index)} isVisible={showMemoryAddress} />
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="rounded-lg bg-white p-3 shadow sm:p-6 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100">
          Doubly Linked List Visualization
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

          {/* View Controls */}
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
              type="doubly-linked-list"
              data={{ nodes: nodesToRender }}
              className="min-h-[280px]"
              isVisible={nodesToRender.length > 0}
            />
          ) : (
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
                {!isInstantiated && steps.length === 0 && (
                  <div className="flex min-h-[200px] items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <svg
                        className="mx-auto mb-2 h-12 w-12 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">Run Code เพื่อดู Visualization</p>
                    </div>
                  </div>
                )}

                {/* Root Node Section - only show after instantiation */}
                {(isInstantiated || steps.length > 0) && (
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
                )}

                {/* Connector from Root to First Node */}
                {(isInstantiated || steps.length > 0) && nodesToRender.length > 0 && (
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
                {(isInstantiated || steps.length > 0) && (
                  <div className="flex flex-row flex-nowrap items-center">
                    {nodesToRender.map((value, index) => {
                      const isExiting = exitingNodes.has(value);
                      return (
                        <Fragment key={`${value}-${index}`}>
                          {/* Node - pointer indicators are now inside renderNode */}
                          {renderNode(value, index)}

                          {/* Bidirectional Arrow between nodes */}
                          {index < nodesToRender.length - 1 &&
                            !isExiting &&
                            !exitingNodes.has(nodesToRender[index + 1]) && (
                              <div
                                className={`mx-2 flex flex-shrink-0 items-center ${showMemoryAddress ? 'mb-10' : 'mb-5'}`}
                              >
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
                )}

                {/* Pending / Floating Nodes - shown during node creation */}
                {pendingNodes.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {pendingNodes.map((pNode, i) => (
                      <div key={`pending-${i}`} className="flex flex-col items-center">
                        <div className="mb-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {pNode.variable}
                        </div>
                        <div
                          className="inline-flex rounded-lg border-4 border-dashed border-orange-500 bg-orange-50 shadow-md transition-all dark:border-orange-400 dark:bg-orange-900/20"
                          style={{ animation: 'pulse 2s infinite' }}
                        >
                          <div className="flex min-w-[40px] items-center justify-center border-r-2 border-dashed border-orange-400 px-2 py-2 dark:border-orange-500">
                            <div className="relative h-5 w-5">
                              <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform bg-orange-500 dark:bg-orange-400"></div>
                              <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform bg-orange-500 dark:bg-orange-400"></div>
                            </div>
                          </div>
                          <div className="flex min-w-[60px] items-center justify-center border-r-2 border-dashed border-orange-400 px-4 py-2 dark:border-orange-500">
                            <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
                              {pNode.value}
                            </span>
                          </div>
                          <div className="flex min-w-[40px] items-center justify-center px-2 py-2">
                            {pendingConnectionToHead ? (
                              <div className="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400"></div>
                            ) : pendingConnectionToStartNext ? (
                              <div className="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400"></div>
                            ) : (
                              <div className="relative h-5 w-5">
                                <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 rotate-45 transform bg-orange-500 dark:bg-orange-400"></div>
                                <div className="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform bg-orange-500 dark:bg-orange-400"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="mt-1 flex text-xs text-orange-600 dark:text-orange-400"
                          style={{ width: '100%' }}
                        >
                          <div className="w-1/3 text-center">prev</div>
                          <div className="w-1/3 text-center">data</div>
                          <div className="w-1/3 text-center">next</div>
                        </div>
                        {/* Connection arrow to target */}
                        {pendingConnectionToHead && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <span>.next → head ({pendingConnectionToHead.toValue})</span>
                          </div>
                        )}
                        {pendingConnectionToStartNext && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <span>.next → ({pendingConnectionToStartNext.toValue})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
            <span className="text-gray-600 dark:text-gray-400">Pointer ปัจจุบัน</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-amber-500 bg-amber-100 dark:border-amber-400 dark:bg-amber-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">กำลังจะลบ</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">ถูกลบ</span>
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

DoublyLinkedListStepthroughVisualization.displayName = 'DoublyLinkedListStepthroughVisualization';

export default DoublyLinkedListStepthroughVisualization;
