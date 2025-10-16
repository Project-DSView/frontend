import React, { forwardRef, useMemo, useState, useEffect, memo, useCallback } from 'react';
import { StepthroughVisualizationProps, BSTNode, PositionedNode, BSTData } from '@/types';
import ZoomableContainer from '../../shared/ZoomableContainer';
import StepIndicator from '../../shared/StepIndicator';

const BSTStepthroughVisualization = forwardRef<
  HTMLDivElement,
  StepthroughVisualizationProps<BSTData>
>(({ steps, currentStepIndex, data, isRunning, error }, ref) => {
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [searchPath, setSearchPath] = useState<string[]>([]);
  const [traverseIndex, setTraverseIndex] = useState(0);
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousNodes, setPreviousNodes] = useState<PositionedNode[]>([]);

  // Helper function to convert backend tree data to BSTNode
  const convertToBSTNode = useCallback((nodeData: unknown): BSTNode | null => {
    if (!nodeData || typeof nodeData !== 'object') {
      return null;
    }

    const data = nodeData as Record<string, unknown>;
    const node: BSTNode = {
      value: String(data.data || data.value || ''),
      left: null,
      right: null,
      id: Math.random().toString(36).substring(2, 11),
    };

    if (data.left) {
      node.left = convertToBSTNode(data.left);
    }
    if (data.right) {
      node.right = convertToBSTNode(data.right);
    }

    return node;
  }, []);

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
  }, [data, steps, currentStepIndex, convertToBSTNode]);

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
  }, [allTrees, steps, currentStepIndex, convertToBSTNode]);

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

  // Handle animation based on current step
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
      }
      // Check if this is an insert operation
      else if (message.includes('insert') || message.includes('Insert')) {
        setHighlightedNodes([]);
        setSearchPath([]);
        setIsTraversing(false);
      }
      // Check if this is a delete operation
      else if (message.includes('delete') || message.includes('Delete')) {
        setHighlightedNodes([]);
        setSearchPath([]);
        setIsTraversing(false);
      } else {
        setHighlightedNodes([]);
        setSearchPath([]);
        setIsTraversing(false);
      }
    } else {
      setHighlightedNodes([]);
      setSearchPath([]);
      setIsTraversing(false);
    }
  }, [steps, currentStepIndex, root, generateTraversalOrder]);

  // Calculate tree layout for a specific tree
  const calculateTreeLayout = useCallback((treeRoot: BSTNode | null): PositionedNode[] => {
    if (!treeRoot) return [];

    const nodes: PositionedNode[] = [];
    const levelHeight = 100; // Vertical spacing between levels
    const nodeWidth = 80; // Horizontal spacing between nodes

    // Calculate positions using a simple approach
    const calculatePositions = (
      node: BSTNode | null,
      level: number = 0,
      x: number = 0,
      y: number = 0,
    ): void => {
      if (!node) return;

      nodes.push({
        ...node,
        x: x, // เก็บตำแหน่งเดิมไว้
        y: y + 50,
        level: level,
      });

      // Calculate positions for children
      const childY = y + levelHeight;
      const childXOffset = nodeWidth * Math.pow(0.6, level + 1); // Decrease offset for deeper levels

      if (node.left) {
        calculatePositions(node.left, level + 1, x - childXOffset, childY);
      }
      if (node.right) {
        calculatePositions(node.right, level + 1, x + childXOffset, childY);
      }
    };

    // Start from center (x = 0)
    calculatePositions(treeRoot, 0, 0, 0);
    return nodes;
  }, []);

  // Calculate tree layout for the main root (backward compatibility)
  const positionedNodes = useMemo(() => {
    return calculateTreeLayout(root);
  }, [root, calculateTreeLayout]);

  // Handle transition animation when nodes change
  useEffect(() => {
    if (previousNodes.length > 0) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }
    setPreviousNodes(positionedNodes);
  }, [positionedNodes, previousNodes.length]);

  // Memoized node component
  const NodeComponent = memo<{
    node: PositionedNode;
    isHighlighted: boolean;
    isInSearchPath: boolean;
    isTraverseSelected: boolean;
    isCurrentlyTraversing: boolean;
    isRunning: boolean;
    isTransitioning: boolean;
  }>(
    ({
      node,
      isHighlighted,
      isInSearchPath,
      isTraverseSelected,
      isCurrentlyTraversing,
      isRunning,
      isTransitioning,
    }) => (
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 transform transition-all duration-700 ease-in-out ${
          isTransitioning ? 'animate-pulse' : ''
        }`}
        style={{
          left: `calc(50% + ${node.x}px)`,
          top: `${node.y}px`,
        }}
      >
        <div
          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-700 ease-in-out ${
            isHighlighted
              ? 'scale-110 animate-bounce border-yellow-400 bg-yellow-200 text-yellow-800 shadow-lg'
              : isInSearchPath
                ? 'scale-105 animate-pulse border-blue-400 bg-blue-200 text-blue-800 shadow-md'
                : isTraverseSelected || isCurrentlyTraversing
                  ? 'scale-110 animate-bounce border-green-400 bg-green-200 text-green-800 shadow-lg'
                  : 'border-black bg-transparent text-gray-800 hover:scale-105 hover:shadow-md'
          } ${isRunning ? 'animate-pulse' : ''} ${isTransitioning ? 'animate-pulse' : ''}`}
        >
          {node.value}
          {isHighlighted && (
            <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-yellow-400" />
          )}
          {(isTraverseSelected || isCurrentlyTraversing) && (
            <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-green-400" />
          )}
          {isTransitioning && (
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-blue-300" />
          )}
        </div>
      </div>
    ),
  );

  NodeComponent.displayName = 'NodeComponent';

  const renderNode = useCallback(
    (node: PositionedNode): React.ReactNode => {
      const isHighlighted = highlightedNodes.includes(node.value);
      const isInSearchPath = searchPath.includes(node.value);

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

      return (
        <NodeComponent
          key={node.id}
          node={node}
          isHighlighted={isHighlighted}
          isInSearchPath={isInSearchPath}
          isTraverseSelected={isTraverseSelected}
          isCurrentlyTraversing={isCurrentlyTraversing}
          isRunning={isRunning ?? false}
          isTransitioning={isTransitioning}
        />
      );
    },
    [
      highlightedNodes,
      searchPath,
      isTraversing,
      traverseIndex,
      traversalOrder,
      isRunning,
      isTransitioning,
      NodeComponent,
    ],
  );

  const renderConnections = useCallback(
    (treeRoot: BSTNode | null, positionedNodes: PositionedNode[]): React.ReactNode => {
      if (!treeRoot) return null;

      const connections: React.ReactNode[] = [];

      const addConnection = (parent: PositionedNode, child: PositionedNode | null) => {
        if (!child) return;

        // Calculate positions to match the node positioning
        const parentX = parent.x;
        const parentY = parent.y + 24; // เพิ่ม offset เพื่อให้เส้นเชื่อมจากขอบ node
        const childX = child.x;
        const childY = child.y - 24; // ลด offset เพื่อให้เส้นเชื่อมไปที่ขอบ node

        // Calculate line properties
        const deltaX = childX - parentX;
        const deltaY = childY - parentY;
        const lineLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const lineAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

        connections.push(
          <div
            key={`${parent.id}-${child.id}`}
            className={`pointer-events-none absolute z-0 transition-all duration-700 ease-in-out ${
              isTransitioning ? 'animate-pulse' : ''
            }`}
            style={{
              left: `calc(50% + ${parentX}px)`,
              top: `${parentY}px`,
              width: `${lineLength}px`,
              height: '2px',
              backgroundColor: isTransitioning ? '#3b82f6' : '#000000',
              transformOrigin: '0 50%',
              transform: `rotate(${lineAngle}deg)`,
            }}
          />,
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
    [isTransitioning],
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
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <div className="text-center text-gray-500">
                <div className="text-lg font-semibold">Tree is Empty</div>
                <div className="text-sm">Add nodes using Insert operation</div>
              </div>
            </div>
            {treeData && (
              <div className="rounded-lg bg-gray-50 p-3">
                <h5 className="mb-2 font-medium text-gray-700">Tree {treeName} Information</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Size:</span>
                    <span className="ml-2 text-gray-800">{treeData.size}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Is Empty:</span>
                    <span className="ml-2 text-gray-800">{treeData.isEmpty ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Height:</span>
                    <span className="ml-2 text-gray-800">{treeData.height}</span>
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
          <div className="relative min-h-[400px] overflow-auto rounded-lg bg-gray-50">
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
          <div className="rounded-lg bg-gray-50 p-3">
            <h5 className="mb-2 font-medium text-gray-700">Tree {treeName} Information</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Size:</span>
                <span className="ml-2 text-gray-800">{treeData?.size || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Is Empty:</span>
                <span className="ml-2 text-gray-800">{treeData?.isEmpty ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Height:</span>
                <span className="ml-2 text-gray-800">{treeData?.height || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Preorder:</span>
                <span className="ml-2 text-gray-800">
                  {traversalResults.preorder.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Inorder:</span>
                <span className="ml-2 text-gray-800">
                  {traversalResults.inorder.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Postorder:</span>
                <span className="ml-2 text-gray-800">
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

  return (
    <div ref={ref} className="rounded-lg bg-white p-6 shadow" suppressHydrationWarning>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">BST Visualization</h2>
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

      {/* Tree Visualization */}
      {showMultipleTrees ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {Object.entries(allTrees)
              .filter(([, treeData]) => treeData.root !== null)
              .map(([treeName, treeData]) => (
                <div key={treeName} className="rounded-lg border bg-white p-4">
                  {renderSingleTree(treeData.root, `Tree ${treeName}`, treeData)}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <ZoomableContainer
          className="min-h-[400px] rounded-lg bg-gray-50"
          minZoom={0.3}
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

          {root ? (
            <div className="relative flex h-full min-h-[400px] w-full justify-center">
              <div className="relative" style={{ minWidth: '800px', minHeight: '400px' }}>
                {/* Render connections first (behind nodes) */}
                {renderConnections(root, positionedNodes)}

                {/* Render nodes */}
                {positionedNodes.map(renderNode)}
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-lg font-medium">Empty BST</div>
                <div className="text-sm">Run your code to see BST visualization</div>
              </div>
            </div>
          )}
        </ZoomableContainer>
      )}

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

      {/* Traversal Order Display - Single Tree */}
      {!showMultipleTrees && traversalOrder.length > 0 && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <div className="text-sm font-medium text-green-800">Traversal Order:</div>
          <div className="text-sm text-green-700">
            {traversalOrder.map((value, index) => (
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
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-green-400 bg-green-200" />
          <span>Traversing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full border border-gray-600 bg-white" />
          <span>Normal Node</span>
        </div>
      </div>
    </div>
  );
});

BSTStepthroughVisualization.displayName = 'BSTStepthroughVisualization';

export default BSTStepthroughVisualization;
