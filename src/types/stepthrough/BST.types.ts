interface BSTData {
  root: {
    value: string;
    left: BSTData['root'];
    right: BSTData['root'];
    id: string;
    x?: number;
    y?: number;
  } | null;
}

export type { BSTData };
