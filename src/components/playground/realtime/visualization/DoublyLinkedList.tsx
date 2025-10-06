import React, { forwardRef, useMemo } from 'react';
import { DoublyLinkedListRealtimeProps, RealtimeDoublyLinkedListNode } from '@/types';

const DoublyLinkedListRealtime = forwardRef<HTMLDivElement, DoublyLinkedListRealtimeProps>(
  ({ data, error, securityStatus }, ref) => {
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
        {/* Security Status */}
        {!securityStatus.isSafe && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-red-800">Security Violation</h3>
                <div className="mt-1 text-xs text-red-700">
                  <ul className="list-inside list-disc">
                    {securityStatus.violations.map((violation, index) => (
                      <li key={index}>{violation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-red-800">Error</h3>
                <div className="mt-1 text-xs text-red-700">
                  <p className="font-mono whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doubly Linked List Visualization */}
        <div className="relative min-h-[300px] w-full overflow-x-auto rounded-lg bg-gray-50 p-6 pt-20">
          {nodes.length === 0 ? (
            <div className="text-gray-400 italic">Empty doubly linked list</div>
          ) : (
            <div className="flex w-full items-center justify-center space-x-2">
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
                      <div className="h-0.5 w-6 bg-black"></div>
                      <div className="h-0 w-0 border-t-[4px] border-b-[4px] border-l-[8px] border-t-transparent border-b-transparent border-l-black"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

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
