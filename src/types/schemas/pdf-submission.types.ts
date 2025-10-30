import { z } from 'zod';

/**
 * Zod schema for PDF submission validation
 * (re-exported from lib for types)
 */
import { pdfSubmissionSchema } from '@/lib/schemas/pdf-submission.schema';

/**
 * Type inference for PDF submission form data
 */
type PDFSubmissionFormData = z.infer<typeof pdfSubmissionSchema>;

/**
 * Type for the form state (including file)
 */
type PDFSubmissionFormState = {
  file: File | null;
};

export type { PDFSubmissionFormData, PDFSubmissionFormState };
