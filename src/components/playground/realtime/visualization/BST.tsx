import React, { forwardRef } from 'react';
import { BSTRealtimeProps, RealtimeBSTNodeData } from '@/types';

const BSTRealtime = forwardRef<HTMLDivElement, BSTRealtimeProps>(
  ({ data, error, securityStatus }, ref) => {
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
          {/* Connection lines (black) */}
          {node.left && node.left.x && node.left.y && (
            <line
              x1={node.x}
              y1={node.y + 24}
              x2={node.left.x}
              y2={node.left.y - 24}
              stroke="#000000"
              strokeWidth="2"
            />
          )}
          {node.right && node.right.x && node.right.y && (
            <line
              x1={node.x}
              y1={node.y + 24}
              x2={node.right.x}
              y2={node.right.y - 24}
              stroke="#000000"
              strokeWidth="2"
            />
          )}

          {/* Node circle (no fill, black border) */}
          <circle cx={node.x} cy={node.y} r="24" fill="none" stroke="#000000" strokeWidth="2" />

          {/* Node value */}
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            className="text-sm font-bold text-gray-800"
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
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center text-gray-500">
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
          <h3 className="text-lg font-semibold text-gray-700">{treeName}</h3>
          <div className="relative min-h-[400px] overflow-auto rounded-lg bg-gray-50">
            <div className="flex h-full min-h-[400px] items-center justify-center p-8">
              <svg width={width} height={height} viewBox="0 0 600 400" className="overflow-visible">
                {nodes}
              </svg>
            </div>
          </div>
        </div>
      );
    };

    // Error display
    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      );
    }

    // Security violations
    if (!securityStatus.isSafe) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold">Security Violations</div>
            <div className="text-sm">
              {securityStatus.violations.map((violation, index) => (
                <div key={index}>{violation}</div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="h-full w-full">
        {showMultipleTrees ? (
          <div className="space-y-6">
            <div className="grid gap-6">
              {data.allTrees &&
                Object.entries(data.allTrees)
                  .filter(([, treeData]) => !treeData.isEmpty)
                  .map(([treeName, treeData]) => (
                    <div key={treeName} className="rounded-lg border bg-white p-4">
                      {renderSingleTree(treeData.root || null, `Tree ${treeName}`)}

                      {/* Tree Information */}
                      <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <h5 className="mb-2 font-medium text-gray-700">
                          Tree {treeName} Information
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Size:</span>
                            <span className="ml-2 text-gray-800">{treeData.size}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Is Empty:</span>
                            <span className="ml-2 text-gray-800">
                              {treeData.isEmpty ? 'Yes' : 'No'}
                            </span>
                          </div>
                          {treeData.traversalResults && (
                            <>
                              <div>
                                <span className="font-medium text-gray-600">Preorder:</span>
                                <span className="ml-2 text-gray-800">
                                  {treeData.traversalResults.preorder.join(', ') || 'None'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Inorder:</span>
                                <span className="ml-2 text-gray-800">
                                  {treeData.traversalResults.inorder.join(', ') || 'None'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Postorder:</span>
                                <span className="ml-2 text-gray-800">
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
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold text-gray-700">Tree Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Size:</span>
                  <span className="ml-2 text-gray-800">{data.count}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Is Empty:</span>
                  <span className="ml-2 text-gray-800">{data.root === null ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Current Operation:</span>
                  <span className="ml-2 text-gray-800">{data.currentOperation || 'None'}</span>
                </div>
                {data.currentTraversal && (
                  <div>
                    <span className="font-medium text-gray-600">Traversal Mode:</span>
                    <span className="ml-2 text-gray-800 capitalize">{data.currentTraversal}</span>
                  </div>
                )}
              </div>

              {/* Traversal Results */}
              {data.elements.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-gray-600">Traversal Result:</span>
                  <div className="mt-1 text-gray-800">{data.elements.join(' → ')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

BSTRealtime.displayName = 'BSTRealtime';

export default BSTRealtime;
