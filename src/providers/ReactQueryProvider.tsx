'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 60 * 1000, // 30 minutes - increased from 5 minutes
            gcTime: 60 * 60 * 1000, // 1 hour - cache time
            refetchOnWindowFocus: false, // Don't refetch when window gains focus
            refetchOnMount: false, // Don't refetch on component mount if data is fresh
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
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { ReactQueryProvider };
