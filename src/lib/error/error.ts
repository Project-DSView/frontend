const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    // Handle Axios errors
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
        status?: number;
      };
      message?: string;
    };

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }

    if (axiosError.message) {
      return axiosError.message;
    }

    // Handle status code specific messages
    if (axiosError.response?.status) {
      return getStatusErrorMessage(axiosError.response.status);
    }
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

const getStatusErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    case 401:
      return 'กรุณาเข้าสู่ระบบอีกครั้ง';
    case 403:
      return 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
    case 404:
      return 'ไม่พบข้อมูลที่ต้องการ';
    case 409:
      return 'ข้อมูลซ้ำกับที่มีอยู่แล้ว';
    case 422:
      return 'ข้อมูลไม่ถูกต้องตามเงื่อนไข';
    case 429:
      return 'คุณทำการร้องขอบ่อยเกินไป กรุณาลองอีกครั้งในภายหลัง';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง';
    default:
      return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
  }
};

const getErrorDetails = (
  error: unknown,
): {
  message: string;
  status?: number;
  code?: string;
  field?: string;
} => {
  const message = getErrorMessage(error);

  if (error && typeof error === 'object') {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
          code?: string;
          field?: string;
        };
        status?: number;
      };
    };

    return {
      message,
      status: axiosError.response?.status,
      code: axiosError.response?.data?.code,
      field: axiosError.response?.data?.field,
    };
  }

  return { message };
};

const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const axiosError = error as {
      code?: string;
      message?: string;
    };
    return (
      axiosError.code === 'NETWORK_ERROR' ||
      axiosError.code === 'ECONNABORTED' ||
      (axiosError.message?.includes('Network Error') ?? false) ||
      (axiosError.message?.includes('timeout') ?? false)
    );
  }
  return false;
};

const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const axiosError = error as {
      response?: {
        status?: number;
      };
    };
    return axiosError.response?.status === 401 || axiosError.response?.status === 403;
  }
  return false;
};

const isValidationError = (error: unknown): boolean => {
  if (error && typeof error === 'object') {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          type?: string;
        };
      };
    };
    const status = axiosError.response?.status;
    const errorType = axiosError.response?.data?.type;
    return status === 400 || status === 422 || errorType === 'validation';
  }
  return false;
};

const formatErrorForDisplay = (error: unknown): string => {
  const details = getErrorDetails(error);

  if (details.status) {
    return getStatusErrorMessage(details.status);
  }

  return details.message;
};

/**
 * Log error with context
 */
const logError = (message: string, error: unknown): void => {
  console.error(message, error);

  // In production, you might want to send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, { message });
  }
};

export {
  getErrorMessage,
  getStatusErrorMessage,
  getErrorDetails,
  isNetworkError,
  isAuthError,
  isValidationError,
  formatErrorForDisplay,
  logError,
};
