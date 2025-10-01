import React, { memo } from 'react';
import {
  UndirectedGraphNode,
  UndirectedGraphEdge,
  DirectedGraphNode,
  DirectedGraphEdge,
} from '@/types';

interface GraphEdgeProps {
  edge: UndirectedGraphEdge | DirectedGraphEdge;
  fromNode: UndirectedGraphNode | DirectedGraphNode;
  toNode: UndirectedGraphNode | DirectedGraphNode;
  isHighlighted: boolean;
}

const GraphEdge = memo<GraphEdgeProps>(({ edge, fromNode, toNode, isHighlighted }) => {
  // Calculate edge properties
  const deltaX = toNode.x - fromNode.x;
  const deltaY = toNode.y - fromNode.y;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  // Calculate start and end points (from edge of circles)
  const nodeRadius = 24; // Half of node width
  const startX = fromNode.x + (deltaX / length) * nodeRadius;
  const startY = fromNode.y + (deltaY / length) * nodeRadius;
  const endX = toNode.x - (deltaX / length) * nodeRadius;
  const endY = toNode.y - (deltaY / length) * nodeRadius;

  const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

  // Midpoint for weight label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Check if this is a directed edge
  const isDirected = 'isDirected' in edge && edge.isDirected;

  // Arrow properties for directed edges
  const arrowSize = 8;
  const arrowAngle = angle;
  // Position arrow at the end of the line, centered on the line
  const arrowX = endX;
  const arrowY = endY;

  return (
    <div>
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${lineLength}px`,
          height: '2px',
          backgroundColor: isHighlighted ? '#f59e0b' : '#374151',
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`,
          zIndex: 1,
        }}
      />

      {/* Arrow head for directed edges */}
      {isDirected && (
        <svg
          className="pointer-events-none absolute"
          style={{
            left: `${arrowX - arrowSize}px`,
            top: `${arrowY - arrowSize}px`,
            width: `${arrowSize * 2}px`,
            height: `${arrowSize * 2}px`,
            zIndex: 2,
          }}
        >
          <polygon
            points={`0,0 ${arrowSize * 2},${arrowSize} 0,${arrowSize * 2}`}
            fill={isHighlighted ? '#f59e0b' : '#374151'}
            transform={`rotate(${arrowAngle} ${arrowSize} ${arrowSize})`}
          />
        </svg>
      )}

      {typeof edge.weight === 'number' && !isNaN(edge.weight) && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-white px-1 text-xs text-gray-700"
          style={{ left: `${midX}px`, top: `${midY}px`, zIndex: 2 }}
        >
          {edge.weight}
        </div>
      )}
    </div>
  );
});

GraphEdge.displayName = 'GraphEdge';

export default GraphEdge;
