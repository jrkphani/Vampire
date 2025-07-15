import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { customerService } from '@/services/api';
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  SearchCustomersParams,
  CreditRatingResponse,
} from '@/types/api';
import type { Customer } from '@/types/business';
import type { PaginatedResponse } from '@/types/api';

// Query keys for consistent caching
export const customerQueryKeys = {
  all: ['customers'] as const,
  lists: () => [...customerQueryKeys.all, 'list'] as const,
  list: (params: SearchCustomersParams) =>
    [...customerQueryKeys.lists(), params] as const,
  details: () => [...customerQueryKeys.all, 'detail'] as const,
  detail: (customerId: string) =>
    [...customerQueryKeys.details(), customerId] as const,
  activeTickets: (customerId: string) =>
    [...customerQueryKeys.detail(customerId), 'active-tickets'] as const,
  transactions: (customerId: string) =>
    [...customerQueryKeys.detail(customerId), 'transactions'] as const,
  creditRating: (customerId: string) =>
    [...customerQueryKeys.detail(customerId), 'credit-rating'] as const,
  summary: (customerId: string) =>
    [...customerQueryKeys.detail(customerId), 'summary'] as const,
  verification: (customerId: string, nric: string) =>
    [...customerQueryKeys.detail(customerId), 'verification', nric] as const,
  duplicate: (nric: string) =>
    [...customerQueryKeys.all, 'duplicate', nric] as const,
};

// Hook to fetch a single customer
export const useCustomer = (customerId: string, enabled = true) => {
  return useQuery({
    queryKey: customerQueryKeys.detail(customerId),
    queryFn: () => customerService.getCustomer(customerId),
    enabled: enabled && !!customerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
    meta: {
      errorMessage: `Failed to fetch customer ${customerId}`,
    },
  });
};

// Hook to search customers with pagination
export const useSearchCustomers = (
  params: SearchCustomersParams,
  enabled = true
) => {
  return useQuery({
    queryKey: customerQueryKeys.list(params),
    queryFn: () => customerService.searchCustomers(params),
    enabled: enabled && !!params.query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData, // Keep previous data while loading new results
    meta: {
      errorMessage: 'Failed to search customers',
    },
  });
};

// Hook to fetch customer's active tickets
export const useCustomerActiveTickets = (
  customerId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: customerQueryKeys.activeTickets(customerId),
    queryFn: () => customerService.getCustomerActiveTickets(customerId),
    enabled: enabled && !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: `Failed to fetch active tickets for customer ${customerId}`,
    },
  });
};

// Hook to fetch customer's transaction history
export const useCustomerTransactionHistory = (
  customerId: string,
  limit = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: customerQueryKeys.transactions(customerId),
    queryFn: () =>
      customerService.getCustomerTransactionHistory(customerId, limit),
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: `Failed to fetch transaction history for customer ${customerId}`,
    },
  });
};

// Hook to fetch customer's credit rating
export const useCustomerCreditRating = (customerId: string, enabled = true) => {
  return useQuery({
    queryKey: customerQueryKeys.creditRating(customerId),
    queryFn: () => customerService.getCustomerCreditRating(customerId),
    enabled: enabled && !!customerId,
    staleTime: 15 * 60 * 1000, // 15 minutes - credit rating doesn't change frequently
    meta: {
      errorMessage: `Failed to fetch credit rating for customer ${customerId}`,
    },
  });
};

// Hook to fetch customer summary
export const useCustomerSummary = (customerId: string, enabled = true) => {
  return useQuery({
    queryKey: customerQueryKeys.summary(customerId),
    queryFn: () => customerService.getCustomerSummary(customerId),
    enabled: enabled && !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: `Failed to fetch customer summary for ${customerId}`,
    },
  });
};

// Hook to verify customer identity
export const useCustomerVerification = (
  customerId: string,
  nric: string,
  enabled = true
) => {
  return useQuery({
    queryKey: customerQueryKeys.verification(customerId, nric),
    queryFn: () => customerService.verifyCustomerIdentity(customerId, nric),
    enabled: enabled && !!customerId && !!nric,
    staleTime: 30 * 60 * 1000, // 30 minutes
    meta: {
      errorMessage: `Failed to verify customer identity`,
    },
  });
};

// Hook to check for duplicate customers
export const useCheckDuplicateCustomer = (nric: string, enabled = true) => {
  return useQuery({
    queryKey: customerQueryKeys.duplicate(nric),
    queryFn: () => customerService.checkDuplicateCustomer(nric),
    enabled: enabled && !!nric,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to check for duplicate customer',
    },
  });
};

// Hook for customer mutations
export const useCustomerMutations = () => {
  const queryClient = useQueryClient();

  // Create customer mutation
  const createCustomer = useMutation({
    mutationFn: (customerData: CreateCustomerRequest) => {
      return customerService.createCustomer(customerData);
    },
    onSuccess: newCustomer => {
      // Add to cache
      queryClient.setQueryData<Customer>(
        customerQueryKeys.detail(newCustomer.id),
        newCustomer
      );

      // Invalidate search results
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.lists(),
      });

      // Invalidate duplicate check for this NRIC
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.duplicate(newCustomer.nric),
      });
    },
    meta: {
      errorMessage: 'Failed to create customer',
    },
  });

  // Update customer mutation
  const updateCustomer = useMutation({
    mutationFn: (updates: UpdateCustomerRequest) => {
      return customerService.updateCustomer(updates);
    },
    onSuccess: updatedCustomer => {
      // Update cache
      queryClient.setQueryData<Customer>(
        customerQueryKeys.detail(updatedCustomer.id),
        updatedCustomer
      );

      // Update in search results
      queryClient.setQueriesData<PaginatedResponse<Customer>>(
        { queryKey: customerQueryKeys.lists() },
        oldData => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map(customer =>
              customer.id === updatedCustomer.id ? updatedCustomer : customer
            ),
          };
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.detail(updatedCustomer.id),
      });
    },
    meta: {
      errorMessage: 'Failed to update customer',
    },
  });

  // Optimistic update for customer
  const updateCustomerOptimistic = useMutation({
    mutationFn: (updates: UpdateCustomerRequest) => {
      return customerService.updateCustomer(updates);
    },
    onMutate: async updates => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: customerQueryKeys.detail(updates.id),
      });

      // Snapshot the previous value
      const previousCustomer = queryClient.getQueryData<Customer>(
        customerQueryKeys.detail(updates.id)
      );

      // Optimistically update the cache
      if (previousCustomer) {
        queryClient.setQueryData<Customer>(
          customerQueryKeys.detail(updates.id),
          { ...previousCustomer, ...updates }
        );
      }

      // Return a context with the previous and new customer
      return { previousCustomer, updates };
    },
    onError: (_error, updates, context) => {
      // Revert the optimistic update on error
      if (context?.previousCustomer) {
        queryClient.setQueryData<Customer>(
          customerQueryKeys.detail(updates.id),
          context.previousCustomer
        );
      }
    },
    onSettled: (_data, _error, updates) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: customerQueryKeys.detail(updates.id),
      });
    },
    meta: {
      errorMessage: 'Failed to update customer',
    },
  });

  // Refresh customer data
  const refreshCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      await queryClient.invalidateQueries({
        queryKey: customerQueryKeys.detail(customerId),
      });
    },
    meta: {
      errorMessage: 'Failed to refresh customer data',
    },
  });

  // Prefetch customer data
  const prefetchCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      await queryClient.prefetchQuery({
        queryKey: customerQueryKeys.detail(customerId),
        queryFn: () => customerService.getCustomer(customerId),
        staleTime: 10 * 60 * 1000,
      });
    },
    meta: {
      errorMessage: 'Failed to prefetch customer data',
    },
  });

  return {
    createCustomer,
    updateCustomer,
    updateCustomerOptimistic,
    refreshCustomer,
    prefetchCustomer,
  };
};

// Hook to manage customer cache
export const useCustomerCache = () => {
  const queryClient = useQueryClient();

  const clearCustomerCache = () => {
    queryClient.removeQueries({
      queryKey: customerQueryKeys.all,
    });
  };

  const invalidateAllCustomers = () => {
    queryClient.invalidateQueries({
      queryKey: customerQueryKeys.all,
    });
  };

  const prefetchCustomers = async (customerIds: string[]) => {
    const prefetchPromises = customerIds.map(customerId =>
      queryClient.prefetchQuery({
        queryKey: customerQueryKeys.detail(customerId),
        queryFn: () => customerService.getCustomer(customerId),
        staleTime: 10 * 60 * 1000,
      })
    );

    await Promise.allSettled(prefetchPromises);
  };

  const getCachedCustomer = (customerId: string): Customer | undefined => {
    return queryClient.getQueryData<Customer>(
      customerQueryKeys.detail(customerId)
    );
  };

  const setCachedCustomer = (customerId: string, data: Customer) => {
    queryClient.setQueryData<Customer>(
      customerQueryKeys.detail(customerId),
      data
    );
  };

  const getCachedCustomerSummary = (customerId: string) => {
    return queryClient.getQueryData(customerQueryKeys.summary(customerId));
  };

  const getCachedCreditRating = (
    customerId: string
  ): CreditRatingResponse | undefined => {
    return queryClient.getQueryData<CreditRatingResponse>(
      customerQueryKeys.creditRating(customerId)
    );
  };

  return {
    clearCustomerCache,
    invalidateAllCustomers,
    prefetchCustomers,
    getCachedCustomer,
    setCachedCustomer,
    getCachedCustomerSummary,
    getCachedCreditRating,
  };
};

// Hook for customer analytics
export const useCustomerAnalytics = () => {
  const queryClient = useQueryClient();

  const getCustomerCacheStats = () => {
    const queries = queryClient.getQueryCache().getAll();
    const customerQueries = queries.filter(
      query => query.queryKey[0] === 'customers'
    );

    return {
      totalCustomers: customerQueries.filter(q => q.queryKey[1] === 'detail')
        .length,
      activeQueries: customerQueries.filter(
        (q: any) => q.state.status === 'pending'
      ).length,
      cachedQueries: customerQueries.filter(q => q.state.status === 'success')
        .length,
      errorQueries: customerQueries.filter(q => q.state.status === 'error')
        .length,
    };
  };

  const getFrequentlyAccessedCustomers = (limit = 10) => {
    const queries = queryClient.getQueryCache().getAll();
    const customerDetailQueries = queries.filter(
      query =>
        query.queryKey[0] === 'customers' && query.queryKey[1] === 'detail'
    );

    return customerDetailQueries
      .sort(
        (a, b) => (b.state.dataUpdatedAt || 0) - (a.state.dataUpdatedAt || 0)
      )
      .slice(0, limit)
      .map(query => ({
        customerId: query.queryKey[2] as string,
        lastAccessed: query.state.dataUpdatedAt,
        data: query.state.data as Customer,
      }));
  };

  return {
    getCustomerCacheStats,
    getFrequentlyAccessedCustomers,
  };
};
