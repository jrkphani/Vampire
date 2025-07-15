import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/api';
import type { SearchTicketsParams } from '@/types/api';
import type { TicketData } from '@/types/business';
import type { PaginatedResponse } from '@/types/api';

// Query keys for consistent caching
export const ticketQueryKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketQueryKeys.all, 'list'] as const,
  list: (params: SearchTicketsParams) =>
    [...ticketQueryKeys.lists(), params] as const,
  details: () => [...ticketQueryKeys.all, 'detail'] as const,
  detail: (ticketNo: string) =>
    [...ticketQueryKeys.details(), ticketNo] as const,
  batch: (ticketNos: string[]) =>
    [...ticketQueryKeys.all, 'batch', ticketNos] as const,
  history: (ticketNo: string) =>
    [...ticketQueryKeys.detail(ticketNo), 'history'] as const,
  availability: (ticketNos: string[]) =>
    [...ticketQueryKeys.all, 'availability', ticketNos] as const,
  financials: (ticketNo: string, date?: string) =>
    [...ticketQueryKeys.detail(ticketNo), 'financials', date] as const,
};

// Hook to fetch a single ticket
export const useTicket = (ticketNo: string, enabled = true) => {
  return useQuery({
    queryKey: ticketQueryKeys.detail(ticketNo),
    queryFn: () => ticketService.getTicket(ticketNo),
    enabled: enabled && !!ticketNo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
    meta: {
      errorMessage: `Failed to fetch ticket ${ticketNo}`,
    },
  });
};

// Hook to search tickets with pagination
export const useSearchTickets = (
  params: SearchTicketsParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => ticketService.searchTickets(params),
    enabled: enabled && !!params.query,
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData: any) => previousData, // Keep previous data while loading new results
    meta: {
      errorMessage: 'Failed to search tickets',
    },
  });
};

// Hook to fetch multiple tickets
export const useMultipleTickets = (ticketNos: string[], enabled = true) => {
  return useQuery({
    queryKey: ticketQueryKeys.batch(ticketNos),
    queryFn: () => ticketService.getMultipleTickets(ticketNos),
    enabled: enabled && ticketNos.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: 'Failed to fetch multiple tickets',
    },
  });
};

// Hook to fetch ticket history
export const useTicketHistory = (ticketNo: string, enabled = true) => {
  return useQuery({
    queryKey: ticketQueryKeys.history(ticketNo),
    queryFn: () => ticketService.getTicketHistory(ticketNo),
    enabled: enabled && !!ticketNo,
    staleTime: 10 * 60 * 1000, // 10 minutes - history doesn't change often
    meta: {
      errorMessage: `Failed to fetch history for ticket ${ticketNo}`,
    },
  });
};

// Hook to check ticket availability
export const useTicketAvailability = (ticketNos: string[], enabled = true) => {
  return useQuery({
    queryKey: ticketQueryKeys.availability(ticketNos),
    queryFn: () => ticketService.checkTicketAvailability(ticketNos),
    enabled: enabled && ticketNos.length > 0,
    staleTime: 30 * 1000, // 30 seconds - availability changes frequently
    refetchInterval: 60 * 1000, // Refetch every minute
    meta: {
      errorMessage: 'Failed to check ticket availability',
    },
  });
};

// Hook to calculate ticket financials
export const useTicketFinancials = (
  ticketNo: string,
  calculationDate?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ticketQueryKeys.financials(ticketNo, calculationDate),
    queryFn: () =>
      ticketService.calculateTicketFinancials(ticketNo, calculationDate),
    enabled: enabled && !!ticketNo,
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: `Failed to calculate financials for ticket ${ticketNo}`,
    },
  });
};

// Mutation hooks for ticket operations
export const useTicketMutations = () => {
  const queryClient = useQueryClient();

  // Mutation to invalidate ticket cache
  const invalidateTicket = useMutation({
    mutationFn: async (ticketNo: string) => {
      await queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(ticketNo),
      });
    },
    meta: {
      errorMessage: 'Failed to refresh ticket data',
    },
  });

  // Mutation to prefetch ticket data
  const prefetchTicket = useMutation({
    mutationFn: async (ticketNo: string) => {
      await queryClient.prefetchQuery({
        queryKey: ticketQueryKeys.detail(ticketNo),
        queryFn: () => ticketService.getTicket(ticketNo),
        staleTime: 5 * 60 * 1000,
      });
    },
    meta: {
      errorMessage: 'Failed to prefetch ticket data',
    },
  });

  // Mutation to update ticket in cache
  const updateTicketCache = useMutation({
    mutationFn: async ({
      ticketNo,
      updates,
    }: {
      ticketNo: string;
      updates: Partial<TicketData>;
    }) => {
      // Update the ticket in cache
      queryClient.setQueryData<TicketData>(
        ticketQueryKeys.detail(ticketNo),
        (oldData: TicketData | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updates };
        }
      );

      // Also update in any search results that might contain this ticket
      queryClient.setQueriesData<PaginatedResponse<TicketData>>(
        { queryKey: ticketQueryKeys.lists() },
        (oldData: PaginatedResponse<TicketData> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map(ticket =>
              ticket.ticketNo === ticketNo ? { ...ticket, ...updates } : ticket
            ),
          };
        }
      );
    },
    meta: {
      errorMessage: 'Failed to update ticket cache',
    },
  });

  return {
    invalidateTicket,
    prefetchTicket,
    updateTicketCache,
  };
};

// Hook to manage ticket cache
export const useTicketCache = () => {
  const queryClient = useQueryClient();

  const clearTicketCache = () => {
    queryClient.clear();
  };

  const invalidateAllTickets = () => {
    queryClient.invalidateQueries({
      queryKey: ticketQueryKeys.all,
    });
  };

  const prefetchTickets = async (ticketNos: string[]) => {
    const prefetchPromises = ticketNos.map(ticketNo =>
      queryClient.prefetchQuery({
        queryKey: ticketQueryKeys.detail(ticketNo),
        queryFn: () => ticketService.getTicket(ticketNo),
        staleTime: 5 * 60 * 1000,
      })
    );

    await Promise.allSettled(prefetchPromises);
  };

  const getCachedTicket = (ticketNo: string): TicketData | undefined => {
    return queryClient.getQueryData<TicketData>(
      ticketQueryKeys.detail(ticketNo)
    );
  };

  const setCachedTicket = (ticketNo: string, data: TicketData) => {
    queryClient.setQueryData<TicketData>(
      ticketQueryKeys.detail(ticketNo),
      data
    );
  };

  return {
    clearTicketCache,
    invalidateAllTickets,
    prefetchTickets,
    getCachedTicket,
    setCachedTicket,
  };
};
