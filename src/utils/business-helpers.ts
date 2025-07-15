/**
 * Business logic helpers for ValueMax operations
 * Provides formatting, calculation, and utility functions
 */

import type {
  TicketStatus,
  PaymentData,
  FinancialSummary,
} from '@/types/business';

/**
 * Format ticket number with proper structure B/MMYY/XXXX
 * Auto-formats as user types, handling various input formats
 */
export function formatTicketNumber(input: string): string {
  // Remove all non-alphanumeric characters
  const cleaned = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // If empty or just starting, return as is
  if (!cleaned || cleaned.length === 0) return '';

  // If first character is not B, S, or T, prepend B
  const firstChar = cleaned[0];
  let prefixed = cleaned;
  if (firstChar !== 'B' && firstChar !== 'S' && firstChar !== 'T') {
    prefixed = 'B' + cleaned;
  }

  // Apply formatting based on length
  if (prefixed.length <= 1) {
    return prefixed;
  } else if (prefixed.length <= 5) {
    // B/MMYY format
    return prefixed.substring(0, 1) + '/' + prefixed.substring(1);
  } else {
    // B/MMYY/XXXX format
    return (
      prefixed.substring(0, 1) +
      '/' +
      prefixed.substring(1, 5) +
      '/' +
      prefixed.substring(5, 9)
    );
  }
}

/**
 * Format NRIC with proper structure SXXXXXXXA
 */
export function formatNRIC(input: string): string {
  const cleaned = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  if (!cleaned) return '';

  // Limit to 9 characters max
  return cleaned.substring(0, 9);
}

/**
 * Format phone number for Singapore format
 */
export function formatPhoneNumber(input: string): string {
  const cleaned = input.replace(/[^0-9]/g, '');

  if (!cleaned) return '';

  // Singapore mobile numbers are 8 digits starting with 8 or 9
  if (cleaned.length <= 8) {
    return cleaned;
  }

  return cleaned.substring(0, 8);
}

/**
 * Format postal code for Singapore (6 digits)
 */
export function formatPostalCode(input: string): string {
  const cleaned = input.replace(/[^0-9]/g, '');
  return cleaned.substring(0, 6);
}

/**
 * Format currency amount with proper decimal places
 */
export function formatCurrency(
  amount: number,
  currency: string = 'SGD'
): string {
  const formatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate total payment amount
 */
export function calculateTotalPayment(payment: PaymentData): number {
  return payment.cashAmount + payment.digitalAmount;
}

/**
 * Calculate total amount due (principal + interest)
 */
export function calculateTotalDue(financial: FinancialSummary): number {
  return financial.principal + financial.interest;
}

/**
 * Calculate interest amount based on principal, rate, and months
 */
export function calculateInterest(
  principal: number,
  rate: number,
  months: number
): number {
  return (principal * rate * months) / 100;
}

/**
 * Check if payment is sufficient for the total amount due
 */
export function isPaymentSufficient(
  payment: PaymentData,
  totalDue: number
): boolean {
  return calculateTotalPayment(payment) >= totalDue;
}

/**
 * Calculate change amount
 */
export function calculateChange(
  paymentTotal: number,
  amountDue: number
): number {
  return Math.max(0, paymentTotal - amountDue);
}

/**
 * Get ticket status display information
 */
export function getTicketStatusInfo(status: TicketStatus): {
  label: string;
  description: string;
  className: string;
  color: string;
} {
  const statusMap = {
    U: {
      label: 'Active',
      description: 'Ticket is active and unredeemed',
      className: 'status-active',
      color: 'success',
    },
    O: {
      label: 'Reopened',
      description: 'Ticket has been reopened (returned from police seizure)',
      className: 'status-pending',
      color: 'warning',
    },
    R: {
      label: 'Redeemed',
      description: 'Ticket has been redeemed or renewed',
      className: 'status-redeemed',
      color: 'secondary',
    },
    V: {
      label: 'Void',
      description: 'Ticket has been voided/cancelled',
      className: 'status-error',
      color: 'error',
    },
    A: {
      label: 'Auctioned',
      description: 'Ticket has been auctioned',
      className: 'status-completed',
      color: 'success',
    },
    D: {
      label: 'Defaulted',
      description: 'Ticket has been defaulted',
      className: 'status-error',
      color: 'error',
    },
  };

  return (
    statusMap[status] || {
      label: 'Unknown',
      description: 'Unknown ticket status',
      className: 'status-error',
      color: 'error',
    }
  );
}

/**
 * Check if a date is expired
 */
export function isDateExpired(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get expiry status with urgency indicator
 */
export function getExpiryStatus(expiryDate: string): {
  status: 'expired' | 'urgent' | 'warning' | 'normal';
  daysLeft: number;
  message: string;
  className: string;
} {
  const daysLeft = getDaysUntilExpiry(expiryDate);

  if (daysLeft < 0) {
    return {
      status: 'expired',
      daysLeft,
      message: `Expired ${Math.abs(daysLeft)} days ago`,
      className: 'status-error',
    };
  } else if (daysLeft === 0) {
    return {
      status: 'urgent',
      daysLeft,
      message: 'Expires today',
      className: 'status-error',
    };
  } else if (daysLeft <= 7) {
    return {
      status: 'urgent',
      daysLeft,
      message: `Expires in ${daysLeft} days`,
      className: 'status-error',
    };
  } else if (daysLeft <= 30) {
    return {
      status: 'warning',
      daysLeft,
      message: `Expires in ${daysLeft} days`,
      className: 'status-pending',
    };
  } else {
    return {
      status: 'normal',
      daysLeft,
      message: `Expires in ${daysLeft} days`,
      className: 'status-active',
    };
  }
}

/**
 * Validate staff PIN format
 */
export function validateStaffPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

/**
 * Mask sensitive information (PIN, partial NRIC, etc.)
 */
export function maskSensitiveInfo(
  value: string,
  visibleChars: number = 2
): string {
  if (value.length <= visibleChars) return value;

  const visible = value.substring(0, visibleChars);
  const masked = '*'.repeat(value.length - visibleChars);
  return visible + masked;
}

/**
 * Generate transaction reference number
 */
export function generateTransactionRef(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format date for display
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'long' = 'short'
): string {
  const date = new Date(dateString);

  if (format === 'short') {
    return date.toLocaleDateString('en-SG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } else {
    return date.toLocaleDateString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

/**
 * Format time for display
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString, 'short')} ${formatTime(dateString)}`;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Get business hours status
 */
export function getBusinessHoursStatus(): {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
} {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Business hours: Mon-Fri 9AM-6PM, Sat 9AM-5PM, Closed Sunday
  const isSaturday = day === 6;

  if (day === 0) {
    // Sunday - closed
    return {
      isOpen: false,
      message: 'Closed on Sundays',
      nextOpenTime: 'Monday 9:00 AM',
    };
  }

  if (isSaturday) {
    // Saturday 9AM-5PM
    if (hour >= 9 && hour < 17) {
      return {
        isOpen: true,
        message: 'Open until 5:00 PM',
      };
    } else {
      return {
        isOpen: false,
        message: 'Closed',
        nextOpenTime: hour < 9 ? 'Today 9:00 AM' : 'Monday 9:00 AM',
      };
    }
  }

  // Monday-Friday 9AM-6PM
  if (hour >= 9 && hour < 18) {
    return {
      isOpen: true,
      message: 'Open until 6:00 PM',
    };
  } else {
    return {
      isOpen: false,
      message: 'Closed',
      nextOpenTime: hour < 9 ? 'Today 9:00 AM' : 'Tomorrow 9:00 AM',
    };
  }
}
