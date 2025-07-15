import { useState, useCallback } from 'react';
import type {
  TicketData,
  TicketLookupResponse,
  RenewalRequest,
  RedemptionRequest,
  LostReportRequest,
  Transaction,
  StaffAuthentication,
  PaymentData,
} from '@/types/business';

/**
 * Custom hook for ticket operations
 * Provides functions for ticket lookup, renewal, redemption, and lost reports
 */
export function useTicketOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ticket lookup function
  const lookupTicket = useCallback(
    async (ticketNo: string): Promise<TicketData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Replace with actual API call
        const response = await fetch(`/api/tickets/${ticketNo}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TicketLookupResponse = await response.json();

        if (!data.success) {
          setError(data.error || 'Ticket not found');
          return null;
        }

        return data.data || null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to lookup ticket';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Ticket renewal function
  const renewTickets = useCallback(
    async (
      tickets: string[],
      payment: PaymentData,
      staffAuth: StaffAuthentication
    ): Promise<Transaction[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const request: RenewalRequest = {
          tickets,
          payment,
          staffAuth,
        };

        const response = await fetch('/api/transactions/renewal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to process renewal');
        }

        return data.transactions || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to renew tickets';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Ticket redemption function
  const redeemTicket = useCallback(
    async (
      ticketNo: string,
      redeemerType: 'pawner' | 'other',
      payment: PaymentData,
      staffAuth: StaffAuthentication[],
      redeemerId?: string,
      newRedeemer?: any
    ): Promise<Transaction> => {
      setIsLoading(true);
      setError(null);

      try {
        const request: RedemptionRequest = {
          ticketNo,
          redeemerType,
          payment,
          staffAuth,
          redeemerId,
          newRedeemer,
        };

        const response = await fetch('/api/transactions/redemption', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to process redemption');
        }

        return data.transaction;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to redeem ticket';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Lost report function
  const reportLostTickets = useCallback(
    async (
      tickets: string[],
      payment: PaymentData,
      staffAuth: StaffAuthentication
    ): Promise<Transaction[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const request: LostReportRequest = {
          tickets,
          payment,
          staffAuth,
        };

        const response = await fetch('/api/transactions/lost-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to process lost report');
        }

        return data.transactions || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to report lost tickets';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Batch ticket lookup
  const lookupMultipleTickets = useCallback(
    async (ticketNumbers: string[]): Promise<TicketData[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tickets/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticketNumbers }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to lookup tickets');
        }

        return data.tickets || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to lookup tickets';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Get ticket history
  const getTicketHistory = useCallback(
    async (ticketNo: string): Promise<Transaction[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/tickets/${ticketNo}/history`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to get ticket history');
        }

        return data.transactions || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get ticket history';
        setError(errorMessage);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Calculate renewal amount
  const calculateRenewalAmount = useCallback(
    async (ticketNumbers: string[]): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tickets/calculate-renewal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticketNumbers }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to calculate renewal amount');
        }

        return data.totalAmount || 0;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to calculate renewal amount';
        setError(errorMessage);
        return 0;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Calculate redemption amount
  const calculateRedemptionAmount = useCallback(
    async (ticketNo: string): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tickets/${ticketNo}/calculate-redemption`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || 'Failed to calculate redemption amount'
          );
        }

        return data.totalAmount || 0;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to calculate redemption amount';
        setError(errorMessage);
        return 0;
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
    lookupTicket,
    renewTickets,
    redeemTicket,
    reportLostTickets,
    lookupMultipleTickets,
    getTicketHistory,
    calculateRenewalAmount,
    calculateRedemptionAmount,
    clearError,
  };
}
