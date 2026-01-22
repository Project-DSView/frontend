import React from 'react';

interface MemoryAddressProps {
  address: string;
  isVisible: boolean;
  className?: string;
}

/**
 * MemoryAddress Component
 * แสดง memory address จำลอง (เช่น 0x001, 0x002) ใต้แต่ละ node
 * ช่วยให้เข้าใจว่า pointer คือการเก็บ "ที่อยู่" ของ node ไม่ใช่ตัว node เอง
 */
const MemoryAddress: React.FC<MemoryAddressProps> = ({ address, isVisible, className = '' }) => {
  if (!isVisible) return null;

  return (
    <div
      className={`mt-1 text-center font-mono text-xs text-gray-400 transition-opacity duration-300 dark:text-gray-500 ${className}`}
    >
      <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700">{address}</span>
    </div>
  );
};

/**
 * Utility function to generate a simulated memory address
 * @param index - Node index (0-based)
 * @param baseAddress - Starting address (default: 0x100)
 * @returns Formatted hex address string
 */
export const generateMemoryAddress = (index: number, baseAddress: number = 0x100): string => {
  const address = baseAddress + index * 8; // Each node is 8 bytes apart
  return `0x${address.toString(16).toUpperCase().padStart(3, '0')}`;
};

export default MemoryAddress;
