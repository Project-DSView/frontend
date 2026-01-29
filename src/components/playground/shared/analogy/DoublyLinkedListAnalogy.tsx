import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainEngine } from './SinglyLinkedListAnalogy';

const DoublyTrainCarriage = ({ value }: { value: string }) => (
  <div className="flex items-center">
    {/* Connector (Prev) - Left Side */}
    <div className="z-0 -mr-1 flex h-3 w-6 items-center justify-center rounded-l-sm bg-gray-600">
      <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
    </div>

    {/* Carriage Body */}
    <div className="relative z-10 flex flex-col items-center">
      <svg width="90" height="60" viewBox="0 0 90 60" className="drop-shadow-md">
        {/* Main Body - Different color for doubly (Purple/Indigo) */}
        <rect
          x="5"
          y="15"
          width="80"
          height="35"
          rx="4"
          fill="#8B5CF6"
          stroke="#5B21B6"
          strokeWidth="2"
        />
        {/* Windows */}
        <rect x="15" y="20" width="15" height="12" fill="#DDD6FE" />
        <rect x="60" y="20" width="15" height="12" fill="#DDD6FE" />
        {/* Wheels */}
        <circle cx="20" cy="50" r="7" fill="#374151" stroke="#111827" strokeWidth="2" />
        <circle cx="70" cy="50" r="7" fill="#374151" stroke="#111827" strokeWidth="2" />
        {/* Roof details */}
        <line x1="5" y1="15" x2="85" y2="15" stroke="#4C1D95" strokeWidth="3" />

        {/* Arrows for Prev/Next inside visualization */}
        {/* Next Arrow (Right) */}
        <path
          d="M70 30 L80 30 L77 27 M80 30 L77 33"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        {/* Prev Arrow (Left) */}
        <path
          d="M20 30 L10 30 L13 27 M10 30 L13 33"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Value Label */}
      <div className="absolute top-[28px] left-0 w-full text-center">
        <span className="rounded bg-white/90 px-1 py-0.5 text-xs font-bold text-gray-800 shadow-sm">
          {value}
        </span>
      </div>
    </div>

    {/* Connector (Next) - Right Side */}
    <div className="z-0 -ml-1 flex h-3 w-6 items-center justify-center rounded-r-sm bg-gray-600">
      <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
    </div>
  </div>
);

const DoublyLinkedListAnalogy = ({
  nodes,
  isVisible = true,
}: {
  nodes: string[];
  isVisible?: boolean;
}) => {
  if (!isVisible) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 text-gray-400">
        <div className="text-3xl opacity-50">🚂 ↔️ 🚂</div>
        <p>Run your code to see the analogy</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center text-center">
        <h3 className="mb-8 text-xl font-bold text-gray-700 dark:text-gray-200">
          Doubly Linked List = ขบวนรถไฟไป-กลับ
        </h3>
      </div>

      <div className="flex items-end px-10 pt-10 pb-4">
        <div className="flex items-end gap-1">
          {/* Head Label */}
          <div className="relative z-10 mr-2 flex flex-col items-center">
            <div className="mb-2 rounded-md border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-800">
              HEAD
            </div>
            {/* Use same engine but maybe different color or just same */}
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
                <DoublyTrainCarriage value={node} />
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
          ใน <strong>Doubly Linked List</strong> ตู้รถไฟเชื่อมกันแน่นหนากว่าเดิม! <br />
          นอกจากดึงตู้ถัดไปได้แล้ว (Next) ยังสามารถหันกลับไปหาตู้ก่อนหน้า (Prev) ได้ด้วย <br />
          ทำให้เราสามารถเดินตรวจตู้รถไฟได้ทั้งจากหัวไปท้าย และท้ายมาหัว
        </p>
      </div>
    </div>
  );
};

export default DoublyLinkedListAnalogy;
