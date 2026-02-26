'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';
import { createQueryClient, devToolsConfig } from '@/lib';

const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {devToolsConfig.reactQuery.enabled && (
        <ReactQueryDevtools
          initialIsOpen={devToolsConfig.reactQuery.initialIsOpen}
          position={devToolsConfig.reactQuery.position}
          buttonPosition={devToolsConfig.reactQuery.buttonPosition}
        />
      )}
    </QueryClientProvider>
  );
};

export { ReactQueryProvider };
