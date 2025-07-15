import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
  useQueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

// Query client configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on authentication errors
          if (error instanceof Error && error.message.includes('401')) {
            return false;
          }
          // Don't retry on client errors (4xx)
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        refetchOnMount: 'always',
      },
      mutations: {
        // Global mutation defaults
        retry: (failureCount, error) => {
          // Don't retry mutations on authentication errors
          if (error instanceof Error && error.message.includes('401')) {
            return false;
          }
          // Don't retry on client errors (4xx)
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          // Retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
    queryCache: new QueryCache({
      onError: (error: Error, query: any) => {
        // Global error handling
        const uiStore = useUIStore.getState();
        const queryMeta = query.meta as { errorMessage?: string } | undefined;

        const errorMessage = queryMeta?.errorMessage || 'An error occurred';
        uiStore.setError('query', errorMessage, 'QUERY_ERROR');

        // Log error for debugging
        console.error('Query error:', error, query);
      },
      onSuccess: (data: any, query: any) => {
        // Clear any existing query errors
        const uiStore = useUIStore.getState();
        uiStore.clearError('query');

        // Log successful queries in development
        if (import.meta.env.DEV) {
          console.log('Query success:', query.queryKey, data);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (
        error: Error,
        _variables: any,
        _context: any,
        mutation: any
      ) => {
        // Global mutation error handling
        const uiStore = useUIStore.getState();
        const mutationMeta = mutation.meta as
          | { errorMessage?: string }
          | undefined;

        const errorMessage = mutationMeta?.errorMessage || 'An error occurred';
        uiStore.setError('mutation', errorMessage, 'MUTATION_ERROR');

        // Show error toast
        uiStore.addToast({
          type: 'error',
          title: 'Operation Failed',
          message: errorMessage,
          duration: 5000,
        });

        // Log error for debugging
        console.error('Mutation error:', error, _variables, _context, mutation);
      },
      onSuccess: (data: any, _variables: any, _context: any, mutation: any) => {
        // Clear any existing mutation errors
        const uiStore = useUIStore.getState();
        uiStore.clearError('mutation');

        // Show success toast if specified
        const mutationMeta = mutation.meta as
          | { successMessage?: string }
          | undefined;
        if (mutationMeta?.successMessage) {
          uiStore.addToast({
            type: 'success',
            title: 'Success',
            message: mutationMeta.successMessage,
            duration: 3000,
          });
        }

        // Log successful mutations in development
        if (import.meta.env.DEV) {
          console.log('Mutation success:', mutation.mutationKey, data);
        }
      },
    }),
  });
};

// Performance monitoring for queries
const setupPerformanceMonitoring = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(['*'], {
    onMutate: async () => {
      // Start performance measurement
      const startTime = performance.now();
      return { startTime };
    },
    onSettled: async (_data, _error, _variables, context) => {
      // End performance measurement
      if (context?.startTime) {
        const duration = performance.now() - context.startTime;
        const uiStore = useUIStore.getState();
        uiStore.setLastApiCallTime(duration);

        // Log slow mutations in development
        if (import.meta.env.DEV && duration > 2000) {
          console.warn('Slow mutation detected:', duration, 'ms');
        }
      }
    },
  });
};

// Handle authentication state changes
const setupAuthHandling = (queryClient: QueryClient) => {
  // Listen for auth state changes
  let previousIsAuthenticated = useAuthStore.getState().isAuthenticated;

  useAuthStore.subscribe(state => {
    const isAuthenticated = state.isAuthenticated;
    if (previousIsAuthenticated && !isAuthenticated) {
      // User logged out, clear all queries
      queryClient.clear();
    } else if (!previousIsAuthenticated && isAuthenticated) {
      // User logged in, invalidate all queries to refresh with new auth
      queryClient.invalidateQueries();
    }
    previousIsAuthenticated = isAuthenticated;
  });
};

// Query provider component
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(() => {
    const client = createQueryClient();
    setupPerformanceMonitoring(client);
    setupAuthHandling(client);
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position={'bottom-right' as any}
        />
      )}
    </QueryClientProvider>
  );
};

// Hook for query performance monitoring
export const useQueryPerformance = () => {
  const queryClient = useQueryClient();
  const uiStore = useUIStore();

  const getQueryStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const stats = {
      total: queries.length,
      fresh: queries.filter(
        (q: any) => q.state.status === 'success' && !q.isStale()
      ).length,
      stale: queries.filter((q: any) => q.isStale()).length,
      loading: queries.filter((q: any) => q.state.status === 'loading').length,
      error: queries.filter((q: any) => q.state.status === 'error').length,
      idle: queries.filter((q: any) => q.state.status === 'idle').length,
    };

    return stats;
  };

  const clearStaleQueries = () => {
    queryClient.removeQueries({
      predicate: (query: any) => query.isStale(),
    });
  };

  const clearErrorQueries = () => {
    queryClient.removeQueries({
      predicate: (query: any) => query.state.status === 'error',
    });
  };

  const getSlowQueries = (threshold = 2000) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return queries
      .filter((query: any) => {
        const fetchTime =
          query.state.dataUpdatedAt - query.state.fetcherStartTime;
        return fetchTime > threshold;
      })
      .map((query: any) => ({
        queryKey: query.queryKey,
        fetchTime: query.state.dataUpdatedAt - query.state.fetcherStartTime,
        status: query.state.status,
      }));
  };

  return {
    getQueryStats,
    clearStaleQueries,
    clearErrorQueries,
    getSlowQueries,
    lastApiCallTime: uiStore.lastApiCallTime,
  };
};

// Hook for query debugging
export const useQueryDebug = () => {
  const queryClient = useQueryClient();

  const logQueryState = (queryKey: string[]) => {
    const query = queryClient.getQueryCache().find({
      queryKey,
    });

    if (query) {
      console.log('Query state:', {
        queryKey: query.queryKey,
        status: query.state.status,
        data: query.state.data,
        error: query.state.error,
        isStale: query.isStale(),
        fetchStatus: query.state.fetchStatus,
        dataUpdatedAt: new Date(query.state.dataUpdatedAt).toISOString(),
      });
    } else {
      console.log('Query not found:', queryKey);
    }
  };

  const logAllQueries = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    console.log(
      'All queries:',
      queries.map((query: any) => ({
        queryKey: query.queryKey,
        status: query.state.status,
        isStale: query.isStale(),
        fetchStatus: query.state.fetchStatus,
      }))
    );
  };

  const logCacheSize = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const totalSize = queries.reduce((size: number, query: any) => {
      return size + (JSON.stringify(query.state.data)?.length || 0);
    }, 0);

    console.log('Cache size:', {
      queries: queries.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    });
  };

  return {
    logQueryState,
    logAllQueries,
    logCacheSize,
  };
};

export default QueryProvider;
