'use client';

import React from 'react';
import Image from 'next/image';

import { ExerciseProblemCardProps } from '@/types';
import { formatDate, transformImageUrl } from '@/lib';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ExerciseProblemCard: React.FC<ExerciseProblemCardProps> = ({
  material,
  isExpired,
  isGraded,
}) => {
  const exampleInputs = material.example_inputs || [];
  const exampleOutputs = material.example_outputs || [];
  const problemImages = material.problem_images || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-2xl font-bold">{material.title}</CardTitle>
            {material.total_points && (
              <div className="flex items-center gap-1 text-gray-600">
                <span>{material.total_points} คะแนน</span>
              </div>
            )}
          </div>
          {material.deadline && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                isExpired ? 'bg-red-50 text-red-600' : 'text-error'
              }`}
            >
              <span className="text-error text-base font-medium">
                {isExpired ? 'หมดเวลาแล้ว' : `ส่งภายใน ${formatDate(material.deadline)}`}
              </span>
              {isExpired && !isGraded && (
                <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                  (Practice - ส่งได้)
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {problemImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {problemImages.map((src: string, idx: number) => (
              <div key={idx} className="relative aspect-video overflow-hidden rounded-md border">
                <Image
                  src={transformImageUrl(src)}
                  alt={`problem-${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {/* Description */}
          {material.description && (
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">คำอธิบาย</h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                {material.description}
              </p>
            </div>
          )}

          {/* Problem Statement */}
          {material.problem_statement && (
            <div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">รายละเอียดโจทย์</h3>
              <div className="bg-info/10 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {material.problem_statement}
                </p>
              </div>
            </div>
          )}

          {/* Constraints */}
          {material.constraints && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">ข้อจำกัด</h3>
              <div className="bg-warning/10 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {material.constraints}
                </p>
              </div>
            </div>
          )}

          {/* Hints */}
          {material.hints && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">คำใบ้</h3>
              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {material.hints}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Examples in the same card */}
        <div className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900">ตัวอย่าง Input / Output</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Input</h3>
              {exampleInputs.length === 0 ? (
                <p className="text-sm text-gray-500">ไม่มีตัวอย่าง</p>
              ) : (
                <div className="space-y-2">
                  {exampleInputs.map((ex: string, i: number) => (
                    <pre
                      key={i}
                      className="overflow-auto rounded-md bg-gray-100 p-3 text-xs text-gray-800"
                    >
                      {ex}
                    </pre>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Output</h3>
              {exampleOutputs.length === 0 ? (
                <p className="text-sm text-gray-500">ไม่มีตัวอย่าง</p>
              ) : (
                <div className="space-y-2">
                  {exampleOutputs.map((ex: string, i: number) => (
                    <pre
                      key={i}
                      className="overflow-auto rounded-md bg-gray-100 p-3 text-xs text-gray-800"
                    >
                      {ex}
                    </pre>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProblemCard;
