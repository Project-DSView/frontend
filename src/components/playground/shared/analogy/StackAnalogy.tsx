import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StackAnalogy = ({ elements }: { elements: string[] }) => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center text-center">
        <h3 className="mb-8 text-xl font-bold text-gray-700 dark:text-gray-200">
          Stack = กองจาน 🍽️
        </h3>
      </div>

      <div className="flex min-h-[300px] flex-col items-center justify-end pb-10">
        {/* The Stack */}
        <div className="ทะ relative flex flex-col items-center">
          <AnimatePresence>
            {elements.map((element, index) => (
              <motion.div
                key={`${index}-${element}`}
                initial={{ opacity: 0, y: -100, scale: 1.1 }} // Drop from top
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }} // Lift up to remove
                transition={{ duration: 0.5, type: 'spring', damping: 12 }}
                className="relative z-10 -mb-2" // Negative margin to stack them visually like plates
                style={{ zIndex: index }}
              >
                {/* Plate Visual */}
                <div className="relative mb-3 flex h-10 w-48 items-center justify-center">
                  {/* Plate Side View */}
                  <div
                    className={`absolute bottom-0 h-4 w-full rounded-b-xl border-r-2 border-b-2 border-l-2 ${index % 3 === 0 ? 'border-blue-300 bg-blue-100' : index % 3 === 1 ? 'border-purple-300 bg-purple-100' : 'border-pink-300 bg-pink-100'} `}
                  ></div>
                  {/* Plate Top Rim (Elliptical look) */}
                  <div
                    className={`absolute top-0 h-8 w-full rounded-[100%] border-2 ${index % 3 === 0 ? 'border-blue-400 bg-blue-200' : index % 3 === 1 ? 'border-purple-400 bg-purple-200' : 'border-pink-400 bg-pink-200'} flex items-center justify-center shadow-sm`}
                  >
                    <span className="mt-1 text-xs font-bold text-gray-700">{element}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Table/Base */}
          <div className="relative z-0 flex flex-col items-center">
            <div className="h-4 w-60 rounded-lg bg-amber-800 shadow-lg"></div>
            <div className="-mt-1 h-20 w-52 rounded-b-lg bg-amber-900/40 backdrop-blur-sm"></div>
            <div className="absolute top-2 text-xs font-bold text-amber-100 opacity-60">
              BASE (Ground)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-lg text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Stack (LIFO) ก็เหมือนกับ <strong>กองจาน</strong> <br />
          เราจะวางจานใบใหม่ซ้อนทับข้างบน (Push) และเวลาจะหยิบใช้ ก็ต้องหยิบจานใบบนสุดออกก่อน (Pop)
          เสมอ
        </p>
      </div>
    </div>
  );
};

export default StackAnalogy;
