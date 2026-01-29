import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TrainEngine = () => (
  <svg
    width="80"
    height="60"
    viewBox="0 0 80 60"
    className="drop-shadow-lg"
    style={{ transform: 'scaleX(-1)' }}
  >
    {/* Body */}
    <path
      d="M10,20 L60,20 L70,30 L70,50 L10,50 Z"
      fill="#EF4444"
      stroke="#991B1B"
      strokeWidth="2"
    />
    {/* Roof/Cabin */}
    <rect x="40" y="5" width="25" height="15" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
    <rect x="45" y="8" width="15" height="10" fill="#BFDBFE" />
    {/* Chimney */}
    <rect x="15" y="10" width="10" height="10" fill="#374151" />
    <path d="M10,10 L30,10" stroke="#374151" strokeWidth="2" />
    {/* Wheels */}
    <circle cx="20" cy="50" r="8" fill="#374151" stroke="#111827" strokeWidth="2" />
    <circle cx="55" cy="50" r="8" fill="#374151" stroke="#111827" strokeWidth="2" />
  </svg>
);

export const TrainCarriage = ({ value }: { value: string; isLast: boolean }) => (
  <div className="flex items-center">
    {/* Connector */}
    <div className="mx-1 flex h-3 w-8 items-center justify-center rounded-sm bg-gray-600">
      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
    </div>

    {/* Carriage Body */}
    <div className="relative flex flex-col items-center">
      <svg width="80" height="60" viewBox="0 0 80 60" className="drop-shadow-md">
        {/* Main Body */}
        <rect
          x="5"
          y="15"
          width="70"
          height="35"
          rx="4"
          fill="#3B82F6"
          stroke="#1D4ED8"
          strokeWidth="2"
        />
        {/* Windows */}
        <rect x="15" y="20" width="15" height="12" fill="#BFDBFE" />
        <rect x="50" y="20" width="15" height="12" fill="#BFDBFE" />
        {/* Wheels */}
        <circle cx="20" cy="50" r="7" fill="#374151" stroke="#111827" strokeWidth="2" />
        <circle cx="60" cy="50" r="7" fill="#374151" stroke="#111827" strokeWidth="2" />
        {/* Roof details */}
        <line x1="5" y1="15" x2="75" y2="15" stroke="#1E3A8A" strokeWidth="3" />
      </svg>

      {/* Value Label */}
      <div className="absolute top-[28px] left-0 w-full text-center">
        <span className="rounded bg-white/90 px-1 py-0.5 text-xs font-bold text-gray-800 shadow-sm">
          {value}
        </span>
      </div>
    </div>
  </div>
);

const LinkedListAnalogy = ({
  nodes,
  isVisible = true,
}: {
  nodes: string[];
  isVisible?: boolean;
}) => {
  if (!isVisible) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">Empty Singly Linked List</p>
          <p className="mt-1 text-sm">Run your code to see Singly Linked List visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center text-center">
        <h3 className="mb-8 text-xl font-bold text-gray-700 dark:text-gray-200">
          Linked List = ขบวนรถไฟ
        </h3>
      </div>

      <div className="flex items-end px-10 pt-10 pb-4">
        <div className="flex items-end">
          {/* Engine (Head) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 rounded-md border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
              HEAD
            </div>
            <TrainEngine />
          </div>

          {/* Carriages (Nodes) */}
          <AnimatePresence>
            {nodes.map((node, index) => (
              <motion.div
                key={`${index}-${node}`}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="flex items-end"
              >
                <TrainCarriage value={node} isLast={index === nodes.length - 1} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Null (End of track) */}
          <div className="ml-2 flex items-center opacity-50">
            <div className="h-1 w-6 bg-gray-400"></div>
            <div className="flex h-12 w-2 flex-col justify-between rounded-sm bg-gray-700">
              <div className="h-1 w-full bg-red-500"></div>
              <div className="h-1 w-full bg-white"></div>
              <div className="h-1 w-full bg-red-500"></div>
            </div>
            <span className="ml-2 font-mono text-xs text-gray-500">NULL</span>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-lg text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          ใน Linked List, <strong>Head</strong> ก็เหมือนกับหัวรถจักรที่จะลากขบวนรถไฟไป <br />
          <strong>Node</strong> แต่ละตัวก็คือตู้รถไฟที่เก็บข้อมูลเอาไว้ และมีตัวเชื่อม (Next
          Pointer) เพื่อเกี่ยวดึงตู้ถัดไป
        </p>
      </div>
    </div>
  );
};

export default LinkedListAnalogy;
