import React from 'react';
import { VisualizationProps } from '@/types';

const Visualization: React.FC<VisualizationProps> = ({
  nodes,
  stats,
  isRunning = false,
  title = 'Data Structure Visualization',
  renderNode,
}) => {
  const defaultRenderNode = (value: string, index: number) => (
    <div className="flex items-center">
      <div
        className={`min-w-[120px] max-w-[200px] rounded-lg border-2 border-black bg-white p-3 text-center font-bold transition-all duration-500 ${
          isRunning ? 'animate-bounce' : 'hover:bg-gray-50'
        }`}
      >
        <div className={`text-black break-words ${
          value.length > 15 ? 'text-xs' : 
          value.length > 8 ? 'text-sm' : 
          'text-base'
        }`}>{value}</div>
        <div className="text-xs text-gray-500">Node {index + 1}</div>
      </div>
    </div>
  );

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex min-h-[80px] items-center space-x-4 rounded-lg bg-gray-50 p-4">
        {nodes.length === 0 ? (
          <div className="text-gray-400 italic">Empty data structure</div>
        ) : (
          <>
            <div className="text-sm font-semibold text-gray-600">HEAD →</div>
            {nodes.map((value, index) => (
              <React.Fragment key={index}>
                {renderNode ? renderNode(value, index) : defaultRenderNode(value, index)}
                {index < nodes.length - 1 && (
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

export default Visualization
