import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  SearchCustomersParams,
  CreditRatingResponse,
} from '@/types/api';
import type { Customer, CustomerCreditDetails } from '@/types/business';

export class CustomerService {
  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Customer> {
    const response = await apiClient.get<ApiResponse<Customer>>(
      `/customers/${customerId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Customer not found');
    }

    return response.data;
  }

  /**
   * Search customers with filters and pagination
   */
  async searchCustomers(
    params: SearchCustomersParams
  ): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Customer>>
    >('/customers/search', { params });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Search failed');
    }

    return response.data;
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<ApiResponse<Customer>>(
      '/customers',
      customerData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create customer');
    }

    return response.data;
  }

  /**
   * Update existing customer
   */
  async updateCustomer(updates: UpdateCustomerRequest): Promise<Customer> {
    const { id, ...updateData } = updates;
    const response = await apiClient.put<ApiResponse<Customer>>(
      `/customers/${id}`,
      updateData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update customer');
    }

    return response.data;
  }

  /**
   * Get customer's active tickets
   */
  async getCustomerActiveTickets(customerId: string): Promise<
    Array<{
      ticketNo: string;
      pledgeDescription: string;
      principal: number;
      interest: number;
      expiryDate: string;
      status: string;
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          ticketNo: string;
          pledgeDescription: string;
          principal: number;
          interest: number;
          expiryDate: string;
          status: string;
        }>
      >
    >(`/customers/${customerId}/active-tickets`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch active tickets');
    }

    return response.data;
  }

  /**
   * Get customer's transaction history
   */
  async getCustomerTransactionHistory(
    customerId: string,
    limit = 20
  ): Promise<
    Array<{
      id: string;
      type: string;
      ticketNo: string;
      amount: number;
      date: string;
      status: string;
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: string;
          type: string;
          ticketNo: string;
          amount: number;
          date: string;
          status: string;
        }>
      >
    >(`/customers/${customerId}/transactions`, { params: { limit } });

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to fetch transaction history'
      );
    }

    return response.data;
  }

  /**
   * Get customer credit rating
   */
  async getCustomerCreditRating(
    customerId: string
  ): Promise<CreditRatingResponse> {
    const response = await apiClient.get<ApiResponse<CreditRatingResponse>>(
      `/customers/${customerId}/credit-rating`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch credit rating');
    }

    return response.data;
  }

  /**
   * Get detailed customer credit assessment
   */
  async getCustomerCreditDetails(
    customerId: string
  ): Promise<CustomerCreditDetails> {
    const response = await apiClient.get<ApiResponse<CustomerCreditDetails>>(
      `/customers/${customerId}/credit-details`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch credit details');
    }

    return response.data;
  }

  /**
   * Verify customer identity
   */
  async verifyCustomerIdentity(
    customerId: string,
    nric: string
  ): Promise<{
    verified: boolean;
    confidence: number;
    details: Record<string, unknown>;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        verified: boolean;
        confidence: number;
        details: Record<string, unknown>;
      }>
    >(`/customers/${customerId}/verify`, { nric });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Identity verification failed');
    }

    return response.data;
  }

  /**
   * Check for duplicate customers
   */
  async checkDuplicateCustomer(nric: string): Promise<{
    isDuplicate: boolean;
    existingCustomer?: Customer;
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        isDuplicate: boolean;
        existingCustomer?: Customer;
      }>
    >('/customers/check-duplicate', { nric });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Duplicate check failed');
    }

    return response.data;
  }

  /**
   * Get customer summary statistics
   */
  async getCustomerSummary(customerId: string): Promise<{
    totalTickets: number;
    activeTickets: number;
    totalPrincipal: number;
    totalInterest: number;
    lastTransactionDate: string;
    creditRating: string;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        totalTickets: number;
        activeTickets: number;
        totalPrincipal: number;
        totalInterest: number;
        lastTransactionDate: string;
        creditRating: string;
        riskLevel: 'low' | 'medium' | 'high';
      }>
    >(`/customers/${customerId}/summary`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch customer summary');
    }

    return response.data;
  }
}

export const customerService = new CustomerService();
