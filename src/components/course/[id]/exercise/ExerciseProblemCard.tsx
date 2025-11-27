'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Edit, Trash2, Loader2, FileImage } from 'lucide-react';

import { ExerciseProblemCardProps } from '@/types';
import { formatDate, transformImageUrl } from '@/lib';
import { useAuth } from '@/hooks';
import { useUpdateMaterial, useDeleteMaterial } from '@/query/material/material.query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import CreateMaterialDialog from '@/components/course/[id]/material/CreateMaterialDialog';

// Component for displaying problem images with fallback to filename
const ProblemImage: React.FC<{ src: string; filename: string; alt: string }> = ({
  src,
  filename,
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-md border">
      {!imageError ? (
        <Image
          src={transformImageUrl(src)}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800 p-2">
          <div className="text-center">
            <FileImage className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{filename}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ExerciseProblemCard: React.FC<ExerciseProblemCardProps> = ({
  material,
  isExpired,
  isGraded,
}) => {
  const { accessToken, profile } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const canEdit = profile?.is_teacher && material.created_by === profile.user_id;
  const exampleInputs = material.example_inputs || [];
  const exampleOutputs = material.example_outputs || [];
  const problemImages = material.problem_images || [];
  const testCases = (material as any).test_cases || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{material.title}</CardTitle>
            {material.total_points && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <span>{material.total_points} คะแนน</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                      <AlertDialogDescription>
                        การลบแบบฝึกหัด "{material.title}" จะไม่สามารถย้อนกลับได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (accessToken) {
                            deleteMutation.mutate(
                              { token: accessToken, materialId: material.material_id },
                              {
                                onSuccess: () => {
                                  setIsDeleteDialogOpen(false);
                                  window.location.reload();
                                },
                              },
                            );
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังลบ...
                          </>
                        ) : (
                          'ลบ'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {material.deadline && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  isExpired ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-error dark:text-red-400'
                }`}
              >
                <span className="text-error dark:text-red-400 text-base font-medium">
                  {isExpired ? 'หมดเวลาแล้ว' : `ส่งภายใน ${formatDate(material.deadline)}`}
                </span>
                {isExpired && !isGraded && (
                  <span className="rounded bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs text-yellow-800 dark:text-yellow-300">
                    (Practice - ส่งได้)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {problemImages.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {problemImages.map((src: string, idx: number) => {
              // Extract filename from URL
              const filename = src.split('/').pop() || `รูปภาพ-${idx + 1}`;
              return (
                <ProblemImage
                  key={idx}
                  src={src}
                  filename={filename}
                  alt={`problem-${idx + 1}`}
                />
              );
            })}
          </div>
        )}

        <div className="space-y-6">
          {/* Description */}
          {material.description && (
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">คำอธิบาย</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{material.description}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Problem Statement */}
          {material.problem_statement && (
            <div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">รายละเอียดโจทย์</h3>
              <div className="bg-info/10 rounded-lg p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return isInline ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <SyntaxHighlighter
                            style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      },
                    }}
                  >
                    {material.problem_statement}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Constraints */}
          {material.constraints && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">ข้อจำกัด</h3>
              <div className="bg-warning/10 rounded-lg p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return isInline ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <SyntaxHighlighter
                            style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      },
                    }}
                  >
                    {material.constraints}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Hints */}
          {material.hints && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">คำใบ้</h3>
              <div className="bg-success/10 rounded-lg p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return isInline ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <SyntaxHighlighter
                            style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      },
                    }}
                  >
                    {material.hints}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Examples - แสดง input/output จาก test cases ถ้ามี ไม่เช่นนั้นแสดงจาก example inputs/outputs */}
        <div className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">ตัวอย่าง Input / Output</h2>
          {testCases.length > 0 ? (
            // แสดงจาก test cases
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Input</h3>
                <div className="space-y-2">
                  {testCases.map((tc: any, idx: number) => {
                    let inputDisplay = '';
                    try {
                      const inputData =
                        typeof tc.input_data === 'string'
                          ? JSON.parse(tc.input_data)
                          : tc.input_data;
                      inputDisplay = JSON.stringify(inputData, null, 2);
                    } catch {
                      inputDisplay =
                        typeof tc.input_data === 'string'
                          ? tc.input_data
                          : JSON.stringify(tc.input_data);
                    }
                    return (
                      <div key={idx} className="rounded-md bg-gray-100 dark:bg-gray-800 p-3">
                        {tc.display_name && (
                          <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">{tc.display_name}</p>
                        )}
                        <pre className="overflow-auto text-xs text-gray-800 dark:text-gray-200">{inputDisplay}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Output</h3>
                <div className="space-y-2">
                  {testCases.map((tc: any, idx: number) => {
                    let outputDisplay = '';
                    try {
                      const outputData =
                        typeof tc.expected_output === 'string'
                          ? JSON.parse(tc.expected_output)
                          : tc.expected_output;
                      // Extract "output" value if exists
                      if (typeof outputData === 'object' && outputData !== null && 'output' in outputData) {
                        outputDisplay =
                          typeof outputData.output === 'string'
                            ? outputData.output
                            : JSON.stringify(outputData.output);
                      } else {
                        outputDisplay = JSON.stringify(outputData, null, 2);
                      }
                    } catch {
                      outputDisplay =
                        typeof tc.expected_output === 'string'
                          ? tc.expected_output
                          : JSON.stringify(tc.expected_output);
                    }
                    return (
                      <div key={idx} className="rounded-md bg-gray-100 dark:bg-gray-800 p-3">
                        {tc.display_name && (
                          <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">{tc.display_name}</p>
                        )}
                        <pre className="overflow-auto text-xs text-gray-800 dark:text-gray-200">{outputDisplay}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // แสดงจาก example inputs/outputs (fallback)
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Input</h3>
                {exampleInputs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">ไม่มีตัวอย่าง</p>
                ) : (
                  <div className="space-y-2">
                    {exampleInputs.map((ex: string, i: number) => (
                      <pre
                        key={i}
                        className="overflow-auto rounded-md bg-gray-100 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200"
                      >
                        {ex}
                      </pre>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Output</h3>
                {exampleOutputs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">ไม่มีตัวอย่าง</p>
                ) : (
                  <div className="space-y-2">
                    {exampleOutputs.map((ex: string, i: number) => {
                      // Try to parse JSON and extract "output" value if exists
                      let displayValue = ex;
                      try {
                        const parsed = JSON.parse(ex);
                        if (typeof parsed === 'object' && parsed !== null && 'output' in parsed) {
                          // If it's a JSON object with "output" key, show only the value
                          displayValue =
                            typeof parsed.output === 'string'
                              ? parsed.output
                              : JSON.stringify(parsed.output);
                        }
                      } catch {
                        // Not valid JSON, use original value
                        displayValue = ex;
                      }
                      return (
                        <pre
                          key={i}
                          className="overflow-auto rounded-md bg-gray-100 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200"
                        >
                          {displayValue}
                        </pre>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      {isEditDialogOpen && accessToken && (
        <CreateMaterialDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          accessToken={accessToken}
          courseId={material.course_id}
          defaultMaterialType={material.type}
          materialToEdit={{
            material_id: material.material_id,
            type: material.type,
            title: material.title,
            description: material.description,
            week: material.week,
            is_public: material.is_public,
            problem_statement: material.problem_statement || null,
            constraints: material.constraints || null,
            hints: material.hints || null,
            total_points: material.total_points || null,
            deadline: material.deadline || null,
            test_cases: testCases.length > 0 ? testCases : null,
            problem_images: problemImages.length > 0 ? problemImages : null,
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            window.location.reload();
          }}
        />
      )}
    </Card>
  );
};

export default ExerciseProblemCard;
