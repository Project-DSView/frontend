'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Announcement } from '@/types';
import AnnouncementCard from './AnnouncementCard';

interface AnnouncementsByWeekProps {
  announcements: Announcement[];
}

const AnnouncementsByWeek: React.FC<AnnouncementsByWeekProps> = ({ announcements }) => {
  // Group announcements by week
  const announcementsByWeek = announcements.reduce((acc, announcement) => {
    const week = announcement.week;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(announcement);
    return acc;
  }, {} as Record<number, Announcement[]>);

  // Sort weeks in descending order (newest first)
  const sortedWeeks = Object.keys(announcementsByWeek)
    .map(Number)
    .sort((a, b) => b - a);

  // Sort announcements within each week (pinned first, then by date)
  const sortAnnouncements = (announcements: Announcement[]) => {
    return announcements.sort((a, b) => {
      // Pinned announcements first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // Then by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  if (sortedWeeks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ยังไม่มีประกาศในคอร์สนี้</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {sortedWeeks.map((week) => {
        const weekAnnouncements = sortAnnouncements(announcementsByWeek[week]);
        const pinnedCount = weekAnnouncements.filter(a => a.is_pinned).length;
        
        return (
          <AccordionItem key={week} value={`week-${week}`}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Week {week}</span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  {weekAnnouncements.length} ประกาศ
                </span>
                {pinnedCount > 0 && (
                  <span className="inline-flex items-center rounded-full border border-orange-300 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                    {pinnedCount} ปักหมุด
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {weekAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.announcement_id}
                    announcement={announcement}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default AnnouncementsByWeek;
