import { QueryClient } from '@tanstack/react-query';

// Create a separate query client for development with enhanced logging
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour - cache time
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: (failureCount, error) => {
          // Don't retry on 401 errors
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401) {
              return false;
            }
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
};

export { createQueryClient };
