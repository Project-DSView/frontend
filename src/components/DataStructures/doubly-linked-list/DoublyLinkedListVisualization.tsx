import React, { forwardRef } from 'react';
import { DoublyLinkedListVisualizationProps } from '@/types';

const DoublyLinkedListVisualization = forwardRef<HTMLDivElement, DoublyLinkedListVisualizationProps>(({
  nodes,
  stats,
  isRunning = false,
  currentOperation,
  currentStep,
  currentPosition = 0,
}, ref) => {
  // Determine which node should be animated based on current operation
  const getAnimatedNodeIndex = () => {
    if (!isRunning || !currentStep) return -1;

    // For traversal operations, animate the current node being visited
    if (currentOperation === 'traverse_forward' || currentOperation === 'traverse_backward') {
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

  // Get current position for head/tail pointer animation
  const getCurrentPosition = () => {
    if (!isRunning || !currentStep) return { head: 0, tail: nodes.length - 1 };

    // For traversal operations, use currentPosition from hook
    if (currentOperation === 'traverse_forward') {
      return { head: currentPosition, tail: nodes.length - 1 };
    }

    if (currentOperation === 'traverse_backward') {
      return { head: 0, tail: nodes.length - 1 - currentPosition };
    }

    // For search operations, move head to current position
    if (currentOperation === 'search_value' || currentOperation === 'search_position') {
      if (currentStep.includes('ตรวจสอบ') || currentStep.includes('current.data')) {
        const match = currentStep.match(/ค่า (.+)/);
        if (match) {
          const value = match[1];
          const index = nodes.indexOf(value);
          return { head: index >= 0 ? index : 0, tail: nodes.length - 1 };
        }
      }
    }

    return { head: 0, tail: nodes.length - 1 }; // Default positions
  };

  const animatedNodeIndex = getAnimatedNodeIndex();
  const { head: headPosition, tail: tailPosition } = getCurrentPosition();

  const renderDoublyLinkedListNode = (value: string, index: number): React.ReactNode => {
    const isAnimated = animatedNodeIndex === index;

    return (
      <div className="flex items-center">
        {/* Node Container - 3 Section Layout like in the image */}
        <div
          className={`flex h-16 w-40 rounded-lg border-2 border-black bg-white transition-all duration-500 ${
            isAnimated ? 'border-accent animate-pulse bg-gray-50' : 'hover:bg-gray-50'
          }`}
        >
          {/* Pre Section - Left */}
          <div className="flex w-1/3 items-center justify-center rounded-l-lg bg-gray-100">
            <span className="text-xs font-bold text-black">Pre</span>
          </div>

          {/* Data Section - Center */}
          <div className="flex w-1/3 items-center justify-center border-x border-x-2 border-black bg-gray-100">
            <span className={`font-bold text-black ${value.length > 6 ? 'text-sm' : 'text-lg'}`}>
              {value}
            </span>
          </div>

          {/* Next Section - Right */}
          <div className="flex w-1/3 items-center justify-center rounded-r-lg bg-gray-100">
            <span className="text-xs font-bold text-black">Next</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Doubly Linked List Visualization</h2>

      {/* Linked List Visualization */}
      <div className="relative min-h-[220px] overflow-x-auto rounded-lg bg-gray-50 p-6 pt-20">
        {nodes.length === 0 && !isRunning && !currentStep ? (
          <div className="text-gray-400 italic">Empty doubly linked list</div>
        ) : (
          <div className="flex items-center justify-start space-x-2">
            {/* Nodes with Head/Tail Pointers */}
            {nodes.map((value: string, index: number) => (
              <React.Fragment key={index}>
                <div className="relative">
                  {/* Head Label - Show on current position for traverse, first node for others */}
                  {((currentOperation === 'traverse_forward' && index === headPosition) ||
                    (currentOperation !== 'traverse_forward' && index === 0)) && (
                    <div
                      className={`absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform transition-all duration-500 ${
                        isRunning &&
                        (currentOperation === 'traverse_forward' ||
                          currentOperation === 'search_value' ||
                          currentOperation === 'search_position')
                          ? 'animate-pulse'
                          : ''
                      }`}
                      style={{
                        left: (nodes.length === 1 || (currentOperation === 'traverse_forward' && headPosition === tailPosition)) ? '25%' : '50%',
                      }}
                    >
                      <div
                        className={`px-2 py-1 text-lg font-semibold ${
                          isRunning &&
                          (currentOperation === 'traverse_forward' ||
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

                  {/* Tail Label - Show on last node for traverse_backward, last node for others */}
                  {((currentOperation === 'traverse_backward' && index === tailPosition) ||
                    (currentOperation !== 'traverse_backward' && index === nodes.length - 1)) && (
                    <div
                      className={`absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform transition-all duration-500 ${
                        isRunning && currentOperation === 'traverse_backward' ? 'animate-pulse' : ''
                      }`}
                      style={{
                        left: (nodes.length === 1 || (currentOperation === 'traverse_backward' && headPosition === tailPosition)) ? '75%' : '50%',
                      }}
                    >
                      <div
                        className={`px-2 py-1 text-lg font-semibold ${
                          isRunning && currentOperation === 'traverse_backward'
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        tail
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-0.5 bg-black"></div>
                        <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent"></div>
                      </div>
                    </div>
                  )}

                  {/* Node */}
                  {renderDoublyLinkedListNode(value, index)}
                </div>

                {/* Connections to next node */}
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
});

DoublyLinkedListVisualization.displayName = 'DoublyLinkedListVisualization';

export default DoublyLinkedListVisualization;
