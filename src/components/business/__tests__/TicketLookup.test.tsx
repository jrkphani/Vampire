import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketLookup } from '../TicketLookup';
import type { TicketData } from '@/types/business';

// Mock the validation utility
vi.mock('@/utils/validation', () => ({
  validateTicketNumber: (ticketNumber: string) => {
    const isValid = /^[BST]\/\d{4}\/\d{4}$/.test(ticketNumber);
    return {
      isValid,
      error: isValid ? null : 'Invalid ticket format. Use B/MMYY/XXXX',
    };
  },
}));

// Mock the business helpers
vi.mock('@/utils/business-helpers', () => ({
  formatTicketNumber: (input: string) => {
    const cleaned = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!cleaned) return '';

    const prefixed =
      cleaned.startsWith('B') ||
      cleaned.startsWith('S') ||
      cleaned.startsWith('T')
        ? cleaned
        : 'B' + cleaned;

    if (prefixed.length <= 1) {
      return prefixed;
    } else if (prefixed.length <= 5) {
      return prefixed.substring(0, 1) + '/' + prefixed.substring(1);
    } else {
      return (
        prefixed.substring(0, 1) +
        '/' +
        prefixed.substring(1, 5) +
        '/' +
        prefixed.substring(5, 9)
      );
    }
  },
}));

// Mock the UI components
vi.mock('@/components/ui/compat', () => ({
  Input: React.forwardRef<HTMLInputElement, any>(
    ({ onChange, onKeyDown, label, helper, error, ...props }, ref) => (
      <div className='w-full'>
        {label && (
          <label className="block text-body-small font-semibold text-foreground mb-2 after:content-['*'] after:text-destructive after:ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
          data-testid='ticket-input'
        />
        {error && <p className='mt-1 text-body-small text-destructive'>{error}</p>}
        {!error && helper && (
          <p className='mt-1 text-body-small text-muted-foreground'>{helper}</p>
        )}
      </div>
    )
  ),
}));

vi.mock('@/components/ui', () => ({
  Button: ({ onClick, disabled, children, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}
      data-testid='lookup-button'
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: ({ size, className }: any) => (
    <div data-testid='loading-spinner' className={className}>
      Loading...
    </div>
  ),
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid='card'>
      {children}
    </div>
  ),
}));

const mockTicketData: TicketData = {
  ticketNo: 'B/0125/1234',
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
  },
  status: 'U' as const,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
};

describe('TicketLookup', () => {
  const mockOnTicketFound = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      expect(screen.getByTestId('ticket-input')).toBeInTheDocument();
      expect(screen.getByTestId('lookup-button')).toBeInTheDocument();
    });

    test('renders with custom placeholder', () => {
      const customPlaceholder = 'Enter custom ticket number';
      render(
        <TicketLookup
          onTicketFound={mockOnTicketFound}
          placeholder={customPlaceholder}
        />
      );

      expect(
        screen.getByPlaceholderText(customPlaceholder)
      ).toBeInTheDocument();
    });

    test('renders disabled when disabled prop is true', () => {
      render(
        <TicketLookup onTicketFound={mockOnTicketFound} disabled={true} />
      );

      expect(screen.getByTestId('ticket-input')).toBeDisabled();
      expect(screen.getByTestId('lookup-button')).toBeDisabled();
    });
  });

  describe('Ticket Number Formatting', () => {
    test('formats ticket number as user types', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, '01251234');

      expect(input).toHaveValue('B/0125/1234');
    });

    test('handles partial input formatting', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, '0125');

      expect(input).toHaveValue('B/0125');
    });

    test('preserves existing prefix', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'S01251234');

      expect(input).toHaveValue('S/0125/1234');
    });
  });

  describe('Validation', () => {
    test('shows error for invalid ticket format', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'invalid');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('enables lookup button when ticket format is valid', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'B/0125/1234');

      expect(button).not.toBeDisabled();
    });

    test('disables lookup button when ticket format is invalid', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'invalid');

      expect(button).toBeDisabled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('triggers lookup on Enter key press', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'B/0125/1234');
      await user.keyboard('{Enter}');

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('clears form on Escape key press', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'B/0125/1234');
      await user.keyboard('{Escape}');

      expect(input).toHaveValue('');
    });
  });

  describe('Lookup Functionality', () => {
    test('shows loading state during lookup', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'B/0125/1234');
      await user.click(button);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('calls onTicketFound when ticket is found', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'B/0125/1234');
      await user.click(button);

      // Wait for the mock API call to complete
      await waitFor(() => {
        expect(mockOnTicketFound).toHaveBeenCalledWith(
          expect.objectContaining({
            ticketNo: 'B/0125/1234',
          })
        );
      });
    });

    test('calls onError when ticket is not found', async () => {
      const user = userEvent.setup();
      render(
        <TicketLookup onTicketFound={mockOnTicketFound} onError={mockOnError} />
      );

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'B/9999/9999');
      await user.click(button);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('not found')
        );
      });
    });
  });

  describe('Ticket Information Display', () => {
    test('displays ticket information after successful lookup', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'B/0125/1234');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Ticket Information')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('S1234567A')).toBeInTheDocument();
      });
    });

    test('displays correct status badge', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');
      const button = screen.getByTestId('lookup-button');

      await user.type(input, 'B/0125/1234');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });
  });

  describe('Clear Functionality', () => {
    test('shows clear button when ticket number is entered', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'B/0125/1234');

      expect(
        screen.getByRole('button', { name: /clear/i })
      ).toBeInTheDocument();
    });

    test('clears form when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'B/0125/1234');

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).toHaveAttribute('required');
    });

    test('associates error message with input', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'invalid');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Error Handling', () => {
    test('displays error message for invalid ticket', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'invalid');

      expect(
        screen.getByText('Invalid ticket format. Use B/MMYY/XXXX')
      ).toBeInTheDocument();
    });

    test('clears error when valid input is entered', async () => {
      const user = userEvent.setup();
      render(<TicketLookup onTicketFound={mockOnTicketFound} />);

      const input = screen.getByTestId('ticket-input');

      await user.type(input, 'invalid');
      expect(
        screen.getByText('Invalid ticket format. Use B/MMYY/XXXX')
      ).toBeInTheDocument();

      await user.clear(input);
      await user.type(input, 'B/0125/1234');

      expect(
        screen.queryByText('Invalid ticket format. Use B/MMYY/XXXX')
      ).not.toBeInTheDocument();
    });
  });
});
