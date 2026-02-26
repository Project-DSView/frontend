'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, Plus } from 'lucide-react';
import { LatestAnnouncementProps } from '@/types';
import { formatDateShort } from '@/lib';

interface LatestAnnouncementWithButtonProps extends LatestAnnouncementProps {
  onAddAnnouncement?: () => void;
  showAddButton?: boolean;
}

const LatestAnnouncement: React.FC<LatestAnnouncementWithButtonProps> = ({
  announcements,
  onAddAnnouncement,
  showAddButton = false,
}) => {
  // หาประกาศที่สำคัญที่สุด (ปักหมุดก่อน แล้วค่อยประกาศล่าสุด)
  const getLatestAnnouncement = () => {
    if (announcements.length === 0) return null;

    // เรียงลำดับ: ปักหมุดก่อน แล้วค่อยตามวันที่ล่าสุด
    const sortedAnnouncements = [...announcements].sort((a, b) => {
      // ปักหมุดก่อน
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      // แล้วค่อยตามวันที่ล่าสุด
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sortedAnnouncements[0];
  };

  const latestAnnouncement = getLatestAnnouncement();

  if (!latestAnnouncement) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-white">ประกาศล่าสุด</span>
            </CardTitle>
            {showAddButton && onAddAnnouncement && (
              <Button
                onClick={onAddAnnouncement}
                size="sm"
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                เพิ่มประกาศ
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">
            ยังไม่มีประกาศในคอร์สนี้
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-900 dark:text-white">ประกาศล่าสุด</span>
          </CardTitle>
          {showAddButton && onAddAnnouncement && (
            <Button
              onClick={onAddAnnouncement}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              เพิ่มประกาศ
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {latestAnnouncement.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDateShort(latestAnnouncement.created_at)}
            </div>
          </div>

          <p className="leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {latestAnnouncement.content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestAnnouncement;
