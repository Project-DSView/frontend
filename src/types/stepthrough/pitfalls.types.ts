interface PitfallWarning {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  tip: string;
}

interface CommonError {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  example: string;
  solution: string;
  solutionTh: string;
  severity: 'info' | 'warning' | 'error';
}

export type { PitfallWarning, CommonError };
