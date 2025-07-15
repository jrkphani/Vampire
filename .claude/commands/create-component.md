# Component Development Command

Create/modify shadcn/ui components with ValueMax business logic: $ARGUMENTS

## Component Creation Workflow
1. **shadcn/ui Foundation**
   ```bash
   # Install required shadcn/ui component
   npx shadcn-ui@latest add [component-name]
   
   # Available components for pawnshop operations:
   # - button, input, card, table, form, dialog
   # - command, toast, badge, calendar, select
   # - checkbox, radio-group, textarea, switch
   ```

2. **TypeScript Interface Definition**
   - Create comprehensive prop interfaces
   - Define business logic types (TicketData, CustomerInfo, PaymentDetails)
   - Implement Zod validation schemas
   - Ensure strict type safety with no `any` types

3. **Business Logic Integration**
   - Integrate with Zustand stores for state management
   - Implement React Hook Form for form handling
   - Add Zod schema validation for all inputs
   - Connect to API with TanStack Query

## Business Component Templates

### Transaction Components
```typescript
// TicketLookup Component
interface TicketLookupProps {
  onTicketFound: (ticket: TicketData) => void
  onError: (error: string) => void
  autoFocus?: boolean
  placeholder?: string
}

// PaymentForm Component  
interface PaymentFormProps {
  totalAmount: number
  onPaymentChange: (payment: PaymentData) => void
  currency?: string
}

// StaffAuth Component
interface StaffAuthProps {
  onAuthenticated: (staff: StaffInfo) => void
  requireDualAuth?: boolean
  purpose: string
}
```

### Data Display Components
```typescript
// TransactionTable Component
interface TransactionTableProps {
  transactions: TransactionData[]
  onRowSelect?: (transaction: TransactionData) => void
  sortable?: boolean
  filterable?: boolean
}

// CustomerCard Component
interface CustomerCardProps {
  customer: CustomerInfo
  tickets?: TicketData[]
  showActions?: boolean
  compact?: boolean
}
```

## Design Token Integration
1. **CSS Custom Properties Usage**
   ```css
   /* Use design tokens for all styling */
   background: var(--color-primary-main)
   color: var(--color-text-primary)
   padding: var(--space-4)
   border-radius: var(--radius-md)
   ```

2. **Tailwind CSS Classes**
   ```tsx
   // Use Tailwind utilities with design tokens
   className="bg-primary text-primary-foreground p-4 rounded-md"
   ```

3. **Theme-aware Components**
   ```tsx
   // Support light/dark mode through CSS variables
   const Button = ({ variant, children, ...props }) => (
     <button 
       className={cn(
         "bg-primary text-primary-foreground",
         variant === "secondary" && "bg-secondary text-secondary-foreground"
       )}
       {...props}
     >
       {children}
     </button>
   )
   ```

## Accessibility Implementation
1. **Keyboard Navigation**
   ```tsx
   // Implement comprehensive keyboard support
   onKeyDown={(e) => {
     if (e.key === 'Enter') handleSubmit()
     if (e.key === 'Escape') handleCancel()
     if (e.key === 'Tab') handleTabNavigation(e)
   }}
   ```

2. **ARIA Labels & Descriptions**
   ```tsx
   <input
     aria-label="Ticket Number"
     aria-describedby="ticket-help"
     aria-required="true"
     aria-invalid={!!error}
   />
   ```

3. **Focus Management**
   ```tsx
   // Auto-focus critical fields
   const inputRef = useRef<HTMLInputElement>(null)
   useEffect(() => {
     if (autoFocus) inputRef.current?.focus()
   }, [autoFocus])
   ```

## Validation & Error Handling
1. **Zod Schema Integration**
   ```typescript
   const TicketNumberSchema = z.string()
     .regex(/^[BST]\/\d{4}\/\d{4}$/, "Invalid ticket format")
     .refine(async (value) => await validateTicketExists(value))
   ```

2. **Real-time Validation**
   ```tsx
   const { register, formState: { errors } } = useForm({
     resolver: zodResolver(schema),
     mode: 'onChange'
   })
   ```

3. **Error Boundary Integration**
   ```tsx
   <ErrorBoundary fallback={<ComponentErrorFallback />}>
     <BusinessComponent />
   </ErrorBoundary>
   ```

## Performance Optimization
1. **Memoization Patterns**
   ```tsx
   const MemoizedComponent = memo(({ data, onAction }) => {
     const memoizedData = useMemo(() => 
       processExpensiveData(data), [data]
     )
     
     const handleAction = useCallback((item) => 
       onAction(item), [onAction]
     )
   })
   ```

2. **Lazy Loading**
   ```tsx
   const LazyComponent = lazy(() => import('./ExpensiveComponent'))
   
   <Suspense fallback={<ComponentSkeleton />}>
     <LazyComponent />
   </Suspense>
   ```

## Testing Requirements
1. **Component Testing**
   ```typescript
   describe('TicketLookup Component', () => {
     it('validates ticket format correctly', async () => {
       render(<TicketLookup onTicketFound={mockFn} onError={mockFn} />)
       // Test implementation
     })
   })
   ```

2. **Accessibility Testing**
   ```typescript
   it('supports keyboard navigation', async () => {
     const user = userEvent.setup()
     render(<Component />)
     
     await user.keyboard('{Tab}')
     expect(screen.getByRole('button')).toHaveFocus()
   })
   ```

## Command Palette Integration
1. **Command Registration**
   ```typescript
   // Register component-specific commands
   useRegisterCommands([
     {
       id: 'ticket-lookup',
       name: 'Lookup Ticket',
       shortcut: ['t', 'l'],
       action: () => focusTicketInput()
     }
   ])
   ```

2. **Search Integration**
   ```typescript
   // Make component searchable in command palette
   const searchableProps = {
     searchTerms: ['ticket', 'lookup', 'search'],
     category: 'transactions'
   }
   ```

## Development Checklist
- [ ] shadcn/ui component properly installed and configured
- [ ] TypeScript interfaces comprehensive and strict
- [ ] Zod validation schemas implemented
- [ ] Design tokens used exclusively for styling
- [ ] Keyboard accessibility fully implemented
- [ ] Error boundaries and error handling complete
- [ ] Performance optimizations applied
- [ ] Component tests written and passing
- [ ] Command palette integration added
- [ ] Business logic integration verified

Usage: `/create-component TicketLookup`
Usage: `/modify-component PaymentForm --add-validation`
Usage: `/optimize-component TransactionTable --performance`
