import React, { memo } from 'react';
import { GraphEdgeProps } from '@/types';

const GraphEdge = memo<GraphEdgeProps>(
  ({ edge, fromNode, toNode, isHighlighted, allEdges = [] }) => {
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

    // Check if there's a reverse edge (for bidirectional arrows)
    const hasReverseEdge = allEdges.some(
      (e) =>
        e.id !== edge.id && // Don't compare with self
        'isDirected' in e &&
        e.isDirected &&
        e.from === edge.to &&
        e.to === edge.from,
    );

    // Arrow properties for directed edges
    const arrowSize = 8;
    const arrowAngle = angle;
    // Position arrow at the end of the line, centered on the line
    const arrowX = endX;
    const arrowY = endY;

    // For bidirectional edges, offset the arrows slightly
    const offsetDistance = hasReverseEdge ? 15 : 0;
    const offsetAngle = angle + 90; // Perpendicular to the edge
    const offsetX = Math.cos((offsetAngle * Math.PI) / 180) * offsetDistance;
    const offsetY = Math.sin((offsetAngle * Math.PI) / 180) * offsetDistance;

    return (
      <div>
        <div
          className="pointer-events-none absolute dark:bg-gray-400"
          style={{
            left: `${startX + offsetX}px`,
            top: `${startY + offsetY}px`,
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
              left: `${arrowX - arrowSize + offsetX}px`,
              top: `${arrowY - arrowSize + offsetY}px`,
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
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-white px-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            style={{ left: `${midX}px`, top: `${midY}px`, zIndex: 2 }}
          >
            {edge.weight}
          </div>
        )}
      </div>
    );
  },
);

GraphEdge.displayName = 'GraphEdge';

export default GraphEdge;
