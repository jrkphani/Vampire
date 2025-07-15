import { apiClient } from './client';
import type {
  ApiResponse,
  ProcessRenewalRequest,
  ProcessRedemptionRequest,
  ProcessLostReportRequest,
  ProcessCombinedRequest,
  TransactionResult,
} from '@/types/api';
import type { Transaction } from '@/types/business';

export class TransactionService {
  /**
   * Process ticket renewal
   */
  async processRenewal(
    request: ProcessRenewalRequest
  ): Promise<TransactionResult> {
    const response = await apiClient.post<ApiResponse<TransactionResult>>(
      '/transactions/renewal',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Renewal processing failed');
    }

    return response.data;
  }

  /**
   * Process ticket redemption
   */
  async processRedemption(
    request: ProcessRedemptionRequest
  ): Promise<TransactionResult> {
    const response = await apiClient.post<ApiResponse<TransactionResult>>(
      '/transactions/redemption',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Redemption processing failed');
    }

    return response.data;
  }

  /**
   * Process lost pledge report
   */
  async processLostReport(
    request: ProcessLostReportRequest
  ): Promise<TransactionResult> {
    const response = await apiClient.post<ApiResponse<TransactionResult>>(
      '/transactions/lost-report',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Lost report processing failed');
    }

    return response.data;
  }

  /**
   * Process combined operations (renewal + redemption)
   */
  async processCombined(
    request: ProcessCombinedRequest
  ): Promise<TransactionResult> {
    const response = await apiClient.post<ApiResponse<TransactionResult>>(
      '/transactions/combined',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Combined transaction processing failed'
      );
    }

    return response.data;
  }

  /**
   * Get transaction details
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `/transactions/${transactionId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Transaction not found');
    }

    return response.data;
  }

  /**
   * Get transaction history for a ticket
   */
  async getTicketTransactionHistory(ticketNo: string): Promise<Transaction[]> {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      `/transactions/history/${encodeURIComponent(ticketNo)}`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to fetch transaction history'
      );
    }

    return response.data;
  }

  /**
   * Get recent transactions for current user
   */
  async getRecentTransactions(limit = 10): Promise<Transaction[]> {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(
      '/transactions/recent',
      { params: { limit } }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to fetch recent transactions'
      );
    }

    return response.data;
  }

  /**
   * Cancel/void a transaction
   */
  async cancelTransaction(
    transactionId: string,
    reason: string
  ): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/transactions/${transactionId}/cancel`,
      { reason }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to cancel transaction');
    }
  }

  /**
   * Validate transaction before processing
   */
  async validateTransaction(request: {
    type: 'renewal' | 'redemption' | 'lost_report' | 'combined';
    tickets: string[];
    payment?: {
      cashAmount: number;
      digitalAmount: number;
    };
  }): Promise<{
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
    }>;
    warnings: Array<{
      field: string;
      message: string;
    }>;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        valid: boolean;
        errors: Array<{
          field: string;
          message: string;
        }>;
        warnings: Array<{
          field: string;
          message: string;
        }>;
      }>
    >('/transactions/validate', request);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Validation failed');
    }

    return response.data;
  }

  /**
   * Calculate transaction totals
   */
  async calculateTransactionTotals(request: {
    type: 'renewal' | 'redemption' | 'lost_report' | 'combined';
    tickets: string[];
    calculationDate?: string;
  }): Promise<{
    totalAmount: number;
    breakdown: Array<{
      ticketNo: string;
      principal: number;
      interest: number;
      penalty: number;
      total: number;
    }>;
    fees: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        totalAmount: number;
        breakdown: Array<{
          ticketNo: string;
          principal: number;
          interest: number;
          penalty: number;
          total: number;
        }>;
        fees: Array<{
          type: string;
          amount: number;
          description: string;
        }>;
      }>
    >('/transactions/calculate', request);

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to calculate transaction totals'
      );
    }

    return response.data;
  }
}

export const transactionService = new TransactionService();
