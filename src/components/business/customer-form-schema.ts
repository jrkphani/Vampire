import { z } from 'zod';

// NRIC validation for Singapore
const nricRegex = /^[STFG]\d{7}[A-Z]$/;

// Phone number validation for Singapore
const phoneRegex = /^[689]\d{7}$/;

// Postal code validation for Singapore
const postalCodeRegex = /^\d{6}$/;

// Date of birth in DDMMYY format
const dobRegex = /^\d{6}$/;

export const customerFormSchema = z.object({
  nric: z
    .string()
    .min(1, 'NRIC is required')
    .regex(nricRegex, 'Invalid NRIC format (e.g., S1234567A)')
    .transform(val => val.toUpperCase()),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Name can only contain letters, spaces, hyphens and apostrophes'
    ),

  dob: z
    .string()
    .regex(dobRegex, 'Invalid date format. Use DDMMYY (e.g., 150190)')
    .refine(val => {
      // Basic date validation
      const day = parseInt(val.substring(0, 2));
      const month = parseInt(val.substring(2, 4));
      const year = parseInt(val.substring(4, 6));

      if (day < 1 || day > 31) return false;
      if (month < 1 || month > 12) return false;

      // Assume 2-digit years 00-30 are 2000-2030, 31-99 are 1931-1999
      const fullYear = year <= 30 ? 2000 + year : 1900 + year;
      const currentYear = new Date().getFullYear();

      return fullYear <= currentYear && fullYear >= 1900;
    }, 'Invalid date of birth'),

  gender: z.enum(['M', 'F']),

  nationality: z
    .string()
    .min(2, 'Nationality is required')
    .max(50, 'Nationality must be at most 50 characters'),

  race: z
    .string()
    .min(2, 'Race is required')
    .max(50, 'Race must be at most 50 characters'),

  address: z
    .string()
    .min(5, 'Address is required')
    .max(200, 'Address must be at most 200 characters'),

  postalCode: z
    .string()
    .regex(postalCodeRegex, 'Invalid postal code. Must be 6 digits'),

  unit: z.string().max(20, 'Unit must be at most 20 characters').optional(),

  contact: z
    .string()
    .regex(
      phoneRegex,
      'Invalid phone number. Must be 8 digits starting with 6, 8, or 9'
    ),

  email: z.string().email('Invalid email address').optional().or(z.literal('')),

  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
