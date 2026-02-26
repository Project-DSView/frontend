import { z } from 'zod';
import { pdfSubmissionSchema } from '@/lib/schemas/pdf-submission.schema';

// ============================================================================
// PDF Submission Schema Types
// ============================================================================
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

// ============================================================================
// Utils Schema Types
// ============================================================================
interface ExportOptions {
  filename?: string;
  quality?: number;
}

// ============================================================================
// Exports
// ============================================================================
export type { PDFSubmissionFormData, PDFSubmissionFormState, ExportOptions };
