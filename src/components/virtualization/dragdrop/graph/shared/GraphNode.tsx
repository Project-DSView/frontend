import React, { memo } from 'react';
import { UndirectedGraphNode } from '@/types';

interface GraphNodeProps {
  node: UndirectedGraphNode;
  isHighlighted: boolean;
  isInSearchPath: boolean;
  isTraverseSelected: boolean;
  isCurrentlyTraversing: boolean;
  isRunning: boolean;
  onMouseDown?: (e: React.MouseEvent, nodeId: string) => void;
  position?: { x: number; y: number };
  isDragging?: boolean;
}

const GraphNode = memo<GraphNodeProps>(
  ({
    node,
    isHighlighted,
    isInSearchPath,
    isTraverseSelected,
    isCurrentlyTraversing,
    isRunning,
    onMouseDown,
    position,
    isDragging,
  }) => {
    const nodePosition = position || { x: node.x, y: node.y };

    return (
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 transform cursor-move"
        style={{
          left: `${nodePosition.x}px`,
          top: `${nodePosition.y}px`,
        }}
        onMouseDown={onMouseDown ? (e) => onMouseDown(e, node.id) : undefined}
      >
        <div
          className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-500 ${
            isHighlighted
              ? 'scale-110 border-yellow-400 bg-yellow-200 text-yellow-800 shadow-lg'
              : isInSearchPath
                ? 'scale-105 border-blue-400 bg-blue-200 text-blue-800 shadow-md'
                : isTraverseSelected || isCurrentlyTraversing
                  ? 'scale-110 border-green-400 bg-green-200 text-green-800 shadow-lg'
                  : 'border-gray-600 bg-white text-gray-800 hover:shadow-md'
          } ${isRunning ? 'animate-pulse' : ''} ${isDragging ? 'z-10' : ''}`}
        >
          {node.value}
          {isHighlighted && (
            <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-yellow-400" />
          )}
          {isInSearchPath && (
            <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-blue-400" />
          )}
          {(isTraverseSelected || isCurrentlyTraversing) && (
            <div className="absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full bg-green-400" />
          )}
        </div>
      </div>
    );
  },
);

GraphNode.displayName = 'GraphNode';

export default GraphNode;
