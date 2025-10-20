/**
 * Validation utility functions
 */

/**
 * Validate PDF file for submission
 */
export const validatePDFFile = (file: File): string | null => {
  if (file.type !== 'application/pdf') {
    return 'ไฟล์ต้องเป็น PDF เท่านั้น';
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'ไฟล์ใหญ่เกิน 10MB';
  }

  return null;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `ไฟล์ต้องเป็น ${allowedTypes.join(', ')} เท่านั้น`;
  }
  return null;
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeBytes: number): string | null => {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(1);
    return `ไฟล์ใหญ่เกิน ${maxSizeMB}MB`;
  }
  return null;
};

/**
 * Generic file validation
 */
export const validateFile = (
  file: File,
  options: {
    allowedTypes?: string[];
    maxSizeBytes?: number;
    customValidator?: (file: File) => string | null;
  } = {},
): string | null => {
  const { allowedTypes, maxSizeBytes, customValidator } = options;

  // Custom validation first
  if (customValidator) {
    const customError = customValidator(file);
    if (customError) return customError;
  }

  // Type validation
  if (allowedTypes && allowedTypes.length > 0) {
    const typeError = validateFileType(file, allowedTypes);
    if (typeError) return typeError;
  }

  // Size validation
  if (maxSizeBytes) {
    const sizeError = validateFileSize(file, maxSizeBytes);
    if (sizeError) return sizeError;
  }

  return null;
};
