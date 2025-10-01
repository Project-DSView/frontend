import React, { memo, useMemo, useCallback } from 'react';
import { VisualizationProps } from '@/types';
import VirtualizedList from './VirtualizedList';

// Memoized node component to prevent unnecessary re-renders
const NodeItem = memo<{ value: string; index: number; isRunning: boolean }>(
  ({ value, index, isRunning }) => (
    <div className="flex items-center">
      <div
        className={`max-w-[200px] min-w-[120px] rounded-lg border-2 border-black bg-white p-3 text-center font-bold transition-all duration-500 ${
          isRunning ? 'animate-bounce' : 'hover:bg-gray-50'
        }`}
      >
        <div
          className={`break-words text-black ${
            value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-base'
          }`}
        >
          {value}
        </div>
        <div className="text-xs text-gray-500">Node {index + 1}</div>
      </div>
    </div>
  ),
);

NodeItem.displayName = 'NodeItem';

const Visualization: React.FC<VisualizationProps> = ({
  nodes,
  stats,
  isRunning = false,
  title = 'Data Structure Visualization',
  renderNode,
}) => {
  // Memoize the default render function
  const defaultRenderNode = useCallback(
    (value: string, index: number) => (
      <NodeItem value={value} index={index} isRunning={isRunning} />
    ),
    [isRunning],
  );

  // Memoize the nodes list to prevent unnecessary re-renders
  const memoizedNodes = useMemo(() => nodes, [nodes]);

  // Use virtualization for large lists (more than 50 items)
  const shouldUseVirtualization = memoizedNodes.length > 50;

  // Memoize the render function for virtualization
  const renderVirtualizedItem = useCallback(
    (value: string, index: number) => (
      <div className="flex items-center">
        {renderNode ? renderNode(value, index) : defaultRenderNode(value, index)}
        {index < memoizedNodes.length - 1 && (
          <div className="mx-3 text-xl font-bold text-black">→</div>
        )}
      </div>
    ),
    [renderNode, defaultRenderNode, memoizedNodes.length],
  );

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex min-h-[80px] items-center space-x-4 rounded-lg bg-gray-50 p-4">
        {memoizedNodes.length === 0 ? (
          <div className="text-gray-400 italic">Empty data structure</div>
        ) : shouldUseVirtualization ? (
          <div className="flex w-full items-center">
            <div className="text-sm font-semibold text-gray-600">HEAD →</div>
            <VirtualizedList
              items={memoizedNodes}
              itemHeight={60}
              containerHeight={80}
              renderItem={renderVirtualizedItem}
              keyExtractor={(_, index) => index}
              className="flex-1"
            />
            <div className="mx-3 text-xl font-bold text-black">→ NULL</div>
          </div>
        ) : (
          <>
            <div className="text-sm font-semibold text-gray-600">HEAD →</div>
            {memoizedNodes.map((value, index) => (
              <React.Fragment key={index}>
                {renderNode ? renderNode(value, index) : defaultRenderNode(value, index)}
                {index < memoizedNodes.length - 1 && (
                  <div className="mx-3 text-xl font-bold text-black">→</div>
                )}
              </React.Fragment>
            ))}
            <div className="mx-3 text-xl font-bold text-black">→ NULL</div>
          </>
        )}
      </div>

      {/* Stats */}
      <section className="mt-4 flex space-x-6 text-sm text-gray-600">
        <div>
          <span className="font-semibold">จำนวน Nodes:</span> {stats.length}
        </div>
        <div>
          <span className="font-semibold">Head Value:</span> {stats.headValue || 'None'}
        </div>
        <div>
          <span className="font-semibold">Tail Value:</span> {stats.tailValue || 'None'}
        </div>
      </section>
    </div>
  );
};

export default memo(Visualization);
