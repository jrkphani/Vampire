import { z } from 'zod';

// Ticket number format validation (B/MMYY/XXXX or S/MMYY/XXXX)
const ticketNumberRegex = /^[BS]\/\d{4}\/\d{4}$/;

// NRIC format validation (S/T/F/G + 7 digits + letter)
const nricRegex = /^[STFG]\d{7}[A-Z]$/;

// Singapore phone number validation
const phoneRegex = /^(\+65\s?)?[6789]\d{7}$/;

export const ticketRedemptionSchema = z.object({
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
  
  customerNric: z
    .string()
    .min(1, 'Customer NRIC is required')
    .regex(nricRegex, 'Invalid NRIC format. Use format: S1234567A'),
  
  customerContact: z
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
  principal: z
    .number()
    .min(0.01, 'Principal amount must be greater than 0')
    .max(100000, 'Principal amount cannot exceed $100,000'),
  
  interest: z
    .number()
    .min(0, 'Interest amount cannot be negative')
    .max(50000, 'Interest amount cannot exceed $50,000'),
  
  totalAmount: z
    .number()
    .min(0.01, 'Total amount must be greater than 0'),
  
  // Redeemer Identity Verification (Critical for security)
  redeemerName: z
    .string()
    .min(1, 'Redeemer name is required')
    .min(2, 'Redeemer name must be at least 2 characters')
    .max(100, 'Redeemer name must not exceed 100 characters'),
  
  redeemerNric: z
    .string()
    .min(1, 'Redeemer NRIC is required')
    .regex(nricRegex, 'Invalid redeemer NRIC format. Use format: S1234567A'),
  
  redeemerContact: z
    .string()
    .min(1, 'Redeemer contact is required')
    .regex(phoneRegex, 'Invalid phone format. Use +65 XXXXXXXX or 8-digit local number'),
  
  relationshipToCustomer: z
    .enum(['self', 'spouse', 'child', 'parent', 'sibling', 'relative', 'authorized', 'other'], {
      required_error: 'Relationship to customer is required'
    }),
  
  // Identity Verification
  idVerificationMethod: z
    .enum(['nric', 'passport', 'driving_license', 'work_permit'], {
      required_error: 'Identity verification method is required'
    }),
  
  idNumber: z
    .string()
    .min(1, 'ID number is required')
    .min(5, 'ID number must be at least 5 characters')
    .max(20, 'ID number must not exceed 20 characters'),
  
  // Security Verification
  isDifferentRedeemer: z.boolean(),
  
  securityQuestion: z
    .string()
    .optional(),
  
  securityAnswer: z
    .string()
    .optional(),
  
  // Payment Information
  paymentAmount: z
    .number()
    .min(0, 'Payment amount cannot be negative'),
  
  // Staff Authentication
  staffCode: z
    .string()
    .min(1, 'Staff code is required'),
  
  secondStaffCode: z
    .string()
    .optional(),
  
  // Dates
  redemptionDate: z
    .string()
    .min(1, 'Redemption date is required')
    .refine((date) => {
      const today = new Date();
      const redemptionDate = new Date(date);
      return redemptionDate >= today;
    }, 'Redemption date cannot be in the past'),
  
  // Additional fields
  remarks: z
    .string()
    .max(1000, 'Remarks must not exceed 1000 characters')
    .optional(),
    
  // Terms acknowledgment
  termsAccepted: z
    .boolean()
    .refine(val => val === true, 'Terms and conditions must be accepted')
}).refine((data) => {
  // Custom validation: If different redeemer, require dual staff authentication
  if (data.isDifferentRedeemer) {
    return data.secondStaffCode && data.secondStaffCode.length > 0;
  }
  return true;
}, {
  message: 'Different redeemer requires dual staff authentication',
  path: ['secondStaffCode']
}).refine((data) => {
  // Custom validation: If different redeemer, security question/answer required
  if (data.isDifferentRedeemer) {
    return data.securityQuestion && data.securityQuestion.length > 0 && 
           data.securityAnswer && data.securityAnswer.length > 0;
  }
  return true;
}, {
  message: 'Security verification required for different redeemer',
  path: ['securityAnswer']
}).refine((data) => {
  // Custom validation: Payment amount must equal total amount for redemption
  return Math.abs(data.paymentAmount - data.totalAmount) < 0.01;
}, {
  message: 'Payment amount must equal the total redemption amount',
  path: ['paymentAmount']
});

export type TicketRedemptionFormData = z.infer<typeof ticketRedemptionSchema>;

// Helper functions for formatting
export const formatTicketNumber = (value: string): string => {
  const cleaned = value.replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 1) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 1)}/${cleaned.slice(1)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5, 9)}`;
};

export const formatNRIC = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+65')) {
    const number = cleaned.slice(3);
    if (number.length <= 4) return `+65 ${number}`;
    return `+65 ${number.slice(0, 4)} ${number.slice(4, 8)}`;
  }
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
};

// Security check helpers
export const getSecurityQuestions = (): string[] => {
  return [
    'What is the customer\'s mother\'s maiden name?',
    'What is the customer\'s date of birth?',
    'What was the customer\'s first pledge item?',
    'What is the customer\'s home address?',
    'What is the customer\'s emergency contact name?'
  ];
};

export const validateIdNumber = (method: string, idNumber: string): boolean => {
  switch (method) {
    case 'nric':
      return nricRegex.test(idNumber);
    case 'passport':
      return /^[A-Z0-9]{6,12}$/.test(idNumber);
    case 'driving_license':
      return /^[A-Z0-9]{8,15}$/.test(idNumber);
    case 'work_permit':
      return /^[A-Z0-9]{8,12}$/.test(idNumber);
    default:
      return false;
  }
};