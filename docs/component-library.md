# Component Library

## Overview

The ValueMax Vampire Frontend component library provides a comprehensive set of reusable UI components designed for pawnshop operations. All components follow the design system guidelines and accessibility standards.

## Base Components

### Button

A versatile button component with multiple variants and states.

#### API Reference
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}
```

#### Usage Examples
```tsx
import { Button } from '@/components/ui/Button'

// Primary action button
<Button variant="primary" onClick={handleSubmit}>
  Process Payment
</Button>

// Secondary button
<Button variant="secondary" size="small">
  Cancel
</Button>

// Loading state
<Button variant="primary" loading disabled>
  Processing...
</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>
  Delete Record
</Button>
```

#### Implementation
```tsx
import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', disabled, loading, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          
          // Size variants
          {
            'px-3 py-2 text-sm': size === 'small',
            'px-4 py-3 text-base': size === 'medium',
            'px-6 py-4 text-lg': size === 'large'
          },
          
          // Color variants
          {
            'bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red': variant === 'primary',
            'bg-primary-main text-white hover:bg-primary-light focus:ring-primary-main': variant === 'secondary',
            'bg-transparent text-primary-main border border-gray-300 hover:bg-gray-50': variant === 'tertiary',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger'
          },
          
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
```

### Input

Flexible input component with validation states and proper accessibility.

#### API Reference
```typescript
interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'password' | 'email' | 'number' | 'tel'
  autoFocus?: boolean
  maxLength?: number
  className?: string
}
```

#### Usage Examples
```tsx
import { Input } from '@/components/ui/Input'

// Basic input
<Input
  label="Customer Name"
  placeholder="Enter customer name"
  value={customerName}
  onChange={setCustomerName}
/>

// Required field with validation
<Input
  label="Ticket Number"
  placeholder="B/0725/1234"
  value={ticketNumber}
  onChange={setTicketNumber}
  required
  error={ticketError}
  helper="Format: Size/MMYY/XXXX"
/>

// Numeric input
<Input
  label="Amount"
  type="number"
  placeholder="0.00"
  value={amount}
  onChange={setAmount}
/>
```

#### Implementation
```tsx
import { forwardRef, useId } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder, value, onChange, error, helper, required, disabled, type = 'text', className, ...props }, ref) => {
    const id = useId()
    const helperId = useId()
    const errorId = useId()

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-gray-900 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          aria-describedby={clsx(
            helper && helperId,
            error && errorId
          )}
          aria-invalid={!!error}
          className={clsx(
            'w-full px-4 py-3 border rounded-lg transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red',
            
            // States
            {
              'border-gray-300 bg-white': !error,
              'border-red-500 bg-red-50': error,
              'bg-gray-100 cursor-not-allowed': disabled
            },
            
            className
          )}
          {...props}
        />
        
        {helper && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-600">
            {helper}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
```

### Table

Data table component optimized for financial data display.

#### API Reference
```typescript
interface Column<T> {
  key: keyof T
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => React.ReactNode
  sortable?: boolean
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onRowClick?: (row: T) => void
  className?: string
}
```

#### Usage Examples
```tsx
import { Table } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/utils/formatting'

const transactionColumns = [
  { key: 'time', header: 'Time', width: '100px' },
  { key: 'ticketNo', header: 'Ticket #', width: '120px' },
  { key: 'customerName', header: 'Customer', width: '200px' },
  { 
    key: 'amount', 
    header: 'Amount', 
    align: 'right',
    format: (value) => formatCurrency(value)
  },
  { 
    key: 'status', 
    header: 'Status',
    format: (value) => <StatusBadge status={value} />
  }
]

<Table
  data={transactions}
  columns={transactionColumns}
  onRowClick={handleRowClick}
  loading={isLoading}
/>
```

#### Implementation
```tsx
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading, 
  onRowClick, 
  className 
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className={clsx('overflow-hidden rounded-lg border border-gray-200', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{ width: column.width }}
                className={clsx(
                  'px-4 py-3 text-xs font-semibold text-gray-900 uppercase tracking-wider',
                  {
                    'text-left': column.align === 'left' || !column.align,
                    'text-center': column.align === 'center',
                    'text-right': column.align === 'right'
                  }
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'hover:bg-gray-50 transition-colors duration-150',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={clsx(
                    'px-4 py-3 text-sm text-gray-900',
                    {
                      'text-left': column.align === 'left' || !column.align,
                      'text-center': column.align === 'center',
                      'text-right': column.align === 'right'
                    }
                  )}
                >
                  {column.format 
                    ? column.format(row[column.key])
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { Table }
export type { TableProps, Column }
```

## Business Components

### TicketLookup

Component for ticket number input and validation.

#### API Reference
```typescript
interface TicketLookupProps {
  onTicketFound: (ticket: TicketData) => void
  onError: (error: string) => void
  autoFocus?: boolean
  placeholder?: string
}
```

#### Usage Examples
```tsx
import { TicketLookup } from '@/components/business/TicketLookup'

<TicketLookup
  onTicketFound={handleTicketFound}
  onError={handleError}
  autoFocus
  placeholder="Enter ticket number (B/0725/1234)"
/>
```

#### Implementation
```tsx
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { useTicketLookup } from '@/hooks/api/useTicketLookup'
import { validateTicketNumber } from '@/utils/validation'

const TicketLookup: React.FC<TicketLookupProps> = ({
  onTicketFound,
  onError,
  autoFocus,
  placeholder = "Enter ticket number"
}) => {
  const [ticketNumber, setTicketNumber] = useState('')
  const [error, setError] = useState('')
  
  const { lookupTicket, isLoading } = useTicketLookup()

  const handleSubmit = async () => {
    // Validate format
    const validation = validateTicketNumber(ticketNumber)
    if (!validation.isValid) {
      setError(validation.error)
      onError(validation.error)
      return
    }

    try {
      const ticket = await lookupTicket(ticketNumber)
      setError('')
      onTicketFound(ticket)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ticket not found'
      setError(errorMessage)
      onError(errorMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Input
      label="Ticket Number"
      value={ticketNumber}
      onChange={setTicketNumber}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      error={error}
      helper="Press Enter to lookup ticket details"
      autoFocus={autoFocus}
      disabled={isLoading}
      required
    />
  )
}

export { TicketLookup }
export type { TicketLookupProps }
```

### PaymentForm

Form component for payment collection with validation.

#### API Reference
```typescript
interface PaymentFormProps {
  totalAmount: number
  onPaymentChange: (payment: PaymentData) => void
  currency?: string
}

interface PaymentData {
  cashAmount: number
  digitalAmount: number
  totalCollected: number
  referenceNo?: string
}
```

#### Usage Examples
```tsx
import { PaymentForm } from '@/components/business/PaymentForm'

<PaymentForm
  totalAmount={24.00}
  onPaymentChange={handlePaymentChange}
  currency="SGD"
/>
```

#### Implementation
```tsx
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/formatting'

const PaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  onPaymentChange,
  currency = 'SGD'
}) => {
  const [cashAmount, setCashAmount] = useState(0)
  const [digitalAmount, setDigitalAmount] = useState(0)
  const [referenceNo, setReferenceNo] = useState('')

  const totalCollected = cashAmount + digitalAmount
  const isValidPayment = totalCollected >= totalAmount

  useEffect(() => {
    onPaymentChange({
      cashAmount,
      digitalAmount,
      totalCollected,
      referenceNo: digitalAmount > 0 ? referenceNo : undefined
    })
  }, [cashAmount, digitalAmount, referenceNo, totalCollected, onPaymentChange])

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Cash Payment"
          type="number"
          value={cashAmount.toString()}
          onChange={(value) => setCashAmount(parseFloat(value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        
        <Input
          label="Digital Payment"
          type="number"
          value={digitalAmount.toString()}
          onChange={(value) => setDigitalAmount(parseFloat(value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Total Amount Due
          </label>
          <div className="text-2xl font-bold text-brand-red font-mono">
            {formatCurrency(totalAmount, currency)}
          </div>
        </div>
      </div>

      {digitalAmount > 0 && (
        <Input
          label="Reference Number"
          value={referenceNo}
          onChange={setReferenceNo}
          placeholder="Digital payment reference"
          helper="Required for digital payments"
        />
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Collected Amount:</span>
          <span className={clsx(
            'text-xl font-bold font-mono',
            isValidPayment ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(totalCollected, currency)}
          </span>
        </div>
        
        {!isValidPayment && totalCollected > 0 && (
          <p className="text-sm text-red-600 mt-1">
            Insufficient payment. Need {formatCurrency(totalAmount - totalCollected, currency)} more.
          </p>
        )}
      </div>
    </div>
  )
}

export { PaymentForm }
export type { PaymentFormProps, PaymentData }
```

### StatusBadge

Component for displaying status indicators with consistent styling.

#### API Reference
```typescript
interface StatusBadgeProps {
  status: 'active' | 'completed' | 'pending' | 'error' | 'redeemed' | 'expired'
  children?: React.ReactNode
  size?: 'small' | 'medium'
}
```

#### Usage Examples
```tsx
import { StatusBadge } from '@/components/business/StatusBadge'

<StatusBadge status="completed">Completed</StatusBadge>
<StatusBadge status="pending" size="small">Processing</StatusBadge>
<StatusBadge status="error">Failed</StatusBadge>
```

#### Implementation
```tsx
import { clsx } from 'clsx'

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  children, 
  size = 'medium' 
}) => {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' },
    redeemed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Redeemed' },
    expired: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Expired' }
  }

  const config = statusConfig[status]
  const displayText = children || config.label

  return (
    <span className={clsx(
      'inline-flex items-center font-semibold rounded-full',
      config.bg,
      config.text,
      {
        'px-2 py-1 text-xs': size === 'small',
        'px-3 py-1 text-sm': size === 'medium'
      }
    )}>
      {displayText}
    </span>
  )
}

export { StatusBadge }
export type { StatusBadgeProps }
```

## Layout Components

### AppLayout

Main application layout with sidebar navigation and header.

#### API Reference
```typescript
interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}
```

#### Usage Examples
```tsx
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'

<AppLayout
  title="Ticket Renewal"
  subtitle="Process single or multiple ticket renewals"
  actions={
    <Button variant="primary">Complete Transaction</Button>
  }
>
  <TransactionForm />
</AppLayout>
```

#### Implementation
```tsx
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} actions={actions} />
        
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
export type { AppLayoutProps }
```

## Form Components

### FormField

Wrapper component for consistent form field styling and behavior.

#### API Reference
```typescript
interface FormFieldProps {
  children: React.ReactNode
  label?: string
  required?: boolean
  error?: string
  helper?: string
  className?: string
}
```

#### Usage Examples
```tsx
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'

<FormField
  label="Customer NRIC"
  required
  error={errors.nric}
  helper="Singapore/Malaysia NRIC format"
>
  <Input
    value={nric}
    onChange={setNric}
    placeholder="S1234567A"
  />
</FormField>
```

## Utility Components

### LoadingSpinner

Consistent loading indicator component.

#### Usage Examples
```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

<LoadingSpinner size="large" text="Processing transaction..." />
```

### ErrorBoundary

Error boundary for graceful error handling.

#### Usage Examples
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <TransactionForm />
</ErrorBoundary>
```

## Testing Components

### Component Testing Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state correctly', () => {
    render(<Button loading>Processing...</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
```

## Storybook Integration

### Component Stories Example
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...'
  }
}
```

---

**Document Version:** 1.0  
**Created:** July 10, 2025  
**Component Lead:** 1CloudHub UI Team  
**Last Updated:** July 10, 2025
