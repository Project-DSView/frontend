'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentProgress, Material } from '@/types';
import { Code2, FileText } from 'lucide-react';

interface ScoreTableProps {
  progress: StudentProgress[];
  materials: Material[];
}

const ScoreTable: React.FC<ScoreTableProps> = ({ progress, materials }) => {
  // สร้าง map ของ material_id -> material เพื่อหา type
  const materialMap = new Map(materials.map((m) => [m.material_id, m]));

  // รวม progress กับ material info
  const progressWithMaterials = progress.map((p) => {
    const material = materialMap.get(p.material_id);
    return {
      ...p,
      material_type: material?.type || 'unknown',
    };
  });

  // เรียงตาม material_title
  const sortedProgress = [...progressWithMaterials].sort((a, b) =>
    a.material_title.localeCompare(b.material_title),
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500">เสร็จสิ้น</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">กำลังทำ</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-500">ยังไม่เริ่ม</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code_exercise':
        return <Code2 className="h-4 w-4 text-blue-600" />;
      case 'pdf_exercise':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'code_exercise':
        return 'Code Exercise';
      case 'pdf_exercise':
        return 'PDF Exercise';
      default:
        return type;
    }
  };

  if (sortedProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>คะแนนแต่ละงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-gray-500">ยังไม่มีงานที่ทำ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>คะแนนแต่ละงาน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 border-b border-gray-200 pb-3 font-semibold text-gray-700">
              <div>ชื่องาน</div>
              <div>ประเภท</div>
              <div>คะแนน</div>
              <div>สถานะ</div>
            </div>
            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {sortedProgress.map((item) => (
                <div
                  key={item.progress_id}
                  className="grid grid-cols-4 gap-4 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">{item.material_title}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.material_type)}
                      <span className="text-sm text-gray-700">
                        {getTypeLabel(item.material_type)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{item.score}</span>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreTable;
