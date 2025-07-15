import { z } from 'zod';
import type { ValidationResult } from '@/types/business';

// Ticket number validation schema
export const ticketNumberSchema = z
  .string()
  .regex(/^[BST]\/\d{4}\/\d{4}$/, 'Invalid ticket format. Use B/MMYY/XXXX');

// NRIC validation schema
export const nricSchema = z
  .string()
  .min(8)
  .max(12)
  .regex(/^[A-Z]\d{7}[A-Z]$/, 'Invalid NRIC format');

// Payment validation schema
export const paymentSchema = z
  .object({
    cashAmount: z.number().min(0, 'Cash amount must be positive'),
    digitalAmount: z.number().min(0, 'Digital amount must be positive'),
    totalCollected: z.number().min(0, 'Total collected must be positive'),
    referenceNo: z.string().optional(),
  })
  .refine(
    data => data.totalCollected === data.cashAmount + data.digitalAmount,
    {
      message: 'Total collected must equal cash + digital amounts',
      path: ['totalCollected'],
    }
  );

// Staff authentication schema
export const staffAuthSchema = z.object({
  staffCode: z
    .string()
    .min(3, 'Staff code must be at least 3 characters')
    .max(10, 'Staff code must be at most 10 characters'),
  pin: z
    .string()
    .min(4, 'PIN must be at least 4 digits')
    .max(8, 'PIN must be at most 8 digits')
    .regex(/^\d+$/, 'PIN must contain only numbers'),
});

// Customer validation schema
export const customerSchema = z.object({
  nric: nricSchema,
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  dob: z.string().regex(/^\d{6}$/, 'Date of birth must be in DDMMYY format'),
  gender: z.enum(['M', 'F']),
  nationality: z
    .string()
    .min(1, 'Nationality is required')
    .max(50, 'Nationality must be at most 50 characters'),
  race: z
    .string()
    .min(1, 'Race is required')
    .max(50, 'Race must be at most 50 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be at most 200 characters'),
  postalCode: z.string().regex(/^\d{6}$/, 'Postal code must be 6 digits'),
  unit: z.string().max(20, 'Unit must be at most 20 characters').optional(),
  contact: z
    .string()
    .regex(/^[89]\d{7}$/, 'Contact must be a valid Singapore mobile number'),
  email: z.string().email('Invalid email format').optional(),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

// Validation helper functions
export function validateTicketNumber(ticketNumber: string): ValidationResult {
  try {
    ticketNumberSchema.parse(ticketNumber);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid ticket number',
      };
    }
    return { isValid: false, error: 'Validation error' };
  }
}

export function validateNRIC(nric: string): ValidationResult {
  try {
    nricSchema.parse(nric);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid NRIC',
      };
    }
    return { isValid: false, error: 'Validation error' };
  }
}

export function validatePayment(payment: unknown): ValidationResult {
  try {
    paymentSchema.parse(payment);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid payment data',
        errors,
      };
    }
    return { isValid: false, error: 'Validation error' };
  }
}

export function validateStaffAuth(auth: unknown): ValidationResult {
  try {
    staffAuthSchema.parse(auth);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid staff authentication',
        errors,
      };
    }
    return { isValid: false, error: 'Validation error' };
  }
}

export function validateCustomer(customer: unknown): ValidationResult {
  try {
    customerSchema.parse(customer);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid customer data',
        errors,
      };
    }
    return { isValid: false, error: 'Validation error' };
  }
}
