# Technical Specifications

## Architecture Overview

The ValueMax Vampire Frontend follows a modern, scalable architecture designed for high-performance pawnshop operations with emphasis on reliability, security, and user experience.

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Tier (Browser)                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  React Frontend │  │   Service Worker │  │  Cache Layer    │ │
│  │  (TypeScript)   │  │   (Offline)     │  │  (LocalStorage) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                            HTTPS/WSS
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Tier                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Gateway   │  │  WebSocket Hub  │  │  Print Service  │ │
│  │   (Node.js)     │  │  (Real-time)    │  │  (Receipt Gen)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                        Database Connections
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Data Tier                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Primary Database│  │  Cache Layer    │  │  File Storage   │ │
│  │ (waterloo_2025) │  │  (Redis)        │  │  (Documents)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Technology Stack

### Core Framework
```json
{
  "react": "18.2.0",
  "typescript": "5.4.0",
  "vite": "5.2.0"
}
```

### State Management
```json
{
  "zustand": "4.4.0",
  "@tanstack/react-query": "5.28.0"
}
```

### Form Handling
```json
{
  "react-hook-form": "7.51.0",
  "zod": "3.22.4",
  "@hookform/resolvers": "3.3.4"
}
```

### UI & Styling
```json
{
  "tailwindcss": "3.4.1",
  "lucide-react": "0.323.0"
}
```

### Utilities
```json
{
  "date-fns": "3.6.0",
  "numeral": "2.0.6",
  "clsx": "2.1.0"
}
```

## Project Structure

```
vampire/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   ├── forms/           # Form-specific components
│   │   ├── layout/          # Layout components
│   │   └── business/        # Business logic components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard views
│   │   ├── transactions/    # Transaction processing
│   │   ├── enquiry/         # Search and enquiry
│   │   └── reports/         # Reporting interfaces
│   ├── hooks/               # Custom React hooks
│   │   ├── api/             # API integration hooks
│   │   ├── forms/           # Form handling hooks
│   │   └── utils/           # Utility hooks
│   ├── services/            # API and external services
│   │   ├── api/             # API client configuration
│   │   ├── auth/            # Authentication services
│   │   ├── print/           # Print service integration
│   │   └── validation/      # Data validation services
│   ├── stores/              # Global state management
│   │   ├── auth.ts          # Authentication state
│   │   ├── transactions.ts  # Transaction state
│   │   └── ui.ts            # UI state
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts           # API response types
│   │   ├── business.ts      # Business domain types
│   │   └── ui.ts            # UI component types
│   ├── utils/               # Utility functions
│   │   ├── formatting.ts    # Data formatting
│   │   ├── validation.ts    # Input validation
│   │   └── constants.ts     # Application constants
│   └── styles/              # Global styles
│       ├── globals.css      # Global CSS
│       ├── components.css   # Component styles
│       └── utilities.css    # Utility classes
├── public/                  # Static assets
├── docs/                    # Project documentation
└── tests/                   # Test files
    ├── unit/                # Unit tests
    ├── integration/         # Integration tests
    └── e2e/                 # End-to-end tests
```

## Database Schema Integration

### Primary Database
**Name:** `waterloo_march2025`

### Key Tables

#### Pledge Management
```sql
-- Large value pledges
pledgebig (
  id, pledge_no, customer_id, amount, status,
  pawn_date, expiry_date, interest_rate,
  weight, description, created_at, updated_at
)

-- Small value pledges  
pledgesmall (
  id, pledge_no, customer_id, amount, status,
  pawn_date, expiry_date, interest_rate,
  weight, description, created_at, updated_at
)

-- Cash pledges
pledgetcash (
  id, pledge_no, customer_id, amount, status,
  pawn_date, expiry_date, interest_rate,
  created_at, updated_at
)
```

#### Customer Management
```sql
-- Customer information
pawner (
  id, nric, name, dob, gender, nationality,
  address, postal_code, contact, email,
  race, notes, created_at, updated_at
)
```

#### Transaction Records
```sql
-- Redemption transactions
redeem (
  id, ticket_no, customer_id, redeemer_id,
  amount, payment_method, staff_id,
  transaction_date, status, created_at
)

-- Lost item reports
lost (
  id, ticket_no, customer_id, report_date,
  fee_amount, status, receipt_no, 
  staff_id, created_at
)

-- Receipt generation
receipt (
  id, transaction_id, receipt_no, 
  document_path, print_status,
  created_at
)
```

### Status Management System

#### Ticket Status Values
```typescript
enum TicketStatus {
  U = 'U',  // Active/Unredeemed
  O = 'O',  // Reopened (returned from police)
  R = 'R',  // Redeemed/Renewed
  V = 'V',  // Void/Cancelled
  A = 'A',  // Auctioned
  D = 'D'   // Defaulted
}
```

#### Transaction Validation Rules
```typescript
interface ValidationRules {
  renewal: {
    requiredStatus: ['U', 'O'];
    staffAuthRequired: 1;
    pawnDateDifference: true;
  };
  redemption: {
    requiredStatus: ['U', 'O'];
    staffAuthRequired: (redeemer: string) => 
      redeemer === 'pawner' ? 1 : 2;
    paymentValidation: 'collected >= total';
  };
  lostReport: {
    requiredStatus: ['U', 'O'];
    staffAuthRequired: 1;
    samePawnerRequired: true; // for multiple items
  };
}
```

## API Architecture

### RESTful Endpoints

#### Authentication
```typescript
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/verify

interface AuthRequest {
  staffCode: string;
  pin: string;
  rememberStaff?: boolean;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  staff: StaffInfo;
  permissions: Permission[];
}
```

#### Transaction Processing
```typescript
// Ticket Operations
GET    /api/tickets/:ticketNo
POST   /api/tickets/renew
POST   /api/tickets/redeem
POST   /api/tickets/combined
GET    /api/tickets/search

// Customer Operations  
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
GET    /api/customers/search

// Lost Items
POST   /api/lost/report
GET    /api/lost/:receiptNo
POST   /api/lost/reprint
```

#### Real-time Updates
```typescript
// WebSocket Events
interface WebSocketEvents {
  'ticket:updated': TicketUpdateEvent;
  'transaction:completed': TransactionEvent;
  'system:notification': SystemNotification;
  'print:status': PrintStatusEvent;
}
```

### Data Transfer Objects

#### Ticket Information
```typescript
interface TicketDTO {
  ticketNo: string;
  pledgeNo: string;
  customer: CustomerSummary;
  pledge: PledgeDetails;
  financial: FinancialSummary;
  status: TicketStatus;
  dates: DateInformation;
}

interface PledgeDetails {
  weight: string;
  description: string;
  scrambledNo: string;
  pledgeCode: string;
  stCode: string;
  pCode: string;
}

interface FinancialSummary {
  principal: number;
  interest: number;
  months: number;
  newAmount: number;
  outstandings: number;
}
```

#### Transaction Requests
```typescript
interface RenewalRequest {
  ticketNo: string;
  payment: PaymentDetails;
  staffAuth: StaffAuthentication;
}

interface RedemptionRequest {
  ticketNo: string;
  redeemer: RedeemerInfo;
  payment: PaymentDetails;
  staffAuth: StaffAuthentication[];
}

interface PaymentDetails {
  cashAmount: number;
  digitalAmount: number;
  referenceNo?: string;
  totalCollected: number;
}
```

## Security Architecture

### Authentication & Authorization
```typescript
interface SecurityConfig {
  authentication: {
    method: 'JWT';
    tokenExpiry: '8 hours';
    refreshTokenExpiry: '30 days';
    sessionTimeout: '2 hours inactivity';
  };
  authorization: {
    roleBasedAccess: true;
    operationLevelPermissions: true;
    auditLogging: true;
  };
  dataProtection: {
    encryptionAtRest: 'AES-256';
    encryptionInTransit: 'TLS 1.3';
    dataAnonymization: 'PII fields';
  };
}
```

### Input Validation
```typescript
// Zod schemas for runtime validation
const TicketNumberSchema = z.string()
  .regex(/^[BST]\/\d{4}\/\d{4}$/, 'Invalid ticket format');

const NRICSchema = z.string()
  .min(8)
  .max(12)
  .regex(/^[A-Z]\d{7}[A-Z]$/, 'Invalid NRIC format');

const PaymentSchema = z.object({
  cashAmount: z.number().min(0),
  digitalAmount: z.number().min(0),
  totalCollected: z.number().min(0)
}).refine(data => 
  data.totalCollected === data.cashAmount + data.digitalAmount,
  'Payment amounts must sum to total'
);
```

## Performance Specifications

### Response Time Requirements
```typescript
interface PerformanceTargets {
  pageLoad: '< 2 seconds';
  formSubmission: '< 1 second';
  searchOperations: '< 500ms';
  keyboardShortcuts: '< 100ms';
  databaseQueries: '< 200ms';
  apiCalls: '< 300ms';
}
```

### Optimization Strategies
```typescript
interface OptimizationConfig {
  bundling: {
    codesplitting: true;
    lazyLoading: true;
    treeShaking: true;
  };
  caching: {
    staticAssets: '1 year';
    apiResponses: '5 minutes';
    userSessions: '8 hours';
  };
  compression: {
    gzip: true;
    brotli: true;
    assetMinification: true;
  };
}
```

## Error Handling Strategy

### Error Classification
```typescript
enum ErrorTypes {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_RULE = 'business_rule',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

interface ErrorResponse {
  type: ErrorTypes;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}
```

### Error Recovery Patterns
```typescript
interface ErrorHandling {
  retryStrategy: {
    network: 'exponential backoff';
    authentication: 'immediate retry once';
    validation: 'user correction required';
  };
  fallbackBehavior: {
    offlineMode: 'cache last known state';
    apiFailure: 'graceful degradation';
    validationError: 'field-specific feedback';
  };
  userCommunication: {
    errorMessages: 'specific and actionable';
    recoverySteps: 'clear next actions';
    supportContact: 'escalation path provided';
  };
}
```

## Integration Points

### Print Service Integration
```typescript
interface PrintService {
  receipts: {
    endpoint: '/api/print/receipt';
    format: 'thermal printer compatible';
    fallback: 'PDF generation';
  };
  contracts: {
    endpoint: '/api/print/contract';
    format: 'legal document template';
    signatures: 'digital signature support';
  };
  lostLetters: {
    endpoint: '/api/print/lost-letter';
    format: 'official letterhead';
    tracking: 'receipt number generation';
  };
}
```

### External System Connections
```typescript
interface ExternalSystems {
  creditRating: {
    provider: 'Third-party credit service';
    caching: '24 hour cache';
    fallback: 'local rating calculation';
  };
  auditLogging: {
    destination: 'Centralized audit system';
    format: 'Structured JSON logs';
    retention: '7 years';
  };
  backup: {
    frequency: 'Real-time replication';
    storage: 'Multiple geographic locations';
    recovery: 'Point-in-time recovery';
  };
}
```

## Deployment Architecture

### Environment Configuration
```typescript
interface Environments {
  development: {
    database: 'local development DB';
    apiEndpoint: 'http://localhost:3000';
    features: 'all features enabled';
    logging: 'verbose';
  };
  staging: {
    database: 'staging replica';
    apiEndpoint: 'https://staging-api.valuemax.com';
    features: 'production feature set';
    logging: 'standard';
  };
  production: {
    database: 'production cluster';
    apiEndpoint: 'https://api.valuemax.com';
    features: 'stable feature set';
    logging: 'error and audit only';
  };
}
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['date-fns', 'numeral'],
          forms: ['react-hook-form', 'zod']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});
```

## Monitoring & Observability

### Application Monitoring
```typescript
interface MonitoringStack {
  performance: {
    metrics: ['page load time', 'api response time', 'error rates'];
    tools: ['Web Vitals', 'Performance Observer API'];
    alerting: 'threshold-based notifications';
  };
  business: {
    metrics: ['transaction volume', 'success rates', 'user activity'];
    dashboards: 'real-time operational views';
    reporting: 'daily/weekly/monthly summaries';
  };
  technical: {
    logs: 'structured application logs';
    errors: 'error tracking and aggregation';
    infrastructure: 'server and database monitoring';
  };
}
```

---

**Document Version:** 1.0  
**Created:** July 10, 2025  
**Technical Lead:** 1CloudHub Development Team  
**Review Cycle:** Monthly
