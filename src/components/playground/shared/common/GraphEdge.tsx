import React, { memo } from 'react';
import { GraphEdgeProps } from '@/types';

const GraphEdge = memo<GraphEdgeProps>(
  ({ edge, fromNode, toNode, isHighlighted, allEdges = [] }) => {
    // ป้องกัน undefined coordinate
    if (
      typeof fromNode.x !== 'number' ||
      typeof fromNode.y !== 'number' ||
      typeof toNode.x !== 'number' ||
      typeof toNode.y !== 'number'
    ) {
      return null;
    }

    const deltaX = toNode.x - fromNode.x;
    const deltaY = toNode.y - fromNode.y;

    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 🔥 กันหาร 0 / NaN
    if (!length || isNaN(length)) return null;

    const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    const nodeRadius = 24;

    const startX = fromNode.x + (deltaX / length) * nodeRadius;
    const startY = fromNode.y + (deltaY / length) * nodeRadius;
    const endX = toNode.x - (deltaX / length) * nodeRadius;
    const endY = toNode.y - (deltaY / length) * nodeRadius;

    const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

    if (!lineLength || isNaN(lineLength)) return null;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const isDirected = 'isDirected' in edge && edge.isDirected;

    const hasReverseEdge = allEdges.some(
      (e) =>
        e.id !== edge.id &&
        'isDirected' in e &&
        e.isDirected &&
        e.from === edge.to &&
        e.to === edge.from,
    );

    const arrowSize = 8;
    const arrowAngle = angle;

    const arrowX = endX;
    const arrowY = endY;

    const offsetDistance = hasReverseEdge ? 15 : 0;
    const offsetAngle = angle + 90;
    const offsetX = Math.cos((offsetAngle * Math.PI) / 180) * offsetDistance;
    const offsetY = Math.sin((offsetAngle * Math.PI) / 180) * offsetDistance;

    return (
      <div>
        {/* เส้น */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${startX + offsetX}px`,
            top: `${startY + offsetY}px`,
            width: `${Math.max(lineLength, 2)}px`,
            height: '2px',
            backgroundColor: isHighlighted ? '#f59e0b' : '#374151',
            transformOrigin: '0 50%',
            transform: `rotate(${angle}deg)`,
            zIndex: 1,
          }}
        />

        {/* Arrow สำหรับ directed */}
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

        {/* น้ำหนักเส้น */}
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