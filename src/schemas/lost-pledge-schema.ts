import { z } from 'zod';

// Ticket number format validation
const ticketNumberRegex = /^[BS]\/\d{4}\/\d{4}$/;

// File type validation for documents
const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

// Selected ticket interface
export const selectedTicketSchema = z.object({
  id: z.string(),
  ticketNumber: z
    .string()
    .min(1, 'Ticket number is required')
    .regex(ticketNumberRegex, 'Invalid ticket format. Use B/MMYY/XXXX or S/MMYY/XXXX'),
  customerName: z
    .string()
    .min(1, 'Customer name is required'),
  status: z.enum(['active', 'expired', 'renewed'])
});

// Supporting document schema
export const supportingDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().refine((type) => allowedFileTypes.includes(type), {
    message: 'File type must be PDF, JPG, or PNG'
  }),
  size: z.number().max(maxFileSize, 'File size must be less than 10MB'),
  file: z.any(), // File object
  uploadedAt: z.string()
});

export const lostPledgeSchema = z.object({
  // Ticket Selection
  selectedTickets: z
    .array(selectedTicketSchema)
    .min(1, 'At least one ticket must be selected for lost pledge reporting'),
  
  // Lost Item Details
  lossDescription: z
    .string()
    .min(1, 'Loss description is required')
    .min(20, 'Description must be at least 20 characters to provide adequate detail')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  lossCircumstances: z
    .enum(['stolen', 'lost', 'damaged', 'destroyed', 'other'], {
      required_error: 'Loss circumstances must be specified'
    }),
  
  lossDate: z
    .string()
    .min(1, 'Loss date is required')
    .refine((date) => {
      const lossDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      return lossDate <= today && lossDate >= oneYearAgo;
    }, 'Loss date must be within the last year and not in the future'),
  
  lossLocation: z
    .string()
    .min(1, 'Loss location is required')
    .min(5, 'Location must be at least 5 characters')
    .max(200, 'Location must not exceed 200 characters'),
  
  // Police Report Information (required for theft)
  policeReportNumber: z
    .string()
    .optional(),
  
  policeStation: z
    .string()
    .optional(),
  
  policeReportDate: z
    .string()
    .optional(),
  
  // Insurance Information
  hasInsurance: z.boolean(),
  
  insuranceCompany: z
    .string()
    .optional(),
  
  insurancePolicyNumber: z
    .string()
    .optional(),
  
  insuranceClaimNumber: z
    .string()
    .optional(),
  
  // Supporting Documents
  supportingDocuments: z
    .array(supportingDocumentSchema)
    .min(1, 'At least one supporting document is required (police report or statutory declaration)'),
  
  // Statutory Declaration
  hasStatutoryDeclaration: z.boolean(),
  
  declarationWitnessName: z
    .string()
    .optional(),
  
  declarationWitnessNric: z
    .string()
    .optional(),
  
  declarationDate: z
    .string()
    .optional(),
  
  // Reporter Information
  reporterName: z
    .string()
    .min(1, 'Reporter name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  reporterNric: z
    .string()
    .min(1, 'Reporter NRIC is required')
    .regex(/^[STFG]\d{7}[A-Z]$/, 'Invalid NRIC format. Use format: S1234567A'),
  
  reporterContact: z
    .string()
    .min(1, 'Reporter contact is required')
    .regex(/^(\+65\s?)?[6789]\d{7}$/, 'Invalid phone format. Use +65 XXXXXXXX or 8-digit local number'),
  
  relationshipToCustomer: z
    .enum(['self', 'spouse', 'child', 'parent', 'sibling', 'relative', 'authorized', 'legal_representative'], {
      required_error: 'Relationship to customer is required'
    }),
  
  // Report Metadata
  reportDate: z
    .string()
    .min(1, 'Report date is required'),
  
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  
  // Staff Information
  staffCode: z
    .string()
    .min(1, 'Staff code is required for report authorization'),
  
  supervisorCode: z
    .string()
    .optional(),
  
  // Additional Information
  additionalNotes: z
    .string()
    .max(1000, 'Additional notes must not exceed 1000 characters')
    .optional(),
  
  followUpRequired: z.boolean().default(false),
  
  // Acknowledgments
  accuracyConfirmed: z
    .boolean()
    .refine(val => val === true, 'Reporter must confirm the accuracy of information'),
  
  penaltyUnderstood: z
    .boolean()
    .refine(val => val === true, 'Reporter must acknowledge false information penalties')
}).refine((data) => {
  // Custom validation: Police report required for theft
  if (data.lossCircumstances === 'stolen') {
    return data.policeReportNumber && data.policeReportNumber.length > 0 &&
           data.policeStation && data.policeStation.length > 0 &&
           data.policeReportDate && data.policeReportDate.length > 0;
  }
  return true;
}, {
  message: 'Police report details are mandatory for stolen items',
  path: ['policeReportNumber']
}).refine((data) => {
  // Custom validation: Insurance details required if insurance claimed
  if (data.hasInsurance) {
    return data.insuranceCompany && data.insuranceCompany.length > 0 &&
           data.insurancePolicyNumber && data.insurancePolicyNumber.length > 0;
  }
  return true;
}, {
  message: 'Insurance details are required when insurance is claimed',
  path: ['insuranceCompany']
}).refine((data) => {
  // Custom validation: Statutory declaration details if no police report
  if (data.lossCircumstances !== 'stolen' && data.hasStatutoryDeclaration) {
    return data.declarationWitnessName && data.declarationWitnessName.length > 0 &&
           data.declarationWitnessNric && data.declarationWitnessNric.length > 0 &&
           data.declarationDate && data.declarationDate.length > 0;
  }
  return true;
}, {
  message: 'Statutory declaration witness details are required',
  path: ['declarationWitnessName']
}).refine((data) => {
  // Custom validation: High priority requires supervisor approval
  if (data.priority === 'high' || data.priority === 'urgent') {
    return data.supervisorCode && data.supervisorCode.length > 0;
  }
  return true;
}, {
  message: 'High priority reports require supervisor approval',
  path: ['supervisorCode']
});

export type LostPledgeFormData = z.infer<typeof lostPledgeSchema>;
export type SelectedTicket = z.infer<typeof selectedTicketSchema>;
export type SupportingDocument = z.infer<typeof supportingDocumentSchema>;

// Helper functions
export const validateTicketNumber = (ticketNumber: string): boolean => {
  return ticketNumberRegex.test(ticketNumber);
};

export const formatTicketNumber = (value: string): string => {
  const cleaned = value.replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 1) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 1)}/${cleaned.slice(1)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5, 9)}`;
};

export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  if (!allowedFileTypes.includes(file.type)) {
    return { isValid: false, error: 'File type must be PDF, JPG, or PNG' };
  }
  
  if (file.size > maxFileSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }
  
  return { isValid: true };
};

export const getRequiredDocuments = (circumstances: string): string[] => {
  switch (circumstances) {
    case 'stolen':
      return ['Police Report (mandatory)', 'Original receipt (if available)', 'Photo identification'];
    case 'lost':
      return ['Statutory Declaration', 'Original receipt (if available)', 'Photo identification'];
    case 'damaged':
      return ['Photos of damage', 'Incident report (if applicable)', 'Original receipt'];
    case 'destroyed':
      return ['Evidence of destruction', 'Insurance report (if applicable)', 'Original receipt'];
    default:
      return ['Supporting documentation', 'Original receipt (if available)', 'Photo identification'];
  }
};

export const getPriorityLevel = (ticketCount: number, totalValue: number): 'low' | 'medium' | 'high' | 'urgent' => {
  if (totalValue > 10000 || ticketCount > 5) return 'urgent';
  if (totalValue > 5000 || ticketCount > 3) return 'high';
  if (totalValue > 1000 || ticketCount > 1) return 'medium';
  return 'low';
};