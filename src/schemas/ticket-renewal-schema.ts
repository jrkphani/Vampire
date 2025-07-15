import { z } from 'zod';

// Ticket number format validation (B/MMYY/XXXX or S/MMYY/XXXX)
const ticketNumberRegex = /^[BS]\/\d{4}\/\d{4}$/;

// NRIC format validation (S/T/F/G + 7 digits + letter)
const nricRegex = /^[STFG]\d{7}[A-Z]$/;

// Singapore phone number validation
const phoneRegex = /^(\+65\s?)?[6789]\d{7}$/;

export const ticketRenewalSchema = z.object({
  // Ticket Information
  ticketNumber: z
    .string()
    .min(1, 'Ticket number is required')
    .regex(ticketNumberRegex, 'Invalid ticket format. Use B/MMYY/XXXX or S/MMYY/XXXX'),
  
  // Customer Information
  customerName: z
    .string()
    .min(1, 'Customer name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  nric: z
    .string()
    .min(1, 'NRIC is required')
    .regex(nricRegex, 'Invalid NRIC format. Use format: S1234567A'),
  
  contact: z
    .string()
    .min(1, 'Contact number is required')
    .regex(phoneRegex, 'Invalid phone format. Use +65 XXXXXXXX or 8-digit local number'),
  
  // Pledge Information
  pledgeDescription: z
    .string()
    .min(1, 'Pledge description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must not exceed 500 characters'),
  
  pledgeWeight: z
    .string()
    .min(1, 'Weight is required')
    .regex(/^\d+(\.\d{1,2})?g?$/, 'Invalid weight format. Use format: 18.5g'),
  
  // Financial Information
  originalAmount: z
    .number()
    .min(0.01, 'Original amount must be greater than 0')
    .max(100000, 'Original amount cannot exceed $100,000'),
  
  interestAmount: z
    .number()
    .min(0, 'Interest amount cannot be negative')
    .max(50000, 'Interest amount cannot exceed $50,000'),
  
  totalAmount: z
    .number()
    .min(0.01, 'Total amount must be greater than 0'),
  
  collectedAmount: z
    .number()
    .min(0, 'Collected amount cannot be negative'),
  
  changeAmount: z
    .number()
    .min(0, 'Change amount cannot be negative'),
  
  // Payment Information
  paymentMethod: z
    .enum(['cash', 'card', 'nets', 'transfer'], {
      required_error: 'Payment method is required'
    }),
  
  // Dates
  renewalDate: z
    .string()
    .min(1, 'Renewal date is required')
    .refine((date) => {
      const today = new Date();
      const renewalDate = new Date(date);
      return renewalDate >= today;
    }, 'Renewal date cannot be in the past'),
  
  newExpiryDate: z
    .string()
    .min(1, 'New expiry date is required'),
  
  // Additional fields
  remarks: z
    .string()
    .max(1000, 'Remarks must not exceed 1000 characters')
    .optional(),
}).refine((data) => {
  // Custom validation: Collected amount must be >= Total amount
  return data.collectedAmount >= data.totalAmount;
}, {
  message: 'Collected amount must be greater than or equal to total amount',
  path: ['collectedAmount']
}).refine((data) => {
  // Custom validation: Change amount should equal collected - total
  const expectedChange = data.collectedAmount - data.totalAmount;
  return Math.abs(data.changeAmount - expectedChange) < 0.01;
}, {
  message: 'Change amount should equal collected amount minus total amount',
  path: ['changeAmount']
}).refine((data) => {
  // Custom validation: New expiry date must be after renewal date
  const renewalDate = new Date(data.renewalDate);
  const expiryDate = new Date(data.newExpiryDate);
  return expiryDate > renewalDate;
}, {
  message: 'New expiry date must be after renewal date',
  path: ['newExpiryDate']
});

export type TicketRenewalFormData = z.infer<typeof ticketRenewalSchema>;

// Helper function to format ticket number
export const formatTicketNumber = (value: string): string => {
  // Remove all non-alphanumeric characters
  const cleaned = value.replace(/[^A-Z0-9]/g, '');
  
  // Format as X/XXXX/XXXX
  if (cleaned.length <= 1) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 1)}/${cleaned.slice(1)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5)}`;
  
  return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5, 9)}`;
};

// Helper function to format NRIC
export const formatNRIC = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// Helper function to format phone number
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // If starts with +65, format as +65 XXXX XXXX
  if (cleaned.startsWith('+65')) {
    const number = cleaned.slice(3);
    if (number.length <= 4) return `+65 ${number}`;
    return `+65 ${number.slice(0, 4)} ${number.slice(4, 8)}`;
  }
  
  // For local numbers, format as XXXX XXXX
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
};

// Helper function to calculate change amount
export const calculateChange = (collected: number, total: number): number => {
  return Math.max(0, collected - total);
};

// Helper function to validate monetary amount
export const formatCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
};