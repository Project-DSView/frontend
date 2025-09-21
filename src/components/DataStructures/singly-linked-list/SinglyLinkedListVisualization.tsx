import React from 'react';
import { SinglyLinkedListVisualizationProps } from '@/types';

const SinglyLinkedListVisualization: React.FC<SinglyLinkedListVisualizationProps> = ({
  nodes,
  stats,
  isRunning = false,
  currentOperation,
  currentStep,
  currentPosition = 0,
}) => {
  // Determine which node should be animated based on current operation
  const getAnimatedNodeIndex = () => {
    if (!isRunning || !currentStep) return -1;

    // For traversal operations, animate the current node being visited
    if (currentOperation === 'traverse') {
      if (currentStep.includes('อ่านค่า') || currentStep.includes('current.data')) {
        const match = currentStep.match(/ค่า (.+)/);
        if (match) {
          const value = match[1];
          return nodes.indexOf(value);
        }
      }
    }

    // For search operations, animate the current node being checked
    if (currentOperation === 'search_value' || currentOperation === 'search_position') {
      if (currentStep.includes('ตรวจสอบ') || currentStep.includes('current.data')) {
        const match = currentStep.match(/ค่า (.+)/);
        if (match) {
          const value = match[1];
          return nodes.indexOf(value);
        }
      }
    }

    // For insert operations, animate the head node
    if (currentOperation === 'insert_beginning') {
      return 0; // Always animate head for insert at beginning
    }

    // For delete operations, animate the node being deleted
    if (currentOperation === 'delete_beginning') {
      return 0; // Animate head for delete from beginning
    }

    return -1;
  };

  // Get current position for head pointer animation
  const getCurrentPosition = () => {
    if (!isRunning || !currentStep) return 0;

    // For traversal operations, use currentPosition from hook
    if (currentOperation === 'traverse') {
      return currentPosition;
    }

    // For search operations, move head to current position
    if (currentOperation === 'search_value' || currentOperation === 'search_position') {
      if (currentStep.includes('ตรวจสอบ') || currentStep.includes('current.data')) {
        const match = currentStep.match(/ค่า (.+)/);
        if (match) {
          const value = match[1];
          const index = nodes.indexOf(value);
          return index >= 0 ? index : 0;
        }
      }
    }

    return 0; // Default to first position
  };

  const animatedNodeIndex = getAnimatedNodeIndex();
  const headPosition = getCurrentPosition();

  const renderSinglyLinkedListNode = (value: string, index: number) => {
    const isAnimated = animatedNodeIndex === index;

    return (
      <div className="flex items-center">
        {/* Node Container - Horizontal Layout */}
        <div
          className={`max-w-[250px] min-w-[160px] rounded-lg border-2 border-black bg-white p-3 text-center font-bold transition-all duration-500 ${
            isAnimated ? 'border-accent animate-pulse bg-yellow-100' : 'hover:bg-gray-50'
          }`}
        >
          {/* Data Section - Left */}
          <div className="inline-block w-1/2 border-r-2 border-black pr-2">
            <div
              className={`font-bold break-words text-black ${
                value.length > 15 ? 'text-xs' : value.length > 8 ? 'text-sm' : 'text-base'
              }`}
            >
              {value}
            </div>
          </div>
          {/* Pointer Section - Right */}
          <div className="inline-block w-1/2 pl-2">
            <div className="text-xs text-gray-600">next</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Singly Linked List Visualization</h2>

      {/* Linked List Visualization */}
      <div className="relative min-h-[220px] overflow-x-auto rounded-lg bg-gray-50 p-6 pt-20">
        {nodes.length === 0 ? (
          <div className="text-gray-400 italic">Empty linked list</div>
        ) : (
          <div className="flex items-center justify-start space-x-2">
            {/* Nodes with Head Pointer */}
            {nodes.map((value, index) => (
              <React.Fragment key={index}>
                <div className="relative">
                  {/* Head Label - Show on current position for traverse, first node for others */}
                  {((currentOperation === 'traverse' && index === headPosition) ||
                    (currentOperation !== 'traverse' && index === 0)) && (
                    <div
                      className={`absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform transition-all duration-500 ${
                        isRunning &&
                        (currentOperation === 'traverse' ||
                          currentOperation === 'search_value' ||
                          currentOperation === 'search_position')
                          ? 'animate-pulse'
                          : ''
                      }`}
                    >
                      <div
                        className={`px-2 py-1 text-lg font-semibold ${
                          isRunning &&
                          (currentOperation === 'traverse' ||
                            currentOperation === 'search_value' ||
                            currentOperation === 'search_position')
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        head
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-0.5 bg-black"></div>
                        <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent"></div>
                      </div>
                    </div>
                  )}

                  {/* Node */}
                  {renderSinglyLinkedListNode(value, index)}
                </div>

                {index < nodes.length - 1 && (
                  <div className="mx-2 flex items-center">
                    <div className="h-0.5 w-6 bg-black"></div>
                    <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[8px] border-t-transparent border-b-transparent border-l-black"></div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* NULL Pointer */}
            <div className="ml-3 flex items-center">
              <div className="h-0.5 w-6 bg-black"></div>
              <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[8px] border-t-transparent border-b-transparent border-l-black"></div>
              <div className="ml-2 text-lg font-bold text-black">NULL</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 flex space-x-6 text-sm text-gray-600">
        <div>
          <span className="font-semibold">จำนวน Nodes:</span> {stats.length}
        </div>
        <div>
          <span className="font-semibold">Head Value:</span> {stats.headValue || 'None'}
        </div>
        <div>
          <span className="font-semibold">Tail Value:</span> {stats.tailValue || 'None'}
        </div>
      </div>
    </div>
  );
};

export default SinglyLinkedListVisualization;
