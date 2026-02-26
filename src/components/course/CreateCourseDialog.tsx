'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Loader2, Upload, X, Shuffle } from 'lucide-react';
import { useForm } from '@tanstack/react-form';

import {
  useCreateCourse,
  useUpdateCourse,
  useUploadCourseImage,
  useCreateInvitation,
  useCourseInvitations,
} from '@/query';
import { courseSchema, isValidImageUrl, transformImageUrl } from '@/lib';
import { Course } from '@/types';

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
import { Copy, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';
import { InvitationResponse } from '@/types';

interface CreateCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSuccess?: () => void;
  course?: Course | null; // For edit mode
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({
  isOpen,
  onClose,
  accessToken,
  onSuccess,
  course,
}) => {
  const isEditMode = !!course;
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const uploadImageMutation = useUploadCourseImage();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [latestInvitation, setLatestInvitation] = React.useState<InvitationResponse | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  // Invitation hooks (only in edit mode)
  const { refetch: refetchInvitations } = useCourseInvitations(
    isEditMode && course ? accessToken : null,
    isEditMode && course ? course.course_id : '',
  );
  const createInvitationMutation = useCreateInvitation();

  // Generate random 8-character alphanumeric key
  const generateRandomEnrollKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const form = useForm({
    defaultValues: {
      name: course?.name || '',
      description: course?.description || '',
      enroll_key: course?.enroll_key || '',
      image: null as File | null,
    },
    onSubmit: async ({ value }) => {
      if (!accessToken) return;

      if (isEditMode) {
        // Edit mode - update name, description, and enroll_key
        try {
          // Validate enroll_key if provided
          if (value.enroll_key && value.enroll_key.trim() !== '') {
            if (value.enroll_key.trim().length < 4) {
              form.setFieldMeta('enroll_key', (meta) => ({
                ...meta,
                errors: ['รหัสลงทะเบียนต้องมีอย่างน้อย 4 ตัวอักษร'],
              }));
              return;
            }
            if (value.enroll_key.trim().length > 50) {
              form.setFieldMeta('enroll_key', (meta) => ({
                ...meta,
                errors: ['รหัสลงทะเบียนต้องไม่เกิน 50 ตัวอักษร'],
              }));
              return;
            }
          }

          // Update course data
          await updateMutation.mutateAsync({
            token: accessToken,
            courseId: course!.course_id,
            updates: {
              name: value.name.trim(),
              description: value.description.trim(),
              enroll_key: value.enroll_key.trim() || undefined,
            },
          });

          // Upload image if provided
          if (value.image) {
            await uploadImageMutation.mutateAsync({
              token: accessToken,
              courseId: course!.course_id,
              image: value.image,
            });
          }

          form.reset();
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          // Error is handled by the mutation
          console.error('Failed to update course:', error);
        }
      } else {
        // Create mode - validate with zod schema
        const result = courseSchema.safeParse(value);
        if (!result.success) {
          // Set field errors
          result.error.issues.forEach((issue) => {
            const fieldName = issue.path[0] as keyof typeof value;
            if (fieldName) {
              form.setFieldMeta(fieldName, (meta) => ({
                ...meta,
                errors: [issue.message],
              }));
            }
          });
          return;
        }

        try {
          await createMutation.mutateAsync({
            token: accessToken,
            name: result.data.name,
            description: result.data.description,
            enroll_key: result.data.enroll_key,
            image: result.data.image || undefined,
          });
          form.reset();
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          // Error is handled by the mutation
          console.error('Failed to create course:', error);
        }
      }
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (course) {
        // Edit mode - load course data
        form.setFieldValue('name', course.name);
        form.setFieldValue('description', course.description);
        form.setFieldValue('enroll_key', course.enroll_key || '');
        form.setFieldValue('image', null);
      } else {
        // Create mode - reset to empty
        form.setFieldValue('name', '');
        form.setFieldValue('description', '');
        form.setFieldValue('enroll_key', '');
        form.setFieldValue('image', null);
      }
      setImagePreview(null);
    }
  }, [isOpen, form, course]);

  // Helper function to create preview from file
  const createImagePreview = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleClose = () => {
    const isPending = isEditMode ? updateMutation.isPending : createMutation.isPending;
    if (!isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'แก้ไขคอร์สเรียน' : 'เพิ่มคอร์สเรียน'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'แก้ไขข้อมูลคอร์สเรียน' : 'กรอกข้อมูลคอร์สเรียนที่ต้องการสร้าง'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4 py-4">
            {/* Course Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === '') {
                    return 'กรุณากรอกชื่อคอร์ส';
                  }
                  if (value.trim().length < 3) {
                    return 'ชื่อคอร์สต้องมีอย่างน้อย 3 ตัวอักษร';
                  }
                  if (value.trim().length > 100) {
                    return 'ชื่อคอร์สต้องไม่เกิน 100 ตัวอักษร';
                  }
                  return undefined;
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="name">
                    ชื่อคอร์ส <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="เช่น วิชาโครงสร้างข้อมูล"
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
            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim() === '') {
                    return 'กรุณากรอกคำอธิบายคอร์ส';
                  }
                  if (value.trim().length < 10) {
                    return 'คำอธิบายคอร์สต้องมีอย่างน้อย 10 ตัวอักษร';
                  }
                  if (value.trim().length > 1000) {
                    return 'คำอธิบายคอร์สต้องไม่เกิน 1000 ตัวอักษร';
                  }
                  return undefined;
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="description">
                    คำอธิบายคอร์ส <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="อธิบายรายละเอียดของคอร์สเรียน..."
                    rows={4}
                    className={`mt-1 ${
                      field.state.meta.errors.length > 0
                        ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                        : ''
                    }`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                  )}
                  <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                    {field.state.value.length}/1000 ตัวอักษร
                  </p>
                </div>
              )}
            </form.Field>

            {/* Enroll Key */}
            <form.Field
              name="enroll_key"
              validators={{
                onChange: ({ value }) => {
                  if (isEditMode) {
                    // In edit mode, enroll_key is optional
                    if (value && value.trim() !== '') {
                      if (value.trim().length < 4) {
                        return 'รหัสลงทะเบียนต้องมีอย่างน้อย 4 ตัวอักษร';
                      }
                      if (value.trim().length > 50) {
                        return 'รหัสลงทะเบียนต้องไม่เกิน 50 ตัวอักษร';
                      }
                    }
                    return undefined;
                  } else {
                    // In create mode, enroll_key is required
                    if (!value || value.trim() === '') {
                      return 'กรุณากรอกรหัสลงทะเบียน';
                    }
                    if (value.trim().length < 4) {
                      return 'รหัสลงทะเบียนต้องมีอย่างน้อย 4 ตัวอักษร';
                    }
                    if (value.trim().length > 50) {
                      return 'รหัสลงทะเบียนต้องไม่เกิน 50 ตัวอักษร';
                    }
                    return undefined;
                  }
                },
                onChangeAsyncDebounceMs: 500,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="enroll_key">
                    รหัสลงทะเบียน {!isEditMode && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="enroll_key"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="เช่น CS1012024"
                      className={`flex-1 ${
                        field.state.meta.errors.length > 0
                          ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => field.handleChange(generateRandomEnrollKey())}
                      title="สุ่มรหัส"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                  )}
                  <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                    {isEditMode
                      ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสลงทะเบียน'
                      : 'รหัสที่นักเรียนต้องใช้เพื่อลงทะเบียนในคอร์สนี้'}
                  </p>
                </div>
              )}
            </form.Field>

            {/* Image Upload */}
            <form.Field
              name="image"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                  if (!allowedTypes.includes(value.type)) {
                    return 'ไฟล์ต้องเป็น JPEG, PNG หรือ WebP เท่านั้น';
                  }
                  const maxSize = 5 * 1024 * 1024; // 5MB
                  if (value.size > maxSize) {
                    return 'ไฟล์ใหญ่เกิน 5MB';
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor="image">รูปภาพคอร์ส (ไม่บังคับ)</Label>
                  <div className="mt-1">
                    {/* Show current image in edit mode */}
                    {isEditMode &&
                      course?.image_url &&
                      isValidImageUrl(course.image_url) &&
                      !field.state.value && (
                        <div className="mb-2">
                          <p className="dark:text-muted-foreground mb-1 text-xs text-gray-500">
                            รูปภาพปัจจุบัน:
                          </p>
                          <div className="border-border relative h-48 w-full overflow-hidden rounded-lg border">
                            <Image
                              src={transformImageUrl(course.image_url)}
                              alt="Current course image"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        </div>
                      )}

                    {/* Show preview of selected image */}
                    {imagePreview && (
                      <div className="mb-2">
                        <p className="dark:text-muted-foreground mb-1 text-xs text-gray-500">
                          {isEditMode ? 'รูปภาพใหม่:' : 'รูปภาพตัวอย่าง:'}
                        </p>
                        <div className="border-border relative h-48 w-full overflow-hidden rounded-lg border">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="image-upload"
                        className="dark:border-border dark:bg-background dark:text-foreground dark:hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" />
                        {field.state.value
                          ? 'เปลี่ยนรูปภาพ'
                          : isEditMode
                            ? 'เลือกรูปภาพใหม่'
                            : 'เลือกรูปภาพ'}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          field.handleChange(file);
                          createImagePreview(file);
                        }}
                        onBlur={field.handleBlur}
                      />
                      {field.state.value && (
                        <div className="flex items-center gap-2">
                          <span className="dark:text-muted-foreground text-sm text-gray-600">
                            {field.state.value.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              field.handleChange(null);
                              setImagePreview(null);
                            }}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>
                    )}
                    <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                      รองรับไฟล์ JPEG, PNG, WebP ขนาดไม่เกิน 5MB
                    </p>
                  </div>
                </div>
              )}
            </form.Field>

            {/* Invitation Links Section - Only in edit mode */}
            {isEditMode && course && (
              <>
                <div className="border-border my-4 border-t" />
                <div className="space-y-3">
                  <div>
                    <Label>ลิงก์เชิญเข้าร่วมคอร์ส</Label>
                    <p className="dark:text-muted-foreground mt-1 text-xs text-gray-500">
                      สร้างลิงก์เชิญเพื่อให้นักเรียนลงทะเบียนเรียนโดยไม่ต้องใช้รหัสลงทะเบียน
                    </p>
                  </div>
                  {latestInvitation ? (
                    <div className="space-y-2">
                      <div className="border-border bg-muted/50 rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground text-xs break-all">
                              {`${window.location.origin}/course/invite/${latestInvitation.token}`}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              หมดอายุ:{' '}
                              {format(new Date(latestInvitation.expires_at), 'dd MMM yyyy, HH:mm', {
                                locale: th,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          const fullUrl = `${window.location.origin}/course/invite/${latestInvitation.token}`;
                          try {
                            await navigator.clipboard.writeText(fullUrl);
                            setIsCopied(true);
                            toast.success('คัดลอกลิงก์เชิญสำเร็จ');
                            setTimeout(() => setIsCopied(false), 2000);
                          } catch (error) {
                            console.error('Failed to copy link:', error);
                            toast.error('ไม่สามารถคัดลอกลิงก์ได้');
                          }
                        }}
                      >
                        {isCopied ? (
                          <>
                            <span className="mr-2">✓</span>
                            คัดลอกแล้ว
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            คัดลอกลิงก์
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setLatestInvitation(null);
                          setIsCopied(false);
                        }}
                      >
                        สร้างลิงก์ใหม่
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        if (!accessToken || !course) return;
                        try {
                          const result = await createInvitationMutation.mutateAsync({
                            token: accessToken,
                            courseId: course.course_id,
                          });
                          if (result?.data) {
                            setLatestInvitation(result.data);
                            refetchInvitations();
                          }
                        } catch (error) {
                          console.error('Failed to create invitation:', error);
                        }
                      }}
                      disabled={createInvitationMutation.isPending}
                    >
                      {createInvitationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          กำลังสร้าง...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          สร้างลิงก์เชิญ
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={
                isEditMode
                  ? updateMutation.isPending || uploadImageMutation.isPending
                  : createMutation.isPending
              }
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={
                isEditMode
                  ? updateMutation.isPending || uploadImageMutation.isPending
                  : createMutation.isPending
              }
            >
              {isEditMode ? (
                updateMutation.isPending || uploadImageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
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
                'สร้างคอร์ส'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
