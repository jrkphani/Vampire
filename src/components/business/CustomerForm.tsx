import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/compat';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { validateCustomer, validateNRIC } from '@/utils/validation';
import {
  formatNRIC,
  formatPhoneNumber,
  formatPostalCode,
  sanitizeInput,
} from '@/utils/business-helpers';
import type { Customer, CustomerFormData } from '@/types/business';

/**
 * Props for the CustomerForm component
 */
interface CustomerFormProps {
  /** Existing customer data for editing (optional - when provided, form is in edit mode) */
  customer?: Customer;
  /** Callback function called when customer data is saved */
  onSave: (customer: CustomerFormData) => void;
  /** Optional callback function called when form is cancelled */
  onCancel?: () => void;
  /** Optional callback function called when an error occurs */
  onError?: (error: string) => void;
  /** Title to display in the form header */
  title?: string;
  /** Whether the form is disabled (e.g., during saving) */
  disabled?: boolean;
  /** Whether the first input should be auto-focused */
  autoFocus?: boolean;
  /** Additional CSS classes to apply to the component */
  className?: string;
}

interface CustomerFormState {
  nric: string;
  name: string;
  dob: string;
  gender: 'M' | 'F';
  nationality: string;
  race: string;
  address: string;
  postalCode: string;
  unit: string;
  contact: string;
  email: string;
  notes: string;
  isLoading: boolean;
  errors: Record<string, string>;
  isValid: boolean;
}

/**
 * CustomerForm - A comprehensive form component for creating and editing customer records
 * 
 * This component provides a complete customer data management interface with:
 * - NRIC validation and formatting for Singapore identification numbers
 * - Comprehensive personal data collection (name, DOB, gender, nationality, race)
 * - Address management with postal code validation
 * - Contact information handling (phone, email)
 * - Real-time validation with immediate feedback
 * - Auto-formatting for phone numbers and postal codes
 * - Duplicate customer detection based on NRIC
 * - Accessibility support with proper keyboard navigation
 * 
 * The form supports both create and edit modes, automatically populating
 * fields when an existing customer is provided. All data is validated
 * against Singapore standards and business rules.
 * 
 * @param props - The component props
 * @returns JSX.Element - The rendered customer form component
 * 
 * @example
 * ```tsx
 * // Creating a new customer
 * <CustomerForm
 *   onSave={(customerData) => {
 *     createCustomer(customerData);
 *   }}
 *   onCancel={() => {
 *     setShowForm(false);
 *   }}
 *   onError={(error) => {
 *     toast.error(error);
 *   }}
 * />
 * 
 * // Editing existing customer
 * <CustomerForm
 *   customer={existingCustomer}
 *   title="Edit Customer Details"
 *   onSave={(customerData) => {
 *     updateCustomer(existingCustomer.id, customerData);
 *   }}
 *   disabled={isSaving}
 * />
 * ```
 */
export function CustomerForm({
  customer,
  onSave,
  onCancel,
  onError,
  title = customer ? 'Edit Customer' : 'New Customer',
  disabled = false,
  autoFocus = true,
  className = '',
}: CustomerFormProps) {
  const [state, setState] = useState<CustomerFormState>({
    nric: customer?.nric || '',
    name: customer?.name || '',
    dob: customer?.dob || '',
    gender: customer?.gender || 'M',
    nationality: customer?.nationality || 'Singapore',
    race: customer?.race || '',
    address: customer?.address || '',
    postalCode: customer?.postalCode || '',
    unit: customer?.unit || '',
    contact: customer?.contact || '',
    email: customer?.email || '',
    notes: customer?.notes || '',
    isLoading: false,
    errors: {},
    isValid: false,
  });

  const nricRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && nricRef.current) {
      nricRef.current.focus();
    }
  }, [autoFocus]);

  // Validate form whenever state changes
  useEffect(() => {
    const customerData: CustomerFormData = {
      nric: state.nric,
      name: state.name,
      dob: state.dob,
      gender: state.gender,
      nationality: state.nationality,
      race: state.race,
      address: state.address,
      postalCode: state.postalCode,
      unit: state.unit || undefined,
      contact: state.contact,
      email: state.email || undefined,
      notes: state.notes || undefined,
    };

    const validationResult = validateCustomer(customerData);

    setState(prev => ({
      ...prev,
      isValid: validationResult.isValid,
      errors: validationResult.errors || {},
    }));
  }, [
    state.nric,
    state.name,
    state.dob,
    state.gender,
    state.nationality,
    state.race,
    state.address,
    state.postalCode,
    state.unit,
    state.contact,
    state.email,
    state.notes,
  ]);

  // Handle NRIC change with formatting
  const handleNRICChange = (value: string) => {
    const formatted = formatNRIC(value);
    setState(prev => ({ ...prev, nric: formatted }));
  };

  // Handle name change with sanitization
  const handleNameChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setState(prev => ({ ...prev, name: sanitized }));
  };

  // Handle DOB change with formatting (DDMMYY)
  const handleDOBChange = (value: string) => {
    // Only allow numeric input, max 6 digits
    if (value === '' || /^\d{0,6}$/.test(value)) {
      setState(prev => ({ ...prev, dob: value }));
    }
  };

  // Handle gender change
  const handleGenderChange = (value: string) => {
    if (value === 'M' || value === 'F') {
      setState(prev => ({ ...prev, gender: value }));
    }
  };

  // Handle nationality change
  const handleNationalityChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setState(prev => ({ ...prev, nationality: sanitized }));
  };

  // Handle race change
  const handleRaceChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setState(prev => ({ ...prev, race: sanitized }));
  };

  // Handle address change
  const handleAddressChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setState(prev => ({ ...prev, address: sanitized }));
  };

  // Handle postal code change with formatting
  const handlePostalCodeChange = (value: string) => {
    const formatted = formatPostalCode(value);
    setState(prev => ({ ...prev, postalCode: formatted }));
  };

  // Handle unit change
  const handleUnitChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setState(prev => ({ ...prev, unit: sanitized }));
  };

  // Handle contact change with formatting
  const handleContactChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setState(prev => ({ ...prev, contact: formatted }));
  };

  // Handle email change
  const handleEmailChange = (value: string) => {
    setState(prev => ({ ...prev, email: value.toLowerCase() }));
  };

  // Handle notes change
  const handleNotesChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setState(prev => ({ ...prev, notes: sanitized }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.isValid) {
      onError?.('Please fix the validation errors before submitting');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const customerData: CustomerFormData = {
        nric: state.nric,
        name: state.name,
        dob: state.dob,
        gender: state.gender,
        nationality: state.nationality,
        race: state.race,
        address: state.address,
        postalCode: state.postalCode,
        unit: state.unit || undefined,
        contact: state.contact,
        email: state.email || undefined,
        notes: state.notes || undefined,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSave(customerData);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save customer';
      setState(prev => ({ ...prev, isLoading: false }));
      onError?.(errorMessage);
    }
  };

  // Handle NRIC lookup for existing customers
  const handleNRICLookup = async () => {
    if (!state.nric) return;

    const validation = validateNRIC(state.nric);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, nric: validation.error || 'Invalid NRIC' },
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Mock API call to lookup existing customer
      const existingCustomer = await mockCustomerLookup(state.nric);

      if (existingCustomer) {
        // Pre-fill form with existing customer data
        setState(prev => ({
          ...prev,
          name: existingCustomer.name,
          dob: existingCustomer.dob,
          gender: existingCustomer.gender,
          nationality: existingCustomer.nationality,
          race: existingCustomer.race,
          address: existingCustomer.address,
          postalCode: existingCustomer.postalCode,
          unit: existingCustomer.unit || '',
          contact: existingCustomer.contact,
          email: existingCustomer.email || '',
          notes: existingCustomer.notes || '',
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      onError?.(
        error instanceof Error ? error.message : 'Failed to lookup customer'
      );
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <Card className={`space-y-6 ${className}`}>
      <div className='card-header'>
        <h3 className='card-title'>{title}</h3>
        <p className='text-body-small text-text-secondary mt-1'>
          {customer
            ? 'Update customer information'
            : 'Enter customer information'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* NRIC with lookup */}
        <div className='space-y-2'>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Input
                ref={nricRef}
                label='NRIC'
                value={state.nric}
                onChange={handleNRICChange}
                onKeyDown={handleKeyDown}
                placeholder='S1234567A'
                error={state.errors.nric}
                disabled={disabled || state.isLoading}
                className='font-mono text-h3'
                maxLength={9}
                required
              />
            </div>
            <div className='flex items-end'>
              <Button
                type='button'
                variant='secondary'
                onClick={handleNRICLookup}
                disabled={!state.nric || state.isLoading}
                className='whitespace-nowrap'
              >
                {state.isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  'Lookup'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className='space-y-4'>
          <h4 className='font-semibold text-text-primary'>
            Personal Information
          </h4>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Full Name'
              value={state.name}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              placeholder='John Doe'
              error={state.errors.name}
              disabled={disabled || state.isLoading}
              required
            />

            <Input
              label='Date of Birth'
              value={state.dob}
              onChange={handleDOBChange}
              onKeyDown={handleKeyDown}
              placeholder='150190 (DDMMYY)'
              error={state.errors.dob}
              disabled={disabled || state.isLoading}
              className='font-mono'
              helper='Format: DDMMYY (e.g., 150190 for 15 Jan 1990)'
              required
            />

            <div>
              <label className='form-label required'>Gender</label>
              <div className='flex gap-4 mt-2'>
                <label className='flex items-center gap-2'>
                  <input
                    type='radio'
                    value='M'
                    checked={state.gender === 'M'}
                    onChange={e => handleGenderChange(e.target.value)}
                    disabled={disabled || state.isLoading}
                    className='focus-ring'
                  />
                  <span>Male</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='radio'
                    value='F'
                    checked={state.gender === 'F'}
                    onChange={e => handleGenderChange(e.target.value)}
                    disabled={disabled || state.isLoading}
                    className='focus-ring'
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <Input
              label='Nationality'
              value={state.nationality}
              onChange={handleNationalityChange}
              onKeyDown={handleKeyDown}
              placeholder='Singapore'
              error={state.errors.nationality}
              disabled={disabled || state.isLoading}
              required
            />

            <Input
              label='Race'
              value={state.race}
              onChange={handleRaceChange}
              onKeyDown={handleKeyDown}
              placeholder='Chinese'
              error={state.errors.race}
              disabled={disabled || state.isLoading}
              required
            />
          </div>
        </div>

        {/* Address Information */}
        <div className='space-y-4'>
          <h4 className='font-semibold text-text-primary'>
            Address Information
          </h4>

          <div className='space-y-4'>
            <Input
              label='Address'
              value={state.address}
              onChange={handleAddressChange}
              onKeyDown={handleKeyDown}
              placeholder='123 Main Street'
              error={state.errors.address}
              disabled={disabled || state.isLoading}
              required
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Input
                label='Postal Code'
                value={state.postalCode}
                onChange={handlePostalCodeChange}
                onKeyDown={handleKeyDown}
                placeholder='123456'
                error={state.errors.postalCode}
                disabled={disabled || state.isLoading}
                className='font-mono'
                maxLength={6}
                required
              />

              <Input
                label='Unit'
                value={state.unit}
                onChange={handleUnitChange}
                onKeyDown={handleKeyDown}
                placeholder='#12-34 (optional)'
                error={state.errors.unit}
                disabled={disabled || state.isLoading}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className='space-y-4'>
          <h4 className='font-semibold text-text-primary'>
            Contact Information
          </h4>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label='Mobile Number'
              value={state.contact}
              onChange={handleContactChange}
              onKeyDown={handleKeyDown}
              placeholder='91234567'
              error={state.errors.contact}
              disabled={disabled || state.isLoading}
              className='font-mono'
              maxLength={8}
              required
            />

            <Input
              label='Email'
              type='email'
              value={state.email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDown}
              placeholder='john@example.com (optional)'
              error={state.errors.email}
              disabled={disabled || state.isLoading}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className='form-label'>Notes</label>
          <textarea
            value={state.notes}
            onChange={e => handleNotesChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Additional notes or comments (optional)'
            disabled={disabled || state.isLoading}
            className='input-field resize-vertical'
            style={{ minHeight: 'var(--space-25)' }}
            maxLength={500}
          />
          {state.errors.notes && (
            <p className='mt-1 text-body-small text-error'>{state.errors.notes}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className='flex gap-3 pt-4 border-t border-border-light'>
          <Button
            type='submit'
            variant='primary'
            disabled={!state.isValid || disabled || state.isLoading}
            className='flex-1'
          >
            {state.isLoading ? (
              <LoadingSpinner size='sm' className='mr-2' />
            ) : null}
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>

          {onCancel && (
            <Button
              type='button'
              variant='secondary'
              onClick={onCancel}
              disabled={state.isLoading}
              className='flex-1'
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

// Mock API function for customer lookup
async function mockCustomerLookup(nric: string): Promise<Customer | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock customer database
  const mockCustomers: Record<string, Customer> = {
    S1234567A: {
      id: 'cust-001',
      nric: 'S1234567A',
      name: 'John Doe',
      dob: '150190',
      gender: 'M',
      nationality: 'Singapore',
      race: 'Chinese',
      address: '123 Main Street',
      postalCode: '123456',
      unit: '#12-34',
      contact: '91234567',
      email: 'john@example.com',
      notes: 'Regular customer',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  };

  return mockCustomers[nric] || null;
}

export default CustomerForm;
