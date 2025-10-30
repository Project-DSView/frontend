import { QueueJob, QueueJobStatus } from '../services/queue.types';

// Request approval dialog props
export interface RequestApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { lab_room: string; table_number: string; notes?: string }) => void;
  isLoading?: boolean;
}

// Queue status card props
export interface QueueStatusCardProps {
  queueJob?: QueueJob | null;
  status?: QueueJobStatus;
  labRoom?: string;
  tableNumber?: string;
  claimedByName?: string;
  reviewComment?: string;
  reviewStatus?: 'approved' | 'rejected';
  reviewedAt?: string;
}

// Approval status badge props
export interface ApprovalStatusBadgeProps {
  status: QueueJobStatus | 'waiting_approval' | 'not_started';
  className?: string;
}

// TA comment card props
export interface TACommentCardProps {
  comment: string;
  status: 'approved' | 'rejected';
  reviewedAt: string;
  reviewedByName: string;
}

// Queue job card props
export interface QueueJobCardProps {
  job: QueueJob;
  onClaim?: (jobId: string) => void;
  onReview?: (jobId: string) => void;
  isClaiming?: boolean;
  isReviewing?: boolean;
  canClaim?: boolean;
  canReview?: boolean;
}

// Queue job list props
export interface QueueJobListProps {
  jobs: QueueJob[];
  isLoading?: boolean;
  onClaim?: (jobId: string) => void;
  onReview?: (jobId: string) => void;
  filters?: {
    status?: QueueJobStatus;
    courseId?: string;
  };
}

// Review dialog props
export interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { status: 'approved' | 'rejected'; comment: string }) => void;
  isLoading?: boolean;
  job?: QueueJob | null;
}









