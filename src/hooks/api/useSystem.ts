import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { systemService } from '@/services/api';
import { useSystemHealthStore } from '@/stores/systemHealthStore';
import type {
  GetSystemStatusResponse,
  PrintDocumentRequest,
  ReprintLostLetterRequest,
} from '@/types/api';

// Query keys for consistent caching
export const systemQueryKeys = {
  all: ['system'] as const,
  status: () => [...systemQueryKeys.all, 'status'] as const,
  health: () => [...systemQueryKeys.all, 'health'] as const,
  metrics: () => [...systemQueryKeys.all, 'metrics'] as const,
  config: () => [...systemQueryKeys.all, 'config'] as const,
  auditLogs: (params: any) =>
    [...systemQueryKeys.all, 'audit-logs', params] as const,
  printJob: (printJobId: string) =>
    [...systemQueryKeys.all, 'print-job', printJobId] as const,
};

// Hook to fetch system status
export const useSystemStatus = (enabled = true) => {
  return useQuery({
    queryKey: systemQueryKeys.status(),
    queryFn: () => systemService.getSystemStatus(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: failureCount => {
      // Be more aggressive with retries for system status
      return failureCount < 5;
    },
    meta: {
      errorMessage: 'Failed to fetch system status',
    },
  });
};

// Hook to perform health check
export const useSystemHealthCheck = (enabled = true) => {
  // const { performHealthCheck } = useSystemHealthStore() // Unused

  return useQuery({
    queryKey: systemQueryKeys.health(),
    queryFn: () => systemService.performHealthCheck(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    meta: {
      errorMessage: 'Failed to perform health check',
    },
  });
};

// Hook to fetch system metrics
export const useSystemMetrics = (enabled = true) => {
  // const { fetchSystemMetrics } = useSystemHealthStore() // Unused

  return useQuery({
    queryKey: systemQueryKeys.metrics(),
    queryFn: () => systemService.getSystemMetrics(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    meta: {
      errorMessage: 'Failed to fetch system metrics',
    },
  });
};

// Hook to fetch system configuration
export const useSystemConfig = (enabled = true) => {
  return useQuery({
    queryKey: systemQueryKeys.config(),
    queryFn: () => systemService.getSystemConfig(),
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - config doesn't change often
    meta: {
      errorMessage: 'Failed to fetch system configuration',
    },
  });
};

// Hook to fetch audit logs
export const useAuditLogs = (
  params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: systemQueryKeys.auditLogs(params),
    queryFn: () => systemService.getAuditLogs(params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: 'Failed to fetch audit logs',
    },
  });
};

// Hook to monitor print job status
export const usePrintJobStatus = (printJobId: string, enabled = true) => {
  return useQuery({
    queryKey: systemQueryKeys.printJob(printJobId),
    queryFn: () => systemService.getPrintJobStatus(printJobId),
    enabled: enabled && !!printJobId,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: query => {
      // Stop refetching if job is completed or failed
      const data = query.state.data;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2 * 1000; // Refetch every 2 seconds
    },
    meta: {
      errorMessage: `Failed to fetch print job status for ${printJobId}`,
    },
  });
};

// Hook for system mutations
export const useSystemMutations = () => {
  const queryClient = useQueryClient();

  // Print document mutation
  const printDocument = useMutation({
    mutationFn: (request: PrintDocumentRequest) => {
      return systemService.printDocument(request);
    },
    onSuccess: response => {
      // Start monitoring the print job
      queryClient.invalidateQueries({
        queryKey: systemQueryKeys.printJob(response.printJobId),
      });
    },
    meta: {
      errorMessage: 'Failed to print document',
    },
  });

  // Reprint lost letter mutation
  const reprintLostLetter = useMutation({
    mutationFn: (request: ReprintLostLetterRequest) => {
      return systemService.reprintLostLetter(request);
    },
    onSuccess: response => {
      // Start monitoring the print job
      queryClient.invalidateQueries({
        queryKey: systemQueryKeys.printJob(response.printJobId),
      });
    },
    meta: {
      errorMessage: 'Failed to reprint lost letter',
    },
  });

  // Update system configuration mutation
  const updateSystemConfig = useMutation({
    mutationFn: (
      config: Partial<{
        lostReportFee: number;
        interestCalculationMethod: 'simple' | 'compound';
        maxTicketsPerTransaction: number;
        sessionTimeout: number;
        timezone: string;
        dateFormat: string;
        numberFormat: string;
      }>
    ) => {
      return systemService.updateSystemConfig(config);
    },
    onSuccess: () => {
      // Invalidate system config cache
      queryClient.invalidateQueries({
        queryKey: systemQueryKeys.config(),
      });
    },
    meta: {
      errorMessage: 'Failed to update system configuration',
    },
  });

  // Force system health check
  const forceHealthCheck = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({
        queryKey: systemQueryKeys.health(),
      });
      await queryClient.invalidateQueries({
        queryKey: systemQueryKeys.status(),
      });
    },
    meta: {
      errorMessage: 'Failed to force health check',
    },
  });

  // Refresh system metrics
  const refreshSystemMetrics = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({
        queryKey: systemQueryKeys.metrics(),
      });
    },
    meta: {
      errorMessage: 'Failed to refresh system metrics',
    },
  });

  return {
    printDocument,
    reprintLostLetter,
    updateSystemConfig,
    forceHealthCheck,
    refreshSystemMetrics,
  };
};

// Hook to manage system cache
export const useSystemCache = () => {
  const queryClient = useQueryClient();

  const clearSystemCache = () => {
    queryClient.removeQueries({
      queryKey: systemQueryKeys.all,
    });
  };

  const invalidateAllSystem = () => {
    queryClient.invalidateQueries({
      queryKey: systemQueryKeys.all,
    });
  };

  const getCachedSystemStatus = (): GetSystemStatusResponse | undefined => {
    return queryClient.getQueryData<GetSystemStatusResponse>(
      systemQueryKeys.status()
    );
  };

  const getCachedSystemConfig = () => {
    return queryClient.getQueryData(systemQueryKeys.config());
  };

  const getCachedSystemMetrics = () => {
    return queryClient.getQueryData(systemQueryKeys.metrics());
  };

  const setCachedSystemStatus = (data: GetSystemStatusResponse) => {
    queryClient.setQueryData<GetSystemStatusResponse>(
      systemQueryKeys.status(),
      data
    );
  };

  return {
    clearSystemCache,
    invalidateAllSystem,
    getCachedSystemStatus,
    getCachedSystemConfig,
    getCachedSystemMetrics,
    setCachedSystemStatus,
  };
};

// Hook for system monitoring
export const useSystemMonitoring = () => {
  const queryClient = useQueryClient();
  const {
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    overallHealth,
    currentMetrics,
    alerts,
    getCriticalAlerts,
    isSystemHealthy,
  } = useSystemHealthStore();

  const startSystemMonitoring = () => {
    startMonitoring();

    // Enable background refetching for critical queries
    queryClient.setQueryDefaults(systemQueryKeys.status(), {
      refetchInterval: 30 * 1000, // 30 seconds
    });

    queryClient.setQueryDefaults(systemQueryKeys.metrics(), {
      refetchInterval: 60 * 1000, // 1 minute
    });
  };

  const stopSystemMonitoring = () => {
    stopMonitoring();

    // Disable background refetching
    queryClient.setQueryDefaults(systemQueryKeys.status(), {
      refetchInterval: false,
    });

    queryClient.setQueryDefaults(systemQueryKeys.metrics(), {
      refetchInterval: false,
    });
  };

  const getMonitoringStatus = () => ({
    isMonitoring,
    overallHealth,
    currentMetrics,
    alertsCount: alerts.length,
    criticalAlertsCount: getCriticalAlerts().length,
    isSystemHealthy: isSystemHealthy(),
  });

  return {
    startSystemMonitoring,
    stopSystemMonitoring,
    getMonitoringStatus,
    isMonitoring,
    overallHealth,
    currentMetrics,
    alerts,
    getCriticalAlerts,
    isSystemHealthy,
  };
};
