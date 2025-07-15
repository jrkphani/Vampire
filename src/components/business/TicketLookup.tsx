import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/compat';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { validateTicketNumber } from '@/utils/validation';
import { formatTicketNumber } from '@/utils/business-helpers';
import type { TicketData, TicketLookupResponse } from '@/types/business';
import { TicketStatus } from '@/types/business';

/**
 * Props for the TicketLookup component
 */
interface TicketLookupProps {
  /** Callback function called when a valid ticket is found and loaded */
  onTicketFound: (ticket: TicketData) => void;
  /** Optional callback function called when an error occurs during ticket lookup */
  onError?: (error: string) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether the input should be auto-focused when component mounts */
  autoFocus?: boolean;
  /** Additional CSS classes to apply to the component */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

interface TicketLookupState {
  ticketNumber: string;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
  foundTicket: TicketData | null;
  showTicketInfo: boolean;
}

/**
 * TicketLookup - A reusable component for searching and validating pawnshop tickets
 * 
 * This component provides a complete ticket lookup interface with:
 * - Real-time validation of ticket number format (B/MMYY/XXXX)
 * - Auto-formatting of input as user types
 * - API integration for fetching ticket details
 * - Loading states and error handling
 * - Display of found ticket information
 * - Keyboard shortcuts for enhanced UX (Enter to search, Escape to clear)
 * 
 * Used extensively across transaction pages (renewal, redemption, combined operations)
 * and enquiry pages for consistent ticket lookup behavior.
 * 
 * Performance optimized with React.memo to prevent unnecessary re-renders when props
 * remain unchanged, especially beneficial in high-frequency usage scenarios.
 * 
 * @param props - The component props
 * @returns JSX.Element - The rendered ticket lookup component
 * 
 * @example
 * ```tsx
 * // Basic usage in a transaction page
 * <TicketLookup
 *   onTicketFound={(ticket) => {
 *     console.log('Found ticket:', ticket);
 *     setSelectedTicket(ticket);
 *   }}
 *   onError={(error) => {
 *     toast.error(error);
 *   }}
 *   placeholder="Enter ticket number for renewal"
 * />
 * 
 * // Disabled state during processing
 * <TicketLookup
 *   onTicketFound={handleTicketFound}
 *   disabled={isProcessing}
 *   autoFocus={false}
 * />
 * ```
 */
export const TicketLookup = React.memo(function TicketLookup({
  onTicketFound,
  onError,
  placeholder = 'Enter ticket number (B/MMYY/XXXX)',
  autoFocus = true,
  className = '',
  disabled = false,
}: TicketLookupProps) {
  const [state, setState] = useState<TicketLookupState>({
    ticketNumber: '',
    isLoading: false,
    error: null,
    isValid: false,
    foundTicket: null,
    showTicketInfo: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle ticket number input with auto-formatting
  const handleTicketNumberChange = (value: string) => {
    // Auto-format the ticket number as user types
    const formattedValue = formatTicketNumber(value);

    // Validate the formatted value
    const validationResult = validateTicketNumber(formattedValue);

    setState(prev => ({
      ...prev,
      ticketNumber: formattedValue,
      isValid: validationResult.isValid,
      error: validationResult.error || null,
      showTicketInfo: false,
      foundTicket: null,
    }));
  };

  // Handle Enter key press for ticket lookup
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTicketLookup();
    }

    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Perform ticket lookup
  const handleTicketLookup = async () => {
    if (!state.isValid || state.isLoading || disabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call - replace with actual API integration
      const response = await mockTicketLookup(state.ticketNumber);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          foundTicket: response.data!,
          showTicketInfo: true,
          error: null,
        }));
        onTicketFound(response.data);
      } else {
        const errorMessage = response.error || 'Ticket not found';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          foundTicket: null,
          showTicketInfo: false,
        }));
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to lookup ticket';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        foundTicket: null,
        showTicketInfo: false,
      }));
      onError?.(errorMessage);
    }
  };

  // Clear the form
  const handleClear = () => {
    setState({
      ticketNumber: '',
      isLoading: false,
      error: null,
      isValid: false,
      foundTicket: null,
      showTicketInfo: false,
    });
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className='flex gap-3'>
        <div className='flex-1'>
          <Input
            ref={inputRef}
            label='Ticket Number'
            value={state.ticketNumber}
            onChange={handleTicketNumberChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            error={state.error || undefined}
            disabled={disabled || state.isLoading}
            className='font-mono text-h3'
            helper='Format: B/MMYY/XXXX (e.g., B/0125/1234)'
            required
          />
        </div>

        <div className='flex gap-2 items-start pt-6'>
          <Button
            onClick={handleTicketLookup}
            disabled={!state.isValid || state.isLoading || disabled}
            className='px-6 h-10'
            size="default"
          >
            {state.isLoading && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Lookup
          </Button>

          {state.ticketNumber && (
            <Button
              variant='outline'
              onClick={handleClear}
              disabled={state.isLoading}
              title='Clear (Escape)'
              className='h-10'
              size="default"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Ticket Information Display */}
      {state.showTicketInfo && state.foundTicket && (
        <Card className='animate-fade-in'>
          <div className='card-header'>
            <h3 className='card-title'>Ticket Information</h3>
            <div className='mt-2 flex items-center gap-2'>
              <span className='text-body-small text-text-secondary'>Status:</span>
              <TicketStatusBadge status={state.foundTicket.status} />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Customer Information */}
            <div>
              <h4 className='font-semibold text-text-primary mb-3'>Customer</h4>
              <div className='space-y-2 text-body-small'>
                <div>
                  <span className='text-text-secondary'>Name:</span>{' '}
                  <span className='font-semibold'>
                    {state.foundTicket.customer.name}
                  </span>
                </div>
                <div>
                  <span className='text-text-secondary'>NRIC:</span>{' '}
                  <span className='font-mono'>
                    {state.foundTicket.customer.nric}
                  </span>
                </div>
                <div>
                  <span className='text-text-secondary'>Contact:</span>{' '}
                  <span className='font-mono'>
                    {state.foundTicket.customer.contact}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h4 className='font-semibold text-text-primary mb-3'>
                Financial
              </h4>
              <div className='space-y-2 text-body-small'>
                <div className='flex justify-between'>
                  <span className='text-text-secondary'>Principal:</span>
                  <span className='monetary-value'>
                    ${state.foundTicket.financial.principal.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-text-secondary'>Interest:</span>
                  <span className='monetary-value'>
                    ${state.foundTicket.financial.interest.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between font-semibold border-t pt-2'>
                  <span>Total Amount:</span>
                  <span className='monetary-value text-brand-red'>
                    $
                    {(
                      state.foundTicket.financial.principal +
                      state.foundTicket.financial.interest
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pledge Information */}
            <div>
              <h4 className='font-semibold text-text-primary mb-3'>Pledge</h4>
              <div className='space-y-2 text-body-small'>
                <div>
                  <span className='text-text-secondary'>Pledge No:</span>{' '}
                  <span className='font-mono'>
                    {state.foundTicket.pledge.pledgeNo}
                  </span>
                </div>
                <div>
                  <span className='text-text-secondary'>Weight:</span>{' '}
                  <span>{state.foundTicket.pledge.weight}</span>
                </div>
                <div>
                  <span className='text-text-secondary'>Description:</span>{' '}
                  <span>{state.foundTicket.pledge.description}</span>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div>
              <h4 className='font-semibold text-text-primary mb-3'>Dates</h4>
              <div className='space-y-2 text-body-small'>
                <div>
                  <span className='text-text-secondary'>Pawn Date:</span>{' '}
                  <span>
                    {new Date(
                      state.foundTicket.dates.pawnDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className='text-text-secondary'>Expiry Date:</span>{' '}
                  <span>
                    {new Date(
                      state.foundTicket.dates.expiryDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className='text-text-secondary'>Months:</span>{' '}
                  <span>{state.foundTicket.financial.months}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

// Helper component for ticket status badge
function TicketStatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'U':
        return { label: 'Active', className: 'status-active' };
      case 'R':
        return { label: 'Redeemed', className: 'status-redeemed' };
      case 'O':
        return { label: 'Reopened', className: 'status-pending' };
      case 'V':
        return { label: 'Void', className: 'status-error' };
      case 'A':
        return { label: 'Auctioned', className: 'status-completed' };
      case 'D':
        return { label: 'Defaulted', className: 'status-error' };
      default:
        return { label: 'Unknown', className: 'status-error' };
    }
  };

  const { label, className } = getStatusConfig(status);

  return <span className={`status-badge ${className}`}>{label}</span>;
}

// Mock API function - replace with actual API integration
async function mockTicketLookup(
  ticketNumber: string
): Promise<TicketLookupResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data for demonstration
  if (ticketNumber === 'B/0125/1234') {
    return {
      success: true,
      data: {
        ticketNo: ticketNumber,
        pledgeNo: 'P1234567',
        customerId: 'C001',
        customer: {
          id: 'C001',
          nric: 'S1234567A',
          name: 'John Doe',
          contact: '91234567',
        },
        pledge: {
          pledgeNo: 'P1234567',
          weight: '10.5g',
          description: '18K Gold Ring',
          scrambledNo: 'SC123',
          pledgeCode: 'PL001',
          stCode: 'ST001',
          pCode: 'P001',
        },
        financial: {
          principal: 1000.0,
          interest: 150.0,
          months: 6,
          newAmount: 1150.0,
          outstandings: 0,
          interestRate: 2.5,
        },
        dates: {
          pawnDate: '2025-01-15',
          expiryDate: '2025-07-15',
          renewalDate: undefined,
          maturityDate: '2025-07-15',
        },
        status: TicketStatus.U,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      },
    };
  }

  return {
    success: false,
    error: 'Ticket not found. Please verify the ticket number.',
  };
}
