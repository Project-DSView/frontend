import React, { forwardRef, useMemo } from 'react';

import { DoublyLinkedListRealtimeProps, RealtimeDoublyLinkedListNode } from '@/types';

import ZoomableContainer from '../../shared/ZoomableContainer';

const DoublyLinkedListRealtime = forwardRef<HTMLDivElement, DoublyLinkedListRealtimeProps>(
  ({ data }, ref) => {
    // Get nodes as array for rendering
    const nodes = useMemo(() => {
      if (!data.head) return [];

      const nodeArray: string[] = [];
      let current: RealtimeDoublyLinkedListNode | null = data.head;

      while (current) {
        nodeArray.push(current.value);
        current = current.next;
      }

      return nodeArray;
    }, [data.head]);

    const renderDoublyLinkedListNode = (value: string, index: number) => {
      const isFirstNode = index === 0;
      const isLastNode = index === nodes.length - 1;

      return (
        <div className="flex items-center">
          {/* Node Container - 3 Section Layout like in dragdrop */}
          <div className="flex h-16 w-40 rounded-lg border-2 border-black bg-white transition-all duration-300 hover:bg-gray-50">
            {/* Prev Section - Left */}
            <div className="flex w-1/3 items-center justify-center rounded-l-lg bg-gray-100">
              {isFirstNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-8 rotate-45 transform bg-black"></div>
                    <div className="absolute h-0.5 w-8 -rotate-45 transform bg-black"></div>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-black">Prev</span>
              )}
            </div>

            {/* Data Section - Center */}
            <div className="flex w-1/3 items-center justify-center border-x border-x-2 border-black bg-gray-100">
              <span className={`font-bold text-black ${value.length > 6 ? 'text-sm' : 'text-lg'}`}>
                {value}
              </span>
            </div>

            {/* Next Section - Right */}
            <div className="flex w-1/3 items-center justify-center rounded-r-lg bg-gray-100">
              {isLastNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-8 rotate-45 transform bg-black"></div>
                    <div className="absolute h-0.5 w-8 -rotate-45 transform bg-black"></div>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-black">Next</span>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow">
        {/* Doubly Linked List Visualization */}
        <ZoomableContainer
          className="min-h-[300px] rounded-lg bg-gray-50"
          minZoom={0.5}
          maxZoom={2}
          initialZoom={1}
          enablePan={true}
          enableWheelZoom={true}
          enableKeyboardZoom={true}
          showControls={true}
        >
          {nodes.length === 0 ? (
            <div className="p-6 text-gray-400 italic">Empty doubly linked list</div>
          ) : (
            <div className="flex w-full items-center justify-center space-x-2 p-6 pt-20">
              {/* Nodes with Head and Tail Pointers */}
              {nodes.map((value, index) => (
                <React.Fragment key={index}>
                  <div className="relative">
                    {/* Head Label - Always show on first node */}
                    {index === 0 && (
                      <div
                        className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform"
                        style={{
                          left: nodes.length === 1 ? '25%' : '50%',
                        }}
                      >
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600">head</div>
                        <div className="flex flex-col items-center">
                          <div className="h-4 w-0.5 bg-black"></div>
                          <div className="h-0 w-0 border-t-[6px] border-r-[4px] border-l-[4px] border-t-black border-r-transparent border-l-transparent"></div>
                        </div>
                      </div>
                    )}

                    {/* Tail Label - Always show on last node */}
                    {index === nodes.length - 1 && (
                      <div
                        className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform"
                        style={{
                          left: nodes.length === 1 ? '75%' : '50%',
                        }}
                      >
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600">tail</div>
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
                      <svg width="80" height="40" viewBox="0 0 80 40">
                        <rect width="80" height="40" fill="#ffffff" />
                        <defs>
                          <marker
                            id="arrowRight"
                            markerWidth="8"
                            markerHeight="8"
                            refX="6"
                            refY="4"
                            orient="auto"
                          >
                            <path d="M0,0 L8,4 L0,8 Z" fill="#000000" />
                          </marker>
                          <marker
                            id="arrowLeft"
                            markerWidth="8"
                            markerHeight="8"
                            refX="2"
                            refY="4"
                            orient="auto"
                          >
                            <path d="M0,0 L6,4 L0,8 Z" fill="#000000" />
                          </marker>
                        </defs>
                        {/* forward (right) */}
                        <line
                          x1="8"
                          y1="12"
                          x2="72"
                          y2="12"
                          stroke="#000000"
                          strokeWidth="2"
                          markerEnd="url(#arrowRight)"
                        />
                        {/* backward (left) */}
                        <line
                          x1="72"
                          y1="28"
                          x2="8"
                          y2="28"
                          stroke="#000000"
                          strokeWidth="2"
                          markerEnd="url(#arrowLeft)"
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </ZoomableContainer>

        {/* Stats */}
        <div className="mt-4 flex space-x-6 text-sm text-gray-600">
          <div>
            <span className="font-semibold">จำนวน Nodes:</span> {data.count}
          </div>
          <div>
            <span className="font-semibold">Head Value:</span> {data.head?.value || 'None'}
          </div>
          <div>
            <span className="font-semibold">Tail Value:</span> {data.tail?.value || 'None'}
          </div>
        </div>
      </div>
    );
  },
);

DoublyLinkedListRealtime.displayName = 'DoublyLinkedListRealtime';

export default DoublyLinkedListRealtime;
