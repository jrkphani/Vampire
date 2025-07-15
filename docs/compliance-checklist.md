# ValueMax Vampire Frontend - Compliance Checklist

> **Version:** 1.0  
> **Created:** July 10, 2025  
> **Team:** 1CloudHub Development Team  
> **Review Cycle:** Weekly

This comprehensive checklist ensures adherence to ValueMax design system standards, type safety requirements, and shadcn/ui component library best practices.

## 🎨 Design Token Compliance

### ✅ Required Design Token Patterns

#### CSS Custom Properties Usage
```css
/* ✅ REQUIRED: Always use design tokens */
.component {
  color: var(--color-text-primary);
  background: var(--color-background);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--border-radius-md);
  font-family: var(--font-sans);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

/* ✅ REQUIRED: Use semantic color tokens */
.error-state {
  color: var(--color-error);
  border-color: var(--color-error);
}

.success-state {
  color: var(--color-success);
  background: var(--color-success);
}
```

#### TypeScript Design Token Integration
```typescript
// ✅ REQUIRED: Import and use design tokens object
import { designTokens } from '@/styles/tokens';

// ✅ REQUIRED: Type-safe token access
const useTheme = () => {
  return {
    colors: designTokens.colors,
    spacing: designTokens.spacing,
    typography: designTokens.typography,
    shadow: designTokens.shadow
  } as const;
};
```

#### Tailwind Configuration with Design Tokens
```typescript
// ✅ REQUIRED: Tailwind config using design tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-red': 'var(--color-brand-red)',
        'brand-gold': 'var(--color-brand-gold)',
        'primary-main': 'var(--color-primary-main)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'border': 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'success': 'var(--color-success)',
        'error': 'var(--color-error)',
        'warning': 'var(--color-warning)',
        'info': 'var(--color-info)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      fontFamily: {
        'sans': 'var(--font-sans)',
        'mono': 'var(--font-mono)',
      }
    }
  }
};
```

### ❌ Prohibited Design Token Anti-Patterns

```css
/* ❌ PROHIBITED: Hardcoded values */
.component {
  color: #1E293B;
  background: #FFFFFF;
  padding: 16px 24px;
  border-radius: 8px;
  font-family: Inter, sans-serif;
}

/* ❌ PROHIBITED: Custom CSS properties outside system */
.custom-component {
  --my-custom-color: #FF5733;
  --my-spacing: 13px;
}
```

```typescript
// ❌ PROHIBITED: Hardcoded design values
const styles = {
  color: '#1E293B',
  padding: '16px 24px',
  borderRadius: '8px'
};

// ❌ PROHIBITED: Arbitrary Tailwind values
<div className="text-[#1E293B] p-[13px] rounded-[7px]">
```

---

## 🧩 shadcn/ui Component Library Compliance

### ✅ Required shadcn/ui Patterns

#### Component Installation and Usage
```bash
# ✅ REQUIRED: Install components via CLI
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
```

#### Proper shadcn/ui Component Implementation
```typescript
// ✅ REQUIRED: Use shadcn/ui base components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ✅ REQUIRED: Extend shadcn/ui components with business logic
interface TicketFormProps {
  onSubmit: (data: TicketFormData) => Promise<void>;
  initialData?: Partial<TicketFormData>;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, initialData }) => {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Ticket Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ticket Number</label>
              <Input 
                placeholder="B/0725/1234"
                className="font-mono"
                {...register('ticketNo')}
              />
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
```

#### Business Component Composition
```typescript
// ✅ REQUIRED: Compose shadcn/ui for business components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TicketDisplayProps {
  ticket: TicketData;
  onRenew: () => void;
  onRedeem: () => void;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ 
  ticket, 
  onRenew, 
  onRedeem 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-mono">{ticket.ticketNo}</CardTitle>
          <p className="text-sm text-text-muted">{ticket.customer.name}</p>
        </div>
        <Badge variant={getStatusVariant(ticket.status)}>
          {ticket.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-secondary">Principal Amount</p>
            <p className="font-mono font-semibold">${ticket.financial.principal}</p>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button onClick={onRenew} className="flex-1">
              Renew
            </Button>
            <Button onClick={onRedeem} variant="secondary" className="flex-1">
              Redeem
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Custom Component Variants
```typescript
// ✅ REQUIRED: Extend shadcn/ui with proper variants
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ValueMaxButtonProps extends ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  loading?: boolean;
}

const ValueMaxButton = React.forwardRef<HTMLButtonElement, ValueMaxButtonProps>(
  ({ className, variant = 'default', loading, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          // Custom ValueMax styling with design tokens
          variant === 'primary' && 'bg-brand-red hover:bg-red-700 text-white',
          variant === 'danger' && 'bg-error hover:bg-red-700 text-white',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    );
  }
);
```

#### Form Integration with shadcn/ui
```typescript
// ✅ REQUIRED: Use shadcn/ui Form components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RenewalFormProps {
  onSubmit: (data: RenewalFormData) => Promise<void>;
}

const RenewalForm: React.FC<RenewalFormProps> = ({ onSubmit }) => {
  const form = useForm<RenewalFormData>({
    resolver: zodResolver(RenewalFormSchema)
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ticketNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Ticket Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="B/0725/1234" 
                  className="font-mono"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="payment.cashAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cash Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00"
                  className="font-mono text-right"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Process Renewal
        </Button>
      </form>
    </Form>
  );
};
```

#### Data Display with shadcn/ui
```typescript
// ✅ REQUIRED: Use shadcn/ui Table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TransactionHistoryProps {
  transactions: TransactionData[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Ticket #</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono">
                {format(transaction.timestamp, 'HH:mm')}
              </TableCell>
              <TableCell className="font-mono">
                {transaction.ticketNo}
              </TableCell>
              <TableCell className="font-mono text-right">
                ${transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### ❌ Prohibited shadcn/ui Anti-Patterns

```typescript
// ❌ PROHIBITED: Creating custom base components instead of using shadcn/ui
const CustomButton = ({ children, ...props }) => (
  <button 
    className="px-4 py-2 bg-blue-500 text-white rounded"
    {...props}
  >
    {children}
  </button>
);

// ❌ PROHIBITED: Not using shadcn/ui component structure
const BadForm = () => (
  <div>
    <input type="text" style={{ border: '1px solid #ccc' }} />
    <button style={{ background: '#007bff' }}>Submit</button>
  </div>
);

// ❌ PROHIBITED: Bypassing shadcn/ui theming system
const BadCard = ({ children }) => (
  <div style={{
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    {children}
  </div>
);

// ❌ PROHIBITED: Not extending shadcn/ui components properly
import './custom-button.css'; // Custom CSS file
const BadButton = (props) => <Button className="my-custom-button" {...props} />;
```

---

## 🔒 Type Safety Compliance

### ✅ Required TypeScript Patterns

#### Strict Type Definitions
```typescript
// ✅ REQUIRED: Comprehensive interface definitions
interface TicketDisplayProps {
  readonly ticket: TicketData;
  readonly onRenew?: (ticketNo: string) => Promise<void>;
  readonly onRedeem?: (ticketNo: string) => Promise<void>;
  readonly isLoading?: boolean;
  readonly className?: string;
}

// ✅ REQUIRED: Discriminated unions for complex state
type TransactionState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TransactionData }
  | { status: 'error'; error: string };

// ✅ REQUIRED: Branded types for domain validation
type TicketNumber = string & { readonly _brand: 'TicketNumber' };
type NRIC = string & { readonly _brand: 'NRIC' };
type Amount = number & { readonly _brand: 'Amount' };
```

#### Zod Schema Integration
```typescript
// ✅ REQUIRED: Comprehensive validation schemas
const TicketDataSchema = z.object({
  ticketNo: z.string().regex(/^[BST]\/\d{4}\/\d{4}$/, 'Invalid ticket format'),
  pledgeNo: z.string().min(1, 'Pledge number required'),
  customer: z.object({
    nric: z.string().regex(/^[A-Z]\d{7}[A-Z]$/, 'Invalid NRIC format'),
    name: z.string().min(1, 'Customer name required'),
    contact: z.string().min(8, 'Valid contact number required')
  }),
  status: z.nativeEnum(TicketStatus),
  financial: z.object({
    principal: z.number().min(0, 'Principal must be positive'),
    interest: z.number().min(0, 'Interest must be positive'),
    total: z.number().min(0, 'Total must be positive')
  })
}).strict();

// ✅ REQUIRED: Infer types from schemas
type TicketData = z.infer<typeof TicketDataSchema>;
```

#### Type-Safe API Integration
```typescript
// ✅ REQUIRED: Typed API client
interface APIClient {
  getTicket(ticketNo: TicketNumber): Promise<APIResponse<TicketData>>;
  renewTicket(data: RenewalFormData): Promise<APIResponse<TransactionResult>>;
  redeemTicket(data: RedemptionFormData): Promise<APIResponse<TransactionResult>>;
  searchCustomers(query: string): Promise<APIResponse<CustomerSummary[]>>;
}

// ✅ REQUIRED: Type-safe hooks
const useTicketQuery = (ticketNo: TicketNumber) => {
  return useQuery({
    queryKey: ['ticket', ticketNo],
    queryFn: () => apiClient.getTicket(ticketNo),
    enabled: !!ticketNo,
    staleTime: 5 * 60 * 1000
  });
};
```

### ❌ Prohibited Type Safety Anti-Patterns

```typescript
// ❌ PROHIBITED: Using any types
const handleData = (data: any) => {
  console.log(data.someProperty);
};

// ❌ PROHIBITED: Type assertions without validation
const ticket = response.data as TicketData;

// ❌ PROHIBITED: Non-null assertions without certainty
const customer = ticket.customer!;

// ❌ PROHIBITED: Loose interfaces
interface LooseProps {
  [key: string]: any;
}
```

---

## 📋 Comprehensive Compliance Checklist

### Pre-Development Setup
- [ ] **Design Tokens Setup**
  - [ ] CSS custom properties defined in globals.css
  - [ ] TypeScript design tokens object exported
  - [ ] Tailwind configuration uses design token variables
  - [ ] No hardcoded values in any component files
  - [ ] Design token usage guidelines documented

- [ ] **shadcn/ui Setup**
  - [ ] shadcn/ui properly initialized in project
  - [ ] components.json configuration file present
  - [ ] Base components installed via CLI
  - [ ] utils.ts helper file configured
  - [ ] Proper import aliases configured (@/components/ui)

- [ ] **TypeScript Configuration**
  - [ ] `strict: true` enabled in tsconfig.json
  - [ ] `noImplicitAny: true` configured
  - [ ] `strictNullChecks: true` enabled
  - [ ] `exactOptionalPropertyTypes: true` enabled
  - [ ] Path mapping configured for clean imports

### Component Development Checklist

#### Design Token Compliance
- [ ] **Color Usage**
  - [ ] All colors use `var(--color-*)` or design token object
  - [ ] Brand red (`--color-brand-red`) used only for primary actions
  - [ ] Semantic colors (`--color-success`, `--color-error`) used appropriately
  - [ ] No hardcoded hex/rgb color values
  - [ ] No arbitrary Tailwind color values

- [ ] **Spacing & Layout**
  - [ ] All spacing uses `var(--space-*)` or design token values
  - [ ] Consistent spacing scale (8px system) followed
  - [ ] No arbitrary padding/margin values
  - [ ] Grid and flexbox utilities use design token spacing

- [ ] **Typography**
  - [ ] Font families use `var(--font-sans)` or `var(--font-mono)`
  - [ ] Monospace font used for data display (tickets, amounts)
  - [ ] Font weights from design token scale (400, 500, 600, 700)
  - [ ] No custom font-size values outside type scale

#### shadcn/ui Component Compliance
- [ ] **Base Component Usage**
  - [ ] All interactive elements use shadcn/ui base components
  - [ ] Forms use shadcn/ui Form, FormField, FormItem components
  - [ ] Data display uses shadcn/ui Table, Card components
  - [ ] Modals use shadcn/ui Dialog components
  - [ ] No custom base UI components created

- [ ] **Component Composition**
  - [ ] Business components compose shadcn/ui components
  - [ ] Proper component variants implemented
  - [ ] Component styling extends shadcn/ui via className
  - [ ] No inline styles or custom CSS files
  - [ ] Proper forwardRef usage for custom components

- [ ] **Accessibility Integration**
  - [ ] ARIA attributes properly used via shadcn/ui
  - [ ] Keyboard navigation supported
  - [ ] Focus management handled by shadcn/ui
  - [ ] Screen reader support maintained

#### Type Safety Compliance
- [ ] **Component Types**
  - [ ] All component props have explicit interfaces
  - [ ] Generic components properly constrained
  - [ ] Event handlers have proper type signatures
  - [ ] Children prop explicitly typed when used
  - [ ] No `any` types in component definitions

- [ ] **Form Handling**
  - [ ] Form schemas defined with Zod
  - [ ] Form data types inferred from schemas
  - [ ] Validation errors properly typed
  - [ ] Submit handlers receive properly typed data
  - [ ] Default values match form data types

- [ ] **Business Logic**
  - [ ] Domain entities have strict type definitions
  - [ ] Enums used for constrained string values
  - [ ] Branded types for domain-specific values
  - [ ] Runtime validation with Zod schemas
  - [ ] API responses validated against schemas

### Code Review Checklist

#### Design System Review
- [ ] **No Hardcoded Values**
  - [ ] No hex/rgb colors in CSS or inline styles
  - [ ] No pixel values for spacing (use design tokens)
  - [ ] No custom font declarations
  - [ ] No custom border-radius values
  - [ ] No custom box-shadow definitions

- [ ] **Proper Token Usage**
  - [ ] CSS custom properties used in all styles
  - [ ] Tailwind classes use design token variables
  - [ ] TypeScript components reference design token object
  - [ ] Consistent naming conventions followed

#### Component Architecture Review
- [ ] **shadcn/ui Integration**
  - [ ] All base UI needs met by shadcn/ui components
  - [ ] Custom components properly extend shadcn/ui
  - [ ] No recreation of existing shadcn/ui functionality
  - [ ] Proper import statements from @/components/ui
  - [ ] Component variants follow shadcn/ui patterns

- [ ] **Business Component Structure**
  - [ ] Clear separation between UI and business components
  - [ ] Proper composition of shadcn/ui base components
  - [ ] Consistent component naming conventions
  - [ ] Proper component file organization

#### Type Safety Review
- [ ] **No Type Bypassing**
  - [ ] No `any` types in production code
  - [ ] No type assertions without validation
  - [ ] No non-null assertions without certainty
  - [ ] No loose object types or index signatures

- [ ] **Proper Type Definitions**
  - [ ] All external data validated with Zod
  - [ ] API responses properly typed
  - [ ] Component props comprehensively typed
  - [ ] Business domain types strictly defined

### Build & Testing Verification

#### Build-Time Checks
- [ ] **TypeScript Compilation**
  - [ ] TypeScript compilation passes with no errors
  - [ ] No TypeScript warnings in production build
  - [ ] Strict mode configuration enforced
  - [ ] Type coverage meets minimum requirements

- [ ] **Design Token Validation**
  - [ ] ESLint rules enforce design token usage
  - [ ] No hardcoded values detected in static analysis
  - [ ] CSS custom properties properly referenced
  - [ ] Tailwind purging removes unused token classes

#### Runtime Verification
- [ ] **No Console Errors**
  - [ ] No type-related runtime errors
  - [ ] Form validation displays correctly
  - [ ] API responses properly validated
  - [ ] Component rendering without errors

- [ ] **Performance Targets**
  - [ ] Component render times meet targets
  - [ ] Bundle size within acceptable limits
  - [ ] Memory usage remains stable
  - [ ] No unnecessary re-renders detected

### Accessibility & UX Verification

#### shadcn/ui Accessibility
- [ ] **Keyboard Navigation**
  - [ ] All interactive elements keyboard accessible
  - [ ] Tab order logical and consistent
  - [ ] Focus indicators visible and clear
  - [ ] Escape key handling for modals

- [ ] **Screen Reader Support**
  - [ ] Proper ARIA labels and descriptions
  - [ ] Form fields properly associated with labels
  - [ ] Error messages announced correctly
  - [ ] Status updates communicated to screen readers

#### Design Token UX
- [ ] **Visual Consistency**
  - [ ] Color usage consistent across components
  - [ ] Spacing rhythm maintained throughout
  - [ ] Typography hierarchy clear and consistent
  - [ ] Interactive states properly styled

- [ ] **Brand Guidelines**
  - [ ] ValueMax brand colors used appropriately
  - [ ] Professional appearance maintained
  - [ ] Design system guidelines followed
  - [ ] Visual hierarchy supports workflow efficiency

### Documentation & Maintenance

#### Component Documentation
- [ ] **Usage Examples**
  - [ ] shadcn/ui component usage documented
  - [ ] Business component examples provided
  - [ ] Props and variants documented
  - [ ] Integration patterns explained

- [ ] **Type Documentation**
  - [ ] Interface definitions documented
  - [ ] Zod schema examples provided
  - [ ] API integration patterns documented
  - [ ] Error handling approaches documented

#### Maintenance Guidelines
- [ ] **Update Procedures**
  - [ ] shadcn/ui update process documented
  - [ ] Design token modification process defined
  - [ ] Type definition update procedures
  - [ ] Breaking change migration guides

---

## 🚨 Critical Compliance Rules

### 🔴 Must Never Violate
1. **No hardcoded colors, spacing, or fonts** - All values must use design tokens
2. **No custom base UI components** - Use shadcn/ui for all base UI needs
3. **No `any` types in production code** - Maintain strict type safety
4. **No inline styles** - All styling through design tokens and Tailwind
5. **No custom CSS files** - Extend shadcn/ui components via className only

### 🟡 Should Always Follow
1. **Compose business components from shadcn/ui base components**
2. **Validate all external data with Zod schemas**
3. **Use branded types for domain-specific values**
4. **Implement proper error boundaries and loading states**
5. **Follow ValueMax branding guidelines for color usage**

### 🟢 Best Practices
1. **Use TypeScript strict mode features effectively**
2. **Implement comprehensive test coverage**
3. **Document component APIs and usage patterns**
4. **Optimize for performance and accessibility**
5. **Maintain consistent code formatting and organization**

---

**This checklist must be reviewed and approved for every component, page, and feature before merging to main branch.**