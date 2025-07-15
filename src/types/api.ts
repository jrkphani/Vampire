// HTTP Status Codes
export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 422 | 500;

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T | undefined;
  message?: string | undefined;
  errors?: ApiError[] | undefined;
  metadata?:
    | {
        timestamp: string;
        requestId: string;
        version: string;
      }
    | undefined;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
}

// Pagination
export interface PaginationParams {
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication API
export interface LoginRequest {
  staffCode: string;
  pin: string;
  rememberStaff?: boolean | undefined;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  staff: {
    id: string;
    code: string;
    name: string;
    role: string;
    permissions: string[];
  };
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Ticket API
export interface GetTicketParams {
  ticketNo: string;
}

export interface SearchTicketsParams extends PaginationParams {
  query?: string | undefined;
  type?:
    | 'customer_name'
    | 'nric'
    | 'ticket_number'
    | 'mmyy'
    | 'expiry_date'
    | undefined;
  status?: string[] | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  amountMin?: number | undefined;
  amountMax?: number | undefined;
}

// Customer API
export interface CreateCustomerRequest {
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
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: string;
}

export interface SearchCustomersParams extends PaginationParams {
  query?: string | undefined;
  type?: 'name' | 'nric' | 'contact' | undefined;
}

// Transaction API
export interface ProcessRenewalRequest {
  tickets: string[];
  payment: {
    cashAmount: number;
    digitalAmount: number;
    referenceNo?: string | undefined;
  };
  staffAuth: {
    staffCode: string;
    pin: string;
  };
}

export interface ProcessRedemptionRequest {
  ticketNo: string;
  redeemerType: 'pawner' | 'other';
  redeemerId?: string | undefined;
  newRedeemer?: CreateCustomerRequest | undefined;
  payment: {
    cashAmount: number;
    digitalAmount: number;
    referenceNo?: string | undefined;
  };
  staffAuth: Array<{
    staffCode: string;
    pin: string;
    role: 'appraiser' | 'keyin';
  }>;
}

export interface ProcessLostReportRequest {
  tickets: string[];
  payment: {
    cashAmount: number;
    digitalAmount: number;
    referenceNo?: string | undefined;
  };
  staffAuth: {
    staffCode: string;
    pin: string;
  };
}

export interface ProcessCombinedRequest {
  renewals: string[];
  redemptions: Array<{
    ticketNo: string;
    redeemerType: 'pawner' | 'other';
    redeemerId?: string | undefined;
  }>;
  payment: {
    cashAmount: number;
    digitalAmount: number;
    referenceNo?: string | undefined;
  };
  staffAuth: Array<{
    staffCode: string;
    pin: string;
    role?: 'appraiser' | 'keyin' | undefined;
  }>;
}

// Transaction Response
export interface TransactionResult {
  transactionId: string;
  receipts: Array<{
    id: string;
    type: 'receipt' | 'contract' | 'lost_letter';
    url: string;
  }>;
  newTickets?: string[] | undefined;
  updatedTickets: string[];
  totalAmount: number;
  changeAmount?: number | undefined;
}

// Credit Rating API
export interface GetCreditRatingParams {
  customerId: string;
}

export interface CreditRatingResponse {
  customerId: string;
  score: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  outstandingAmount: number;
  creditLimit: number;
  utilizationRate: number;
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }>;
  history: Array<{
    date: string;
    score: number;
    rating: string;
    change: 'improved' | 'declined' | 'stable';
  }>;
  lastUpdated: string;
}

// Document API
export interface PrintDocumentRequest {
  transactionId: string;
  documentType: 'receipt' | 'contract' | 'lost_letter';
  copies?: number | undefined;
}

export interface PrintDocumentResponse {
  printJobId: string;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  estimatedTime?: number | undefined;
}

export interface ReprintLostLetterRequest {
  receiptNo: string;
}

// System API
export interface GetSystemStatusResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: Array<{
    name: string;
    status: 'up' | 'down';
    responseTime?: number | undefined;
    lastCheck: string;
  }>;
  version: string;
}

// WebSocket Events
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  id: string;
}

export interface TicketUpdateEvent {
  ticketNo: string;
  status: string;
  updatedBy: string;
  changes: Record<string, unknown>;
}

export interface TransactionCompletedEvent {
  transactionId: string;
  type: 'renewal' | 'redemption' | 'lost_report' | 'combined';
  ticketNos: string[];
  totalAmount: number;
  staffId: string;
}

export interface SystemNotificationEvent {
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  action?:
    | {
        label: string;
        url: string;
      }
    | undefined;
}

export interface PrintStatusEvent {
  printJobId: string;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  error?: string | undefined;
}

// File Upload
export interface FileUploadResponse {
  fileId: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
  totalCount: number;
  successCount: number;
  failedCount: number;
  errors?: Array<{
    fileName: string;
    error: string;
  }>;
}

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  defaultHeaders: Record<string, string>;
}

// HTTP Client Types
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  params?: Record<string, unknown> | undefined;
  data?: unknown | undefined;
  headers?: Record<string, string> | undefined;
  timeout?: number | undefined;
  retries?: number | undefined;
}

export interface ResponseConfig<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

// Staff Validation API
export interface ValidateDualAuthRequest {
  primaryStaff: {
    staffCode: string;
    pin: string;
  };
  secondaryStaff: {
    staffCode: string;
    pin: string;
  };
}

export interface ValidateDualAuthResponse {
  valid: boolean;
  primaryStaffValid: boolean;
  secondaryStaffValid: boolean;
  differentStaff: boolean;
  error?: string;
}

// Lost Pledge API
export interface LostPledgeSubmitRequest {
  selectedTickets: Array<{
    ticketNumber: string;
    customerName: string;
  }>;
  lossDescription: string;
  lossCircumstances: 'stolen' | 'lost' | 'damaged' | 'destroyed' | 'other';
  lossDate: string;
  lossLocation: string;
  policeReportNumber?: string;
  policeStation?: string;
  reporterName: string;
  reporterNric: string;
  reporterContact: string;
  supportingDocuments: string[]; // File IDs
}

export interface LostPledgeStatusResponse {
  reportId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  submittedAt: string;
  lastUpdated: string;
  estimatedCompletion?: string;
  notes?: string;
}

// Search with suggestions
export interface UniversalSearchResponse {
  tickets: Array<{
    ticketNo: string;
    customerName: string;
    status: string;
    amount: number;
  }>;
  customers: Array<{
    id: string;
    name: string;
    nric: string;
    contact: string;
  }>;
  totalCount: number;
  hasMore: boolean;
  suggestions: string[];
}

// Environment Types
export interface Environment {
  API_BASE_URL: string;
  WS_URL: string;
  DB_HOST: string;
  DB_NAME: string;
  JWT_SECRET: string;
  SESSION_TIMEOUT: number;
  PRINT_SERVICE_URL: string;
  ENABLE_DEBUG_MODE: boolean;
  ENABLE_MOCK_DATA: boolean;
  ENABLE_OFFLINE_MODE: boolean;
  ANALYTICS_ENABLED: boolean;
  ERROR_REPORTING_ENABLED: boolean;
}
