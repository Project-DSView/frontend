import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { BSTVisualizationProps, BSTNode, PositionedNode } from '@/types';

const BSTVisualization = forwardRef<HTMLDivElement, BSTVisualizationProps>(
  ({ root, stats, isRunning, currentStep, highlightedNodes = [], searchPath = [], currentOperation, selectedStep }, ref) => {
    const [traverseIndex, setTraverseIndex] = useState(0);
    const [isTraversing, setIsTraversing] = useState(false);
    const [traversalOrder, setTraversalOrder] = useState<string[]>([]);

    // Generate traversal order based on current operation
    const generateTraversalOrder = (node: BSTNode | null, type: string): string[] => {
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
    };

    // Handle traverse animation
    useEffect(() => {
      if (selectedStep !== null && selectedStep !== undefined && currentOperation && currentOperation.includes('traverse')) {
        const order = generateTraversalOrder(root, currentOperation);
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
        // Reset when not traversing
        setIsTraversing(false);
        setTraverseIndex(0);
        setTraversalOrder([]);
      }
    }, [selectedStep, currentOperation, root]);
    
    // Calculate tree layout
    const positionedNodes = useMemo(() => {
      if (!root) return [];
      
      const nodes: PositionedNode[] = [];
      const levelHeight = 100; // Vertical spacing between levels
      const nodeWidth = 80; // Horizontal spacing between nodes
      
      // Calculate positions using a simple approach
      const calculatePositions = (node: BSTNode | null, level: number = 0, x: number = 0, y: number = 0): void => {
        if (!node) return;
        
        nodes.push({
          ...node,
          x: x,
          y: y,
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
      calculatePositions(root, 0, 0, 0);
      return nodes;
    }, [root]);

    const renderNode = (node: PositionedNode): React.ReactNode => {
      const isHighlighted = highlightedNodes.includes(node.value);
      const isInSearchPath = searchPath.includes(node.value);
      
      // Check if this node should be animated during traversal
      const isTraverseSelected = 
        selectedStep !== null &&
        selectedStep !== undefined &&
        currentOperation &&
        currentOperation.includes('traverse') &&
        isTraversing &&
        traverseIndex < traversalOrder.length &&
        node.value === traversalOrder[traverseIndex];
      
      const isCurrentlyTraversing = 
        isTraversing && 
        traverseIndex < traversalOrder.length &&
        node.value === traversalOrder[traverseIndex];

      return (
        <div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `calc(50% + ${node.x}px)`, // Center the tree
            top: `${node.y + 50}px`,
          }}
        >
          <div
            className={`
              relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500
              ${isHighlighted 
                ? 'bg-yellow-200 border-yellow-400 text-yellow-800 shadow-lg scale-110' 
                : isInSearchPath
                ? 'bg-blue-200 border-blue-400 text-blue-800 shadow-md scale-105'
                : isTraverseSelected || isCurrentlyTraversing
                ? 'bg-green-200 border-green-400 text-green-800 shadow-lg scale-110'
                : 'bg-white border-gray-600 text-gray-800 hover:shadow-md'
              }
              ${isRunning ? 'animate-pulse' : ''}
            `}
          >
            {node.value}
            {isHighlighted && (
              <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-yellow-400 animate-ping" />
            )}
            {(isTraverseSelected || isCurrentlyTraversing) && (
              <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-green-400 animate-ping" />
            )}
          </div>
        </div>
      );
    };

    const renderConnections = (): React.ReactNode => {
      if (!root) return null;
      
      const connections: React.ReactNode[] = [];
      
      const addConnection = (parent: PositionedNode, child: PositionedNode | null) => {
        if (!child) return;
        
        // Calculate positions to match the node positioning
        const parentX = parent.x;
        const parentY = parent.y + 50;
        const childX = child.x;
        const childY = child.y + 50;
        
        // Calculate line properties
        const deltaX = childX - parentX;
        const deltaY = childY - parentY;
        
        // Calculate the starting point (from the edge of parent node)
        const angle = Math.atan2(deltaY, deltaX);
        const parentRadius = 24; // Half of node width
        const childRadius = 24;
        
        const startX = parentX + Math.cos(angle) * parentRadius;
        const startY = parentY + Math.sin(angle) * parentRadius;
        const endX = childX - Math.cos(angle) * childRadius;
        const endY = childY - Math.sin(angle) * childRadius;
        
        // Calculate the line properties
        const lineDeltaX = endX - startX;
        const lineDeltaY = endY - startY;
        const lineLength = Math.sqrt(lineDeltaX * lineDeltaX + lineDeltaY * lineDeltaY);
        const lineAngle = Math.atan2(lineDeltaY, lineDeltaX) * 180 / Math.PI;
        
        connections.push(
          <div
            key={`${parent.id}-${child.id}`}
            className="absolute pointer-events-none"
            style={{
              left: `calc(50% + ${startX}px)`, // Match the node positioning
              top: `${startY}px`,
              width: `${lineLength}px`,
              height: '2px',
              backgroundColor: '#374151',
              transformOrigin: '0 50%',
              transform: `rotate(${lineAngle}deg)`,
            }}
          />
        );
      };
      
      // Add connections for all nodes
      positionedNodes.forEach(parent => {
        const leftChild = positionedNodes.find(n => n.id === parent.left?.id) || null;
        const rightChild = positionedNodes.find(n => n.id === parent.right?.id) || null;
        
        addConnection(parent, leftChild);
        addConnection(parent, rightChild);
      });
      
      return <>{connections}</>;
    };

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">BST Visualization</h2>
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
              <span>Running...</span>
            </div>
          )}
        </div>

        {/* Current Step Display */}
        {currentStep && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3">
            <div className="text-sm font-medium text-blue-800">Current Step:</div>
            <div className="text-sm text-blue-700">{currentStep}</div>
          </div>
        )}

        {/* Tree Visualization */}
        <div className="mb-6 min-h-[400px] overflow-auto relative bg-gray-50 rounded-lg">
          {root ? (
            <div className="relative w-full h-full min-h-[400px]">
              {/* Render connections first (behind nodes) */}
              {renderConnections()}
              
              {/* Render nodes */}
              {positionedNodes.map(renderNode)}
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="mb-2 text-4xl">🌳</div>
                <div className="text-lg font-medium">Empty BST</div>
                <div className="text-sm">ลาก operations มาสร้าง BST</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.size}</div>
            <div className="text-xs text-gray-600">Size</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.height}</div>
            <div className="text-xs text-gray-600">Height</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-lg font-bold text-gray-800">{stats.minValue || 'N/A'}</div>
            <div className="text-xs text-gray-600">Min Value</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-lg font-bold text-gray-800">{stats.maxValue || 'N/A'}</div>
            <div className="text-xs text-gray-600">Max Value</div>
          </div>
        </div>

        {/* Search Path Display */}
        {searchPath.length > 0 && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <div className="text-sm font-medium text-blue-800">Search Path:</div>
            <div className="text-sm text-blue-700">
              {searchPath.join(' → ')}
            </div>
          </div>
        )}

        {/* Traversal Order Display */}
        {traversalOrder.length > 0 && (
          <div className="mt-4 rounded-lg bg-green-50 p-3">
            <div className="text-sm font-medium text-green-800">Traversal Order:</div>
            <div className="text-sm text-green-700">
              {traversalOrder.map((value, index) => (
                <span
                  key={index}
                  className={`inline-block px-2 py-1 mx-1 rounded transition-all duration-300 ${
                    isTraversing && index === traverseIndex
                      ? 'bg-green-200 text-green-800 font-bold scale-110'
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
            <div className="h-3 w-3 rounded-full bg-yellow-200 border border-yellow-400" />
            <span>Highlighted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-200 border border-blue-400" />
            <span>Search Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-200 border border-green-400" />
            <span>Traversing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-white border border-gray-600" />
            <span>Normal Node</span>
          </div>
        </div>
      </div>
    );
  }
);

BSTVisualization.displayName = 'BSTVisualization';

export default BSTVisualization;
