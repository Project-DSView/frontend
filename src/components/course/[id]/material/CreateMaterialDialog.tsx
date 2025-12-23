'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from '@tanstack/react-form';

import { useCreateMaterial, useUpdateMaterial } from '@/query';
import { materialSchema } from '@/lib/schemas/material.schema';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Trash2, Plus, Code, Type, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { vscodeLight, vscodeDark } from '@uiw/codemirror-theme-vscode';
import { useTheme } from '@/providers/ThemeProvider';

// Dynamically import CodeMirror for JSON editing
const CodeMirror = dynamic(() => import('@uiw/react-codemirror').then((mod) => mod.default), {
  ssr: false,
});

// Dynamically import JSON language support
const loadJSONLang = async () => {
  const jsonLang = await import('@codemirror/lang-json');
  return jsonLang.json();
};

interface CreateMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  courseId: string;
  onSuccess?: () => void;
  defaultMaterialType?:
    | 'document'
    | 'video'
    | 'code_exercise'
    | 'pdf_exercise'
    | 'announcement'
    | '';
  materialToEdit?: {
    material_id: string;
    type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement';
    title: string;
    description?: string | null;
    week: number;
    is_public?: boolean;
    video_url?: string | null;
    content?: string | null;
    file_name?: string | null;
    file_url?: string | null;
    // Code exercise fields
    problem_statement?: string | null;
    constraints?: string | null;
    hints?: string | null;
    total_points?: number | null;
    deadline?: string | null;
    test_cases?: Array<{
      input_data: string;
      expected_output: string;
      display_name?: string | null;
    }> | null;
    problem_images?: string[] | null;
  };
}

const CreateMaterialDialog: React.FC<CreateMaterialDialogProps> = ({
  isOpen,
  onClose,
  accessToken,
  courseId,
  onSuccess,
  defaultMaterialType = '',
  materialToEdit,
}) => {
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const isEditMode = !!materialToEdit;
  const { theme } = useTheme();
  const [materialType, setMaterialType] = React.useState<
    'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement' | ''
  >(defaultMaterialType);
  // Track JSON mode for each test case
  const [testCaseModes, setTestCaseModes] = React.useState<
    Record<number, { input: 'text' | 'json'; output: 'text' | 'json' }>
  >({});

  // JSON Editor component
  const JSONEditor: React.FC<{
    value: string;
    onChange: (value: string) => void;
    theme: string;
  }> = ({ value, onChange, theme }) => {
    const [jsonLangExtension, setJsonLangExtension] = React.useState<
      import('@codemirror/state').Extension[]
    >([]);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      // Load JSON language extension
      loadJSONLang()
        .then((extension) => {
          setJsonLangExtension([extension]);
        })
        .catch((err) => {
          console.warn('Failed to load JSON language extension:', err);
          setJsonLangExtension([]);
        });
    }, []);

    if (!mounted) {
      return (
        <div className="bg-muted flex h-[120px] items-center justify-center">
          <p className="text-muted-foreground text-xs">กำลังโหลด editor...</p>
        </div>
      );
    }

    return (
      <CodeMirror
        value={value}
        onChange={onChange}
        height="120px"
        theme={theme === 'dark' ? vscodeDark : vscodeLight}
        extensions={jsonLangExtension}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
        }}
      />
    );
  };

  // Update materialType when defaultMaterialType changes and dialog opens
  React.useEffect(() => {
    if (isOpen && defaultMaterialType) {
      setMaterialType(defaultMaterialType);
    }
    if (isOpen && materialToEdit) {
      setMaterialType(materialToEdit.type);
    }
  }, [isOpen, defaultMaterialType, materialToEdit]);

  const form = useForm({
    defaultValues: {
      title: materialToEdit?.title || '',
      description: materialToEdit?.description || '',
      week: materialToEdit?.week || 1,
      is_public: materialToEdit?.is_public ?? true,
      // Document fields
      file: null as File | null,
      // Video fields
      video_url: materialToEdit?.video_url || '',
      // Exercise fields
      total_points: materialToEdit?.total_points || 100,
      deadline: materialToEdit?.deadline || '',
      problem_statement: materialToEdit?.problem_statement || '',
      constraints: materialToEdit?.constraints || '',
      hints: materialToEdit?.hints || '',
      // Code exercise test cases
      test_cases: (() => {
        if (!materialToEdit?.test_cases || !Array.isArray(materialToEdit.test_cases)) {
          return [];
        }
        // Convert test cases to the expected format
        return materialToEdit.test_cases.map(
          (tc: {
            input_data?: string | object;
            expected_output?: string | object;
            display_name?: string | null;
          }) => ({
            input_data:
              typeof tc.input_data === 'string'
                ? tc.input_data
                : typeof tc.input_data === 'object'
                  ? JSON.stringify(tc.input_data)
                  : String(tc.input_data || ''),
            expected_output:
              typeof tc.expected_output === 'string'
                ? tc.expected_output
                : typeof tc.expected_output === 'object'
                  ? JSON.stringify(tc.expected_output)
                  : String(tc.expected_output || ''),
            display_name: tc.display_name || '',
          }),
        );
      })(),
      // Announcement fields
      content: materialToEdit?.content || '',
    },
    onSubmit: async ({ value }) => {
      if (!accessToken || !materialType) return;

      // Prepare data for validation based on material type
      const validationData = {
        type: materialType,
        title: value.title,
        description: value.description || null,
        week: value.week,
        is_public: value.is_public,
        // In edit mode, file is optional for documents
        ...(materialType === 'document' && {
          file: isEditMode ? value.file || undefined : value.file,
        }),
        ...(materialType === 'video' && { video_url: value.video_url }),
        ...(materialType === 'code_exercise' && {
          total_points: value.total_points,
          deadline: value.deadline || null,
          problem_statement: value.problem_statement,
          constraints: value.constraints || null,
          hints: value.hints || null,
          file: value.file || null,
          test_cases: value.test_cases || [],
        }),
        ...(materialType === 'pdf_exercise' && {
          total_points: value.total_points,
          deadline: value.deadline || null,
          file: value.file,
        }),
        ...(materialType === 'announcement' && {
          content: value.content,
        }),
      };

      // Validate with Zod schema
      // For edit mode with documents, skip file validation if no file is provided
      if (isEditMode && materialType === 'document' && !validationData.file) {
        // Validate only non-file fields for edit mode documents without new file
        const baseValidation = z.object({
          type: z.literal('document'),
          title: z.string().min(1).min(3).max(255).trim(),
          description: z.string().max(1000).trim().optional().nullable(),
          week: z.number().int().min(1),
          is_public: z.boolean(),
        });
        const result = baseValidation.safeParse(validationData);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            const fieldPath = issue.path;
            if (fieldPath.length > 0) {
              const fieldName = fieldPath[0] as keyof typeof value;
              if (fieldName) {
                form.setFieldMeta(fieldName, (meta) => ({
                  ...meta,
                  errors: [issue.message],
                }));
              }
            }
          });
          return;
        }
      } else {
        // Normal validation for create mode or when file is provided
        const result = materialSchema.safeParse(validationData);
        if (!result.success) {
          // Set field errors
          result.error.issues.forEach((issue) => {
            const fieldPath = issue.path;
            if (fieldPath.length > 0) {
              const fieldName = fieldPath[0] as keyof typeof value;
              if (fieldName) {
                form.setFieldMeta(fieldName, (meta) => ({
                  ...meta,
                  errors: [issue.message],
                }));
              }
            }
          });
          return;
        }
      }

      try {
        if (isEditMode && materialToEdit) {
          // Update mode
          await updateMutation.mutateAsync({
            token: accessToken,
            materialId: materialToEdit.material_id,
            updates: {
              title: value.title,
              description: value.description || undefined,
              week: value.week,
              isPublic: value.is_public,
              ...(materialType === 'video' && { videoUrl: value.video_url || undefined }),
              ...(materialType === 'announcement' && { content: value.content || undefined }),
              ...((materialType === 'code_exercise' || materialType === 'pdf_exercise') && {
                totalPoints: value.total_points,
                deadline: value.deadline || null,
              }),
              ...(materialType === 'code_exercise' && {
                problemStatement: value.problem_statement,
                constraints: value.constraints || null,
                hints: value.hints || null,
                testCases: value.test_cases || [],
                problemImage: value.file || null,
              }),
            },
          });
        } else {
          // Create mode
          await createMutation.mutateAsync({
            token: accessToken,
            courseId,
            type: materialType,
            title: value.title,
            description: value.description || null,
            week: value.week,
            isPublic: value.is_public,
            file: value.file || undefined,
            videoUrl: value.video_url || undefined,
            totalPoints: value.total_points,
            deadline: value.deadline || null,
            problemStatement: value.problem_statement || undefined,
            constraints: value.constraints || null,
            hints: value.hints || null,
            testCases: materialType === 'code_exercise' ? value.test_cases : undefined,
            content: value.content || undefined,
          });
        }

        handleClose();
        onSuccess?.();
      } catch (error) {
        // Error is handled by mutation hook
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} material:`, error);
      }
    },
  });

  // Reset form when dialog opens with materialToEdit
  React.useEffect(() => {
    if (isOpen && materialToEdit) {
      const testCases = (() => {
        if (!materialToEdit.test_cases || !Array.isArray(materialToEdit.test_cases)) {
          return [];
        }
        return materialToEdit.test_cases.map(
          (tc: {
            input_data?: string | object;
            expected_output?: string | object;
            display_name?: string | null;
          }) => ({
            input_data:
              typeof tc.input_data === 'string'
                ? tc.input_data
                : typeof tc.input_data === 'object'
                  ? JSON.stringify(tc.input_data)
                  : String(tc.input_data || ''),
            expected_output:
              typeof tc.expected_output === 'string'
                ? tc.expected_output
                : typeof tc.expected_output === 'object'
                  ? JSON.stringify(tc.expected_output)
                  : String(tc.expected_output || ''),
            display_name: tc.display_name || '',
          }),
        );
      })();

      form.reset({
        title: materialToEdit.title || '',
        description: materialToEdit.description || '',
        week: materialToEdit.week || 1,
        is_public: materialToEdit.is_public ?? true,
        file: null,
        video_url: materialToEdit.video_url || '',
        total_points: materialToEdit.total_points || 100,
        deadline: materialToEdit.deadline || '',
        problem_statement: materialToEdit.problem_statement || '',
        constraints: materialToEdit.constraints || '',
        hints: materialToEdit.hints || '',
        test_cases: testCases,
        content: materialToEdit.content || '',
      });
    } else if (isOpen && !materialToEdit) {
      // Reset to default when creating new material
      form.reset();
    }
  }, [isOpen, materialToEdit, form]);

  const handleClose = () => {
    const isPending = isEditMode ? updateMutation.isPending : createMutation.isPending;
    if (!isPending) {
      form.reset();
      setMaterialType('');
      onClose();
    }
  };

  const handleTypeChange = (newType: string) => {
    setMaterialType(
      newType as 'document' | 'video' | 'code_exercise' | 'pdf_exercise' | 'announcement' | '',
    );
    form.reset();
    // Reset form values but keep week and is_public
    form.setFieldValue('title', '');
    form.setFieldValue('description', '');
    form.setFieldValue('file', null);
    form.setFieldValue('video_url', '');
    form.setFieldValue('total_points', 100);
    form.setFieldValue('deadline', '');
    form.setFieldValue('problem_statement', '');
    form.setFieldValue('constraints', '');
    form.setFieldValue('hints', '');
    form.setFieldValue('test_cases', []);
    form.setFieldValue('content', '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'แก้ไขเนื้อหา' : 'เพิ่มเนื้อหา'}</DialogTitle>
          <DialogDescription>เลือกประเภทเนื้อหาและกรอกข้อมูลที่ต้องการ</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {/* Material Type Selector */}
            <div>
              <Label htmlFor="material-type">
                ประเภทเนื้อหา <span className="text-red-500">*</span>
              </Label>
              <Select value={materialType} onValueChange={handleTypeChange} disabled={isEditMode}>
                <SelectTrigger id="material-type" className="mt-1">
                  <SelectValue placeholder="เลือกประเภทเนื้อหา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">เอกสาร (Document)</SelectItem>
                  <SelectItem value="video">วิดีโอ (Video)</SelectItem>
                  <SelectItem value="code_exercise">แบบฝึกหัดโค้ด (Code Exercise)</SelectItem>
                  <SelectItem value="pdf_exercise">แบบฝึกหัด PDF (PDF Exercise)</SelectItem>
                  <SelectItem value="announcement">ประกาศ (Announcement)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {materialType && (
              <>
                {/* Title */}
                <form.Field
                  name="title"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim() === '') {
                        return 'กรุณากรอกชื่อเนื้อหา';
                      }
                      if (value.trim().length < 3) {
                        return 'ชื่อเนื้อหาต้องมีอย่างน้อย 3 ตัวอักษร';
                      }
                      if (value.trim().length > 255) {
                        return 'ชื่อเนื้อหาต้องไม่เกิน 255 ตัวอักษร';
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div>
                      <Label htmlFor="title">
                        ชื่อเนื้อหา <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="เช่น บทที่ 1: Introduction"
                        className={`mt-1 ${
                          field.state.meta.errors.length > 0
                            ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                            : ''
                        }`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Description */}
                <form.Field name="description">
                  {(field) => (
                    <div>
                      <Label htmlFor="description">คำอธิบาย</Label>
                      <Textarea
                        id="description"
                        value={field.state.value || ''}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="อธิบายรายละเอียดของเนื้อหา..."
                        rows={3}
                        className="mt-1"
                      />
                      <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                        {(field.state.value || '').length}/1000 ตัวอักษร
                      </p>
                    </div>
                  )}
                </form.Field>

                {/* Week */}
                <form.Field
                  name="week"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value < 1) {
                        return 'สัปดาห์ต้องมีค่าอย่างน้อย 1';
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div>
                      <Label htmlFor="week">
                        สัปดาห์ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="week"
                        type="text"
                        inputMode="numeric"
                        value={field.state.value.toString()}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty string while typing
                          if (inputValue === '') {
                            field.handleChange(0);
                            return;
                          }
                          // Only allow numbers
                          const numValue = parseInt(inputValue, 10);
                          if (!isNaN(numValue) && numValue >= 0) {
                            field.handleChange(numValue);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onBlur={(e) => {
                          // Ensure value is at least 1 on blur
                          const numValue = parseInt(e.target.value, 10);
                          if (isNaN(numValue) || numValue < 1) {
                            field.handleChange(1);
                          }
                          field.handleBlur();
                        }}
                        className={`mt-1 ${
                          field.state.meta.errors.length > 0
                            ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                            : ''
                        }`}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Is Public */}
                <form.Field name="is_public">
                  {(field) => (
                    <div className="flex items-center space-x-2">
                      <input
                        id="is_public"
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="is_public" className="cursor-pointer">
                        แสดงให้ทุกคนเห็น
                      </Label>
                    </div>
                  )}
                </form.Field>

                {/* Document-specific fields */}
                {materialType === 'document' && (
                  <form.Field
                    name="file"
                    validators={{
                      onChange: ({ value }) => {
                        // In edit mode, file is optional (can keep existing file)
                        if (!isEditMode && !value) {
                          return 'กรุณาเลือกไฟล์';
                        }
                        // If a file is selected, validate it
                        if (value) {
                          const allowedTypes = [
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/vnd.ms-excel',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'application/vnd.ms-powerpoint',
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            'text/plain',
                          ];
                          if (!allowedTypes.includes(value.type)) {
                            return 'ไฟล์ต้องเป็น PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX หรือ TXT เท่านั้น';
                          }
                          if (value.size > 10 * 1024 * 1024) {
                            return 'ไฟล์ใหญ่เกิน 10MB';
                          }
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div>
                        <Label htmlFor="file">
                          ไฟล์เอกสาร {!isEditMode && <span className="text-red-500">*</span>}
                          {isEditMode && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              (ไม่เลือก = ใช้ไฟล์เดิม)
                            </span>
                          )}
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              field.handleChange(file);
                            }}
                            onBlur={field.handleBlur}
                            className={`${
                              field.state.meta.errors.length > 0
                                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                        {field.state.value ? (
                          <p className="mt-1 text-xs text-gray-500">
                            ไฟล์ใหม่: {field.state.value.name} (
                            {(field.state.value.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        ) : isEditMode && materialToEdit?.file_name ? (
                          <p className="mt-1 text-xs text-gray-500">
                            ไฟล์ปัจจุบัน: {materialToEdit.file_name}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </form.Field>
                )}

                {/* Video-specific fields */}
                {materialType === 'video' && (
                  <form.Field
                    name="video_url"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.trim() === '') {
                          return 'กรุณากรอก URL ของวิดีโอ';
                        }
                        try {
                          new URL(value);
                        } catch {
                          return 'URL ไม่ถูกต้อง';
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <div>
                        <Label htmlFor="video_url">
                          URL วิดีโอ <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="video_url"
                          type="url"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={`mt-1 ${
                            field.state.meta.errors.length > 0
                              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                              : ''
                          }`}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>
                )}

                {/* Code Exercise-specific fields */}
                {materialType === 'code_exercise' && (
                  <>
                    <form.Field
                      name="total_points"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value < 1) {
                            return 'คะแนนเต็มต้องมีค่าอย่างน้อย 1';
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label htmlFor="total_points">
                            คะแนนเต็ม <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="total_points"
                            type="number"
                            min={1}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 1)}
                            onBlur={field.handleBlur}
                            className={`mt-1 ${
                              field.state.meta.errors.length > 0
                                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-xs text-red-500">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="deadline">
                      {(field) => (
                        <div>
                          <Label htmlFor="deadline">กำหนดส่ง (ไม่บังคับ)</Label>
                          <Input
                            id="deadline"
                            type="datetime-local"
                            value={
                              field.state.value
                                ? new Date(field.state.value).toISOString().slice(0, 16)
                                : ''
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                field.handleChange(new Date(e.target.value).toISOString());
                              } else {
                                field.handleChange('');
                              }
                            }}
                            onBlur={field.handleBlur}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field
                      name="problem_statement"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value.trim() === '') {
                            return 'กรุณากรอกโจทย์';
                          }
                          if (value.trim().length < 10) {
                            return 'โจทย์ต้องมีอย่างน้อย 10 ตัวอักษร';
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label htmlFor="problem_statement">
                            โจทย์ <span className="text-red-500">*</span>
                          </Label>
                          <div className="mt-1">
                            <MarkdownEditor
                              value={field.state.value}
                              onChange={field.handleChange}
                              placeholder="อธิบายโจทย์ที่ต้องการให้นักเรียนแก้..."
                              rows={8}
                              error={field.state.meta.errors[0]}
                            />
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="constraints">
                      {(field) => (
                        <div>
                          <Label htmlFor="constraints">ข้อจำกัด (ไม่บังคับ)</Label>
                          <div className="mt-1">
                            <MarkdownEditor
                              value={field.state.value || ''}
                              onChange={field.handleChange}
                              placeholder="ระบุข้อจำกัดต่างๆ เช่น ข้อจำกัดเวลา, หน่วยความจำ..."
                              rows={5}
                            />
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="hints">
                      {(field) => (
                        <div>
                          <Label htmlFor="hints">คำใบ้ (ไม่บังคับ)</Label>
                          <div className="mt-1">
                            <MarkdownEditor
                              value={field.state.value || ''}
                              onChange={field.handleChange}
                              placeholder="ให้คำใบ้สำหรับนักเรียน..."
                              rows={5}
                            />
                          </div>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="file">
                      {(field) => (
                        <div>
                          <Label htmlFor="file">รูปภาพประกอบโจทย์ (ไม่บังคับ)</Label>
                          <div className="mt-1">
                            <Input
                              id="file"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                field.handleChange(file);
                              }}
                              onBlur={field.handleBlur}
                            />
                          </div>
                          {field.state.value ? (
                            <p className="mt-1 text-xs text-gray-500">
                              ไฟล์ใหม่: {field.state.value.name} (
                              {(field.state.value.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          ) : isEditMode &&
                            materialToEdit?.problem_images &&
                            materialToEdit.problem_images.length > 0 ? (
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">ไฟล์ปัจจุบัน:</p>
                              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-gray-600">
                                {materialToEdit.problem_images.map(
                                  (imgUrl: string, idx: number) => {
                                    const filename = imgUrl.split('/').pop() || `รูปภาพ-${idx + 1}`;
                                    return <li key={idx}>{filename}</li>;
                                  },
                                )}
                              </ul>
                              <p className="mt-1 text-xs text-gray-400">
                                (ไม่เลือกไฟล์ใหม่ = ใช้รูปภาพเดิม)
                              </p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground mt-1 text-xs">
                              {isEditMode ? '(ไม่เลือก = ใช้รูปภาพเดิม)' : 'กรุณาเลือกไฟล์'}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    {/* Test Cases Section */}
                    <form.Field
                      name="test_cases"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value.length === 0) {
                            return 'ต้องมีอย่างน้อย 1 test case';
                          }
                          if (value.length > 10) {
                            return 'ไม่สามารถเพิ่ม test case ได้เกิน 10 กรณี';
                          }
                          // Validate each test case
                          for (let i = 0; i < value.length; i++) {
                            const tc = value[i];
                            if (!tc.input_data || tc.input_data.trim() === '') {
                              return `Test case ${i + 1}: กรุณากรอก input data`;
                            }
                            if (!tc.expected_output || tc.expected_output.trim() === '') {
                              return `Test case ${i + 1}: กรุณากรอก expected output`;
                            }
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <Label>
                              Test Cases <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = '.json';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        try {
                                          const content = event.target?.result as string;
                                          const parsed = JSON.parse(content);

                                          // Handle array of test cases
                                          if (Array.isArray(parsed)) {
                                            const newTestCases = parsed.map(
                                              (tc: {
                                                input_data?: unknown;
                                                expected_output?: unknown;
                                                display_name?: string;
                                              }) => ({
                                                input_data:
                                                  typeof tc.input_data === 'string'
                                                    ? tc.input_data
                                                    : JSON.stringify(tc.input_data),
                                                expected_output:
                                                  typeof tc.expected_output === 'string'
                                                    ? tc.expected_output
                                                    : JSON.stringify(tc.expected_output),
                                                display_name: tc.display_name || '',
                                              }),
                                            );

                                            const totalCases =
                                              field.state.value.length + newTestCases.length;
                                            if (totalCases <= 10) {
                                              field.handleChange([
                                                ...field.state.value,
                                                ...newTestCases,
                                              ]);
                                            } else {
                                              const remaining = 10 - field.state.value.length;
                                              field.handleChange([
                                                ...field.state.value,
                                                ...newTestCases.slice(0, remaining),
                                              ]);
                                              alert(
                                                `สามารถเพิ่มได้สูงสุด 10 test cases ระบบจะเพิ่ม ${remaining} test cases แรก`,
                                              );
                                            }
                                          } else if (parsed.input_data && parsed.expected_output) {
                                            // Single test case object
                                            const newTestCase = {
                                              input_data:
                                                typeof parsed.input_data === 'string'
                                                  ? parsed.input_data
                                                  : JSON.stringify(parsed.input_data),
                                              expected_output:
                                                typeof parsed.expected_output === 'string'
                                                  ? parsed.expected_output
                                                  : JSON.stringify(parsed.expected_output),
                                              display_name: parsed.display_name || '',
                                            };

                                            if (field.state.value.length < 10) {
                                              field.handleChange([
                                                ...field.state.value,
                                                newTestCase,
                                              ]);
                                            } else {
                                              alert('ไม่สามารถเพิ่ม test case ได้เกิน 10 กรณี');
                                            }
                                          } else {
                                            alert(
                                              'รูปแบบ JSON ไม่ถูกต้อง ต้องมี input_data และ expected_output',
                                            );
                                          }
                                        } catch (error) {
                                          alert(
                                            'ไม่สามารถอ่านไฟล์ JSON ได้: ' +
                                              (error as Error).message,
                                          );
                                        }
                                      };
                                      reader.readAsText(file);
                                    }
                                  };
                                  input.click();
                                }}
                                disabled={field.state.value.length >= 10}
                              >
                                <Upload className="mr-1 h-4 w-4" />
                                อัปโหลด JSON
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (field.state.value.length < 10) {
                                    field.handleChange([
                                      ...field.state.value,
                                      { input_data: '', expected_output: '', display_name: '' },
                                    ]);
                                  }
                                }}
                                disabled={field.state.value.length >= 10}
                              >
                                <Plus className="mr-1 h-4 w-4" />
                                เพิ่ม Test Case
                              </Button>
                            </div>
                          </div>

                          {field.state.value.length === 0 && (
                            <p className="text-muted-foreground mt-1 text-sm">
                              ยังไม่มี test case กรุณาเพิ่มอย่างน้อย 1 กรณี
                            </p>
                          )}

                          <div className="mt-2 space-y-4">
                            {field.state.value.map((testCase, index) => (
                              <div
                                key={index}
                                className="border-border bg-muted/30 rounded-lg border p-4"
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <Label className="text-sm font-medium">
                                    Test Case {index + 1}
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newTestCases = field.state.value.filter(
                                        (_, i) => i !== index,
                                      );
                                      field.handleChange(newTestCases);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <Label
                                      htmlFor={`test_case_${index}_display_name`}
                                      className="text-xs"
                                    >
                                      ชื่อ (ไม่บังคับ)
                                    </Label>
                                    <Input
                                      id={`test_case_${index}_display_name`}
                                      value={testCase.display_name || ''}
                                      onChange={(e) => {
                                        const newTestCases = [...field.state.value];
                                        newTestCases[index] = {
                                          ...newTestCases[index],
                                          display_name: e.target.value,
                                        };
                                        field.handleChange(newTestCases);
                                      }}
                                      placeholder="เช่น Test Case 1, Sample Input 1"
                                      className="mt-1"
                                    />
                                  </div>

                                  <div>
                                    <div className="mb-1 flex items-center justify-between">
                                      <Label
                                        htmlFor={`test_case_${index}_input`}
                                        className="text-xs"
                                      >
                                        Input Data <span className="text-red-500">*</span>
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                          const currentMode = testCaseModes[index]?.input || 'text';
                                          const newMode = currentMode === 'text' ? 'json' : 'text';
                                          setTestCaseModes((prev) => ({
                                            ...prev,
                                            [index]: { ...prev[index], input: newMode },
                                          }));
                                        }}
                                      >
                                        {testCaseModes[index]?.input === 'json' ? (
                                          <>
                                            <Type className="mr-1 h-3 w-3" />
                                            Text
                                          </>
                                        ) : (
                                          <>
                                            <Code className="mr-1 h-3 w-3" />
                                            JSON
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    {testCaseModes[index]?.input === 'json' ? (
                                      <div className="border-input mt-1 overflow-hidden rounded-md border">
                                        <JSONEditor
                                          value={testCase.input_data}
                                          onChange={(value) => {
                                            const newTestCases = [...field.state.value];
                                            newTestCases[index] = {
                                              ...newTestCases[index],
                                              input_data: value,
                                            };
                                            field.handleChange(newTestCases);
                                          }}
                                          theme={theme}
                                        />
                                      </div>
                                    ) : (
                                      <Textarea
                                        id={`test_case_${index}_input`}
                                        value={testCase.input_data}
                                        onChange={(e) => {
                                          const newTestCases = [...field.state.value];
                                          newTestCases[index] = {
                                            ...newTestCases[index],
                                            input_data: e.target.value,
                                          };
                                          field.handleChange(newTestCases);
                                        }}
                                        placeholder='เช่น {"n": 5, "arr": [1,2,3]} หรือ 5\n3\n1 2 3'
                                        rows={4}
                                        className="mt-1 font-mono text-sm"
                                      />
                                    )}
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      {testCaseModes[index]?.input === 'json'
                                        ? 'JSON format (จะ validate อัตโนมัติ)'
                                        : 'รองรับทั้ง JSON format และ plain text'}
                                    </p>
                                  </div>

                                  <div>
                                    <div className="mb-1 flex items-center justify-between">
                                      <Label
                                        htmlFor={`test_case_${index}_output`}
                                        className="text-xs"
                                      >
                                        Expected Output <span className="text-red-500">*</span>
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => {
                                          const currentMode =
                                            testCaseModes[index]?.output || 'text';
                                          const newMode = currentMode === 'text' ? 'json' : 'text';
                                          setTestCaseModes((prev) => ({
                                            ...prev,
                                            [index]: { ...prev[index], output: newMode },
                                          }));
                                        }}
                                      >
                                        {testCaseModes[index]?.output === 'json' ? (
                                          <>
                                            <Type className="mr-1 h-3 w-3" />
                                            Text
                                          </>
                                        ) : (
                                          <>
                                            <Code className="mr-1 h-3 w-3" />
                                            JSON
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    {testCaseModes[index]?.output === 'json' ? (
                                      <div className="border-input mt-1 overflow-hidden rounded-md border">
                                        <JSONEditor
                                          value={testCase.expected_output}
                                          onChange={(value) => {
                                            const newTestCases = [...field.state.value];
                                            newTestCases[index] = {
                                              ...newTestCases[index],
                                              expected_output: value,
                                            };
                                            field.handleChange(newTestCases);
                                          }}
                                          theme={theme}
                                        />
                                      </div>
                                    ) : (
                                      <Textarea
                                        id={`test_case_${index}_output`}
                                        value={testCase.expected_output}
                                        onChange={(e) => {
                                          const newTestCases = [...field.state.value];
                                          newTestCases[index] = {
                                            ...newTestCases[index],
                                            expected_output: e.target.value,
                                          };
                                          field.handleChange(newTestCases);
                                        }}
                                        placeholder='เช่น {"result": 6} หรือ 8'
                                        rows={4}
                                        className="mt-1 font-mono text-sm"
                                      />
                                    )}
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      {testCaseModes[index]?.output === 'json'
                                        ? 'JSON format (จะ validate อัตโนมัติ)'
                                        : 'Plain text จะถูกแปลงเป็น {"output": "..."} อัตโนมัติ หรือใส่ JSON format ได้เลย'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-2 text-xs text-red-500">
                              {field.state.meta.errors[0]}
                            </p>
                          )}

                          <p className="text-muted-foreground mt-2 text-xs">
                            {field.state.value.length}/10 test cases
                          </p>
                        </div>
                      )}
                    </form.Field>
                  </>
                )}

                {/* Announcement-specific fields */}
                {materialType === 'announcement' && (
                  <>
                    <form.Field
                      name="content"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value.trim() === '') {
                            return 'กรุณากรอกเนื้อหาประกาศ';
                          }
                          if (value.trim().length < 10) {
                            return 'เนื้อหาประกาศต้องมีอย่างน้อย 10 ตัวอักษร';
                          }
                          if (value.trim().length > 5000) {
                            return 'เนื้อหาประกาศต้องไม่เกิน 5000 ตัวอักษร';
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label htmlFor="content">
                            เนื้อหาประกาศ <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="content"
                            value={field.state.value || ''}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="กรอกเนื้อหาประกาศ..."
                            rows={8}
                            className={`mt-1 ${
                              field.state.meta.errors.length > 0
                                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                          <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                            {(field.state.value || '').length}/5000 ตัวอักษร
                          </p>
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-xs text-red-500">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </>
                )}

                {/* PDF Exercise-specific fields */}
                {materialType === 'pdf_exercise' && (
                  <>
                    <form.Field
                      name="total_points"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value < 1) {
                            return 'คะแนนเต็มต้องมีค่าอย่างน้อย 1';
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label htmlFor="total_points">
                            คะแนนเต็ม <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="total_points"
                            type="number"
                            min={1}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 1)}
                            onBlur={field.handleBlur}
                            className={`mt-1 ${
                              field.state.meta.errors.length > 0
                                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-xs text-red-500">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="deadline">
                      {(field) => (
                        <div>
                          <Label htmlFor="deadline">กำหนดส่ง (ไม่บังคับ)</Label>
                          <Input
                            id="deadline"
                            type="datetime-local"
                            value={
                              field.state.value
                                ? new Date(field.state.value).toISOString().slice(0, 16)
                                : ''
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                field.handleChange(new Date(e.target.value).toISOString());
                              } else {
                                field.handleChange('');
                              }
                            }}
                            onBlur={field.handleBlur}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field
                      name="file"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) {
                            return 'กรุณาเลือกไฟล์ PDF';
                          }
                          if (value.type !== 'application/pdf') {
                            return 'ไฟล์ต้องเป็น PDF เท่านั้น';
                          }
                          if (value.size > 10 * 1024 * 1024) {
                            return 'ไฟล์ใหญ่เกิน 10MB';
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div>
                          <Label htmlFor="file">
                            ไฟล์ PDF <span className="text-red-500">*</span>
                          </Label>
                          <div className="mt-1">
                            <Input
                              id="file"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                field.handleChange(file);
                              }}
                              onBlur={field.handleBlur}
                              className={`${
                                field.state.meta.errors.length > 0
                                  ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                                  : ''
                              }`}
                            />
                          </div>
                          {field.state.meta.errors.length > 0 && (
                            <p className="mt-1 text-xs text-red-500">
                              {field.state.meta.errors[0]}
                            </p>
                          )}
                          {field.state.value && (
                            <p className="mt-1 text-xs text-gray-500">
                              ไฟล์: {field.state.value.name} (
                              {(field.state.value.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isEditMode ? updateMutation.isPending : createMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={
                !materialType || (isEditMode ? updateMutation.isPending : createMutation.isPending)
              }
            >
              {isEditMode ? (
                updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังแก้ไข...
                  </>
                ) : (
                  'บันทึกการแก้ไข'
                )
              ) : createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                'สร้างเนื้อหา'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMaterialDialog;
