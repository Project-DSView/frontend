import { SubmissionStatus, SubmissionStatusConfig } from '@/types';

const SUBMISSION_STATUS_CONFIG: Record<SubmissionStatus, SubmissionStatusConfig> = {
  pending: {
    label: 'รอตรวจ',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  running: {
    label: 'กำลังตรวจ',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  completed: {
    label: 'ผ่านแล้ว',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  error: {
    label: 'ไม่ผ่าน',
    color: 'text-error',
    bgColor: 'bg-error',
  },
};

export { SUBMISSION_STATUS_CONFIG };
