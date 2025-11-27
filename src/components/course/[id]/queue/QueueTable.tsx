'use client';

import React, { useState } from 'react';
import { Loader2, Clock, User, CheckCircle, XCircle, RefreshCw, Award } from 'lucide-react';
import { toast } from 'sonner';

import { formatDate } from '@/lib';
import { QueueJobStatus, QueueTableProps } from '@/types';
import { useClaimQueueJob } from '@/query';
import { QUEUE_STATUS_LABELS, QUEUE_STATUS_COLORS } from '@/data';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ReviewScoreDialog from '../ReviewScoreDialog';

const QueueTable: React.FC<QueueTableProps> = ({
  jobs,
  isLoading = false,
  canManage = false,
  token,
  onRefresh,
  showRefreshButton = true,
  queuePositionMap,
}) => {
  const claimQueueJobMutation = useClaimQueueJob();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClaimJob = async (jobId: string) => {
    if (!token) {
      toast.error('ไม่พบ access token');
      return;
    }

    try {
      await claimQueueJobMutation.mutateAsync({ token, jobId });
      toast.success('รับงานสำเร็จ');
      onRefresh?.();
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'เกิดข้อผิดพลาดในการรับงาน';
      toast.error(errorMessage);
    }
  };

  const handleOpenGradeModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
  };

  const handleGradeSuccess = () => {
    onRefresh?.();
  };

  const getStatusIcon = (status: QueueJobStatus) => {
    switch (status) {
      case 'pending':
      case 'waiting_approval':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <User className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: QueueJobStatus, reviewStatus?: string) => {
    // If status is completed and review_status is rejected, show "ไม่ผ่าน" (red)
    if (status === 'completed' && reviewStatus === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800" variant="outline">
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            ไม่ผ่าน
          </span>
        </Badge>
      );
    }

    const color = QUEUE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
    const label = QUEUE_STATUS_LABELS[status] || status;

    return (
      <Badge className={color} variant="outline">
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {label}
        </span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>กำลังโหลดข้อมูลคิว...</span>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-gray-500">ไม่มีงานในคิว</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            รีเฟรช
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showRefreshButton && onRefresh && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            รีเฟรช
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ลำดับ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>ผู้ส่ง</TableHead>
              <TableHead>เนื้อหา</TableHead>
              <TableHead>ห้อง/โต๊ะ</TableHead>
              <TableHead>วันที่ส่ง</TableHead>
              {canManage && <TableHead>การจัดการ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job, index) => {
              const userName = job.user
                ? `${job.user.firstname} ${job.user.lastname}`.trim()
                : 'ไม่ระบุ';
              const materialTitle = job.course_material?.title || 'ไม่ระบุ';
              const labInfo =
                job.lab_room && job.table_number
                  ? `${job.lab_room} / ${job.table_number}`
                  : job.lab_room || job.table_number || '-';
              const canClaim =
                canManage && (job.status === 'pending' || job.status === 'waiting_approval');
              const isClaiming = claimQueueJobMutation.isPending;

              // Get queue position from map, fallback to index + 1 if not available
              const queuePosition = queuePositionMap?.get(job.id) ?? index + 1;

              return (
                <TableRow key={job.id}>
                  <TableCell className="text-center font-medium">{queuePosition}</TableCell>
                  <TableCell>{getStatusBadge(job.status, job.review_status)}</TableCell>
                  <TableCell>{userName}</TableCell>
                  <TableCell className="max-w-xs truncate" title={materialTitle}>
                    {materialTitle}
                  </TableCell>
                  <TableCell>{labInfo}</TableCell>
                  <TableCell>{formatDate(job.created_at)}</TableCell>
                  {canManage && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canClaim ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaimJob(job.id)}
                            disabled={isClaiming}
                          >
                            {isClaiming ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังรับ...
                              </>
                            ) : (
                              'รับงาน'
                            )}
                          </Button>
                        ) : job.status === 'processing' && job.processed_by_user ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleOpenGradeModal(job.id)}
                            >
                              <Award className="mr-2 h-4 w-4" />
                              ให้คะแนน
                            </Button>
                            <span className="ml-2 text-sm text-gray-600">
                              ถูกตรวจโดย {job.processed_by_user.firstname}{' '}
                              {job.processed_by_user.lastname}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedJobId && (
        <ReviewScoreDialog
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          jobId={selectedJobId}
          token={token}
          onSuccess={handleGradeSuccess}
        />
      )}
    </div>
  );
};

export default QueueTable;
