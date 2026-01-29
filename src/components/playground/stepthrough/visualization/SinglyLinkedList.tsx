import React, { forwardRef, useState, useEffect, Fragment, useRef } from 'react';
import { gsap } from 'gsap';

import { StepthroughVisualizationProps, LinkedListData, StepNodeState, ViewMode } from '@/types';
import { generateMemoryAddress } from '@/lib';

import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';
import StepIndicator from '@/components/playground/shared/action/StepIndicator';
import ConsoleOutput from '@/components/playground/stepthrough/ConsoleOutput';
import PerformanceAnalysisPanel from '@/components/playground/shared/PerformancePanel/PerformanceAnalysisPanel';
import MemoryAddress from '@/components/playground/shared/common/MemoryAddress';
import VariableStatePanel from '@/components/playground/stepthrough/VariableStatePanel';
import CommonPitfallsWarning from '@/components/playground/stepthrough/CommonPitfallsWarning';
import PitfallPopup from '@/components/playground/stepthrough/PitfallPopup';
import ConceptualAnalogyPanel from '@/components/playground/shared/analogy/ConceptualAnalogyPanel';
import VisualizationViewControls from '@/components/playground/shared/common/VisualizationViewControls';

const SinglyLinkedListStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<LinkedListData>
>(({ steps, currentStepIndex, data, isRunning, error, complexity }, ref) => {
  const [highlightedNodeIndex, setHighlightedNodeIndex] = useState(-1);
  const [, setHeadPosition] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('technical');
  const [isTraversing, setIsTraversing] = useState(false);
  const [traverseIndex, setTraverseIndex] = useState(-1);
  const [visitedTraverseNodes, setVisitedTraverseNodes] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [enteringNodes, setEnteringNodes] = useState<Set<number>>(new Set());
  const [exitingNodes, setExitingNodes] = useState<Set<string>>(new Set());
  const [nodesToRender, setNodesToRender] = useState<string[]>(data.nodes);
  const [isInstantiated, setIsInstantiated] = useState(false);
  const [pendingNodes, setPendingNodes] = useState<Array<{ variable: string; value: string }>>([]);
  const [pendingDeleteNode, setPendingDeleteNode] = useState<string | null>(null);
  const [showMemoryAddress, setShowMemoryAddress] = useState(false);
  const [pointerAnimationIndex, setPointerAnimationIndex] = useState(-1);
  const [isPointerAnimating, setIsPointerAnimating] = useState(false);
  const [currentInsertedValue, setCurrentInsertedValue] = useState<string | null>(null);
  const [nodes, setNodes] = useState(data.nodes);

  const currentInsertedValueRef = useRef<string | null>(null);
  const insertHistoryRef = useRef<string[]>([]);
  const nodesRef = useRef(data.nodes);
  const previousNodesRef = useRef<string[]>(data.nodes);
  const stepStateCache = useRef<Map<number, StepNodeState>>(new Map());
  const previousStepIndexRef = useRef<number>(currentStepIndex);
  const isInitializedRef = useRef<boolean>(false);
  const pendingNodesRef = useRef<Array<{ variable: string; value: string }>>([]);
  const isInTraverseSequenceRef = useRef<boolean>(false);
  // Refs for GSAP animations
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
      // Restore traverse state from cache
      if (cachedState.visitedTraverseNodes) {
        setVisitedTraverseNodes(new Set(cachedState.visitedTraverseNodes));
      }
      if (cachedState.isInTraverseSequence !== undefined) {
        setIsTraversing(cachedState.isInTraverseSequence);
      }
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

      // Cache the current state for this step (pendingNodes will be updated by the separate useEffect)
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

  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const stepDetail = currentStep.state?.step_detail as
        | {
            operation?: string;
            is_traverse_step?: boolean;
            traverse_node?: string;
            current_node?: string;
          }
        | undefined;

      // Check if this is a traverse step
      const isTraverseStep =
        stepDetail?.is_traverse_step === true || stepDetail?.operation === 'traverse';

      // Check previous step to detect the START of a new traverse sequence
      const previousStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
      const previousStepDetail = previousStep?.state?.step_detail as
        | { is_traverse_step?: boolean; operation?: string }
        | undefined;
      const wasTraversing =
        previousStepDetail?.is_traverse_step === true ||
        previousStepDetail?.operation === 'traverse';

      // Detect start of a NEW traverse sequence (wasn't traversing before, now we are)
      const isNewTraverseSequence =
        isTraverseStep && !wasTraversing && !isInTraverseSequenceRef.current;

      if (isTraverseStep) {
        // If this is a new traverse sequence, reset visited nodes
        if (isNewTraverseSequence) {
          setVisitedTraverseNodes(new Set());
          isInTraverseSequenceRef.current = true;
        }

        setIsTraversing(true);

        const traverseNodeValue = stepDetail?.traverse_node || stepDetail?.current_node;

        if (traverseNodeValue) {
          const nodeIndex = nodesToRender.findIndex((node) => node === traverseNodeValue);
          if (nodeIndex !== -1) {
            setTraverseIndex(nodeIndex);
            setVisitedTraverseNodes((prev) => {
              const newSet = new Set(prev);
              newSet.add(nodeIndex);
              const cachedState = stepStateCache.current.get(currentStepIndex);
              if (cachedState) {
                cachedState.visitedTraverseNodes = Array.from(newSet);
                cachedState.isInTraverseSequence = true;
              }
              return newSet;
            });
          } else {
            setTraverseIndex(-1);
          }
        } else {
          setTraverseIndex(-1);
        }
      } else {
        setIsTraversing(false);
        setTraverseIndex(-1);
        isInTraverseSequenceRef.current = false;
      }
    } else {
      setIsTraversing(false);
      setTraverseIndex(-1);
      setVisitedTraverseNodes(new Set());
      isInTraverseSequenceRef.current = false;
    }
  }, [steps, currentStepIndex, nodesToRender]);

  // Detects pointer movement patterns like `current = current.next` or `start = start.next`
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const code = currentStep.code || '';
      const stepDetail = currentStep.state?.step_detail as
        | {
            operation?: string;
            is_traverse_step?: boolean;
            traverse_node?: string;
            current_node?: string;
          }
        | undefined;

      // Check if this is a pointer movement operation
      const isPointerMove =
        code.includes('current = current.next') ||
        code.includes('current=current.next') ||
        code.includes('start = start.next') ||
        code.includes('start=start.next');

      if (isPointerMove && stepDetail?.is_traverse_step) {
        // Use traverse_node from step_detail for accurate positioning
        const traverseNodeValue = stepDetail?.traverse_node || stepDetail?.current_node;

        if (traverseNodeValue) {
          const newIndex = nodesToRender.findIndex((node) => node === traverseNodeValue);

          if (newIndex !== -1 && newIndex !== pointerAnimationIndex) {
            setPointerAnimationIndex(newIndex);
            setIsPointerAnimating(true);

            // Stop animation after duration
            setTimeout(() => {
              setIsPointerAnimating(false);
            }, 600);
          }
        }
      }
    }
  }, [steps, currentStepIndex, nodesToRender, pointerAnimationIndex]);

  // Reset pointer animation when steps reset
  useEffect(() => {
    if (steps.length === 0 || currentStepIndex === 0) {
      setPointerAnimationIndex(-1);
      setIsPointerAnimating(false);
    }
  }, [steps.length, currentStepIndex]);

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

  // Determine which node should be highlighted based on currentInsertedValue
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
          setHighlightedNodeIndex(-1);
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
    const isNewlyCreated = enteringNodes.has(index); // Green - just created
    const isBeingDeleted = exitingNodes.has(value); // Red - fade out
    const isPendingDelete = pendingDeleteNode === value; // Yellow - about to be deleted

    // Current node is the one where latest operation occurred (not traverse)
    // Only show blue highlight when NOT in traverse mode AND no visited nodes
    const isCurrentNode =
      highlightedNodeIndex === index &&
      !isTraversing &&
      visitedTraverseNodes.size === 0 &&
      !isNewlyCreated &&
      !isPendingDelete;
    // For traverse: check if this node has been visited (cumulative green)
    // Show green for ALL visited nodes, regardless of current step being traverse or not
    const isTraverseVisited = visitedTraverseNodes.has(index);
    // Current traverse position (for the pointer indicator) - only show when actively traversing
    const isCurrentTraverseNode = isTraversing && index === traverseIndex;
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
            {/* Current Pointer - Static indicator for highlighted node */}
            {isCurrentNode && !isPointerAnimating && (
              <div className="absolute -bottom-14 left-1/2 z-10 -translate-x-1/2 transform">
                <div className="flex flex-col items-center">
                  <div className="h-0 w-0 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-blue-500 border-l-transparent"></div>
                  <div className="h-4 w-1 bg-blue-500"></div>
                </div>
                <div className="px-1 py-0.5 text-sm font-semibold whitespace-nowrap text-blue-600">
                  เพิ่มล่าสุด
                </div>
              </div>
            )}

            {/* Animated Pointer - Shows during traverse animation on CURRENT traverse node */}
            {((isPointerAnimating && index === pointerAnimationIndex) || isCurrentTraverseNode) && (
              <div
                className="absolute -bottom-20 left-1/2 z-20 -translate-x-1/2 transform"
                style={{ animation: 'bounceIn 0.6s ease-out forwards' }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-0 w-0 border-r-[6px] border-b-[8px] border-l-[6px] border-r-transparent border-b-green-500 border-l-transparent"></div>
                  <div className="h-6 w-1 bg-green-500"></div>
                </div>
                <div className="px-1 py-0.5 text-sm font-bold whitespace-nowrap text-green-600">
                  traverse
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
                    : // Green - Newly created
                      isNewlyCreated
                      ? 'scale-105 border-green-500 bg-green-100 shadow-lg dark:border-green-400 dark:bg-green-900/30'
                      : // Blue - Current pointer
                        isCurrentNode
                        ? 'border-blue-500 bg-blue-100 shadow-lg dark:border-blue-400 dark:bg-blue-900/30'
                        : // Green - Traverse step
                          isCurrentTraverseNode
                          ? 'scale-110 border-green-500 bg-green-100 shadow-lg dark:border-green-400 dark:bg-green-900/30'
                          : isTraverseVisited
                            ? 'border-green-500 bg-green-100 shadow-lg dark:border-green-400 dark:bg-green-900/30'
                            : // Default
                              isTransitioning
                              ? 'animate-pulse border-gray-900 bg-blue-100 dark:border-gray-300 dark:bg-blue-900/30'
                              : 'border-gray-900 bg-white dark:border-gray-300 dark:bg-gray-700'
              }`}
            >
              {/* Data Section - Left */}
              <div
                className={`flex min-w-[60px] items-center justify-center border-r-4 px-4 py-2 ${
                  isCurrentNode
                    ? 'border-blue-500 dark:border-blue-400'
                    : isTraverseVisited || isCurrentTraverseNode
                      ? 'border-green-500 dark:border-green-400'
                      : 'border-gray-900 dark:border-gray-300'
                }`}
              >
                <span
                  className={`font-bold ${
                    isCurrentNode
                      ? 'text-blue-700 dark:text-blue-300'
                      : isTraverseVisited || isCurrentTraverseNode
                        ? 'text-green-700 dark:text-green-300'
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
                        isCurrentNode
                          ? 'bg-blue-500 dark:bg-blue-400'
                          : isTraverseVisited || isCurrentTraverseNode
                            ? 'bg-green-500 dark:bg-green-400'
                            : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 -rotate-45 transform ${
                        isCurrentNode
                          ? 'bg-blue-500 dark:bg-blue-400'
                          : isTraverseVisited || isCurrentTraverseNode
                            ? 'bg-green-500 dark:bg-green-400'
                            : 'bg-gray-900 dark:bg-gray-300'
                      }`}
                    ></div>
                  </div>
                ) : (
                  /* Dot for pointer - same as root head section */
                  <div
                    className={` ${isCurrentNode ? 'bg-blue-500 dark:bg-blue-400' : isTraverseVisited || isCurrentTraverseNode ? 'bg-green-500 dark:bg-green-400' : ''}`}
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
    <div ref={ref} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Singly Linked List Visualization
        </h2>
        <div className="flex items-center gap-3">
          {/* Variable Panel Toggle */}
          <button
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
            Variables
          </button>
          {/* View Controls (Mode Switcher + Memory Address Toggle) */}
          <div className="mx-2">
            <VisualizationViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showMemoryAddress={showMemoryAddress}
              onToggleMemoryAddress={setShowMemoryAddress}
            />
          </div>
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Running...</span>
            </div>
          )}
          {/* Common Errors Button */}
          <button
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
            Common Errors
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
        <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Step {steps[currentStepIndex].stepNumber}: {steps[currentStepIndex].state.message}
          </div>
        </div>
      )}

      {/* Main Content - Flex layout with Variable Panel */}
      <div className="flex gap-4">
        {/* Left Side - Variable State Panel */}
        {showVariablePanel && (
          <div className="flex-shrink-0">
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
              <div className="p-6">
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
                {isInstantiated && nodesToRender.length > 0 && (
                  <div className="mb-2 ml-[85px] flex">
                    {/* Vertical line going down */}
                    <div id="root-to-first-arrow" className="flex flex-col items-center">
                      <div className="h-8 w-0.5 bg-gray-900 dark:bg-gray-300"></div>
                      {/* Arrow pointing down */}
                      <div className="h-0 w-0 border-t-[6px] border-r-[5px] border-l-[5px] border-t-gray-900 border-r-transparent border-l-transparent dark:border-t-gray-300"></div>
                    </div>
                  </div>
                )}

                {/* Data Nodes Row - Horizontal */}
                <div
                  className={`flex flex-row flex-nowrap items-center ${nodesToRender.length === 0 && pendingNodes.length > 0 ? 'mt-8' : ''}`}
                >
                  {nodesToRender.map((value, index) => {
                    const isExiting = exitingNodes.has(value);
                    return (
                      <Fragment key={`${value}-${index}`}>
                        {/* Node - pointer indicators are now inside renderNode */}
                        {renderNode(value, index)}

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
                  {pendingNodes.length > 0 && (
                    <>
                      {/* Same spacing as arrow between nodes */}
                      {nodesToRender.length > 0 && (
                        <div className="mx-2 mb-5 flex w-[50px] flex-shrink-0 items-center"></div>
                      )}
                      {pendingNodes.map((pendingNode, index) => (
                        <div
                          key={`floating-${pendingNode.variable}-${index}`}
                          className="flex items-center"
                        >
                          <div className="relative">
                            {/* Node Box - Same style as normal nodes but with orange accent */}
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
                          {/* Same spacing as arrow between nodes */}
                          {index < pendingNodes.length - 1 && (
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
            <div className="mr-1.5 h-3 w-3 rounded border border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">ปัจจุบัน</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 h-3 w-3 rounded border border-green-500 bg-green-100 dark:border-green-400 dark:bg-green-900/30"></div>
            <span className="text-gray-600 dark:text-gray-400">Traverse</span>
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
