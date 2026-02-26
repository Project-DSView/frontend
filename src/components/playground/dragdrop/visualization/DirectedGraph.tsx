'use client';

import React, { forwardRef, useState, useCallback } from 'react';

import { DirectedGraphVisualizationProps, DirectedGraphNode, DirectedGraphEdge } from '@/types';

import GraphNode from '../../shared/common/GraphNode';
import GraphEdge from '../../shared/common/GraphEdge';
import ZoomableContainer from '../../shared/action/ZoomableContainer';

const DirectedGraphDragDropVisualization = forwardRef<
  HTMLDivElement,
  DirectedGraphVisualizationProps
>(({ nodes = [], edges = [], stats, isRunning }, ref) => {
  /* ================= State ================= */

  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  /* ================= Drag ================= */

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setNodePositions((prev) => ({
      ...prev,
      [draggedNode]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    }));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  /* ================= Render Node ================= */

  const renderNode = useCallback(
    (node: DirectedGraphNode) => {
      const outgoing = Array.isArray(node.outgoingEdges) ? node.outgoingEdges : [];
      const incoming = Array.isArray(node.incomingEdges) ? node.incomingEdges : [];

      return (
        <GraphNode
          key={node.id} // ✅ FIX: key ใช้ id เท่านั้น (ห้ามใช้ value)
          node={{
            ...node,
            neighbors: [...outgoing, ...incoming],
          }}
          position={nodePositions[node.id]}
          isDragging={draggedNode === node.id}
          onMouseDown={handleMouseDown}
          isRunning={isRunning ?? false}
          isHighlighted={false}
          isInSearchPath={false}
          isTraverseSelected={false}
          isCurrentlyTraversing={false}
        />
      );
    },
    [nodePositions, draggedNode, isRunning],
  );

  /* ================= Render Edge ================= */

  const renderEdge = useCallback(
    (edge: DirectedGraphEdge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);

      if (!fromNode || !toNode) return null;

      const fromPos = nodePositions[fromNode.id] ?? {
        x: fromNode.x,
        y: fromNode.y,
      };
      const toPos = nodePositions[toNode.id] ?? {
        x: toNode.x,
        y: toNode.y,
      };

      return (
        <GraphEdge
          key={edge.id}
          edge={edge}
          fromNode={{ ...fromNode, ...fromPos }}
          toNode={{ ...toNode, ...toPos }}
          isHighlighted={false}
        />
      );
    },
    [nodes, nodePositions],
  );

  /* ================= Render ================= */

  return (
    <div
      ref={ref}
      className="rounded-lg bg-white p-6 shadow"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <h2 className="mb-4 text-lg font-semibold"></h2>

      <ZoomableContainer className="min-h-[400px] rounded-lg bg-gray-50" showControls>
        {nodes.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-gray-400">
            Empty Graph
          </div>
        ) : (
          <div className="relative h-full min-h-[400px] w-full">
            {/* Render edges behind nodes */}
            {edges.map(renderEdge)}

            {/* Render nodes */}
            {nodes.map(renderNode)}
          </div>
        )}
      </ZoomableContainer>

      {/* ================= Stats ================= */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xl font-bold">{stats.vertices}</div>
          <div className="text-xs text-gray-500">Vertices</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats.edges}</div>
          <div className="text-xs text-gray-500">Edges</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats.isStronglyConnected ? 'Yes' : 'No'}</div>
          <div className="text-xs text-gray-500">Strongly Connected</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats.hasCycle ? 'Yes' : 'No'}</div>
          <div className="text-xs text-gray-500">Has Cycle</div>
        </div>
      </div>
    </div>
  );
});

DirectedGraphDragDropVisualization.displayName = 'DirectedGraphDragDropVisualization';

export default DirectedGraphDragDropVisualization;
