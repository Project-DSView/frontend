import { z } from 'zod';

/**
 * File validation constants for course images
 */
const COURSE_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Zod schema for validating course creation form
 */
const courseSchema = z.object({
  name: z
    .string()
    .min(1, 'กรุณากรอกชื่อคอร์ส')
    .min(3, 'ชื่อคอร์สต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(100, 'ชื่อคอร์สต้องไม่เกิน 100 ตัวอักษร')
    .trim(),
  description: z
    .string()
    .min(1, 'กรุณากรอกคำอธิบายคอร์ส')
    .min(10, 'คำอธิบายคอร์สต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(1000, 'คำอธิบายคอร์สต้องไม่เกิน 1000 ตัวอักษร')
    .trim(),
  enroll_key: z
    .string()
    .min(1, 'กรุณากรอกรหัสลงทะเบียน')
    .min(4, 'รหัสลงทะเบียนต้องมีอย่างน้อย 4 ตัวอักษร')
    .max(50, 'รหัสลงทะเบียนต้องไม่เกิน 50 ตัวอักษร')
    .trim(),
  image: z
    .instanceof(File, { message: 'ไฟล์ไม่ถูกต้อง' })
    .optional()
    .nullable()
    .refine(
      (file) => {
        if (!file) return true;
        return ALLOWED_IMAGE_MIME_TYPES.includes(file.type);
      },
      { message: 'ไฟล์ต้องเป็น JPEG, PNG หรือ WebP เท่านั้น' },
    )
    .refine(
      (file) => {
        if (!file) return true;
        return file.size <= COURSE_IMAGE_MAX_SIZE;
      },
      { message: 'ไฟล์ใหญ่เกิน 5MB' },
    ),
});

type CourseFormData = z.infer<typeof courseSchema>;

export { courseSchema, type CourseFormData };
