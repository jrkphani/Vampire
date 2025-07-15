import { z } from 'zod';

export const staffAuthenticationSchema = z.object({
  staffCode: z
    .string()
    .min(3, 'Staff code must be at least 3 characters')
    .max(10, 'Staff code must be at most 10 characters')
    .regex(
      /^[A-Z0-9]+$/,
      'Staff code must contain only uppercase letters and numbers'
    )
    .transform(val => val.toUpperCase()),
  pin: z
    .string()
    .min(4, 'PIN must be at least 4 digits')
    .max(8, 'PIN must be at most 8 digits')
    .regex(/^\d+$/, 'PIN must contain only numbers'),
});

export type StaffAuthenticationFormData = z.infer<
  typeof staffAuthenticationSchema
>;
