interface QueueData {
  elements: string[];
  count: number;
}

interface QueueStats {
  size: number;
  isEmpty: boolean;
  front: string | null;
  back: string | null;
}

export type {
  QueueData,
  QueueStats,
};

