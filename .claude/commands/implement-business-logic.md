# Business Logic Implementation Command

Implement ValueMax business rules with full TypeScript safety: $ARGUMENTS

## Business Function Categories
1. **Transaction Processing** (FUNC-01 to FUNC-06)
2. **Customer Management** (FUNC-02.1, FUNC-03)
3. **Payment Processing** (All functions)
4. **Authentication & Authorization** (Staff validation)
5. **Data Validation & Formatting** (Input processing)

## Transaction Flow Implementation

### Ticket Renewal (FUNC-01)
```typescript
// Type-safe renewal process
interface RenewalRequest {
  ticketNumber: string
  payment: PaymentDetails
  staffAuth: StaffAuthentication
}

interface RenewalResponse {
  success: boolean
  newTicketNumber: string
  receiptNumber: string
  contractNumber: string
}

const processRenewal = async (request: RenewalRequest): Promise<RenewalResponse> => {
  // 1. Validate ticket format and status
  const ticket = await validateTicket(request.ticketNumber)
  
  // 2. Validate payment amount
  const payment = validatePayment(request.payment, ticket.renewalAmount)
  
  // 3. Authenticate staff
  const staff = await authenticateStaff(request.staffAuth)
  
  // 4. Process renewal
  return await executeRenewal({ ticket, payment, staff })
}
```

### Customer Redemption (FUNC-02)
```typescript
// Handle same vs different redeemer logic
interface RedemptionRequest {
  ticketNumber: string
  redeemer: RedeemerInfo
  payment: PaymentDetails
  staffAuth: StaffAuthentication | DualStaffAuthentication
}

const processRedemption = async (request: RedemptionRequest): Promise<RedemptionResponse> => {
  const ticket = await validateTicket(request.ticketNumber)
  const redeemer = await validateRedeemer(request.redeemer, ticket.customer)
  
  // Different redeemer requires dual staff auth
  if (redeemer.type === 'different') {
    validateDualStaffAuth(request.staffAuth as DualStaffAuthentication)
    await notifyPromotionVoidance(ticket)
  }
  
  return await executeRedemption({ ticket, redeemer, payment, staffAuth: request.staffAuth })
}
```

## Validation Schema Implementation

### Ticket Number Validation
```typescript
import { z } from 'zod'

// Strict ticket format validation
const TicketNumberSchema = z.string()
  .regex(/^[BST]\/\d{4}\/\d{4}$/, {
    message: "Ticket format must be Size/MMYY/XXXX (e.g., B/0725/1234)"
  })
  .refine(async (ticketNo) => {
    const exists = await checkTicketExists(ticketNo)
    return exists
  }, {
    message: "Ticket not found in database"
  })
  .refine(async (ticketNo) => {
    const ticket = await getTicket(ticketNo)
    return ['U', 'O'].includes(ticket.status)
  }, {
    message: "Ticket status must be Active (U) or Reopened (O)"
  })
```

### Payment Validation
```typescript
const PaymentSchema = z.object({
  cashAmount: z.number().min(0, "Cash amount cannot be negative"),
  digitalAmount: z.number().min(0, "Digital amount cannot be negative"),
  referenceNumber: z.string().optional(),
  totalCollected: z.number()
}).refine((data) => {
  return data.totalCollected === data.cashAmount + data.digitalAmount
}, {
  message: "Total collected must equal sum of cash and digital amounts",
  path: ["totalCollected"]
}).refine((data) => {
  // Digital payment requires reference number
  return data.digitalAmount === 0 || !!data.referenceNumber
}, {
  message: "Reference number required for digital payments",
  path: ["referenceNumber"]
})
```

### Customer Data Validation
```typescript
const CustomerSchema = z.object({
  nric: z.string()
    .regex(/^[A-Z]\d{7}[A-Z]$/, "Invalid NRIC format"),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name too long"),
  dateOfBirth: z.string()
    .regex(/^\d{6}$/, "DOB format: DDMMYY"),
  race: z.enum(['C', 'M', 'I', 'E', 'F', 'B', 'O']),
  sex: z.enum(['M', 'F']),
  nationality: z.enum(['S', 'M', 'I', 'C', 'F', 'V', 'Y', 'P', 'T', 'B', 'N', 'A', 'O']),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string()
    .regex(/^\d{6}$/, "Postal code must be 6 digits"),
  contact: z.string()
    .regex(/^[89]\d{7}$/, "Contact number format: 8xxxxxxx or 9xxxxxxx")
})
```

## State Management Implementation

### Transaction Store (Zustand)
```typescript
interface TransactionState {
  currentTickets: TicketData[]
  paymentDetails: PaymentDetails | null
  staffAuthentication: StaffAuthentication | null
  transactionType: 'renewal' | 'redemption' | 'combined' | 'lost'
  
  // Actions
  addTicket: (ticket: TicketData) => void
  removeTicket: (ticketNumber: string) => void
  setPayment: (payment: PaymentDetails) => void
  authenticateStaff: (auth: StaffAuthentication) => void
  clearTransaction: () => void
  
  // Computed values
  totalAmount: number
  isPaymentValid: boolean
  canProceed: boolean
}

const useTransactionStore = create<TransactionState>((set, get) => ({
  currentTickets: [],
  paymentDetails: null,
  staffAuthentication: null,
  transactionType: 'renewal',
  
  addTicket: (ticket) => set(state => ({
    currentTickets: [...state.currentTickets, ticket]
  })),
  
  setPayment: (payment) => set({ paymentDetails: payment }),
  
  get totalAmount() {
    return get().currentTickets.reduce((sum, ticket) => 
      sum + ticket.renewalAmount, 0)
  },
  
  get isPaymentValid() {
    const payment = get().paymentDetails
    const total = get().totalAmount
    return payment ? payment.totalCollected >= total : false
  },
  
  get canProceed() {
    return get().currentTickets.length > 0 && 
           get().isPaymentValid && 
           !!get().staffAuthentication
  }
}))
```

### API Integration (TanStack Query)
```typescript
// Type-safe API hooks
const useTicketLookup = () => {
  return useMutation({
    mutationFn: async (ticketNumber: string): Promise<TicketData> => {
      const response = await apiClient.get(`/tickets/${ticketNumber}`)
      return TicketDataSchema.parse(response.data)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    }
  })
}

const useProcessRenewal = () => {
  return useMutation({
    mutationFn: async (request: RenewalRequest): Promise<RenewalResponse> => {
      const response = await apiClient.post('/transactions/renew', request)
      return RenewalResponseSchema.parse(response.data)
    },
    onSuccess: (data) => {
      toast.success(`Renewal successful. Receipt: ${data.receiptNumber}`)
    }
  })
}
```

## Error Handling & Recovery

### Business Rule Enforcement
```typescript
// Centralized business rule validation
class BusinessRuleValidator {
  static validateRenewalEligibility(ticket: TicketData): ValidationResult {
    if (!['U', 'O'].includes(ticket.status)) {
      return {
        isValid: false,
        error: `Ticket status '${ticket.status}' not eligible for renewal`
      }
    }
    
    if (isSameDate(ticket.pawnDate, new Date())) {
      return {
        isValid: false,
        error: "Cannot renew ticket on same day as pawn date"
      }
    }
    
    return { isValid: true }
  }
  
  static validatePaymentAmount(collected: number, required: number): ValidationResult {
    if (collected < required) {
      return {
        isValid: false,
        error: `Insufficient payment. Need additional $${(required - collected).toFixed(2)}`
      }
    }
    
    return { isValid: true }
  }
}
```

### Error Recovery Patterns
```typescript
// Graceful error handling with recovery options
const handleTransactionError = (error: TransactionError) => {
  switch (error.type) {
    case 'VALIDATION_ERROR':
      return {
        message: error.message,
        actions: [
          { label: 'Fix Input', action: () => focusErrorField(error.field) },
          { label: 'Clear Form', action: () => clearForm() }
        ]
      }
    
    case 'NETWORK_ERROR':
      return {
        message: 'Connection lost. Transaction saved locally.',
        actions: [
          { label: 'Retry', action: () => retryTransaction() },
          { label: 'Work Offline', action: () => enableOfflineMode() }
        ]
      }
    
    case 'BUSINESS_RULE_ERROR':
      return {
        message: error.message,
        actions: [
          { label: 'Review Rules', action: () => showBusinessRules() },
          { label: 'Contact Supervisor', action: () => requestSupervisorAuth() }
        ]
      }
  }
}
```

## Command Palette Business Integration

### Transaction Commands
```typescript
// Register business-specific commands
const transactionCommands = [
  {
    id: 'renew-ticket',
    name: 'Renew Ticket',
    shortcut: ['r', 't'],
    action: () => router.push('/renew'),
    category: 'transactions'
  },
  {
    id: 'find-customer',
    name: 'Find Customer',
    shortcut: ['f', 'c'],
    action: (query: string) => searchCustomers(query),
    category: 'search'
  },
  {
    id: 'quick-renewal',
    name: 'Quick Renewal',
    shortcut: ['q', 'r'],
    action: (ticketNumber: string) => quickRenewal(ticketNumber),
    category: 'quick-actions'
  }
]
```

## Performance & Optimization

### Memoization for Expensive Calculations
```typescript
// Memoize complex business calculations
const calculateRenewalAmount = useMemo(() => {
  return (principal: number, interestRate: number, months: number) => {
    const interest = principal * interestRate * months
    return {
      principal,
      interest,
      total: principal + interest
    }
  }
}, [])

// Debounce validation for real-time feedback
const debouncedValidation = useDebouncedCallback(
  (value: string) => validateTicketNumber(value),
  300
)
```

## Testing Business Logic
```typescript
describe('Business Rule Validation', () => {
  it('validates ticket renewal eligibility', () => {
    const validTicket = { status: 'U', pawnDate: '2025-07-09' }
    const result = BusinessRuleValidator.validateRenewalEligibility(validTicket)
    expect(result.isValid).toBe(true)
  })
  
  it('rejects same-day renewal attempts', () => {
    const invalidTicket = { status: 'U', pawnDate: format(new Date(), 'yyyy-MM-dd') }
    const result = BusinessRuleValidator.validateRenewalEligibility(invalidTicket)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('same day')
  })
})
```

## Implementation Checklist
- [ ] All business rules implemented with TypeScript types
- [ ] Zod schemas for all data validation
- [ ] Zustand stores for state management
- [ ] TanStack Query for API integration
- [ ] Comprehensive error handling and recovery
- [ ] Business logic unit tests
- [ ] Performance optimization applied
- [ ] Command palette integration
- [ ] Real-time validation feedback

Usage: `/implement-business-logic renewal-flow`
Usage: `/validate-business-rules payment-processing`  
Usage: `/optimize-business-logic customer-search`
