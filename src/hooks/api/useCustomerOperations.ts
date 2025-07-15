import { useState, useCallback } from 'react';
import type {
  Customer,
  CustomerFormData,
  CustomerSummary,
  SearchResult,
  SearchFilters,
  CreditRating,
} from '@/types/business';

/**
 * Custom hook for customer operations
 * Provides functions for customer management, search, and credit rating
 */
export function useCustomerOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer lookup by NRIC
  const lookupCustomer = useCallback(
    async (nric: string): Promise<Customer | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/nric/${nric}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null; // Customer not found
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Customer not found');
          return null;
        }

        return data.customer || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to lookup customer';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Customer lookup by ID
  const getCustomerById = useCallback(
    async (id: string): Promise<Customer | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null; // Customer not found
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Customer not found');
          return null;
        }

        return data.customer || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get customer';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Create new customer
  const createCustomer = useCallback(
    async (customerData: CustomerFormData): Promise<Customer> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to create customer');
        }

        return data.customer;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create customer';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update existing customer
  const updateCustomer = useCallback(
    async (id: string, customerData: CustomerFormData): Promise<Customer> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to update customer');
        }

        return data.customer;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update customer';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Search customers
  const searchCustomers = useCallback(
    async (
      query: string,
      filters?: SearchFilters,
      limit: number = 20,
      offset: number = 0
    ): Promise<SearchResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          query,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, v.toString()));
              } else {
                searchParams.append(key, value.toString());
              }
            }
          });
        }

        const response = await fetch(`/api/customers/search?${searchParams}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to search customers');
        }

        return {
          tickets: [],
          customers: data.customers || [],
          totalCount: data.totalCount || 0,
          hasMore: data.hasMore || false,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to search customers';
        setError(errorMessage);
        return {
          tickets: [],
          customers: [],
          totalCount: 0,
          hasMore: false,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get customer transaction history
  const getCustomerTransactions = useCallback(
    async (customerId: string): Promise<any[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/customers/${customerId}/transactions`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to get customer transactions');
        }

        return data.transactions || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get customer transactions';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get customer's active tickets
  const getCustomerTickets = useCallback(
    async (customerId: string): Promise<any[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/${customerId}/tickets`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to get customer tickets');
        }

        return data.tickets || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get customer tickets';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get customer credit rating
  const getCustomerCreditRating = useCallback(
    async (customerId: string): Promise<CreditRating | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/customers/${customerId}/credit-rating`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null; // No credit rating found
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to get credit rating');
          return null;
        }

        return data.creditRating || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get credit rating';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update customer credit rating
  const updateCustomerCreditRating = useCallback(
    async (customerId: string): Promise<CreditRating> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/customers/${customerId}/credit-rating`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to update credit rating');
        }

        return data.creditRating;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update credit rating';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get customer statistics
  const getCustomerStats = useCallback(
    async (customerId: string): Promise<any> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/${customerId}/stats`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to get customer statistics');
        }

        return data.stats || {};
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get customer statistics';
        setError(errorMessage);
        return {};
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Validate customer NRIC against external database
  const validateCustomerNRIC = useCallback(
    async (nric: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/customers/validate-nric', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nric }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to validate NRIC');
          return false;
        }

        return data.isValid || false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to validate NRIC';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get recent customers
  const getRecentCustomers = useCallback(
    async (limit: number = 10): Promise<CustomerSummary[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/recent?limit=${limit}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to get recent customers');
        }

        return data.customers || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get recent customers';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Actions
    lookupCustomer,
    getCustomerById,
    createCustomer,
    updateCustomer,
    searchCustomers,
    getCustomerTransactions,
    getCustomerTickets,
    getCustomerCreditRating,
    updateCustomerCreditRating,
    getCustomerStats,
    validateCustomerNRIC,
    getRecentCustomers,
    clearError,
  };
}
