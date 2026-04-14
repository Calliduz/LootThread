import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Global retry: 1 for resilience without long wait
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
      refetchOnWindowFocus: false, // Avoid refetching when switching tabs
    },
    mutations: {
      retry: 0, // No retries for mutations by default
    },
  },
});
