import { z } from 'zod';

/**
 * File validation schema for PDF submissions
 */
const FILE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

/**
 * Zod schema for validating PDF file submissions
 */
const pdfSubmissionSchema = z.object({
  file: z
    .instanceof(File, { message: 'กรุณาเลือกไฟล์ PDF' })
    .refine(
      (file) => {
        // Check file type
        return ALLOWED_MIME_TYPES.includes(file.type);
      },
      { message: 'ไฟล์ต้องเป็น PDF เท่านั้น' },
    )
    .refine(
      (file) => {
        // Check file size (10MB limit)
        return file.size <= FILE_MAX_SIZE;
      },
      { message: 'ไฟล์ใหญ่เกิน 10MB' },
    ),
});

export { pdfSubmissionSchema };
