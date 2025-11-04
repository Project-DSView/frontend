'use client';

import React from 'react';
import { Clock, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

import { QueueStatusCardProps } from '@/types';
import { QUEUE_STATUS_LABELS, QUEUE_STATUS_COLORS } from '@/lib/constants/queue';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const QueueStatusCard: React.FC<QueueStatusCardProps> = ({
  queueJob,
  status,
  labRoom,
  tableNumber,
  claimedByName,
  reviewComment,
  reviewStatus,
  reviewedAt,
}) => {
  // Determine the current status
  const currentStatus = queueJob?.status || status || 'not_started';

  // Get lab/table info from queueJob or props
  const lab = queueJob?.lab_room || labRoom;
  const table = queueJob?.table_number || tableNumber;
  const claimedBy = queueJob?.user?.name || claimedByName;

  // Don't render if no status or queue job
  if (!currentStatus || currentStatus === 'not_started') {
    return null;
  }

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'pending':
      case 'waiting_approval':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <User className="h-4 w-4" />;
      case 'completed':
        return reviewStatus === 'approved' ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        );
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (currentStatus === 'completed') {
      return reviewStatus === 'approved'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';
    }
    return QUEUE_STATUS_COLORS[currentStatus] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (currentStatus === 'completed') {
      return reviewStatus === 'approved' ? 'ผ่านการตรวจสอบ' : 'ไม่ผ่านการตรวจสอบ';
    }
    return QUEUE_STATUS_LABELS[currentStatus] || currentStatus;
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {getStatusIcon()}
          สถานะการตรวจสอบ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>{getStatusText()}</Badge>
        </div>

        {/* Lab and Table Info */}
        {(lab || table) && (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">ห้อง:</span> {lab || 'ไม่ระบุ'}
            </p>
            <p>
              <span className="font-medium">โต๊ะ:</span> {table || 'ไม่ระบุ'}
            </p>
          </div>
        )}

        {/* Claimed By Info */}
        {claimedBy && currentStatus === 'processing' && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <User className="h-4 w-4" />
            <span>กำลังตรวจโดย: {claimedBy}</span>
          </div>
        )}

        {/* Review Comment */}
        {reviewComment && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4" />
              ความคิดเห็นจากผู้สอน:
            </div>
            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">{reviewComment}</div>
            {reviewedAt && (
              <p className="text-xs text-gray-500">
                ตรวจเมื่อ: {new Date(reviewedAt).toLocaleString('th-TH')}
              </p>
            )}
          </div>
        )}

        {/* Additional Info for Different Statuses */}
        {currentStatus === 'pending' && (
          <p className="text-sm text-yellow-600">กำลังรอผู้สอนรับงานตรวจสอบ</p>
        )}

        {currentStatus === 'processing' && !claimedBy && (
          <p className="text-sm text-blue-600">กำลังรอผู้สอนเริ่มตรวจสอบ</p>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueStatusCard;

