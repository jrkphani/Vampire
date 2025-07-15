// Ticket Status Enum
export enum TicketStatus {
  U = 'U', // Active/Unredeemed
  O = 'O', // Reopened (returned from police seizure)
  R = 'R', // Redeemed/Renewed
  V = 'V', // Void/Cancelled
  A = 'A', // Auctioned
  D = 'D', // Defaulted
}

// Payment Types
export interface PaymentData {
  cashAmount: number;
  digitalAmount: number;
  totalCollected: number;
  referenceNo?: string | undefined;
}

// Customer Information
export interface Customer {
  id: string;
  nric: string;
  name: string;
  dob: string;
  gender: 'M' | 'F';
  nationality: string;
  race: string;
  address: string;
  postalCode: string;
  unit?: string | undefined;
  contact: string;
  email?: string | undefined;
  notes?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  id: string;
  nric: string;
  name: string;
  contact: string;
}

// Pledge Information
export interface PledgeDetails {
  pledgeNo: string;
  weight: string;
  description: string;
  scrambledNo: string;
  pledgeCode: string;
  stCode: string;
  pCode: string;
}

// Financial Information
export interface FinancialSummary {
  principal: number;
  interest: number;
  months: number;
  newAmount: number;
  outstandings: number;
  interestRate: number;
}

// Date Information
export interface DateInformation {
  pawnDate: string;
  expiryDate: string;
  renewalDate?: string | undefined;
  maturityDate?: string | undefined;
}

// Complete Ticket Information
export interface TicketData {
  ticketNo: string;
  pledgeNo: string;
  customerId: string;
  customer: CustomerSummary;
  pledge: PledgeDetails;
  financial: FinancialSummary;
  dates: DateInformation;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

// Staff Information
export interface StaffInfo {
  id: string;
  code: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface StaffAuthentication {
  staffCode: string;
  pin: string;
  staffInfo?: StaffInfo | undefined;
}

// Transaction Types
export interface TransactionBase {
  id: string;
  ticketNo: string;
  customerId: string;
  staffId: string;
  transactionDate: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface RenewalTransaction extends TransactionBase {
  type: 'renewal';
  payment: PaymentData;
  newTicketNo: string;
  interestAmount: number;
}

export interface RedemptionTransaction extends TransactionBase {
  type: 'redemption';
  redeemerType: 'pawner' | 'other';
  redeemerId?: string | undefined;
  payment: PaymentData;
  totalAmount: number;
  promotionVoided?: boolean | undefined;
  appraiserStaffId?: string | undefined;
}

export interface LostReportTransaction extends TransactionBase {
  type: 'lost_report';
  feeAmount: number;
  receiptNo: string;
  payment: PaymentData;
}

export type Transaction =
  | RenewalTransaction
  | RedemptionTransaction
  | LostReportTransaction;

// API Request/Response Types
export interface TicketLookupRequest {
  ticketNo: string;
}

export interface TicketLookupResponse {
  success: boolean;
  data?: TicketData | undefined;
  error?: string | undefined;
}

export interface RenewalRequest {
  tickets: string[];
  payment: PaymentData;
  staffAuth: StaffAuthentication;
}

export interface RedemptionRequest {
  ticketNo: string;
  redeemerType: 'pawner' | 'other';
  redeemerId?: string | undefined;
  newRedeemer?: Partial<Customer> | undefined;
  payment: PaymentData;
  staffAuth: StaffAuthentication[];
}

export interface LostReportRequest {
  tickets: string[];
  payment: PaymentData;
  staffAuth: StaffAuthentication;
}

// Search and Enquiry Types
export interface SearchFilters {
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  status?: TicketStatus[] | undefined;
  amountMin?: number | undefined;
  amountMax?: number | undefined;
}

export interface SearchResult {
  tickets: TicketData[];
  customers: Customer[];
  totalCount: number;
  hasMore: boolean;
}

// Credit Rating Types
export interface CreditRating {
  customerId: string;
  score: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  outstandingAmount: number;
  creditLimit: number;
  riskFactors: string[];
  lastUpdated: string;
}

export interface CustomerCreditDetails {
  customer: {
    id: string;
    name: string;
    nric: string;
    contact: string;
    address: string;
  };
  creditScore: number;
  rating: string;
  riskLevel: string;
  totalExposure: number;
  recommendedCreditLimit: number;
  lastAssessmentDate: string;
  transactionHistory: Array<{
    type: string;
    date: string;
    amount: number;
    status: string;
  }>;
  assessmentFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  recommendations: string[];
}

// Document Types
export interface DocumentInfo {
  id: string;
  type: 'receipt' | 'contract' | 'lost_letter';
  transactionId: string;
  filePath: string;
  printStatus: 'pending' | 'printed' | 'failed';
  createdAt: string;
}

// Error Types
export interface BusinessError {
  code: string;
  message: string;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  error?: string | undefined;
  errors?: Record<string, string> | undefined;
}

// Utility Types for Form Handling
export type TicketFormData = {
  ticketNumber: string;
};

export type PaymentFormData = PaymentData;

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

export type StaffAuthFormData = {
  staffCode: string;
  pin: string;
};

// Combined Operation Types
export interface CombinedOperation {
  renewals: string[];
  redemptions: string[];
  totalAmount: number;
  staffAuth: StaffAuthentication[];
}

// System Configuration Types
export interface SystemConfig {
  currency: string;
  lostReportFee: number;
  interestCalculationMethod: 'simple' | 'compound';
  maxTicketsPerTransaction: number;
  sessionTimeout: number;
}
