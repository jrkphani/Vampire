import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/compat';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { validatePayment } from '@/utils/validation';
import {
  formatCurrency,
  calculateChange,
  isPaymentSufficient,
  generateTransactionRef,
} from '@/utils/business-helpers';
import type { PaymentData } from '@/types/business';

/**
 * Props for the PaymentForm component
 */
interface PaymentFormProps {
  /** The total amount due for the transaction */
  totalDue: number;
  /** Callback function called when payment data changes */
  onPaymentChange: (payment: PaymentData, isValid: boolean) => void;
  /** Optional callback function called when payment form is submitted */
  onSubmit?: (payment: PaymentData) => void;
  /** Whether the form is disabled (e.g., during processing) */
  disabled?: boolean;
  /** Whether the first input should be auto-focused */
  autoFocus?: boolean;
  /** Additional CSS classes to apply to the component */
  className?: string;
}

interface PaymentFormState {
  cashAmount: string;
  digitalAmount: string;
  referenceNo: string;
  isValid: boolean;
  errors: Record<string, string>;
  showDigitalPayment: boolean;
}

/**
 * PaymentForm - A comprehensive payment processing component for pawnshop transactions
 * 
 * This component handles all aspects of payment collection including:
 * - Cash payment entry with real-time validation
 * - Digital payment support (NETS, cards, transfers) with reference numbers
 * - Automatic change calculation for overpayments
 * - Split payment support (cash + digital)
 * - Real-time validation and error handling
 * - Currency formatting and business rule enforcement
 * 
 * Features:
 * - Auto-calculates sufficient payment amounts
 * - Validates minimum payment requirements
 * - Handles both single and dual payment methods
 * - Generates transaction references for digital payments
 * - Provides real-time feedback on payment validity
 * 
 * @param props - The component props
 * @returns JSX.Element - The rendered payment form component
 * 
 * @example
 * ```tsx
 * // Basic payment form for ticket renewal
 * <PaymentForm
 *   totalDue={125.50}
 *   onPaymentChange={(payment, isValid) => {
 *     setPaymentData(payment);
 *     setCanProceed(isValid);
 *   }}
 *   onSubmit={(payment) => {
 *     processPayment(payment);
 *   }}
 * />
 * 
 * // Disabled during transaction processing
 * <PaymentForm
 *   totalDue={totalAmount}
 *   onPaymentChange={handlePaymentChange}
 *   disabled={isProcessing}
 *   autoFocus={false}
 * />
 * ```
 */
export function PaymentForm({
  totalDue,
  onPaymentChange,
  onSubmit,
  disabled = false,
  autoFocus = true,
  className = '',
}: PaymentFormProps) {
  const [state, setState] = useState<PaymentFormState>({
    cashAmount: '',
    digitalAmount: '',
    referenceNo: '',
    isValid: false,
    errors: {},
    showDigitalPayment: false,
  });

  // Calculate derived values
  const cashAmountNum = parseFloat(state.cashAmount) || 0;
  const digitalAmountNum = parseFloat(state.digitalAmount) || 0;
  const totalCollected = cashAmountNum + digitalAmountNum;
  const changeAmount = calculateChange(totalCollected, totalDue);
  const isPaymentValid = isPaymentSufficient(
    {
      cashAmount: cashAmountNum,
      digitalAmount: digitalAmountNum,
      totalCollected,
      referenceNo: state.referenceNo,
    },
    totalDue
  );

  // Validate payment data whenever state changes
  useEffect(() => {
    const paymentData: PaymentData = {
      cashAmount: cashAmountNum,
      digitalAmount: digitalAmountNum,
      totalCollected,
      referenceNo: state.referenceNo || undefined,
    };

    const validationResult = validatePayment(paymentData);
    const isValid = validationResult.isValid && isPaymentValid;

    setState(prev => ({
      ...prev,
      isValid,
      errors: validationResult.errors || {},
    }));

    onPaymentChange(paymentData, isValid);
  }, [
    state.cashAmount,
    state.digitalAmount,
    state.referenceNo,
    totalDue,
    totalCollected,
    cashAmountNum,
    digitalAmountNum,
    isPaymentValid,
    onPaymentChange,
  ]);

  // Handle cash amount change
  const handleCashAmountChange = (value: string) => {
    // Only allow numeric input with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setState(prev => ({ ...prev, cashAmount: value }));
    }
  };

  // Handle digital amount change
  const handleDigitalAmountChange = (value: string) => {
    // Only allow numeric input with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setState(prev => ({ ...prev, digitalAmount: value }));
    }
  };

  // Handle reference number change
  const handleReferenceNoChange = (value: string) => {
    setState(prev => ({ ...prev, referenceNo: value.toUpperCase() }));
  };

  // Toggle digital payment section
  const toggleDigitalPayment = () => {
    setState(prev => ({
      ...prev,
      showDigitalPayment: !prev.showDigitalPayment,
      digitalAmount: prev.showDigitalPayment ? '' : prev.digitalAmount,
      referenceNo: prev.showDigitalPayment ? '' : prev.referenceNo,
    }));
  };

  // Auto-fill exact amount for cash payment
  const handleAutoFillCash = () => {
    const remainingAmount = Math.max(0, totalDue - digitalAmountNum);
    setState(prev => ({ ...prev, cashAmount: remainingAmount.toFixed(2) }));
  };

  // Auto-fill exact amount for digital payment
  const handleAutoFillDigital = () => {
    const remainingAmount = Math.max(0, totalDue - cashAmountNum);
    setState(prev => ({
      ...prev,
      digitalAmount: remainingAmount.toFixed(2),
      referenceNo: prev.referenceNo || generateTransactionRef(),
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.isValid && onSubmit) {
      const paymentData: PaymentData = {
        cashAmount: cashAmountNum,
        digitalAmount: digitalAmountNum,
        totalCollected,
        referenceNo: state.referenceNo || undefined,
      };
      onSubmit(paymentData);
    }
  };

  // Handle Enter key for quick submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state.isValid) {
      handleSubmit(e);
    }
  };

  return (
    <Card className={`space-y-6 ${className}`}>
      <div className='card-header'>
        <h3 className='card-title'>Payment Information</h3>
        <div className='mt-2 text-sm text-text-secondary'>
          Total Due:{' '}
          <span className='font-semibold text-brand-red'>
            {formatCurrency(totalDue)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Cash Payment */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='font-semibold text-text-primary'>Cash Payment</h4>
            <Button
              type='button'
              variant='tertiary'
              size='sm'
              onClick={handleAutoFillCash}
              disabled={disabled}
              className='text-xs'
            >
              Auto-fill (
              {formatCurrency(Math.max(0, totalDue - digitalAmountNum))})
            </Button>
          </div>

          <Input
            label='Cash Amount'
            value={state.cashAmount}
            onChange={handleCashAmountChange}
            onKeyDown={handleKeyDown}
            placeholder='0.00'
            error={state.errors.cashAmount}
            disabled={disabled}
            className='font-mono text-lg'
            autoFocus={autoFocus}
          />
        </div>

        {/* Digital Payment Toggle */}
        <div className='flex items-center justify-between py-2 border-t border-border-light'>
          <span className='text-sm font-medium text-text-primary'>
            Digital Payment
          </span>
          <Button
            type='button'
            variant='tertiary'
            size='sm'
            onClick={toggleDigitalPayment}
            disabled={disabled}
          >
            {state.showDigitalPayment ? 'Remove' : 'Add Digital Payment'}
          </Button>
        </div>

        {/* Digital Payment Section */}
        {state.showDigitalPayment && (
          <div className='space-y-4 animate-fade-in'>
            <div className='flex items-center justify-between'>
              <h4 className='font-semibold text-text-primary'>
                Digital Payment
              </h4>
              <Button
                type='button'
                variant='tertiary'
                size='sm'
                onClick={handleAutoFillDigital}
                disabled={disabled}
                className='text-xs'
              >
                Auto-fill (
                {formatCurrency(Math.max(0, totalDue - cashAmountNum))})
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Input
                label='Digital Amount'
                value={state.digitalAmount}
                onChange={handleDigitalAmountChange}
                onKeyDown={handleKeyDown}
                placeholder='0.00'
                error={state.errors.digitalAmount}
                disabled={disabled}
                className='font-mono text-lg'
              />

              <Input
                label='Reference Number'
                value={state.referenceNo}
                onChange={handleReferenceNoChange}
                onKeyDown={handleKeyDown}
                placeholder='REF123456'
                error={state.errors.referenceNo}
                disabled={disabled}
                className='font-mono'
                helper='Transaction reference for digital payment'
              />
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className='bg-background-surface rounded-lg p-4 space-y-3'>
          <h4 className='font-semibold text-text-primary'>Payment Summary</h4>

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-text-secondary'>Cash Amount:</span>
              <span className='monetary-value'>
                {formatCurrency(cashAmountNum)}
              </span>
            </div>

            {state.showDigitalPayment && (
              <div className='flex justify-between'>
                <span className='text-text-secondary'>Digital Amount:</span>
                <span className='monetary-value'>
                  {formatCurrency(digitalAmountNum)}
                </span>
              </div>
            )}

            <div className='flex justify-between border-t pt-2'>
              <span className='font-semibold'>Total Collected:</span>
              <span className='monetary-value font-semibold'>
                {formatCurrency(totalCollected)}
              </span>
            </div>

            <div className='flex justify-between'>
              <span className='font-semibold'>Amount Due:</span>
              <span className='monetary-value font-semibold'>
                {formatCurrency(totalDue)}
              </span>
            </div>

            {changeAmount > 0 && (
              <div className='flex justify-between text-brand-red'>
                <span className='font-semibold'>Change:</span>
                <span className='monetary-value font-semibold'>
                  {formatCurrency(changeAmount)}
                </span>
              </div>
            )}

            {totalCollected < totalDue && (
              <div className='flex justify-between text-error'>
                <span className='font-semibold'>Shortfall:</span>
                <span className='monetary-value font-semibold'>
                  {formatCurrency(totalDue - totalCollected)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Validation Status */}
        {totalCollected > 0 && (
          <div
            className={`p-3 rounded-lg text-sm ${
              isPaymentValid
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-error/10 text-error border border-error/20'
            }`}
          >
            <div className='flex items-center gap-2'>
              <div
                className={`w-2 h-2 rounded-full ${
                  isPaymentValid ? 'bg-success' : 'bg-error'
                }`}
              />
              <span className='font-medium'>
                {isPaymentValid
                  ? 'Payment amount is sufficient'
                  : 'Payment amount is insufficient'}
              </span>
            </div>
            {!isPaymentValid && (
              <div className='mt-1 text-xs'>
                Collected amount must be greater than or equal to the total due.
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {onSubmit && (
          <div className='flex justify-end pt-4 border-t border-border-light'>
            <Button
              type='submit'
              variant='primary'
              disabled={!state.isValid || disabled}
              className='px-8'
            >
              Process Payment
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}

export default PaymentForm;
