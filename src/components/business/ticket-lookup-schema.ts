import { z } from 'zod';

// Ticket number validation schema
export const ticketLookupSchema = z.object({
  ticketNumber: z
    .string()
    .min(1, 'Ticket number is required')
    .regex(
      /^B\/\d{4}\/\d{4}$/,
      'Invalid ticket format. Use B/MMYY/XXXX (e.g., B/0125/1234)'
    ),
});

export type TicketLookupFormData = z.infer<typeof ticketLookupSchema>;
