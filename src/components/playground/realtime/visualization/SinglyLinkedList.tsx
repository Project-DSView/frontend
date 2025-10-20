import React, { forwardRef, useMemo } from 'react';

import { SinglyLinkedListRealtimeProps, RealtimeSinglyLinkedListNode } from '@/types';

import ZoomableContainer from '../../shared/ZoomableContainer';

const SinglyLinkedListRealtime = forwardRef<HTMLDivElement, SinglyLinkedListRealtimeProps>(
  ({ data }, ref) => {
    // Get nodes as array for rendering
    const nodes = useMemo(() => {
      if (!data.head) return [];

      const nodeArray: string[] = [];
      let current: RealtimeSinglyLinkedListNode | null = data.head;

      while (current) {
        nodeArray.push(current.value);
        current = current.next;
      }

      return nodeArray;
    }, [data.head]);

    const renderSinglyLinkedListNode = (value: string, index: number) => {
      const isLastNode = index === nodes.length - 1;

      return (
        <div className="flex items-center">
          {/* Node Container - Horizontal Layout */}
          <div className="max-w-[250px] min-w-[160px] rounded-lg border-2 border-black bg-white p-3 text-center font-bold transition-all duration-300 hover:bg-gray-50">
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
            <div className="flex inline-block w-1/2 items-center justify-center pl-2">
              {isLastNode ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="mb-2 h-0.5 w-8 rotate-45 transform bg-black"></div>
                    <div className="absolute mb-2 h-0.5 w-8 -rotate-45 transform bg-black"></div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600">next</div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className="rounded-lg bg-white p-6 shadow">
        {/* Linked List Visualization */}
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
            <div className="p-6 text-gray-400 italic">Empty linked list</div>
          ) : (
            <div className="flex w-full items-center justify-center space-x-2 p-6 pt-20">
              {/* Nodes with Head Pointer */}
              {nodes.map((value, index) => (
                <React.Fragment key={index}>
                  <div className="relative">
                    {/* Head Label - Always show on first node */}
                    {index === 0 && (
                      <div className="absolute -top-16 left-1/2 z-10 -translate-x-1/2 transform">
                        <div className="px-2 py-1 text-lg font-semibold text-gray-600">head</div>
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

SinglyLinkedListRealtime.displayName = 'SinglyLinkedListRealtime';

export default SinglyLinkedListRealtime;
