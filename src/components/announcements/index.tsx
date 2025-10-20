'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertCircle } from 'lucide-react';
import { LatestAnnouncementProps } from '@/types';
import { formatDateShort } from '@/lib';

const LatestAnnouncement: React.FC<LatestAnnouncementProps> = ({ announcements }) => {
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
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            ประกาศล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-gray-500">ยังไม่มีประกาศในคอร์สนี้</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            ประกาศล่าสุด
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{latestAnnouncement.title}</h3>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDateShort(latestAnnouncement.created_at)}
            </div>
          </div>

          <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
            {latestAnnouncement.content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestAnnouncement;
