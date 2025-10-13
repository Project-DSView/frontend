'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Material } from '@/types';
import MaterialCard from './MaterialCard';

interface MaterialsByWeekProps {
  materials: Material[];
}

const MaterialsByWeek: React.FC<MaterialsByWeekProps> = ({ materials }) => {
  // จัดกลุ่ม materials ตาม week
  const materialsByWeek = materials.reduce(
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
      const typeOrder = { 'code_exercise': 0, 'pdf_exercise': 1, 'document': 2, 'video': 3 };
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
      exercises: weekMaterials.filter(m => m.type === 'code_exercise' || m.type === 'pdf_exercise').length,
      documents: weekMaterials.filter(m => m.type === 'document').length,
      videos: weekMaterials.filter(m => m.type === 'video').length,
      withDeadline: weekMaterials.filter(m => m.deadline).length,
    };
    return stats;
  };

  if (sortedWeeks.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">ยังไม่มีเนื้อหาในคอร์สนี้</p>
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
                <span className="font-semibold">Week {week}</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {stats.total} รายการ
                  </span>
                  {stats.exercises > 0 && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {stats.exercises} แบบฝึกหัด
                    </span>
                  )}
                  {stats.documents > 0 && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {stats.documents} เอกสาร
                    </span>
                  )}
                  {stats.videos > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      {stats.videos} วิดีโอ
                    </span>
                  )}
                  {stats.withDeadline > 0 && (
                    <span className="inline-flex items-center rounded-full border border-orange-300 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                      {stats.withDeadline} มีกำหนดส่ง
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {weekMaterials.map((material) => (
                  <MaterialCard
                    key={material.material_id}
                    material={material}
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

export default MaterialsByWeek;
