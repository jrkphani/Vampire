import { apiClient } from './client';
import type {
  ApiResponse,
  GetSystemStatusResponse,
  PrintDocumentRequest,
  PrintDocumentResponse,
  ReprintLostLetterRequest,
} from '@/types/api';

export class SystemService {
  /**
   * Get system health status
   */
  async getSystemStatus(): Promise<GetSystemStatusResponse> {
    const response =
      await apiClient.get<ApiResponse<GetSystemStatusResponse>>(
        '/system/status'
      );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch system status');
    }

    return response.data;
  }

  /**
   * Print document
   */
  async printDocument(
    request: PrintDocumentRequest
  ): Promise<PrintDocumentResponse> {
    const response = await apiClient.post<ApiResponse<PrintDocumentResponse>>(
      '/documents/print',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Print request failed');
    }

    return response.data;
  }

  /**
   * Reprint lost letter
   */
  async reprintLostLetter(
    request: ReprintLostLetterRequest
  ): Promise<PrintDocumentResponse> {
    const response = await apiClient.post<ApiResponse<PrintDocumentResponse>>(
      '/documents/reprint-lost-letter',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Reprint request failed');
    }

    return response.data;
  }

  /**
   * Get print job status
   */
  async getPrintJobStatus(printJobId: string): Promise<{
    status: 'queued' | 'printing' | 'completed' | 'failed';
    progress: number;
    error?: string;
    estimatedTime?: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        status: 'queued' | 'printing' | 'completed' | 'failed';
        progress: number;
        error?: string;
        estimatedTime?: number;
      }>
    >(`/documents/print-jobs/${printJobId}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch print job status');
    }

    return response.data;
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(): Promise<{
    currency: string;
    lostReportFee: number;
    interestCalculationMethod: 'simple' | 'compound';
    maxTicketsPerTransaction: number;
    sessionTimeout: number;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        currency: string;
        lostReportFee: number;
        interestCalculationMethod: 'simple' | 'compound';
        maxTicketsPerTransaction: number;
        sessionTimeout: number;
        timezone: string;
        dateFormat: string;
        numberFormat: string;
      }>
    >('/system/config');

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to fetch system configuration'
      );
    }

    return response.data;
  }

  /**
   * Update system configuration (admin only)
   */
  async updateSystemConfig(
    config: Partial<{
      lostReportFee: number;
      interestCalculationMethod: 'simple' | 'compound';
      maxTicketsPerTransaction: number;
      sessionTimeout: number;
      timezone: string;
      dateFormat: string;
      numberFormat: string;
    }>
  ): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>(
      '/system/config',
      config
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Failed to update system configuration'
      );
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<{
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    activeConnections: number;
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        uptime: number;
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
        activeConnections: number;
        requestsPerMinute: number;
        averageResponseTime: number;
        errorRate: number;
      }>
    >('/system/metrics');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch system metrics');
    }

    return response.data;
  }

  /**
   * Perform system health check
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      duration: number;
    }>;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        overall: 'healthy' | 'degraded' | 'unhealthy';
        checks: Array<{
          name: string;
          status: 'pass' | 'fail' | 'warn';
          message: string;
          duration: number;
        }>;
      }>
    >('/system/health');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Health check failed');
    }

    return response.data;
  }

  /**
   * Get system audit logs
   */
  async getAuditLogs(params: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      timestamp: string;
      userId: string;
      action: string;
      resource: string;
      details: Record<string, unknown>;
      ipAddress: string;
      userAgent: string;
    }>;
    totalCount: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        logs: Array<{
          id: string;
          timestamp: string;
          userId: string;
          action: string;
          resource: string;
          details: Record<string, unknown>;
          ipAddress: string;
          userAgent: string;
        }>;
        totalCount: number;
        page: number;
        limit: number;
      }>
    >('/system/audit-logs', { params });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch audit logs');
    }

    return response.data;
  }
}

export const systemService = new SystemService();
