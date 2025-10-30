import React, { forwardRef } from 'react';

import { BSTRealtimeProps, RealtimeBSTNodeData } from '@/types';

import ZoomableContainer from '../../shared/ZoomableContainer';

const BSTRealtime = forwardRef<HTMLDivElement, BSTRealtimeProps>(({ data }, ref) => {
  // Check if we need to show multiple trees
  const showMultipleTrees = data.allTrees && Object.keys(data.allTrees).length > 0;

  // Calculate tree layout for SVG positioning (dragdrop style)
  const calculateTreeLayout = (
    root: RealtimeBSTNodeData | null,
    level: number = 0,
    x: number = 0,
    y: number = 0,
  ): RealtimeBSTNodeData | null => {
    if (!root) return null;

    const levelHeight = 100; // Vertical spacing between levels
    const nodeWidth = 80; // Horizontal spacing between nodes
    const childXOffset = nodeWidth * Math.pow(0.6, level + 1); // Decrease offset for deeper levels

    const leftChild = root.left
      ? calculateTreeLayout(root.left, level + 1, x - childXOffset, y + levelHeight)
      : null;

    const rightChild = root.right
      ? calculateTreeLayout(root.right, level + 1, x + childXOffset, y + levelHeight)
      : null;

    return {
      ...root,
      x: x + 200, // Offset to center (ลดลง)
      y: y + 50,
      level,
      left: leftChild,
      right: rightChild,
    };
  };

  // Render a single tree node (dragdrop style)
  const renderTreeNode = (node: RealtimeBSTNodeData) => {
    if (!node.x || !node.y) return null;

    return (
      <g key={`node-${node.value}-${node.x}-${node.y}`}>
        {/* Connection lines */}
        {node.left && node.left.x && node.left.y && (
          <line
            x1={node.x}
            y1={node.y + 24}
            x2={node.left.x}
            y2={node.left.y - 24}
            className="stroke-gray-900 dark:stroke-gray-300"
            strokeWidth="2"
          />
        )}
        {node.right && node.right.x && node.right.y && (
          <line
            x1={node.x}
            y1={node.y + 24}
            x2={node.right.x}
            y2={node.right.y - 24}
            className="stroke-gray-900 dark:stroke-gray-300"
            strokeWidth="2"
          />
        )}

        {/* Node circle (no fill, border) */}
        <circle
          cx={node.x}
          cy={node.y}
          r="24"
          fill="none"
          className="stroke-gray-900 dark:stroke-gray-300"
          strokeWidth="2"
        />

        {/* Node value */}
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="text-sm font-bold text-gray-800 dark:text-gray-100"
        >
          {node.value}
        </text>
      </g>
    );
  };

  // Render tree nodes recursively
  const renderTreeNodes = (node: RealtimeBSTNodeData | null): React.ReactNode[] => {
    if (!node) return [];

    const nodes: React.ReactNode[] = [];

    // Render current node
    nodes.push(renderTreeNode(node));

    // Render children
    if (node.left) {
      nodes.push(...renderTreeNodes(node.left));
    }
    if (node.right) {
      nodes.push(...renderTreeNodes(node.right));
    }

    return nodes;
  };

  // Render a single tree
  const renderSingleTree = (root: RealtimeBSTNodeData | null, treeName: string) => {
    if (!root) {
      return (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-lg font-semibold">Tree is Empty</div>
            <div className="text-sm">Add nodes using Insert operation</div>
          </div>
        </div>
      );
    }

    const layoutRoot = calculateTreeLayout(root);
    const nodes = renderTreeNodes(layoutRoot);

    // Calculate SVG dimensions (simplified)
    const width = 600;
    const height = 400;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{treeName}</h3>
        <ZoomableContainer
          className="min-h-[400px] rounded-lg bg-gray-50 dark:bg-gray-800"
          minZoom={0.3}
          maxZoom={2}
          initialZoom={1}
          enablePan={true}
          enableWheelZoom={true}
          enableKeyboardZoom={true}
          showControls={true}
        >
          <div className="flex h-full min-h-[400px] items-center justify-center p-8">
            <svg width={width} height={height} viewBox="0 0 600 400" className="overflow-visible">
              {nodes}
            </svg>
          </div>
        </ZoomableContainer>
      </div>
    );
  };

  return (
    <div ref={ref} className="h-full w-full">
      {showMultipleTrees ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {data.allTrees &&
              Object.entries(data.allTrees)
                .filter(([, treeData]) => !treeData.isEmpty)
                .map(([treeName, treeData]) => (
                  <div
                    key={treeName}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {renderSingleTree(treeData.root || null, `Tree ${treeName}`)}

                    {/* Tree Information */}
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <h5 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                        Tree {treeName} Information
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            Size:
                          </span>
                          <span className="ml-2 text-gray-800 dark:text-gray-200">
                            {treeData.size}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            Is Empty:
                          </span>
                          <span className="ml-2 text-gray-800 dark:text-gray-200">
                            {treeData.isEmpty ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {treeData.traversalResults && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Preorder:
                              </span>
                              <span className="ml-2 text-gray-800 dark:text-gray-200">
                                {treeData.traversalResults.preorder.join(', ') || 'None'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Inorder:
                              </span>
                              <span className="ml-2 text-gray-800 dark:text-gray-200">
                                {treeData.traversalResults.inorder.join(', ') || 'None'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Postorder:
                              </span>
                              <span className="ml-2 text-gray-800 dark:text-gray-200">
                                {treeData.traversalResults.postorder.join(', ') || 'None'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {renderSingleTree(data.root || null, 'Binary Search Tree')}

          {/* Tree Information */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <h4 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Tree Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{data.count}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Is Empty:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {data.root === null ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Current Operation:
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {data.currentOperation || 'None'}
                </span>
              </div>
              {data.currentTraversal && (
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Traversal Mode:
                  </span>
                  <span className="ml-2 text-gray-800 capitalize dark:text-gray-200">
                    {data.currentTraversal}
                  </span>
                </div>
              )}
            </div>

            {/* Traversal Results */}
            {data.elements.length > 0 && (
              <div className="mt-3">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Traversal Result:
                </span>
                <div className="mt-1 text-gray-800 dark:text-gray-200">
                  {data.elements.join(' → ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

BSTRealtime.displayName = 'BSTRealtime';

export default BSTRealtime;
