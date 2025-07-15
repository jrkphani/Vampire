import { z } from 'zod';

// Ticket number format validation
const ticketNumberRegex = /^[BS]\/\d{4}\/\d{4}$/;

// NRIC format validation
const nricRegex = /^[STFG]\d{7}[A-Z]$/;

// Phone number validation
const phoneRegex = /^(\+65\s?)?[6789]\d{7}$/;

// Ticket item schema for the wizard
export const ticketItemSchema = z.object({
  id: z.string(),
  ticketNumber: z
    .string()
    .min(1, 'Ticket number is required')
    .regex(ticketNumberRegex, 'Invalid ticket format. Use B/MMYY/XXXX or S/MMYY/XXXX'),
  customerName: z.string().min(1, 'Customer name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  operation: z.enum(['renew', 'redeem'])
});

// Step 1: Ticket Selection and Operation Type
export const step1Schema = z.object({
  tickets: z
    .array(ticketItemSchema)
    .min(1, 'At least one ticket must be added to proceed'),
  
  currentOperationType: z.enum(['renew', 'redeem']),
  
  currentTicketNumber: z
    .string()
    .optional()
}).refine((data) => {
  // Ensure we have at least one ticket of each type if both operations are present
  const renewals = data.tickets.filter(t => t.operation === 'renew');
  const redemptions = data.tickets.filter(t => t.operation === 'redeem');
  
  return renewals.length > 0 || redemptions.length > 0;
}, {
  message: 'At least one renewal or redemption ticket must be added',
  path: ['tickets']
});

// Step 2: Customer & Redeemer Verification
export const step2Schema = z.object({
  // Primary customer verification
  primaryCustomerVerified: z.boolean().refine(val => val === true, {
    message: 'Primary customer identity must be verified'
  }),
  
  // Redeemer information (required if any redemptions exist)
  redeemerName: z.string().optional(),
  redeemerNric: z.string().optional(),
  redeemerContact: z.string().optional(),
  relationshipToCustomer: z.enum(['self', 'spouse', 'child', 'parent', 'sibling', 'relative', 'authorized', 'other']).optional(),
  
  // Identity verification
  idVerificationMethod: z.enum(['nric', 'passport', 'driving_license', 'work_permit']).optional(),
  idNumber: z.string().optional(),
  
  // Different redeemer flag
  isDifferentRedeemer: z.boolean(),
  
  // Security verification for different redeemer
  securityQuestion: z.string().optional(),
  securityAnswer: z.string().optional(),
  
  // Authorization documents
  hasAuthorizationLetter: z.boolean().optional(),
  authorizationWitnessName: z.string().optional(),
  authorizationDate: z.string().optional()
}).superRefine((data, ctx) => {
  // If different redeemer, require redeemer details
  if (data.isDifferentRedeemer) {
    if (!data.redeemerName || data.redeemerName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Redeemer name is required for different redeemer',
        path: ['redeemerName']
      });
    }
    
    if (!data.redeemerNric || !nricRegex.test(data.redeemerNric)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid redeemer NRIC is required',
        path: ['redeemerNric']
      });
    }
    
    if (!data.redeemerContact || !phoneRegex.test(data.redeemerContact)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid redeemer contact is required',
        path: ['redeemerContact']
      });
    }
    
    if (!data.relationshipToCustomer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Relationship to customer is required',
        path: ['relationshipToCustomer']
      });
    }
    
    if (!data.securityQuestion || !data.securityAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Security verification is required for different redeemer',
        path: ['securityAnswer']
      });
    }
  }
});

// Step 3: Payment Processing
export const step3Schema = z.object({
  // Payment method selection
  paymentMethod: z.enum(['cash', 'card', 'nets', 'transfer', 'mixed'], {
    required_error: 'Payment method is required'
  }),
  
  // Cash payment details
  cashAmount: z.number().min(0, 'Cash amount cannot be negative').optional(),
  
  // Digital payment details
  digitalAmount: z.number().min(0, 'Digital amount cannot be negative').optional(),
  cardLastFour: z.string().optional(),
  cardType: z.enum(['visa', 'mastercard', 'amex', 'nets']).optional(),
  
  // Transfer details
  transferReference: z.string().optional(),
  transferBank: z.string().optional(),
  
  // Total calculations
  totalRenewalAmount: z.number().min(0, 'Total renewal amount cannot be negative'),
  totalRedemptionAmount: z.number().min(0, 'Total redemption amount cannot be negative'),
  netAmount: z.number(),
  collectedAmount: z.number().min(0, 'Collected amount cannot be negative'),
  changeAmount: z.number().min(0, 'Change amount cannot be negative'),
  
  // Payment verification
  paymentVerified: z.boolean().refine(val => val === true, {
    message: 'Payment must be verified before proceeding'
  }),
  
  // Receipt generation
  generateReceipt: z.boolean().default(true),
  receiptEmail: z.string().email('Invalid email format').optional(),
  receiptSms: z.boolean().default(false)
}).superRefine((data, ctx) => {
  // Validate payment amounts based on method
  const totalPayment = (data.cashAmount || 0) + (data.digitalAmount || 0);
  
  if (data.paymentMethod === 'cash' && (!data.cashAmount || data.cashAmount === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Cash amount is required for cash payment',
      path: ['cashAmount']
    });
  }
  
  if ((data.paymentMethod === 'card' || data.paymentMethod === 'nets') && (!data.digitalAmount || data.digitalAmount === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Digital payment amount is required',
      path: ['digitalAmount']
    });
  }
  
  if (data.paymentMethod === 'transfer' && !data.transferReference) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Transfer reference is required for bank transfer',
      path: ['transferReference']
    });
  }
  
  // Validate collected amount matches net amount
  if (Math.abs(data.collectedAmount - Math.abs(data.netAmount)) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Collected amount must equal the net transaction amount',
      path: ['collectedAmount']
    });
  }
  
  // Validate change calculation
  const expectedChange = Math.max(0, totalPayment - Math.abs(data.netAmount));
  if (Math.abs(data.changeAmount - expectedChange) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Change amount calculation is incorrect',
      path: ['changeAmount']
    });
  }
});

// Step 4: Staff Authentication & Final Review
export const step4Schema = z.object({
  // Primary staff authentication
  staffCode: z
    .string()
    .min(1, 'Primary staff code is required'),
  
  staffPassword: z
    .string()
    .min(1, 'Staff password is required'),
  
  // Dual staff authentication (required for different redeemer or high-value transactions)
  requiresDualAuth: z.boolean(),
  
  secondStaffCode: z.string().optional(),
  secondStaffPassword: z.string().optional(),
  
  // Final review and confirmations
  transactionReviewed: z.boolean().refine(val => val === true, {
    message: 'Transaction details must be reviewed'
  }),
  
  documentsVerified: z.boolean().refine(val => val === true, {
    message: 'All required documents must be verified'
  }),
  
  complianceChecked: z.boolean().refine(val => val === true, {
    message: 'Compliance requirements must be verified'
  }),
  
  // Manager approval (for high-value transactions)
  requiresManagerApproval: z.boolean(),
  managerCode: z.string().optional(),
  managerApprovalReason: z.string().optional(),
  
  // Final confirmation
  finalConfirmation: z.boolean().refine(val => val === true, {
    message: 'Final confirmation is required to complete the transaction'
  }),
  
  // Transaction metadata
  transactionDate: z.string().min(1, 'Transaction date is required'),
  branchCode: z.string().min(1, 'Branch code is required'),
  terminalId: z.string().optional(),
  
  // Audit information
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional()
}).superRefine((data, ctx) => {
  // Dual staff authentication validation
  if (data.requiresDualAuth) {
    if (!data.secondStaffCode || data.secondStaffCode.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Second staff code is required for dual authentication',
        path: ['secondStaffCode']
      });
    }
    
    if (!data.secondStaffPassword || data.secondStaffPassword.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Second staff password is required for dual authentication',
        path: ['secondStaffPassword']
      });
    }
    
    // Ensure different staff members
    if (data.staffCode === data.secondStaffCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Second staff member must be different from primary staff',
        path: ['secondStaffCode']
      });
    }
  }
  
  // Manager approval validation
  if (data.requiresManagerApproval) {
    if (!data.managerCode || data.managerCode.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Manager code is required for high-value transactions',
        path: ['managerCode']
      });
    }
    
    if (!data.managerApprovalReason || data.managerApprovalReason.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Manager approval reason is required',
        path: ['managerApprovalReason']
      });
    }
  }
});

// Combined schema for all steps
export const combinedOperationsSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  currentStep: z.number().min(1).max(4).default(1)
});

// Type exports
export type CombinedOperationsFormData = z.infer<typeof combinedOperationsSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type TicketItem = z.infer<typeof ticketItemSchema>;

// Helper functions
export const calculateNetAmount = (tickets: TicketItem[]): {
  totalRenewalAmount: number;
  totalRedemptionAmount: number;
  netAmount: number;
} => {
  const totalRenewalAmount = tickets
    .filter(t => t.operation === 'renew')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalRedemptionAmount = tickets
    .filter(t => t.operation === 'redeem')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAmount = totalRenewalAmount - totalRedemptionAmount;
  
  return { totalRenewalAmount, totalRedemptionAmount, netAmount };
};

export const requiresDualAuthentication = (tickets: TicketItem[], netAmount: number): boolean => {
  // Dual auth required for:
  // 1. Any redemption transactions
  // 2. High-value transactions (>$5000)
  // 3. Multiple tickets (>5)
  const hasRedemptions = tickets.some(t => t.operation === 'redeem');
  const isHighValue = Math.abs(netAmount) > 5000;
  const isMultipleTickets = tickets.length > 5;
  
  return hasRedemptions || isHighValue || isMultipleTickets;
};

export const requiresManagerApproval = (tickets: TicketItem[], netAmount: number): boolean => {
  // Manager approval required for:
  // 1. Very high-value transactions (>$10000)
  // 2. Large number of tickets (>10)
  const isVeryHighValue = Math.abs(netAmount) > 10000;
  const isManyTickets = tickets.length > 10;
  
  return isVeryHighValue || isManyTickets;
};

export const formatTicketNumber = (value: string): string => {
  const cleaned = value.replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 1) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 1)}/${cleaned.slice(1)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 1)}/${cleaned.slice(1, 5)}/${cleaned.slice(5, 9)}`;
};

export const validateStepCompletion = (step: number, data: any): boolean => {
  try {
    switch (step) {
      case 1:
        step1Schema.parse(data);
        return true;
      case 2:
        step2Schema.parse(data);
        return true;
      case 3:
        step3Schema.parse(data);
        return true;
      case 4:
        step4Schema.parse(data);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
};