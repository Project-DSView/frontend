'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, FileText } from 'lucide-react';
import { StudentProgress, Material } from '@/types';

interface ScoreByTypeCardProps {
  progress: StudentProgress[];
  materials: Material[];
}

const ScoreByTypeCard: React.FC<ScoreByTypeCardProps> = ({ progress, materials }) => {
  // สร้าง map ของ material_id -> material
  const materialMap = new Map(materials.map((m) => [m.material_id, m]));

  // คำนวณคะแนนแยกตามประเภท
  const codeExerciseProgress = progress.filter(
    (p) => materialMap.get(p.material_id)?.type === 'code_exercise',
  );
  const pdfExerciseProgress = progress.filter(
    (p) => materialMap.get(p.material_id)?.type === 'pdf_exercise',
  );

  const codeExerciseScore = codeExerciseProgress.reduce((sum, p) => sum + p.score, 0);
  const pdfExerciseScore = pdfExerciseProgress.reduce((sum, p) => sum + p.score, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>คะแนนแยกตามประเภท</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Code Exercise */}
          <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Code2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Code Exercise</p>
              <p className="text-2xl font-bold text-gray-900">{codeExerciseScore}</p>
              <p className="mt-1 text-xs text-gray-500">{codeExerciseProgress.length} งาน</p>
            </div>
          </div>

          {/* PDF Exercise */}
          <div className="flex items-center gap-4 rounded-lg bg-red-50 p-4">
            <div className="rounded-full bg-red-100 p-3">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">PDF Exercise</p>
              <p className="text-2xl font-bold text-gray-900">{pdfExerciseScore}</p>
              <p className="mt-1 text-xs text-gray-500">{pdfExerciseProgress.length} งาน</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreByTypeCard;
