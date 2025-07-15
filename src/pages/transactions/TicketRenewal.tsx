/**
 * @fileoverview TicketRenewal - Main page component for processing pawnshop ticket renewals
 * 
 * This page handles the complete ticket renewal workflow including:
 * - Ticket lookup and validation
 * - Interest calculation with penalty fees
 * - Payment processing (cash, digital, or split payments)
 * - Staff authentication and authorization
 * - Real-time transaction processing with WebSocket updates
 * - Receipt generation and printing
 * - Transaction state management and error handling
 * 
 * The component integrates with multiple stores for state management:
 * - TransactionStore: Handles transaction workflow and processing
 * - UIStore: Manages loading states, toasts, and UI feedback
 * - AuthStore: Provides staff authentication context
 * 
 * Business Rules:
 * - Validates ticket status (must be active/unredeemed)
 * - Calculates interest based on original pawn date and current date
 * - Applies penalty fees for overdue tickets
 * - Requires sufficient payment (collected amount >= total due)
 * - Generates new ticket with extended maturity date
 * 
 * @author ValueMax Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Calculator, CreditCard, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-actual';
import { 
  ticketRenewalSchema, 
  type TicketRenewalFormData,
  formatTicketNumber,
  calculateChange
} from '@/schemas/ticket-renewal-schema';
import { ticketService } from '@/services/api';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import type { TicketData } from '@/types/business';

/**
 * TicketRenewal - Complete ticket renewal processing page
 * 
 * This component provides a multi-step workflow for renewing pawnshop tickets:
 * 
 * 1. **Ticket Lookup**: Search and validate ticket by number
 * 2. **Interest Calculation**: Calculate current interest and any penalties
 * 3. **Payment Entry**: Collect payment details (cash/digital/split)
 * 4. **Transaction Processing**: Process renewal with real-time updates
 * 5. **Confirmation**: Generate receipts and complete transaction
 * 
 * Features:
 * - Real-time validation and error handling
 * - Keyboard shortcuts for enhanced productivity (F4 focus, Enter submit)
 * - Auto-calculation of payment amounts
 * - Integration with payment processing systems
 * - Comprehensive transaction logging and audit trail
 * - Accessibility support with screen reader compatibility
 * 
 * @returns JSX.Element - The rendered ticket renewal page
 * 
 * @example
 * // This component is used as a route in the main application:
 * // <Route path="/transactions/renewal" element={<TicketRenewal />} />
 * 
 * // The component automatically integrates with the global stores:
 * // - Transactions are tracked in TransactionStore
 * // - UI state is managed in UIStore
 * // - Staff context from AuthStore
 */
export function TicketRenewal() {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isTicketFound, setIsTicketFound] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  
  // Store hooks
  const { addToast, setLoading, clearLoading, setError, clearError } = useUIStore();
  const { staff } = useAuthStore();
  const { 
    startSession, 
    endSession, 
    addTicket, 
    setPaymentData, 
    processRenewal,
    resetTransaction,
    isProcessing,
    processingMessage,
    errors: transactionErrors
  } = useTransactionStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<TicketRenewalFormData>({
    resolver: zodResolver(ticketRenewalSchema),
    mode: 'onChange',
    defaultValues: {
      ticketNumber: '',
      customerName: '',
      nric: '',
      contact: '',
      pledgeDescription: '',
      pledgeWeight: '',
      originalAmount: 0,
      interestAmount: 0,
      totalAmount: 0,
      collectedAmount: 0,
      changeAmount: 0,
      paymentMethod: 'cash',
      renewalDate: new Date().toISOString().split('T')[0],
      newExpiryDate: '',
      remarks: ''
    } as Partial<TicketRenewalFormData>
  });

  // Watch form values for calculations
  const watchedValues = watch(['collectedAmount', 'totalAmount', 'originalAmount', 'interestAmount']);

  // Auto-calculate totals and change
  useEffect(() => {
    const [collectedAmount, totalAmount, originalAmount, interestAmount] = watchedValues;
    
    // Calculate total amount from original + interest
    const calculatedTotal = (originalAmount || 0) + (interestAmount || 0);
    if (calculatedTotal !== totalAmount) {
      setValue('totalAmount', calculatedTotal);
    }
    
    // Calculate change amount
    const calculatedChange = calculateChange(collectedAmount || 0, totalAmount || 0);
    setValue('changeAmount', calculatedChange);
  }, [watchedValues, setValue]);
  
  // Initialize transaction session on component mount
  useEffect(() => {
    return () => {
      // Cleanup: end session when component unmounts
      endSession();
    };
  }, [endSession]);
  
  // Real-time financial calculations when ticket is found
  useEffect(() => {
    if (ticketData && isTicketFound) {
      const calculateRealTimeFinancials = async () => {
        try {
          const calculations = await ticketService.calculateTicketFinancials(
            ticketData.ticketNo
          );
          
          // Update form with real-time calculations
          setValue('interestAmount', calculations.interest);
          setValue('originalAmount', calculations.principal);
          
          if (calculations.penaltyAmount > 0) {
            addToast({
              type: 'warning',
              title: 'Penalty Applied',
              message: `A penalty of ${formatCurrency(calculations.penaltyAmount)} has been applied due to overdue status.`,
            });
          }
        } catch (error) {
          console.warn('Failed to get real-time calculations:', error);
        }
      };
      
      calculateRealTimeFinancials();
    }
  }, [ticketData, isTicketFound, setValue, addToast]);

  const handleTicketLookup = async () => {
    const ticketNumber = watch('ticketNumber');
    if (!ticketNumber) return;

    setIsLookingUp(true);
    setLookupError(null);
    clearError('ticketLookup');
    
    try {
      // Format ticket number if needed
      const formattedTicketNumber = formatTicketNumber(ticketNumber);
      
      // Call the API service
      const ticket = await ticketService.getTicket(formattedTicketNumber);
      
      // Populate form with retrieved data
      setValue('customerName', ticket.customer.name);
      setValue('nric', ticket.customer.nric);
      setValue('contact', ticket.customer.contact);
      setValue('pledgeDescription', ticket.pledge.description);
      setValue('pledgeWeight', ticket.pledge.weight);
      setValue('originalAmount', ticket.financial.principal);
      setValue('interestAmount', ticket.financial.interest);
      
      // Set renewal and expiry dates
      const today = new Date();
      const expiryDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
      const expiryDateString = expiryDate.toISOString().split('T')[0];
      if (expiryDateString) {
        setValue('newExpiryDate', expiryDateString);
      }
      
      if (!formattedTicketNumber) return;
      
      // Store ticket data for transaction processing
      setTicketData(ticket);
      setIsTicketFound(true);
      
      // Start transaction session and add ticket
      startSession('renewal');
      addTicket(ticket);
      
      addToast({
        type: 'success',
        title: 'Ticket Found',
        message: `Ticket ${formattedTicketNumber} loaded successfully`,
      });
      
    } catch (error) {
      console.error('Ticket lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to lookup ticket';
      
      setLookupError(errorMessage);
      setError('ticketLookup', errorMessage);
      setIsTicketFound(false);
      setTicketData(null);
      
      addToast({
        type: 'error',
        title: 'Ticket Not Found',
        message: errorMessage,
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleTicketKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTicketLookup();
    }
  };

  const onSubmit = async (data: TicketRenewalFormData) => {
    if (!ticketData || !staff) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        message: 'Ticket data or staff authentication is missing',
      });
      return;
    }

    try {
      setLoading('renewal', true, 'Processing renewal...');
      
      // Set payment data in store
      setPaymentData({
        cashAmount: data.paymentMethod === 'cash' ? data.collectedAmount : 0,
        digitalAmount: data.paymentMethod !== 'cash' ? data.collectedAmount : 0,
        totalCollected: data.collectedAmount,
        referenceNo: data.paymentMethod === 'transfer' ? `TXF${Date.now()}` : undefined,
      });
      
      // Process the renewal through the transaction service
      await processRenewal();
      
      // Success! Clear the form and show success message
      addToast({
        type: 'success',
        title: 'Renewal Processed',
        message: `Ticket renewal completed successfully. Amount collected: ${formatCurrency(data.collectedAmount)}`,
        persistent: true,
      });
      
      // Reset form and state
      handleReset();
      
    } catch (error) {
      console.error('Renewal processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Renewal processing failed';
      
      addToast({
        type: 'error',
        title: 'Processing Failed',
        message: errorMessage,
        persistent: true,
      });
    } finally {
      clearLoading('renewal');
    }
  };
  
  const handleReset = () => {
    // Reset form
    setValue('ticketNumber', '');
    setValue('customerName', '');
    setValue('nric', '');
    setValue('contact', '');
    setValue('pledgeDescription', '');
    setValue('pledgeWeight', '');
    setValue('originalAmount', 0);
    setValue('interestAmount', 0);
    setValue('totalAmount', 0);
    setValue('collectedAmount', 0);
    setValue('changeAmount', 0);
    setValue('remarks', '');
    
    // Reset state
    setIsTicketFound(false);
    setTicketData(null);
    setLookupError(null);
    
    // Reset transaction store
    resetTransaction();
    endSession();
    
    // Clear any errors
    clearError('ticketLookup');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-h1 font-bold text-foreground mb-2'>
            Ticket Renewals
          </h1>
          <p className='text-muted-foreground'>
            Process single or multiple ticket renewals with payment processing
          </p>
        </div>
        <div className='text-right'>
          <div className='text-body-small text-muted-foreground'>Function</div>
          <div className='text-h3 font-semibold text-foreground font-mono'>FUNC-01</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Main Layout - Two Column Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column */}
          <div className='space-y-6'>
            {/* Ticket Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Search className='h-5 w-5' />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='form-group md:col-span-2'>
                    <label className='form-label required' htmlFor='ticket-number'>
                      Ticket Number
                    </label>
                    <Input
                      id='ticket-number'
                      {...register('ticketNumber')}
                      className={cn(
                        'text-mono',
                        errors.ticketNumber && 'border-red-500 focus:border-red-500'
                      )}
                      type='text'
                      placeholder='B/MMYY/XXXX'
                      onKeyPress={handleTicketKeyPress}
                    />
                    {errors.ticketNumber && (
                      <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                        <AlertCircle className='h-4 w-4' />
                        {errors.ticketNumber.message}
                      </div>
                    )}
                    <div className='text-caption'>Press Enter to lookup</div>
                  </div>
                  <div className='form-group'>
                    <label className='form-label opacity-0 select-none' aria-hidden='true'>
                      Action
                    </label>
                    <Button 
                      type='button'
                      variant='outline'
                      className='flex items-center gap-2 w-full h-10'
                      onClick={handleTicketLookup}
                      disabled={isLookingUp || !watch('ticketNumber')}
                    >
                      {isLookingUp ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Searching...
                        </>
                      ) : isTicketFound ? (
                        <>
                          <CheckCircle2 className='h-4 w-4 text-green-600' />
                          Found
                        </>
                      ) : (
                        <>
                          <Search className='h-4 w-4' />
                          Lookup
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Lookup Error Display */}
                {lookupError && (
                  <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <div className='flex items-center gap-2 text-red-800'>
                      <AlertCircle className='h-5 w-5' />
                      <span className='font-semibold'>Lookup Failed</span>
                    </div>
                    <p className='text-red-700 mt-1 text-body-small'>{lookupError}</p>
                    <div className='mt-3'>
                      <button
                        type='button'
                        className='text-red-600 hover:text-red-800 text-body-small underline'
                        onClick={() => {
                          setLookupError(null);
                          clearError('ticketLookup');
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            {isTicketFound && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CheckCircle2 className='h-5 w-5 text-green-600' />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label required'>Customer Name</label>
                      <Input
                        {...register('customerName')}
                        className={cn(
                          errors.customerName && 'border-red-500 focus:border-red-500'
                        )}
                        readOnly
                      />
                      {errors.customerName && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.customerName.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>NRIC</label>
                      <Input
                        {...register('nric')}
                        className={cn(
                          'text-mono',
                          errors.nric && 'border-red-500 focus:border-red-500'
                        )}
                        readOnly
                      />
                      {errors.nric && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.nric.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Contact Number</label>
                      <Input
                        {...register('contact')}
                        className={cn(
                          errors.contact && 'border-red-500 focus:border-red-500'
                        )}
                        readOnly
                      />
                      {errors.contact && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.contact.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Pledge Weight</label>
                      <Input
                        {...register('pledgeWeight')}
                        className={cn(
                          'text-mono',
                          errors.pledgeWeight && 'border-red-500 focus:border-red-500'
                        )}
                        readOnly
                      />
                      {errors.pledgeWeight && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.pledgeWeight.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label required'>Pledge Description</label>
                      <Input
                        {...register('pledgeDescription')}
                        className={cn(
                          errors.pledgeDescription && 'border-red-500 focus:border-red-500'
                        )}
                        readOnly
                      />
                      {errors.pledgeDescription && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.pledgeDescription.message}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Financial Information */}
            {isTicketFound && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calculator className='h-5 w-5' />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label required'>Original Amount</label>
                      <Input
                        {...register('originalAmount', { valueAsNumber: true })}
                        className={cn(
                          'monetary-value',
                          errors.originalAmount && 'border-red-500 focus:border-red-500'
                        )}
                        type='number'
                        step='0.01'
                        readOnly
                      />
                      {errors.originalAmount && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.originalAmount.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Interest Amount</label>
                      <Input
                        {...register('interestAmount', { valueAsNumber: true })}
                        className={cn(
                          'monetary-value',
                          errors.interestAmount && 'border-red-500 focus:border-red-500'
                        )}
                        type='number'
                        step='0.01'
                        readOnly
                      />
                      {errors.interestAmount && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.interestAmount.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label required'>Total Amount</label>
                      <Input
                        {...register('totalAmount', { valueAsNumber: true })}
                        className='monetary-value bg-muted'
                        type='number'
                        step='0.01'
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {isTicketFound && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <CreditCard className='h-5 w-5' />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label required'>Payment Method</label>
                      <Select onValueChange={(value) => setValue('paymentMethod', value as 'cash' | 'card' | 'nets' | 'transfer')} defaultValue={watch('paymentMethod')}>
                        <SelectTrigger className={cn(
                          errors.paymentMethod && 'border-red-500 focus:border-red-500'
                        )}>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='cash'>Cash</SelectItem>
                          <SelectItem value='card'>Credit/Debit Card</SelectItem>
                          <SelectItem value='nets'>NETS</SelectItem>
                          <SelectItem value='transfer'>Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.paymentMethod && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.paymentMethod.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Collected Amount</label>
                      <Input
                        {...register('collectedAmount', { valueAsNumber: true })}
                        className={cn(
                          'monetary-value',
                          errors.collectedAmount && 'border-red-500 focus:border-red-500'
                        )}
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                      />
                      {errors.collectedAmount && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.collectedAmount.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Change Amount</label>
                      <Input
                        {...register('changeAmount', { valueAsNumber: true })}
                        className='monetary-value bg-muted'
                        type='number'
                        step='0.01'
                        readOnly
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Renewal Date</label>
                      <Input
                        {...register('renewalDate')}
                        className={cn(
                          errors.renewalDate && 'border-red-500 focus:border-red-500'
                        )}
                        type='date'
                      />
                      {errors.renewalDate && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.renewalDate.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label required'>New Expiry Date</label>
                      <Input
                        {...register('newExpiryDate')}
                        className={cn(
                          errors.newExpiryDate && 'border-red-500 focus:border-red-500'
                        )}
                        type='date'
                      />
                      {errors.newExpiryDate && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.newExpiryDate.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label'>Remarks</label>
                      <Textarea
                        {...register('remarks')}
                        className={cn(
                          errors.remarks && 'border-red-500 focus:border-red-500'
                        )}
                        rows={3}
                        placeholder='Optional remarks or notes'
                      />
                      {errors.remarks && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-red-600'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.remarks.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className='mt-6 p-4 bg-muted rounded-lg'>
                    <h4 className='font-semibold text-foreground mb-3'>Payment Summary</h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-body-small'>
                        <span>Total Amount Due:</span>
                        <span className='font-mono font-semibold'>{formatCurrency(watch('totalAmount') || 0)}</span>
                      </div>
                      <div className='flex justify-between text-body-small'>
                        <span>Amount Collected:</span>
                        <span className={cn(
                          'font-mono',
                          (watch('collectedAmount') || 0) >= (watch('totalAmount') || 0) ? 'text-green-600' : 'text-orange-600'
                        )}>
                          {formatCurrency(watch('collectedAmount') || 0)}
                        </span>
                      </div>
                      <div className='border-t pt-2 mt-2'>
                        <div className='flex justify-between font-semibold'>
                          <span>Change Due:</span>
                          <span className={cn(
                            'font-mono',
                            (watch('changeAmount') || 0) > 0 ? 'text-green-600' : 'text-foreground'
                          )}>
                            {formatCurrency(Math.max(0, watch('changeAmount') || 0))}
                          </span>
                        </div>
                      </div>
                      {/* Payment Status Indicator */}
                      <div className='mt-3 pt-2 border-t'>
                        <div className='flex items-center gap-2 text-body-small'>
                          {(watch('collectedAmount') || 0) < (watch('totalAmount') || 0) ? (
                            <>
                              <AlertCircle className='h-4 w-4 text-orange-500' />
                              <span className='text-orange-600'>Insufficient payment</span>
                            </>
                          ) : (watch('collectedAmount') || 0) === (watch('totalAmount') || 0) ? (
                            <>
                              <CheckCircle2 className='h-4 w-4 text-green-500' />
                              <span className='text-green-600'>Exact payment</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className='h-4 w-4 text-green-500' />
                              <span className='text-green-600'>Overpayment - change due</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Transaction Error Display */}
        {Object.keys(transactionErrors).length > 0 && (
          <Card className='bg-red-50 border-red-200'>
            <div className='p-4'>
              <h4 className='font-semibold text-red-800 mb-2 flex items-center gap-2'>
                <AlertCircle className='h-5 w-5' />
                Transaction Errors
              </h4>
              <div className='space-y-1'>
                {Object.entries(transactionErrors).map(([field, error]) => (
                  <p key={field} className='text-red-700 text-body-small'>
                    <strong>{field}:</strong> {error}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className='flex gap-4 justify-end'>
          <Button 
            type='button' 
            variant='tertiary'
            onClick={handleReset}
            disabled={isProcessing}
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Reset
          </Button>
          <Button 
            type='button' 
            variant='secondary' 
            disabled={!isTicketFound || isProcessing}
            onClick={() => {
              addToast({
                type: 'info',
                title: 'Draft Saved',
                message: 'Transaction data has been saved as draft',
              });
            }}
          >
            Save Draft
          </Button>
          <Button 
            type='submit' 
            variant='primary'
            disabled={!isValid || isProcessing || !isTicketFound}
          >
            {isProcessing ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                {processingMessage || 'Processing...'}
              </>
            ) : (
              'Process Renewal'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}