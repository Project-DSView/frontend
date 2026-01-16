const MEMORY_LIMIT_BYTES = 256 * 1024 * 1024;
const SIGNIFICANT_MEMORY_THRESHOLD = 1024;
const SIGNIFICANT_TIME_THRESHOLD = 0.001;

const formatMemory = (bytes: number): string => {
  const absBytes = Math.abs(bytes);
  const sign = bytes < 0 ? '-' : '';
  if (absBytes === 0) return '0 Bytes';
  if (absBytes < 1024) return `${sign}${absBytes} Bytes`;
  if (absBytes < 1024 * 1024) return `${sign}${(absBytes / 1024).toFixed(1)} KB`;
  return `${sign}${(absBytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatTime = (seconds: number): string => {
  if (seconds === 0) return '0 ms';
  if (seconds < 1) return `${(seconds * 1000).toFixed(3)} ms`;
  return `${seconds.toFixed(3)} s`;
};

const truncateCode = (code: string, maxLen: number = 35): string => {
  if (!code) return '';
  const trimmed = code.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.substring(0, maxLen) + '...';
};

const getTimeLevel = (c: string): { label: string; color: string } => {
  if (c.includes('O(1)') || c.includes('O(log n)'))
    return { label: 'ดีมาก', color: 'text-emerald-600 dark:text-emerald-400' };
  if (c.includes('O(n)') && !c.includes('²') && !c.includes('log'))
    return { label: 'ดี', color: 'text-blue-600 dark:text-blue-400' };
  if (c.includes('O(n log n)'))
    return { label: 'ปานกลาง', color: 'text-amber-600 dark:text-amber-400' };
  if (c.includes('O(n²)')) return { label: 'ช้า', color: 'text-orange-600 dark:text-orange-400' };
  return { label: 'ช้ามาก', color: 'text-red-600 dark:text-red-400' };
};

const getSpaceLevel = (c: string): { label: string; color: string } => {
  if (c.includes('O(1)'))
    return { label: 'ดีมาก', color: 'text-emerald-600 dark:text-emerald-400' };
  if (c.includes('O(log n)')) return { label: 'ดี', color: 'text-blue-600 dark:text-blue-400' };
  if (c.includes('O(n)') && !c.includes('²'))
    return { label: 'ปานกลาง', color: 'text-amber-600 dark:text-amber-400' };
  return { label: 'มาก', color: 'text-orange-600 dark:text-orange-400' };
};

export {
  MEMORY_LIMIT_BYTES,
  SIGNIFICANT_MEMORY_THRESHOLD,
  SIGNIFICANT_TIME_THRESHOLD,
  formatMemory,
  formatTime,
  truncateCode,
  getTimeLevel,
  getSpaceLevel,
};
