import { z } from 'zod';

/**
 * File validation constants for feedback files
 */
const FEEDBACK_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FEEDBACK_MIME_TYPES = ['application/pdf'];

/**
 * Zod schema for validating grading form
 */
const gradingSchema = z
  .object({
    score: z
      .string()
      .min(1, 'กรุณากรอกคะแนน')
      .refine(
        (val) => {
          const num = parseInt(val, 10);
          return !isNaN(num) && num >= 0;
        },
        { message: 'คะแนนต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0' },
      )
      .transform((val) => parseInt(val, 10)),
    maxScore: z
      .string()
      .min(1, 'กรุณากรอกคะแนนเต็ม')
      .refine(
        (val) => {
          const num = parseInt(val, 10);
          return !isNaN(num) && num > 0;
        },
        { message: 'คะแนนเต็มต้องเป็นตัวเลขที่มากกว่า 0' },
      )
      .transform((val) => parseInt(val, 10)),
    comment: z.string().min(1, 'กรุณากรอกคำติชม').min(3, 'คำติชมต้องมีอย่างน้อย 3 ตัวอักษร').trim(),
    feedbackFile: z
      .instanceof(File, { message: 'ไฟล์ไม่ถูกต้อง' })
      .optional()
      .nullable()
      .refine(
        (file) => {
          if (!file) return true;
          return ALLOWED_FEEDBACK_MIME_TYPES.includes(file.type);
        },
        { message: 'ไฟล์ต้องเป็น PDF เท่านั้น' },
      )
      .refine(
        (file) => {
          if (!file) return true;
          return file.size <= FEEDBACK_FILE_MAX_SIZE;
        },
        { message: 'ไฟล์ใหญ่เกิน 10MB' },
      ),
  })
  .refine(
    (data) => {
      return data.score <= data.maxScore;
    },
    {
      message: 'คะแนนต้องไม่เกินคะแนนเต็ม',
      path: ['score'],
    },
  );

type GradingFormData = z.infer<typeof gradingSchema>;

export { gradingSchema, type GradingFormData };
