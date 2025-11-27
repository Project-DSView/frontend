import { z } from 'zod';

/**
 * File validation constants for materials
 */
export const MATERIAL_FILE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];
const ALLOWED_PDF_MIME_TYPES = ['application/pdf'];
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Base schema fields shared by all material types
 */
const baseMaterialSchema = {
  title: z
    .string()
    .min(1, 'กรุณากรอกชื่อเนื้อหา')
    .min(3, 'ชื่อเนื้อหาต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(255, 'ชื่อเนื้อหาต้องไม่เกิน 255 ตัวอักษร')
    .trim(),
  description: z
    .string()
    .max(1000, 'คำอธิบายต้องไม่เกิน 1000 ตัวอักษร')
    .trim()
    .optional()
    .nullable(),
  week: z.number().int('สัปดาห์ต้องเป็นจำนวนเต็ม').min(1, 'สัปดาห์ต้องมีค่าอย่างน้อย 1'),
  is_public: z.boolean().default(true),
};

/**
 * Document material schema
 */
const documentMaterialSchema = z.object({
  ...baseMaterialSchema,
  type: z.literal('document'),
  file: z
    .instanceof(File, { message: 'ไฟล์ไม่ถูกต้อง' })
    .refine(
      (file) => {
        return ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type);
      },
      { message: 'ไฟล์ต้องเป็น PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX หรือ TXT เท่านั้น' },
    )
    .refine(
      (file) => {
        return file.size <= MATERIAL_FILE_MAX_SIZE;
      },
      { message: 'ไฟล์ใหญ่เกิน 10MB' },
    ),
});

/**
 * Video material schema
 */
const videoMaterialSchema = z.object({
  ...baseMaterialSchema,
  type: z.literal('video'),
  video_url: z.string().min(1, 'กรุณากรอก URL ของวิดีโอ').url('URL ไม่ถูกต้อง').trim(),
});

/**
 * Test case schema for code exercises
 */
const testCaseSchema = z.object({
  input_data: z
    .string()
    .min(1, 'กรุณากรอก input data')
    .refine(
      (val) => {
        // Try to parse as JSON if it looks like JSON, otherwise accept as plain text
        if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        }
        return true; // Plain text is valid
      },
      { message: 'รูปแบบ JSON ไม่ถูกต้อง' },
    ),
  expected_output: z
    .string()
    .min(1, 'กรุณากรอก expected output')
    .refine(
      (val) => {
        // Try to parse as JSON if it looks like JSON, otherwise accept as plain text
        if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        }
        return true; // Plain text is valid
      },
      { message: 'รูปแบบ JSON ไม่ถูกต้อง' },
    ),
  display_name: z.string().trim().optional().nullable(),
});

/**
 * Code exercise material schema
 */
const codeExerciseMaterialSchema = z.object({
  ...baseMaterialSchema,
  type: z.literal('code_exercise'),
  total_points: z
    .number()
    .int('คะแนนเต็มต้องเป็นจำนวนเต็ม')
    .min(1, 'คะแนนเต็มต้องมีค่าอย่างน้อย 1'),
  deadline: z.string().datetime('รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น ISO 8601)').optional().nullable(),
  problem_statement: z
    .string()
    .min(1, 'กรุณากรอกโจทย์')
    .min(10, 'โจทย์ต้องมีอย่างน้อย 10 ตัวอักษร')
    .trim(),
  constraints: z.string().trim().optional().nullable(),
  hints: z.string().trim().optional().nullable(),
  file: z
    .instanceof(File, { message: 'ไฟล์ไม่ถูกต้อง' })
    .optional()
    .nullable()
    .refine(
      (file) => {
        if (!file) return true;
        return ALLOWED_IMAGE_MIME_TYPES.includes(file.type);
      },
      { message: 'ไฟล์รูปภาพต้องเป็น JPEG, PNG หรือ WebP เท่านั้น' },
    )
    .refine(
      (file) => {
        if (!file) return true;
        return file.size <= MATERIAL_FILE_MAX_SIZE;
      },
      { message: 'ไฟล์รูปภาพใหญ่เกิน 10MB' },
    ),
  test_cases: z
    .array(testCaseSchema)
    .min(1, 'ต้องมีอย่างน้อย 1 test case')
    .max(10, 'ไม่สามารถเพิ่ม test case ได้เกิน 10 กรณี'),
});

/**
 * PDF exercise material schema
 */
const pdfExerciseMaterialSchema = z.object({
  ...baseMaterialSchema,
  type: z.literal('pdf_exercise'),
  total_points: z
    .number()
    .int('คะแนนเต็มต้องเป็นจำนวนเต็ม')
    .min(1, 'คะแนนเต็มต้องมีค่าอย่างน้อย 1'),
  deadline: z.string().datetime('รูปแบบวันที่ไม่ถูกต้อง (ต้องเป็น ISO 8601)').optional().nullable(),
  file: z
    .instanceof(File, { message: 'ไฟล์ไม่ถูกต้อง' })
    .refine(
      (file) => {
        return ALLOWED_PDF_MIME_TYPES.includes(file.type);
      },
      { message: 'ไฟล์ต้องเป็น PDF เท่านั้น' },
    )
    .refine(
      (file) => {
        return file.size <= MATERIAL_FILE_MAX_SIZE;
      },
      { message: 'ไฟล์ใหญ่เกิน 10MB' },
    ),
});

/**
 * Announcement material schema
 */
const announcementMaterialSchema = z.object({
  ...baseMaterialSchema,
  type: z.literal('announcement'),
  content: z
    .string()
    .min(1, 'กรุณากรอกเนื้อหาประกาศ')
    .min(10, 'เนื้อหาประกาศต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(5000, 'เนื้อหาประกาศต้องไม่เกิน 5000 ตัวอักษร')
    .trim(),
});

/**
 * Union schema for all material types
 */
const materialSchema = z.discriminatedUnion('type', [
  documentMaterialSchema,
  videoMaterialSchema,
  codeExerciseMaterialSchema,
  pdfExerciseMaterialSchema,
  announcementMaterialSchema,
]);

type MaterialFormData = z.infer<typeof materialSchema>;
type DocumentMaterialFormData = z.infer<typeof documentMaterialSchema>;
type VideoMaterialFormData = z.infer<typeof videoMaterialSchema>;
type CodeExerciseMaterialFormData = z.infer<typeof codeExerciseMaterialSchema>;
type PDFExerciseMaterialFormData = z.infer<typeof pdfExerciseMaterialSchema>;
type AnnouncementMaterialFormData = z.infer<typeof announcementMaterialSchema>;

export {
  materialSchema,
  baseMaterialSchema,
  documentMaterialSchema,
  videoMaterialSchema,
  codeExerciseMaterialSchema,
  pdfExerciseMaterialSchema,
  announcementMaterialSchema,
  type MaterialFormData,
  type DocumentMaterialFormData,
  type VideoMaterialFormData,
  type CodeExerciseMaterialFormData,
  type PDFExerciseMaterialFormData,
  type AnnouncementMaterialFormData,
};
