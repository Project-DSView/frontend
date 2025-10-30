// Lab room options
export const LAB_ROOMS = ['Lab A', 'Lab B', 'Lab C', 'Lab D', 'Lab E', 'Lab F'];

// Table number options (A01-A20, B01-B20, etc.)
export const TABLE_NUMBERS = [
  ...Array.from({ length: 20 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 20 }, (_, i) => `B${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 20 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 20 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`),
];

// Queue status labels in Thai
export const QUEUE_STATUS_LABELS: Record<string, string> = {
  pending: 'รอการตรวจ',
  processing: 'กำลังตรวจ',
  completed: 'ตรวจเสร็จ',
  failed: 'ล้มเหลว',
  cancelled: 'ยกเลิก',
  waiting_approval: 'รอการตรวจ',
  not_started: 'ยังไม่เริ่ม',
};

// Queue status colors
export const QUEUE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  waiting_approval: 'bg-yellow-100 text-yellow-800',
  not_started: 'bg-gray-100 text-gray-800',
};









