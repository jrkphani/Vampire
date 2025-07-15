import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  SearchTicketsParams,
} from '@/types/api';
import type { TicketData } from '@/types/business';

export class TicketService {
  /**
   * Get ticket by ticket number
   */
  async getTicket(ticketNo: string): Promise<TicketData> {
    const response = await apiClient.get<ApiResponse<TicketData>>(
      `/tickets/${encodeURIComponent(ticketNo)}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Ticket not found');
    }

    return response.data;
  }

  /**
   * Search tickets with filters and pagination
   */
  async searchTickets(
    params: SearchTicketsParams
  ): Promise<PaginatedResponse<TicketData>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<TicketData>>
    >('/tickets/search', { params });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Search failed');
    }

    return response.data;
  }

  /**
   * Get multiple tickets by ticket numbers
   */
  async getMultipleTickets(ticketNos: string[]): Promise<TicketData[]> {
    const response = await apiClient.post<ApiResponse<TicketData[]>>(
      '/tickets/batch',
      { ticketNos }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch tickets');
    }

    return response.data;
  }

  /**
   * Get ticket history
   */
  async getTicketHistory(ticketNo: string): Promise<
    Array<{
      id: string;
      action: string;
      timestamp: string;
      staffId: string;
      details: Record<string, unknown>;
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          action: string;
          timestamp: string;
          staffId: string;
          details: Record<string, unknown>;
        }>
      >
    >(`/tickets/${encodeURIComponent(ticketNo)}/history`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch ticket history');
    }

    return response.data;
  }

  /**
   * Check ticket availability for transactions
   */
  async checkTicketAvailability(ticketNos: string[]): Promise<
    Record<
      string,
      {
        available: boolean;
        reason?: string;
      }
    >
  > {
    const response = await apiClient.post<
      ApiResponse<
        Record<
          string,
          {
            available: boolean;
            reason?: string;
          }
        >
      >
    >('/tickets/check-availability', { ticketNos });

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to check ticket availability'
      );
    }

    return response.data;
  }

  /**
   * Get ticket financial calculation
   */
  async calculateTicketFinancials(
    ticketNo: string,
    calculationDate?: string
  ): Promise<{
    principal: number;
    interest: number;
    totalAmount: number;
    daysOverdue: number;
    penaltyAmount: number;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        principal: number;
        interest: number;
        totalAmount: number;
        daysOverdue: number;
        penaltyAmount: number;
      }>
    >(`/tickets/${encodeURIComponent(ticketNo)}/calculate`, {
      params: { calculationDate },
    });

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to calculate ticket financials'
      );
    }

    return response.data;
  }
}

export const ticketService = new TicketService();
