import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

import { trpc, trpcClient } from './trpc';

const queryClient = new QueryClient();

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/*<ReactQueryDevtools initialIsOpen={false} />*/}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
