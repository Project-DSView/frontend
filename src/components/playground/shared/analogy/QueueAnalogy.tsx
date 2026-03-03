import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PERSON_COLORS = [
  { shirt: '#3B82F6', shirtDark: '#2563EB', pants: '#1E3A5F' },
  { shirt: '#10B981', shirtDark: '#059669', pants: '#1A3A2A' },
  { shirt: '#F59E0B', shirtDark: '#D97706', pants: '#4A3000' },
  { shirt: '#EC4899', shirtDark: '#DB2777', pants: '#4A1942' },
  { shirt: '#8B5CF6', shirtDark: '#7C3AED', pants: '#2E1065' },
  { shirt: '#06B6D4', shirtDark: '#0891B2', pants: '#164E63' },
];

const PersonSVG = ({ color, value }: { color: typeof PERSON_COLORS[number]; value: string }) => (
  <div className="flex flex-col items-center">
    {/* Name tag above head */}
    <div className="mb-1 rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-bold text-gray-800 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
      {value}
    </div>

    <svg width="52" height="80" viewBox="0 0 52 80" className="drop-shadow-md">
      {/* Head */}
      <circle cx="26" cy="14" r="10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="22" cy="12" r="1.5" fill="#1F2937" />
      <circle cx="30" cy="12" r="1.5" fill="#1F2937" />
      {/* Smile */}
      <path d="M22,17 Q26,21 30,17" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />

      {/* Body / Shirt */}
      <path
        d="M16,24 L14,50 L38,50 L36,24 Q26,28 16,24"
        fill={color.shirt}
        stroke={color.shirtDark}
        strokeWidth="1.5"
      />
      {/* Collar */}
      <path d="M22,24 L26,30 L30,24" fill="white" opacity="0.6" />

      {/* Arms */}
      <rect x="6" y="28" width="8" height="22" rx="4" fill={color.shirt} stroke={color.shirtDark} strokeWidth="1" />
      <rect x="38" y="28" width="8" height="22" rx="4" fill={color.shirt} stroke={color.shirtDark} strokeWidth="1" />

      {/* Hands */}
      <circle cx="10" cy="52" r="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      <circle cx="42" cy="52" r="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />

      {/* Legs */}
      <rect x="16" y="50" width="8" height="22" rx="3" fill={color.pants} stroke="#111827" strokeWidth="1" />
      <rect x="28" y="50" width="8" height="22" rx="3" fill={color.pants} stroke="#111827" strokeWidth="1" />

      {/* Shoes */}
      <ellipse cx="20" cy="74" rx="6" ry="3.5" fill="#374151" />
      <ellipse cx="32" cy="74" rx="6" ry="3.5" fill="#374151" />
    </svg>
  </div>
);

const ServiceCounter = () => (
  <div className="flex flex-col items-center">
    <div className="mb-2 rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold tracking-wide text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
      🏢 SERVICE COUNTER
    </div>
    <svg width="90" height="120" viewBox="0 0 90 120" className="drop-shadow-lg">
      {/* Staff Person (behind counter) */}
      {/* Head */}
      <circle cx="45" cy="22" r="12" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      {/* Hair */}
      <path d="M33,18 Q33,8 45,8 Q57,8 57,18" fill="#4B5563" stroke="#374151" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="41" cy="20" r="1.5" fill="#1F2937" />
      <circle cx="49" cy="20" r="1.5" fill="#1F2937" />
      {/* Smile */}
      <path d="M41,26 Q45,30 49,26" fill="none" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />

      {/* Body / Uniform */}
      <path
        d="M33,34 L30,70 L60,70 L57,34 Q45,38 33,34"
        fill="#059669"
        stroke="#047857"
        strokeWidth="1.5"
      />
      {/* Name badge */}
      <rect x="37" y="42" width="16" height="8" rx="2" fill="white" opacity="0.8" />
      <text x="45" y="49" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#065F46">
        STAFF
      </text>

      {/* Arms */}
      <rect x="22" y="38" width="8" height="20" rx="4" fill="#059669" stroke="#047857" strokeWidth="1" />
      <rect x="60" y="38" width="8" height="20" rx="4" fill="#059669" stroke="#047857" strokeWidth="1" />
      {/* Waving hand (right) */}
      <circle cx="66" cy="36" r="4" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      {/* Left hand */}
      <circle cx="26" cy="60" r="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />

      {/* Counter body */}
      <rect x="5" y="68" width="80" height="36" rx="4" fill="#059669" stroke="#047857" strokeWidth="2" />
      {/* Counter top */}
      <rect x="2" y="64" width="86" height="8" rx="3" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
      {/* Window / Sign */}
      <rect x="20" y="78" width="50" height="18" rx="3" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="1" />
      <text x="45" y="91" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065F46">
        OPEN
      </text>
      {/* Base */}
      <rect x="8" y="102" width="74" height="6" rx="2" fill="#047857" />
    </svg>
  </div>
);

const QueueAnalogy = ({ elements }: { elements: string[] }) => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center justify-center text-center">
        <h3 className="mb-8 text-xl font-bold text-gray-700 dark:text-gray-200">
          Queue = การต่อแถว 🧑‍🤝‍🧑
        </h3>
      </div>

      <div className="flex min-h-[300px] items-end justify-center gap-1 px-4 pb-10">
        {/* Service Counter (left side - where FRONT person goes) */}
        <div className="mr-4 flex flex-col items-center">
          <ServiceCounter />
        </div>

        {/* Arrow pointing to counter */}
        {elements.length > 0 && (
          <div className="mb-8 flex flex-col items-center self-center">
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path
                d="M38,10 L8,10 M14,4 L8,10 L14,16"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Dequeue</span>
          </div>
        )}

        {/* Queue of People */}
        <div className="flex items-end gap-3">
          <AnimatePresence>
            {elements.map((element, index) => {
              const colorIndex = index % PERSON_COLORS.length;
              const isFront = index === 0;
              const isBack = index === elements.length - 1;

              return (
                <motion.div
                  key={`${index}-${element}`}
                  initial={{ opacity: 0, x: 60, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.8 }}
                  transition={{ duration: 0.5, type: 'spring', damping: 14 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Front/Back label */}
                  {isFront && (
                    <div className="absolute -top-6 rounded-full border border-green-400 bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:border-green-600 dark:bg-green-900/40 dark:text-green-300">
                      FRONT
                    </div>
                  )}
                  {isBack && elements.length > 1 && (
                    <div className="absolute -top-6 rounded-full border border-blue-400 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      BACK
                    </div>
                  )}

                  <PersonSVG color={PERSON_COLORS[colorIndex]} value={element} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Enqueue arrow (right side) */}
        {elements.length > 0 && (
          <div className="ml-2 mb-8 flex flex-col items-center self-center">
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path
                d="M2,10 L32,10 M26,4 L32,10 L26,16"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Enqueue</span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">ยังไม่มีคนต่อแถว — ลอง Enqueue เพื่อเพิ่มคนเข้าแถว</p>
        </div>
      )}

      {/* Floor / Ground */}
      <div className="-mt-6 h-2 w-full max-w-xl rounded-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600" />

      <div className="mt-6 max-w-lg text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Queue (FIFO) ก็เหมือนกับ <strong>การต่อคิว</strong> <br />
          คนที่มาต่อแถวก่อน (Enqueue) ก็จะได้รับบริการก่อน (Dequeue)
          — เข้าก่อนออกก่อน เสมอ
        </p>
      </div>
    </div>
  );
};

export default QueueAnalogy;
