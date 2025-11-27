'use client';

import React from 'react';

import { MaterialsByWeekProps, Material } from '@/types';
import { isDeadlinePassed } from '@/lib';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import MaterialCard from './MaterialCard';

const MaterialsByWeek: React.FC<MaterialsByWeekProps> = ({ materials, userProfile }) => {
  // กรอง materials ที่หมดเวลาแล้วสำหรับ user ที่ isteacher: false
  const filteredMaterials = materials.filter((material) => {
    // ถ้าเป็น teacher หรือ TA ให้แสดงทุก material
    if (userProfile?.is_teacher) {
      return true;
    }

    // ถ้าเป็น student และ material มี deadline
    if (material.deadline) {
      const isExpired = isDeadlinePassed(material.deadline);
      const isGraded = material.is_graded ?? true; // default เป็น graded

      // ซ่อนเฉพาะ graded exercise ที่หมดเวลา
      if (
        isGraded &&
        isExpired &&
        (material.type === 'code_exercise' || material.type === 'pdf_exercise')
      ) {
        return false;
      }
    }

    return true;
  });

  // จัดกลุ่ม materials ตาม week
  const materialsByWeek = filteredMaterials.reduce(
    (acc, material) => {
      const week = material.week;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(material);
      return acc;
    },
    {} as Record<number, Material[]>,
  );

  // เรียงลำดับ week จาก 1 ไปสูงสุด
  const sortedWeeks = Object.keys(materialsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  // เรียงลำดับ materials ภายในแต่ละ week (ตามประเภทและวันที่)
  const sortMaterials = (materials: Material[]) => {
    return materials.sort((a, b) => {
      // เรียงตามประเภท: exercise ก่อน document/video
      const typeOrder = { code_exercise: 0, pdf_exercise: 1, document: 2, video: 3 };
      const aOrder = typeOrder[a.type] ?? 4;
      const bOrder = typeOrder[b.type] ?? 4;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // ถ้าประเภทเดียวกัน ให้เรียงตามวันที่ล่าสุด
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // นับจำนวน materials แต่ละประเภทในแต่ละ week
  const getWeekStats = (weekMaterials: Material[]) => {
    const stats = {
      total: weekMaterials.length,
      exercises: weekMaterials.filter(
        (m) => m.type === 'code_exercise' || m.type === 'pdf_exercise',
      ).length,
      documents: weekMaterials.filter((m) => m.type === 'document').length,
      videos: weekMaterials.filter((m) => m.type === 'video').length,
      announcements: weekMaterials.filter((m) => m.type === 'announcement').length,
      withDeadline: weekMaterials.filter((m) => m.deadline).length,
    };
    return stats;
  };

  if (sortedWeeks.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มีเนื้อหาในคอร์สนี้</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {sortedWeeks.map((week) => {
        const weekMaterials = sortMaterials(materialsByWeek[week]);
        const stats = getWeekStats(weekMaterials);

        return (
          <AccordionItem key={week} value={`week-${week}`}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 dark:text-white">Week {week}</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                    {stats.total} รายการ
                  </span>
                  {stats.exercises > 0 && (
                    <span className="bg-error/20 dark:bg-error/30 text-error dark:text-red-400 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {stats.exercises} แบบฝึกหัด
                    </span>
                  )}
                  {stats.documents > 0 && (
                    <span className="bg-info/20 dark:bg-info/30 text-info dark:text-blue-400 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {stats.documents} เอกสาร
                    </span>
                  )}
                  {stats.videos > 0 && (
                    <span className="bg-success/20 dark:bg-success/30 text-success dark:text-green-400 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {stats.videos} วิดีโอ
                    </span>
                  )}
                  {stats.announcements > 0 && (
                    <span className="bg-warning/20 dark:bg-warning/30 text-warning dark:text-yellow-400 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {stats.announcements} ประกาศ
                    </span>
                  )}
                  {stats.withDeadline > 0 && (
                    <span className="inline-flex items-center rounded-full border border-orange-300 dark:border-orange-600 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                      {stats.withDeadline} มีกำหนดส่ง
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {weekMaterials.map((material) => (
                  <MaterialCard key={material.material_id} material={material} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default MaterialsByWeek;
