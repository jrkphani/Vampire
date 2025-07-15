import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/api';
import { useTransactionStore } from '@/stores/transactionStore';
import type {
  ProcessRenewalRequest,
  ProcessRedemptionRequest,
  ProcessLostReportRequest,
  ProcessCombinedRequest,
  TransactionResult,
} from '@/types/api';
import type {
  Transaction,
  RenewalTransaction,
  RedemptionTransaction,
  LostReportTransaction,
} from '@/types/business';

// Query keys for consistent caching
export const transactionQueryKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionQueryKeys.all, 'list'] as const,
  recent: (limit: number) =>
    [...transactionQueryKeys.lists(), 'recent', limit] as const,
  details: () => [...transactionQueryKeys.all, 'detail'] as const,
  detail: (transactionId: string) =>
    [...transactionQueryKeys.details(), transactionId] as const,
  ticketHistory: (ticketNo: string) =>
    [...transactionQueryKeys.all, 'ticket-history', ticketNo] as const,
  validation: (request: any) =>
    [...transactionQueryKeys.all, 'validation', request] as const,
  calculation: (request: any) =>
    [...transactionQueryKeys.all, 'calculation', request] as const,
};

// Hook to fetch a single transaction
export const useTransaction = (transactionId: string, enabled = true) => {
  return useQuery({
    queryKey: transactionQueryKeys.detail(transactionId),
    queryFn: () => transactionService.getTransaction(transactionId),
    enabled: enabled && !!transactionId,
    staleTime: 10 * 60 * 1000, // 10 minutes - transactions don't change often
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
    meta: {
      errorMessage: `Failed to fetch transaction ${transactionId}`,
    },
  });
};

// Hook to fetch recent transactions
export const useRecentTransactions = (limit = 10, enabled = true) => {
  return useQuery({
    queryKey: transactionQueryKeys.recent(limit),
    queryFn: () => transactionService.getRecentTransactions(limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    meta: {
      errorMessage: 'Failed to fetch recent transactions',
    },
  });
};

// Hook to fetch transaction history for a ticket
export const useTicketTransactionHistory = (
  ticketNo: string,
  enabled = true
) => {
  return useQuery({
    queryKey: transactionQueryKeys.ticketHistory(ticketNo),
    queryFn: () => transactionService.getTicketTransactionHistory(ticketNo),
    enabled: enabled && !!ticketNo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorMessage: `Failed to fetch transaction history for ticket ${ticketNo}`,
    },
  });
};

// Hook to validate a transaction
export const useTransactionValidation = (
  request: {
    type: 'renewal' | 'redemption' | 'lost_report' | 'combined';
    tickets: string[];
    payment?: {
      cashAmount: number;
      digitalAmount: number;
    };
  },
  enabled = true
) => {
  return useQuery({
    queryKey: transactionQueryKeys.validation(request),
    queryFn: () => transactionService.validateTransaction(request),
    enabled: enabled && request.tickets.length > 0,
    staleTime: 30 * 1000, // 30 seconds - validation can change frequently
    retry: 2,
    meta: {
      errorMessage: 'Failed to validate transaction',
    },
  });
};

// Hook to calculate transaction totals
export const useTransactionCalculation = (
  request: {
    type: 'renewal' | 'redemption' | 'lost_report' | 'combined';
    tickets: string[];
    calculationDate?: string;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: transactionQueryKeys.calculation(request),
    queryFn: () => transactionService.calculateTransactionTotals(request),
    enabled: enabled && request.tickets.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    meta: {
      errorMessage: 'Failed to calculate transaction totals',
    },
  });
};

// Hook for transaction processing mutations
export const useTransactionMutations = () => {
  const queryClient = useQueryClient();
  const { setProcessing, setError, clearAllErrors } = useTransactionStore();

  // Helper to handle transaction success
  const handleTransactionSuccess = (
    result: TransactionResult,
    type: string
  ) => {
    // Add to recent transactions cache
    queryClient.setQueryData<Transaction[]>(
      transactionQueryKeys.recent(10),
      oldData => {
        if (!oldData) return oldData;

        // Create a proper transaction based on type
        let newTransaction: Transaction;
        if (type === 'renewal') {
          newTransaction = {
            id: result.transactionId,
            type: 'renewal',
            ticketNo: result.updatedTickets[0] || '',
            customerId: '',
            staffId: '',
            transactionDate: new Date().toISOString(),
            status: 'completed',
            createdAt: new Date().toISOString(),
            payment: { cashAmount: 0, digitalAmount: 0 },
            interestAmount: 0,
          } as RenewalTransaction;
        } else if (type === 'redemption') {
          newTransaction = {
            id: result.transactionId,
            type: 'redemption',
            ticketNo: result.updatedTickets[0] || '',
            customerId: '',
            staffId: '',
            transactionDate: new Date().toISOString(),
            status: 'completed',
            createdAt: new Date().toISOString(),
            payment: { cashAmount: 0, digitalAmount: 0 },
            totalAmount: 0,
          } as RedemptionTransaction;
        } else {
          newTransaction = {
            id: result.transactionId,
            type: 'lost_report',
            ticketNo: result.updatedTickets[0] || '',
            customerId: '',
            staffId: '',
            transactionDate: new Date().toISOString(),
            status: 'completed',
            createdAt: new Date().toISOString(),
            feeAmount: 0,
            receiptNo: '',
            payment: { cashAmount: 0, digitalAmount: 0 },
          } as LostReportTransaction;
        }

        return [newTransaction, ...oldData].slice(0, 10);
      }
    );

    // Invalidate related queries
    queryClient.invalidateQueries({
      queryKey: transactionQueryKeys.recent(10),
    });

    // Invalidate ticket queries for updated tickets
    result.updatedTickets.forEach(ticketNo => {
      queryClient.invalidateQueries({
        queryKey: ['tickets', 'detail', ticketNo],
      });
    });

    // Clear processing state
    setProcessing(false);
    clearAllErrors();
  };

  // Helper to handle transaction error
  const handleTransactionError = (error: any) => {
    setProcessing(false);
    setError(
      'processing',
      error instanceof Error ? error.message : 'Transaction failed'
    );
  };

  // Renewal mutation
  const processRenewal = useMutation({
    mutationFn: (request: ProcessRenewalRequest) => {
      setProcessing(true, 'Processing renewal...');
      return transactionService.processRenewal(request);
    },
    onSuccess: result => {
      handleTransactionSuccess(result, 'renewal');
    },
    onError: handleTransactionError,
    meta: {
      errorMessage: 'Failed to process renewal',
    },
  });

  // Redemption mutation
  const processRedemption = useMutation({
    mutationFn: (request: ProcessRedemptionRequest) => {
      setProcessing(true, 'Processing redemption...');
      return transactionService.processRedemption(request);
    },
    onSuccess: result => {
      handleTransactionSuccess(result, 'redemption');
    },
    onError: handleTransactionError,
    meta: {
      errorMessage: 'Failed to process redemption',
    },
  });

  // Lost report mutation
  const processLostReport = useMutation({
    mutationFn: (request: ProcessLostReportRequest) => {
      setProcessing(true, 'Processing lost report...');
      return transactionService.processLostReport(request);
    },
    onSuccess: result => {
      handleTransactionSuccess(result, 'lost_report');
    },
    onError: handleTransactionError,
    meta: {
      errorMessage: 'Failed to process lost report',
    },
  });

  // Combined operation mutation
  const processCombined = useMutation({
    mutationFn: (request: ProcessCombinedRequest) => {
      setProcessing(true, 'Processing combined transaction...');
      return transactionService.processCombined(request);
    },
    onSuccess: result => {
      handleTransactionSuccess(result, 'combined');
    },
    onError: handleTransactionError,
    meta: {
      errorMessage: 'Failed to process combined transaction',
    },
  });

  // Cancel transaction mutation
  const cancelTransaction = useMutation({
    mutationFn: ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      return transactionService.cancelTransaction(transactionId, reason);
    },
    onSuccess: (_, { transactionId }) => {
      // Update transaction in cache
      queryClient.setQueryData<Transaction>(
        transactionQueryKeys.detail(transactionId),
        oldData => {
          if (!oldData) return oldData;
          return { ...oldData, status: 'failed' };
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: transactionQueryKeys.recent(10),
      });
    },
    meta: {
      errorMessage: 'Failed to cancel transaction',
    },
  });

  return {
    processRenewal,
    processRedemption,
    processLostReport,
    processCombined,
    cancelTransaction,
  };
};

// Hook to manage transaction cache
export const useTransactionCache = () => {
  const queryClient = useQueryClient();

  const clearTransactionCache = () => {
    queryClient.removeQueries({
      queryKey: transactionQueryKeys.all,
    });
  };

  const invalidateAllTransactions = () => {
    queryClient.invalidateQueries({
      queryKey: transactionQueryKeys.all,
    });
  };

  const prefetchTransaction = async (transactionId: string) => {
    await queryClient.prefetchQuery({
      queryKey: transactionQueryKeys.detail(transactionId),
      queryFn: () => transactionService.getTransaction(transactionId),
      staleTime: 10 * 60 * 1000,
    });
  };

  const getCachedTransaction = (
    transactionId: string
  ): Transaction | undefined => {
    return queryClient.getQueryData<Transaction>(
      transactionQueryKeys.detail(transactionId)
    );
  };

  const setCachedTransaction = (transactionId: string, data: Transaction) => {
    queryClient.setQueryData<Transaction>(
      transactionQueryKeys.detail(transactionId),
      data
    );
  };

  const getCachedRecentTransactions = (
    limit = 10
  ): Transaction[] | undefined => {
    return queryClient.getQueryData<Transaction[]>(
      transactionQueryKeys.recent(limit)
    );
  };

  return {
    clearTransactionCache,
    invalidateAllTransactions,
    prefetchTransaction,
    getCachedTransaction,
    setCachedTransaction,
    getCachedRecentTransactions,
  };
};

// Hook for optimistic updates
export const useOptimisticTransactions = () => {
  const queryClient = useQueryClient();

  const addOptimisticTransaction = (
    transaction: Partial<Transaction> & {
      type: 'renewal' | 'redemption' | 'lost_report';
    }
  ) => {
    let optimisticTransaction: Transaction;

    if (transaction.type === 'renewal') {
      optimisticTransaction = {
        id: `optimistic_${Date.now()}`,
        ticketNo: transaction.ticketNo || '',
        customerId: transaction.customerId || '',
        staffId: transaction.staffId || '',
        transactionDate:
          transaction.transactionDate || new Date().toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        payment: { cashAmount: 0, digitalAmount: 0 },
        interestAmount: 0,
        ...transaction,
      } as RenewalTransaction;
    } else if (transaction.type === 'redemption') {
      optimisticTransaction = {
        id: `optimistic_${Date.now()}`,
        ticketNo: transaction.ticketNo || '',
        customerId: transaction.customerId || '',
        staffId: transaction.staffId || '',
        transactionDate:
          transaction.transactionDate || new Date().toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        payment: { cashAmount: 0, digitalAmount: 0 },
        totalAmount: 0,
        ...transaction,
      } as RedemptionTransaction;
    } else {
      optimisticTransaction = {
        id: `optimistic_${Date.now()}`,
        ticketNo: transaction.ticketNo || '',
        customerId: transaction.customerId || '',
        staffId: transaction.staffId || '',
        transactionDate:
          transaction.transactionDate || new Date().toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        feeAmount: 0,
        receiptNo: '',
        payment: { cashAmount: 0, digitalAmount: 0 },
        ...transaction,
      } as LostReportTransaction;
    }

    queryClient.setQueryData<Transaction[]>(
      transactionQueryKeys.recent(10),
      oldData => {
        if (!oldData) return [optimisticTransaction];
        return [optimisticTransaction, ...oldData];
      }
    );

    return optimisticTransaction.id;
  };

  const removeOptimisticTransaction = (optimisticId: string) => {
    queryClient.setQueryData<Transaction[]>(
      transactionQueryKeys.recent(10),
      oldData => {
        if (!oldData) return oldData;
        return oldData.filter(transaction => transaction.id !== optimisticId);
      }
    );
  };

  const updateOptimisticTransaction = (
    optimisticId: string,
    updates: Partial<Transaction>
  ) => {
    queryClient.setQueryData<Transaction[]>(
      transactionQueryKeys.recent(10),
      oldData => {
        if (!oldData) return oldData;
        return oldData.map(transaction => {
          if (transaction.id === optimisticId) {
            return { ...transaction, ...updates } as Transaction;
          }
          return transaction;
        });
      }
    );
  };

  return {
    addOptimisticTransaction,
    removeOptimisticTransaction,
    updateOptimisticTransaction,
  };
};
