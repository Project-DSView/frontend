import React, { forwardRef, useMemo, useState, useEffect, memo, useCallback, useRef } from 'react';
import { StepthroughVisualizationProps, BSTNode, PositionedNode, BSTData } from '@/types';
import ZoomableContainer from '@/components/playground/shared/action/ZoomableContainer';
import ConsoleOutput from '@/components/playground/stepthrough/ConsoleOutput';
import PerformanceAnalysisPanel from '@/components/playground/shared/PerformancePanel/PerformanceAnalysisPanel';
import MemoryAddress from '@/components/playground/shared/common/MemoryAddress';
import VisualizationViewControls from '@/components/playground/shared/common/VisualizationViewControls';
import { ViewMode } from '@/types';

import VariableStatePanel from '@/components/playground/stepthrough/VariableStatePanel';
import CommonPitfallsWarning from '@/components/playground/stepthrough/CommonPitfallsWarning';
import PitfallPopup from '@/components/playground/stepthrough/PitfallPopup';
import StepInfoPanel from '@/components/playground/stepthrough/StepInfoPanel';
import ConceptualAnalogyPanel from '@/components/playground/shared/analogy/ConceptualAnalogyPanel';
import { generateHashAddress, convertToBSTNode } from '@/lib';

const BSTStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<BSTData>
>(({ steps, currentStepIndex, data, isRunning, error, complexity, code }, ref) => {
  const [searchPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('technical');
  const [traverseIndex, setTraverseIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousNodes, setPreviousNodes] = useState<PositionedNode[]>([]);
  const [exitingNodes, setExitingNodes] = useState<Set<string>>(new Set());
  const [insertedNode, setInsertedNode] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [pathNodes, setPathNodes] = useState<Set<string>>(new Set());
  const [activeConnectionIndex, setActiveConnectionIndex] = useState<number | null>(null);
  const [connectionProgress, setConnectionProgress] = useState<number>(0);
  const [activeParentNode, setActiveParentNode] = useState<string | null>(null);
  const [animatedNodes, setAnimatedNodes] = useState<Set<string>>(new Set());
  const [completedConnections, setCompletedConnections] = useState<Set<string>>(new Set());
  const [showMemoryAddress, setShowMemoryAddress] = useState(false);
  const [showVariablePanel, setShowVariablePanel] = useState(true);
  const [isPitfallPopupOpen, setIsPitfallPopupOpen] = useState(false);

  const previousRootRef = useRef<BSTNode | null>(null);
  const rootPositionRef = useRef<{ x: number; y: number } | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const connectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Extract all BST instances from data or steps data
  const allTrees = useMemo(() => {
    const trees: {
      [treeName: string]: { root: BSTNode | null; size: number; isEmpty: boolean; height: number };
    } = {};

    // First try to get from data (from hook)
    if (data && 'allTrees' in data && data.allTrees) {
      Object.entries(data.allTrees).forEach(([treeName, treeData]) => {
        if (treeData && treeData.root) {
          trees[treeName] = {
            root: convertToBSTNode(treeData.root),
            size: treeData.size || 0,
            isEmpty: treeData.isEmpty || false,
            height: treeData.height || 0,
          };
        }
      });
      return trees;
    }

    // Fallback: extract from steps data
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const state = currentStep.state;

      // Look for BST instances in the state
      if (state.instances) {
        Object.entries(state.instances).forEach(([instanceName, instanceData]) => {
          if (instanceData && typeof instanceData === 'object' && 'root' in instanceData) {
            const instance = instanceData as Record<string, unknown>;
            if (instance.root) {
              trees[instanceName] = {
                root: convertToBSTNode(instance.root),
                size: (instance.size as number) || 0,
                isEmpty: (instance.isEmpty as boolean) || false,
                height: (instance.height as number) || 0,
              };
            }
          }
        });
      }

      // Try to extract from step detail
      if (state.step_detail) {
        const stepDetail = state.step_detail as Record<string, unknown>;

        if (stepDetail.after_tree) {
          trees['main'] = {
            root: convertToBSTNode(stepDetail.after_tree),
            size: 0,
            isEmpty: false,
            height: 0,
          };
        }
      }
    }

    return trees;
  }, [data, steps, currentStepIndex]);

  // Get the first tree as the main root for backward compatibility
  const root = useMemo(() => {
    const treeNames = Object.keys(allTrees);
    if (treeNames.length > 0) {
      return allTrees[treeNames[0]].root;
    }

    // If no trees in current step, try to get from previous steps
    if (steps.length > 0 && currentStepIndex < steps.length) {
      for (let i = currentStepIndex; i >= 0; i--) {
        const step = steps[i];
        if (step.state && step.state.instances) {
          const instanceEntries = Object.entries(step.state.instances);
          for (const [, instanceData] of instanceEntries) {
            if (instanceData && typeof instanceData === 'object' && 'root' in instanceData) {
              const instance = instanceData as Record<string, unknown>;
              if (instance.root) {
                return convertToBSTNode(instance.root);
              }
            }
          }
        }
      }
    }

    return null;
  }, [allTrees, steps, currentStepIndex]);

  // Generate traversal results for a tree
  const generateTraversalResults = useCallback((node: BSTNode | null) => {
    if (!node) return { preorder: [], inorder: [], postorder: [] };

    const preorder: string[] = [];
    const inorder: string[] = [];
    const postorder: string[] = [];

    const preorderTraverse = (n: BSTNode | null) => {
      if (n) {
        preorder.push(n.value);
        preorderTraverse(n.left);
        preorderTraverse(n.right);
      }
    };

    const inorderTraverse = (n: BSTNode | null) => {
      if (n) {
        inorderTraverse(n.left);
        inorder.push(n.value);
        inorderTraverse(n.right);
      }
    };

    const postorderTraverse = (n: BSTNode | null) => {
      if (n) {
        postorderTraverse(n.left);
        postorderTraverse(n.right);
        postorder.push(n.value);
      }
    };

    preorderTraverse(node);
    inorderTraverse(node);
    postorderTraverse(node);

    return { preorder, inorder, postorder };
  }, []);

  // Generate traversal order based on current step
  const generateTraversalOrder = useCallback((node: BSTNode | null, type: string): string[] => {
    if (!node) return [];

    const result: string[] = [];

    const inorder = (n: BSTNode | null) => {
      if (n) {
        inorder(n.left);
        result.push(n.value);
        inorder(n.right);
      }
    };

    const preorder = (n: BSTNode | null) => {
      if (n) {
        result.push(n.value);
        preorder(n.left);
        preorder(n.right);
      }
    };

    const postorder = (n: BSTNode | null) => {
      if (n) {
        postorder(n.left);
        postorder(n.right);
        result.push(n.value);
      }
    };

    switch (type) {
      case 'traverse_inorder':
        inorder(node);
        break;
      case 'traverse_preorder':
        preorder(node);
        break;
      case 'traverse_postorder':
        postorder(node);
        break;
      default:
        return [];
    }

    return result;
  }, []);

  // Handle animation based on current step (Traversal only)
  useEffect(() => {
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const message = currentStep.state?.message || '';

      // Check if this is a traverse operation
      if (message.includes('traverse') || message.includes('Traverse')) {
        const order = generateTraversalOrder(root, 'traverse_inorder'); // Default to inorder
        setTraversalOrder(order);
        setIsTraversing(true);
        setTraverseIndex(0);

        // Start animation from first node
        const interval = setInterval(() => {
          setTraverseIndex((prev) => {
            const nextIndex = prev + 1;
            if (nextIndex >= order.length) {
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
        // Not traversing, reset traversal state
        setIsTraversing(false);
      }
    } else {
      setIsTraversing(false);
    }
  }, [steps, currentStepIndex, root, generateTraversalOrder]);

  // Calculate tree layout for a specific tree
  const calculateTreeLayout = useCallback((treeRoot: BSTNode | null): PositionedNode[] => {
    if (!treeRoot) return [];

    const nodes: PositionedNode[] = [];
    const levelHeight = 140; // Vertical spacing between levels (increased from 100)
    const nodeWidth = 120; // Horizontal spacing between nodes (increased from 80)
    const minSpacing = 100; // Minimum spacing between nodes at same level

    // Calculate subtree width to ensure proper spacing
    const calculateSubtreeWidth = (node: BSTNode | null, level: number): number => {
      if (!node) return 0;

      const leftWidth = calculateSubtreeWidth(node.left, level + 1);
      const rightWidth = calculateSubtreeWidth(node.right, level + 1);

      // Base width for current node
      const nodeBaseWidth = nodeWidth;

      // Return total width needed for this subtree
      return Math.max(leftWidth + rightWidth, nodeBaseWidth) + minSpacing;
    };

    // Calculate positions using improved algorithm
    const calculatePositions = (
      node: BSTNode | null,
      level: number = 0,
      x: number = 0,
      y: number = 0,
    ): void => {
      if (!node) return;

      // For root node (level 0), use stored position if available, otherwise use center
      let finalX = x;
      let finalY = y + 50;

      if (level === 0) {
        if (rootPositionRef.current) {
          // Use stored root position to prevent movement
          finalX = rootPositionRef.current.x;
          finalY = rootPositionRef.current.y;
        } else {
          // First time: store root position at center
          finalX = 0;
          finalY = 50;
          rootPositionRef.current = { x: finalX, y: finalY };
        }
      }

      nodes.push({
        ...node,
        x: finalX,
        y: finalY,
        level: level,
      });

      // Calculate positions for children with better spacing
      const childY = (level === 0 ? finalY : y) + levelHeight;

      // Calculate spacing based on subtree widths
      const leftSubtreeWidth = calculateSubtreeWidth(node.left, level + 1);
      const rightSubtreeWidth = calculateSubtreeWidth(node.right, level + 1);

      // Use dynamic offset based on subtree widths
      const leftOffset =
        leftSubtreeWidth > 0
          ? Math.max(leftSubtreeWidth / 2 + minSpacing / 2, nodeWidth * 0.8)
          : nodeWidth * 0.8;
      const rightOffset =
        rightSubtreeWidth > 0
          ? Math.max(rightSubtreeWidth / 2 + minSpacing / 2, nodeWidth * 0.8)
          : nodeWidth * 0.8;

      if (node.left) {
        calculatePositions(node.left, level + 1, finalX - leftOffset, childY);
      }
      if (node.right) {
        calculatePositions(node.right, level + 1, finalX + rightOffset, childY);
      }
    };

    // Start from center (x = 0)
    calculatePositions(treeRoot, 0, 0, 0);
    return nodes;
  }, []);

  // Pre-calculate positioned nodes for the main tree (used by animations & variable panel)
  const positionedNodes = useMemo(() => calculateTreeLayout(root), [root, calculateTreeLayout]);

  // Extract all node values from a tree
  const extractNodeValues = useCallback((node: BSTNode | null): Set<string> => {
    const values = new Set<string>();
    const traverse = (n: BSTNode | null) => {
      if (n) {
        values.add(n.value);
        traverse(n.left);
        traverse(n.right);
      }
    };
    traverse(node);
    return values;
  }, []);

  // Find path from root to target node
  const findPathToNode = useCallback((treeRoot: BSTNode | null, targetValue: string): string[] => {
    if (!treeRoot) return [];

    const path: string[] = [];

    const traverse = (node: BSTNode | null, currentPath: string[]): boolean => {
      if (!node) return false;

      const newPath = [...currentPath, node.value];

      if (node.value === targetValue) {
        path.push(...newPath);
        return true;
      }

      if (traverse(node.left, newPath)) return true;
      if (traverse(node.right, newPath)) return true;

      return false;
    };

    traverse(treeRoot, []);
    return path;
  }, []);

  // Get path connections with order
  const getPathConnections = useCallback(
    (
      treeRoot: BSTNode | null,
      pathValues: string[],
      positionedNodes: PositionedNode[],
    ): Array<{
      parentValue: string;
      childValue: string;
      connectionKey: string;
      index: number;
      isLeft: boolean;
    }> => {
      if (!treeRoot || pathValues.length < 2) return [];

      const connections: Array<{
        parentValue: string;
        childValue: string;
        connectionKey: string;
        index: number;
        isLeft: boolean;
      }> = [];

      // Find node by value in tree
      const findNodeByValue = (node: BSTNode | null, value: string): BSTNode | null => {
        if (!node) return null;
        if (node.value === value) return node;
        const left = findNodeByValue(node.left, value);
        if (left) return left;
        return findNodeByValue(node.right, value);
      };

      // Build connections from path
      for (let i = 0; i < pathValues.length - 1; i++) {
        const parentValue = pathValues[i];
        const childValue = pathValues[i + 1];

        const parentNode = findNodeByValue(treeRoot, parentValue);
        if (!parentNode) continue;

        // Check if child is left or right
        const isLeft = parentNode.left?.value === childValue;
        const isRight = parentNode.right?.value === childValue;

        if (isLeft || isRight) {
          // Find positioned nodes to get IDs
          const parentPosNode = positionedNodes.find((n) => n.value === parentValue);
          const childPosNode = positionedNodes.find((n) => n.value === childValue);

          if (parentPosNode && childPosNode) {
            connections.push({
              parentValue,
              childValue,
              connectionKey: `${parentPosNode.id}-${childPosNode.id}`,
              index: i,
              isLeft: isLeft,
            });
          }
        }
      }

      return connections;
    },
    [],
  );

  // Detect entering and exiting nodes
  useEffect(() => {
    const previousValues = extractNodeValues(previousRootRef.current);
    const currentValues = extractNodeValues(root);

    // Find nodes that were deleted
    const newExitingNodes = new Set<string>();
    previousValues.forEach((value) => {
      if (!currentValues.has(value)) {
        newExitingNodes.add(value);
      }
    });

    // Find nodes that were inserted
    const newEnteringNodes = new Set<string>();
    currentValues.forEach((value) => {
      if (!previousValues.has(value)) {
        newEnteringNodes.add(value);
      }
    });

    // Only track the node that was just added/removed in current step
    let targetNode: string | null = null;
    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const message = currentStep.state?.message || '';

      // Try to extract the node value from the message
      const nodePatterns = [
        /(?:insert|inserting|เพิ่ม)\s+([^\s,()]+)/i,
        /(?:delete|deleting|removed|ลบ)\s+([^\s,()]+)/i,
        /(?:value|node)\s+([^\s,()]+)/i,
      ];

      for (const pattern of nodePatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          const extractedValue = match[1].trim();
          // Only use if this value is actually in the entering or exiting nodes
          if (newEnteringNodes.has(extractedValue) || newExitingNodes.has(extractedValue)) {
            targetNode = extractedValue;
            break;
          }
        }
      }
    }

    // Extract current node and inserted node from step_detail
    let insertedNodeValue: string | null = null;
    let currentNodeValue: string | null = null;

    if (steps.length > 0 && currentStepIndex < steps.length) {
      const currentStep = steps[currentStepIndex];
      const message = currentStep.state?.message || '';
      const stepDetail = currentStep.state?.step_detail as Record<string, unknown> | undefined;

      // Extract current_node from step_detail (for all operations)
      if (stepDetail?.current_node && typeof stepDetail.current_node === 'string') {
        currentNodeValue = String(stepDetail.current_node);
      }

      // Check if this is an insert operation
      if (
        message.includes('insert') ||
        message.includes('Insert') ||
        message.includes('เพิ่ม') ||
        stepDetail?.operation === 'insert'
      ) {
        // Primary: Use inserted_node from step_detail if available (most reliable)
        if (stepDetail?.inserted_node && typeof stepDetail.inserted_node === 'string') {
          const detailValue = String(stepDetail.inserted_node);
          if (newEnteringNodes.has(detailValue)) {
            insertedNodeValue = detailValue;
          }
        }

        // Fallback 1: Try to extract from message using patterns
        if (!insertedNodeValue) {
          const nodePatterns = [
            /(?:insert|inserting|เพิ่ม)\s+([^\s,()]+)/i,
            /(?:value|node)\s+([^\s,()]+)/i,
          ];

          for (const pattern of nodePatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              const extractedValue = match[1].trim();
              if (newEnteringNodes.has(extractedValue)) {
                insertedNodeValue = extractedValue;
                break;
              }
            }
          }
        }

        // Fallback 2: If no match found but there's a new entering node, use it
        if (!insertedNodeValue && newEnteringNodes.size > 0) {
          insertedNodeValue = Array.from(newEnteringNodes)[0];
        }
      }
    }

    // Only set state if we found a specific target node
    if (targetNode) {
      if (newExitingNodes.has(targetNode)) {
        setExitingNodes(new Set([targetNode]));
      } else {
        setExitingNodes(new Set());
      }
    } else {
      // No target node found - clear states
      setExitingNodes(new Set());
    }

    // Set current node from backend (for animation)
    if (currentNodeValue) {
      setCurrentNode(currentNodeValue);

      // Find path from root to current node
      const pathToCurrent = findPathToNode(root, currentNodeValue);
      setPathNodes(new Set(pathToCurrent));
    } else {
      // Clear current node when step changes (no current node in this step)
      setCurrentNode(null);
      setPathNodes(new Set());
    }

    // Set insert path and inserted node
    // Keep inserted node highlighted permanently (until new insert or node is deleted)
    if (insertedNodeValue) {
      // New insert - set the inserted node
      setInsertedNode(insertedNodeValue);
    } else {
      // No new insert in this step - only clear if node was deleted
      if (insertedNode && !currentValues.has(insertedNode)) {
        // Inserted node was deleted - clear it
        setInsertedNode(null);
      }
      // Otherwise keep the existing insertedNode (don't clear it)
    }

    if (previousNodes.length > 0 || newEnteringNodes.size > 0 || newExitingNodes.size > 0) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }
    setPreviousNodes(positionedNodes);
    previousRootRef.current = root;
  }, [
    positionedNodes,
    previousNodes.length,
    root,
    extractNodeValues,
    steps,
    currentStepIndex,
    insertedNode,
    currentNode,
    findPathToNode,
  ]);

  // Animation effect for path connections
  useEffect(() => {
    if (!currentNode || pathNodes.size === 0) {
      setActiveConnectionIndex(null);
      setConnectionProgress(0);
      setActiveParentNode(null);
      setAnimatedNodes(new Set());
      setCompletedConnections(new Set());
      return;
    }

    // Get path connections based on current layout
    const pathValues = Array.from(pathNodes);
    const layoutNodes = calculateTreeLayout(root);
    const pathConnections = getPathConnections(root, pathValues, layoutNodes);

    if (pathConnections.length === 0) {
      setActiveConnectionIndex(null);
      setConnectionProgress(0);
      setActiveParentNode(null);
      setAnimatedNodes(new Set());
      setCompletedConnections(new Set());
      return;
    }

    // Reset animation state
    setActiveConnectionIndex(null);
    setConnectionProgress(0);
    setActiveParentNode(null);
    setAnimatedNodes(new Set());
    setCompletedConnections(new Set());

    // Animate each connection sequentially
    let currentIndex = 0;
    let animationFrameId: number | null = null;
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds per connection

    const animateConnection = () => {
      if (currentIndex >= pathConnections.length) {
        // All connections animated, mark all as completed
        const allConnectionKeys = new Set(pathConnections.map((conn) => conn.connectionKey));
        setCompletedConnections(allConnectionKeys);
        setActiveConnectionIndex(null);
        setConnectionProgress(1);
        return;
      }

      const connection = pathConnections[currentIndex];
      setActiveConnectionIndex(currentIndex);
      // Set parent node as active (fill orange) when starting animation
      setActiveParentNode(connection.parentValue);

      const animate = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setConnectionProgress(progress);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          // Connection complete - mark parent node as animated (border orange) and clear active parent
          setAnimatedNodes((prev) => new Set([...prev, connection.parentValue]));
          setActiveParentNode(null);
          setCompletedConnections((prev) => new Set([...prev, connection.connectionKey]));
          setConnectionProgress(0);
          startTime = null;
          currentIndex++;
          setTimeout(() => {
            animateConnection();
          }, 300); // 0.3s delay between connections
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timeoutId = setTimeout(() => {
      animateConnection();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentNode, pathNodes, root, calculateTreeLayout, getPathConnections]);

  // Memoized node component
  const NodeComponent = memo<{
    node: PositionedNode;
    isInSearchPath: boolean;
    isTraverseSelected: boolean;
    isCurrentlyTraversing: boolean;
    isInsertedNode: boolean;
    isCurrentNode: boolean;
    isInPath: boolean;
    isAnimatedNode: boolean;
    isActiveParent: boolean;
  }>(
    ({
      node,
      isInSearchPath,
      isTraverseSelected,
      isCurrentlyTraversing,
      isInsertedNode,
      isCurrentNode,
      isInPath,
      isAnimatedNode,
      isActiveParent,
    }) => (
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transform"
        style={{
          left: `calc(50% + ${node.x}px)`,
          top: `${node.y}px`,
        }}
        ref={(el) => {
          if (el) {
            nodeRefs.current.set(node.value, el);
          } else {
            nodeRefs.current.delete(node.value);
          }
        }}
      >
        <div
          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold ${
            isCurrentNode
              ? 'border-orange-500 bg-orange-200 text-orange-800 shadow-lg'
              : isInsertedNode
                ? 'border-yellow-400 bg-yellow-200 text-yellow-800 shadow-lg'
                : isActiveParent
                  ? 'border-orange-500 bg-orange-200 text-orange-800 shadow-lg'
                  : isAnimatedNode
                    ? 'border-orange-500 bg-transparent text-gray-800 shadow-md'
                    : isInPath && !isAnimatedNode
                      ? 'border-orange-500 bg-orange-200 text-orange-800 shadow-md'
                      : isInSearchPath
                        ? 'border-blue-400 bg-blue-200 text-blue-800 shadow-md'
                        : isTraverseSelected || isCurrentlyTraversing
                          ? 'border-green-400 bg-green-200 text-green-800 shadow-lg'
                          : 'border-black bg-transparent text-gray-800 hover:shadow-md'
          }`}
        >
          {node.value}
          {/* Show "root" label for root node */}
          {node.level === 0 && !isCurrentNode && (
            <div className="absolute top-1/2 -right-16 -translate-y-1/2 whitespace-nowrap">
              <div className="flex items-center space-x-1">
                <div className="text-xs font-normal text-gray-600">→</div>
                <div className="rounded border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  root
                </div>
              </div>
            </div>
          )}
          {/* Show "current" label for current node */}
          {isCurrentNode && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="flex flex-col items-center">
                <div className="text-lg font-bold text-orange-500">↓</div>
                <div className="rounded border border-orange-300 bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                  current
                </div>
              </div>
            </div>
          )}
          {/* Show both "root" and "current" if root is also current */}
          {node.level === 0 && isCurrentNode && (
            <div className="absolute top-1/2 -right-16 -translate-y-1/2 whitespace-nowrap">
              <div className="flex items-center space-x-1">
                <div className="text-xs font-normal text-orange-500">→</div>
                <div className="rounded border border-orange-300 bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                  root
                </div>
              </div>
            </div>
          )}
          {(isTraverseSelected || isCurrentlyTraversing) && (
            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-green-400" />
          )}

          {/* Memory Address */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <MemoryAddress
              address={generateHashAddress(node.value)}
              isVisible={showMemoryAddress}
            />
          </div>
        </div>
      </div>
    ),
  );

  NodeComponent.displayName = 'NodeComponent';

  const renderNode = useCallback(
    (node: PositionedNode): React.ReactNode => {
      const isInSearchPath = searchPath.includes(node.value);
      const isExiting = exitingNodes.has(node.value);
      const isInsertedNode = insertedNode === node.value;
      const isCurrentNode = currentNode === node.value;
      const isInPath = pathNodes.has(node.value) && !isCurrentNode;
      const isAnimatedNode = animatedNodes.has(node.value);
      const isActiveParent = activeParentNode === node.value;

      // Check if this node should be animated during traversal
      const isTraverseSelected = Boolean(
        isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      const isCurrentlyTraversing = Boolean(
        isTraversing &&
          traverseIndex < traversalOrder.length &&
          node.value === traversalOrder[traverseIndex],
      );

      // Don't render exiting nodes after animation
      if (isExiting && !isTransitioning) {
        return null;
      }

      return (
        <NodeComponent
          key={node.id}
          node={node}
          isInSearchPath={isInSearchPath}
          isTraverseSelected={isTraverseSelected}
          isCurrentlyTraversing={isCurrentlyTraversing}
          isInsertedNode={isInsertedNode}
          isCurrentNode={isCurrentNode}
          isInPath={isInPath}
          isAnimatedNode={isAnimatedNode}
          isActiveParent={isActiveParent}
        />
      );
    },
    [
      searchPath,
      isTraversing,
      traverseIndex,
      traversalOrder,
      isTransitioning,
      exitingNodes,
      insertedNode,
      currentNode,
      pathNodes,
      animatedNodes,
      activeParentNode,
      NodeComponent,
    ],
  );

  const renderConnections = useCallback(
    (treeRoot: BSTNode | null, positionedNodes: PositionedNode[]): React.ReactNode => {
      if (!treeRoot) return null;

      const connections: React.ReactNode[] = [];

      // Get path connections if we have a current node
      const pathValues = currentNode ? Array.from(pathNodes) : [];
      const pathConnections = currentNode
        ? getPathConnections(treeRoot, pathValues, positionedNodes)
        : [];

      const addConnection = (parent: PositionedNode, child: PositionedNode | null) => {
        if (!child) return;

        // Calculate positions to match the node positioning
        const parentX = parent.x;
        const parentY = parent.y + 24;
        const childX = child.x;
        const childY = child.y - 24;

        // Calculate line properties
        const deltaX = childX - parentX;
        const deltaY = childY - parentY;
        const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const lineAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

        // Check if this connection is part of the path to current node
        const isInPath = pathNodes.has(parent.value) && pathNodes.has(child.value);

        const connectionKey = `${parent.id}-${child.id}`;
        const pathConnection = pathConnections.find((conn) => conn.connectionKey === connectionKey);
        const isActive = pathConnection && activeConnectionIndex === pathConnection.index;
        const isCompleted = completedConnections.has(connectionKey);

        // Determine base line color
        const baseColor = isTransitioning ? '#3b82f6' : '#000000';

        // Calculate animated width for active connection
        const animatedWidth = isActive
          ? connectionProgress * lineLength
          : isCompleted
            ? lineLength
            : 0;
        const showOverlay = isActive || isCompleted;

        connections.push(
          <div
            key={connectionKey}
            className="pointer-events-none absolute z-0"
            style={{
              left: `calc(50% + ${parentX}px)`,
              top: `${parentY}px`,
              width: `${lineLength}px`,
              height: isInPath ? '3px' : '2px',
              transformOrigin: '0 50%',
              transform: `rotate(${lineAngle}deg)`,
              opacity: isTransitioning ? 0.5 : 1,
            }}
            ref={(el) => {
              if (el) {
                connectionRefs.current.set(connectionKey, el);
              } else {
                connectionRefs.current.delete(connectionKey);
              }
            }}
          >
            {/* Base line (black) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: baseColor,
              }}
            />
            {/* Animated orange overlay */}
            {showOverlay && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${animatedWidth}px`,
                  height: '100%',
                  backgroundColor: '#f97316',
                  transition: isActive ? 'none' : 'width 0.3s ease-out',
                }}
              />
            )}
          </div>,
        );
      };

      // Add connections for all nodes
      positionedNodes.forEach((parent) => {
        const leftChild = positionedNodes.find((n) => n.id === parent.left?.id) || null;
        const rightChild = positionedNodes.find((n) => n.id === parent.right?.id) || null;

        addConnection(parent, leftChild);
        addConnection(parent, rightChild);
      });

      return <>{connections}</>;
    },
    [
      isTransitioning,
      pathNodes,
      currentNode,
      activeConnectionIndex,
      connectionProgress,
      completedConnections,
      getPathConnections,
    ],
  );

  // Render a single tree
  const renderSingleTree = useCallback(
    (
      treeRoot: BSTNode | null,
      treeName: string,
      treeData?: { size: number; isEmpty: boolean; height: number },
    ) => {
      if (!treeRoot) {
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">{treeName}</h3>
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
              <div className="text-center text-gray-500">
                <div className="text-lg font-semibold">Tree is Empty</div>
                <div className="text-sm">Add nodes using Insert operation</div>
              </div>
            </div>
            {treeData && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Tree {treeName} Information
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">{treeData.size}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">
                      {treeData.isEmpty ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">Height:</span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">{treeData.height}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      const positionedNodes = calculateTreeLayout(treeRoot);
      const connections = renderConnections(treeRoot, positionedNodes);
      const traversalResults = generateTraversalResults(treeRoot);

      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">{treeName}</h3>
          <div className="relative min-h-[400px] overflow-auto rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="relative flex h-full min-h-[400px] w-full justify-center">
              <div className="relative" style={{ minWidth: '800px', minHeight: '400px' }}>
                {/* Render connections first (behind nodes) */}
                {connections}

                {/* Render nodes */}
                {positionedNodes.map(renderNode)}
              </div>
            </div>
          </div>

          {/* Tree Information */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Tree {treeName} Information
            </h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{treeData?.size || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {treeData?.isEmpty ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Height:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {treeData?.height || 0}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Preorder:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {traversalResults.preorder.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Inorder:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {traversalResults.inorder.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Postorder:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {traversalResults.postorder.join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [calculateTreeLayout, renderConnections, renderNode, generateTraversalResults],
  );

  // Check if we need to show multiple trees
  const showMultipleTrees = Object.keys(allTrees).length > 1;

  // Main tree metadata (for single-tree display)
  const mainTreeData = useMemo(() => {
    const entries = Object.entries(allTrees);
    if (entries.length === 0) return undefined;
    const [, treeData] = entries[0];
    return {
      size: treeData.size,
      isEmpty: treeData.isEmpty,
      height: treeData.height,
    };
  }, [allTrees]);

  return (
    <section
      ref={ref}
      className="rounded-lg bg-white p-3 shadow sm:p-6 dark:bg-gray-800"
      suppressHydrationWarning
      aria-label="BST Stepthrough Visualization"
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-800 sm:text-lg dark:text-gray-100">
          BST Visualization
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
          {isRunning && (
            <div className="hidden items-center space-x-2 text-sm text-blue-600 sm:flex dark:text-blue-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Running...</span>
            </div>
          )}

          <div className="mx-0 sm:mx-2">
            <VisualizationViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showMemoryAddress={showMemoryAddress}
              onToggleMemoryAddress={setShowMemoryAddress}
            />
          </div>

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
      </header>

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
          <aside className="w-full flex-shrink-0 lg:w-auto" aria-label="Variable State Panel">
            <VariableStatePanel
              steps={steps}
              currentStepIndex={currentStepIndex}
              nodes={positionedNodes.map((n) => n.value)}
            />
          </aside>
        )}

        {/* Right Side - Tree Visualization */}
        <div className="min-w-0 flex-1">
          <ZoomableContainer>
            {viewMode === 'analogy' ? (
              <ConceptualAnalogyPanel type="bst" data={{ root: root }} className="min-h-[500px]" />
            ) : showMultipleTrees ? (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {Object.entries(allTrees)
                    .filter(([, treeData]) => treeData.root !== null)
                    .map(([treeName, treeData]) => (
                      <div
                        key={treeName}
                        className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900"
                      >
                        {renderSingleTree(treeData.root, treeName, {
                          size: treeData.size,
                          isEmpty: treeData.isEmpty,
                          height: treeData.height,
                        })}
                      </div>
                    ))}
                </div>
              </div>
            ) : root ? (
              renderSingleTree(root, 'Main Tree', mainTreeData)
            ) : (
              <div className="flex h-96 items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-lg font-medium">Empty BST</div>
                  <div className="text-sm">Run your code to see BST visualization</div>
                </div>
              </div>
            )}
          </ZoomableContainer>
        </div>
      </div>

      {/* Traversal Order Display - Multiple Trees */}
      {showMultipleTrees && Object.keys(allTrees).length > 0 && (
        <div className="mt-4 space-y-4">
          {Object.entries(allTrees)
            .filter(([, treeData]) => treeData.root !== null)
            .map(([treeName, treeData]) => {
              const treeTraversalOrder = generateTraversalOrder(treeData.root, 'traverse_inorder');
              return (
                <div key={treeName} className="rounded-lg bg-green-50 p-3">
                  <div className="text-sm font-medium text-green-800">
                    Tree {treeName} Traversal Order:
                  </div>
                  <div className="text-sm text-green-700">
                    {treeTraversalOrder.map((value, index) => (
                      <span
                        key={index}
                        className={`mx-1 inline-block rounded px-2 py-1 transition-all duration-300 ${
                          isTraversing && index === traverseIndex
                            ? 'scale-110 bg-green-200 font-bold text-green-800'
                            : index < traverseIndex
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Console Output */}
      <ConsoleOutput steps={steps} currentStepIndex={currentStepIndex} />

      {/* Big O Analysis */}
      <PerformanceAnalysisPanel
        steps={steps}
        currentStepIndex={currentStepIndex}
        complexity={complexity}
        code={code}
      />

      {/* Legend */}
      <footer className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded border border-gray-900 bg-white dark:border-gray-500 dark:bg-gray-800" />
          <span className="text-gray-600 dark:text-gray-400">Node ปกติ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded border border-green-400 bg-green-200 dark:border-green-500 dark:bg-green-900/30" />
          <span className="text-gray-600 dark:text-gray-400">Traversing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded border border-orange-500 bg-orange-200 dark:border-orange-400 dark:bg-orange-900/30" />
          <span className="text-gray-600 dark:text-gray-400">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded border border-yellow-400 bg-yellow-200 dark:border-yellow-500 dark:bg-yellow-900/30" />
          <span className="text-gray-600 dark:text-gray-400">Inserted (Active)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded border border-blue-400 bg-blue-200 dark:border-blue-500 dark:bg-blue-900/30" />
          <span className="text-gray-600 dark:text-gray-400">In Path</span>
        </div>
      </footer>

      {/* Pitfall Popup */}
      <PitfallPopup isOpen={isPitfallPopupOpen} onClose={() => setIsPitfallPopupOpen(false)} />
    </section>
  );
});

BSTStepthroughVisualization.displayName = 'BSTStepthroughVisualization';

export default BSTStepthroughVisualization;
