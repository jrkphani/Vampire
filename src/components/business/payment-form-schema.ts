import { z } from 'zod';

export const paymentFormSchema = z
  .object({
    cashAmount: z.string().regex(/^\d*\.?\d{0,2}$/, 'Invalid amount format'),
    digitalAmount: z.string().regex(/^\d*\.?\d{0,2}$/, 'Invalid amount format'),
    referenceNo: z.string().optional(),
  })
  .refine(
    data => {
      // If digital amount > 0, reference number is required
      const digitalAmount = parseFloat(data.digitalAmount) || 0;
      if (digitalAmount > 0 && !data.referenceNo) {
        return false;
      }
      return true;
    },
    {
      message: 'Reference number is required for digital payment',
      path: ['referenceNo'],
    }
  );

export type PaymentFormData = z.infer<typeof paymentFormSchema>;
