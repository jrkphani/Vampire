import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, User, CreditCard, Shield, CheckCircle2, AlertCircle, Loader2, RefreshCw, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-actual';
import { 
  ticketRedemptionSchema, 
  type TicketRedemptionFormData,
  formatTicketNumber
} from '@/schemas/ticket-redemption-schema';
import { ticketService } from '@/services/api';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import type { TicketData } from '@/types/business';

export function TicketRedemption() {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isTicketFound, setIsTicketFound] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isDifferentRedeemer, setIsDifferentRedeemer] = useState(false);
  const [requiresDualAuth, setRequiresDualAuth] = useState(false);
  
  // Store hooks
  const { addToast, setLoading, clearLoading, setError, clearError } = useUIStore();
  const { staff } = useAuthStore();
  const { 
    startSession, 
    endSession, 
    addTicket, 
    setPaymentData, 
    processRedemption,
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
  } = useForm<TicketRedemptionFormData>({
    resolver: zodResolver(ticketRedemptionSchema),
    mode: 'onChange',
    defaultValues: {
      ticketNumber: '',
      customerName: '',
      customerNric: '',
      customerContact: '',
      pledgeDescription: '',
      pledgeWeight: '',
      principal: 0,
      interest: 0,
      totalAmount: 0,
      redeemerName: '',
      redeemerNric: '',
      redeemerContact: '',
      relationshipToCustomer: 'self',
      idVerificationMethod: 'nric',
      idNumber: '',
      isDifferentRedeemer: false,
      paymentAmount: 0,
      staffCode: '',
      redemptionDate: new Date().toISOString().split('T')[0],
      termsAccepted: false
    } as Partial<TicketRedemptionFormData>
  });

  // Watch form values for calculations and validations
  const watchedValues = watch(['redeemerNric', 'customerNric', 'totalAmount', 'paymentAmount']);

  // Check if redeemer is different from customer
  useEffect(() => {
    const [redeemerNric, customerNric] = watchedValues;
    const isDifferent = Boolean(
      typeof redeemerNric === 'string' && redeemerNric.length > 0 && 
      typeof customerNric === 'string' && customerNric.length > 0 && 
      redeemerNric !== customerNric
    );
    setIsDifferentRedeemer(isDifferent);
    setValue('isDifferentRedeemer', isDifferent);
    
    // Dual auth is required for different redeemer
    setRequiresDualAuth(isDifferent);
  }, [watchedValues, setValue]);

  // Auto-set payment amount to total amount
  useEffect(() => {
    const [, , totalAmount] = watchedValues;
    if (totalAmount > 0) {
      setValue('paymentAmount', totalAmount);
    }
  }, [watchedValues, setValue]);

  // Initialize transaction session on component mount
  useEffect(() => {
    return () => {
      // Cleanup: end session when component unmounts
      endSession();
    };
  }, [endSession]);

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
      
      // Check if ticket is available for redemption
      if (ticket.status !== 'U') {
        throw new Error(`Ticket ${formattedTicketNumber} is not available for redemption (Status: ${ticket.status})`);
      }
      
      // Populate form with retrieved data
      setValue('customerName', ticket.customer.name);
      setValue('customerNric', ticket.customer.nric);
      setValue('customerContact', ticket.customer.contact);
      setValue('pledgeDescription', ticket.pledge.description);
      setValue('pledgeWeight', ticket.pledge.weight);
      setValue('principal', ticket.financial.principal);
      setValue('interest', ticket.financial.interest);
      setValue('totalAmount', ticket.financial.principal + ticket.financial.interest);
      
      // Initialize redeemer as customer (can be changed)
      setValue('redeemerName', ticket.customer.name);
      setValue('redeemerNric', ticket.customer.nric);
      setValue('redeemerContact', ticket.customer.contact);
      setValue('idNumber', ticket.customer.nric);
      
      // Store ticket data for transaction processing
      setTicketData(ticket);
      setIsTicketFound(true);
      
      // Start transaction session and add ticket
      startSession('redemption');
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
      e.preventDefault();
      handleTicketLookup();
    }
  };

  const onSubmit = async (data: TicketRedemptionFormData) => {
    if (!ticketData || !staff) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        message: 'Ticket data or staff authentication is missing',
      });
      return;
    }

    try {
      setLoading('redemption', true, 'Processing redemption...');
      
      // Set payment data in store
      setPaymentData({
        cashAmount: data.paymentAmount, // For redemption, this is what we pay out
        digitalAmount: 0,
        totalCollected: data.paymentAmount,
        referenceNo: `RED${Date.now()}`,
      });
      
      // Process the redemption through the transaction service
      await processRedemption();
      
      // Success! Clear the form and show success message
      addToast({
        type: 'success',
        title: 'Redemption Processed',
        message: `Ticket redemption completed successfully. Amount paid: ${formatCurrency(data.paymentAmount)}`,
        persistent: true,
      });
      
      // Reset form and state
      handleReset();
      
    } catch (error) {
      console.error('Redemption processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Redemption processing failed';
      
      addToast({
        type: 'error',
        title: 'Processing Failed',
        message: errorMessage,
        persistent: true,
      });
    } finally {
      clearLoading('redemption');
    }
  };

  const handleReset = () => {
    // Reset form to initial state
    setValue('ticketNumber', '');
    setValue('customerName', '');
    setValue('customerNric', '');
    setValue('customerContact', '');
    setValue('pledgeDescription', '');
    setValue('pledgeWeight', '');
    setValue('principal', 0);
    setValue('interest', 0);
    setValue('totalAmount', 0);
    setValue('redeemerName', '');
    setValue('redeemerNric', '');
    setValue('redeemerContact', '');
    setValue('paymentAmount', 0);
    setValue('staffCode', '');
    setValue('secondStaffCode', '');
    setValue('remarks', '');
    setValue('termsAccepted', false);
    
    // Reset state
    setIsTicketFound(false);
    setTicketData(null);
    setLookupError(null);
    setIsDifferentRedeemer(false);
    setRequiresDualAuth(false);
    
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
            Ticket Redemptions
          </h1>
          <p className='text-muted-foreground'>
            Process ticket redemptions with redeemer validation and dual staff authentication
          </p>
        </div>
        <div className='text-right'>
          <div className='text-body-small text-muted-foreground'>Function</div>
          <div className='text-h3 font-semibold text-foreground font-mono'>FUNC-02</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className='space-y-6'>
        {/* Security Warning */}
        {isDifferentRedeemer && (
          <Card className='border-destructive/30 bg-destructive/5'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-destructive' />
                <span className='status-badge status-error'>Security Alert</span>
                <span className='text-body-small text-destructive'>
                  Redeemer does not match ticket holder - Dual staff authentication required
                </span>
              </div>
            </CardContent>
          </Card>
        )}

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
                        errors.ticketNumber && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                      )}
                      type='text'
                      placeholder='S/MMYY/XXXX'
                      onKeyPress={handleTicketKeyPress}
                    />
                    {errors.ticketNumber && (
                      <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                        <AlertCircle className='h-4 w-4' />
                        {errors.ticketNumber.message}
                      </div>
                    )}
                    <div className='text-caption'>Press Enter to lookup</div>
                  </div>
                  <div className='flex items-end'>
                    <Button 
                      type='button'
                      variant='secondary'
                      className='flex items-center gap-2 w-full'
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
                          <CheckCircle2 className='h-4 w-4 text-[var(--color-success)]' />
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
                  <div className='mt-4 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg'>
                    <div className='flex items-center gap-2 text-[var(--color-error)]'>
                      <AlertCircle className='h-5 w-5' />
                      <span className='font-semibold'>Lookup Failed</span>
                    </div>
                    <p className='text-[var(--color-error)] mt-1 text-body-small'>{lookupError}</p>
                    <div className='mt-3'>
                      <button
                        type='button'
                        className='text-[var(--color-error)] hover:text-[var(--color-error)] text-body-small underline'
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
                    <User className='h-5 w-5' />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label'>Customer Name</label>
                      <Input
                        {...register('customerName')}
                        className='bg-muted'
                        readOnly
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>NRIC</label>
                      <Input
                        {...register('customerNric')}
                        className='bg-muted text-mono'
                        readOnly
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Contact Number</label>
                      <Input
                        {...register('customerContact')}
                        className='bg-muted'
                        readOnly
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Pledge Weight</label>
                      <Input
                        {...register('pledgeWeight')}
                        className='bg-muted text-mono'
                        readOnly
                      />
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label'>Pledge Description</label>
                      <Input
                        {...register('pledgeDescription')}
                        className='bg-muted'
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Redeemer Identity Verification Section */}
            {isTicketFound && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <UserCheck className='h-5 w-5' />
                    Redeemer Identity Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label required' htmlFor='redeemer-nric'>
                        Redeemer NRIC
                      </label>
                      <Input
                        id='redeemer-nric'
                        {...register('redeemerNric')}
                        className={cn(
                          'text-mono',
                          errors.redeemerNric && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}
                        type='text'
                        placeholder='S1234567A'
                      />
                      {errors.redeemerNric && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.redeemerNric.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required' htmlFor='redeemer-name'>
                        Redeemer Name
                      </label>
                      <Input
                        id='redeemer-name'
                        {...register('redeemerName')}
                        className={cn(
                          errors.redeemerName && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}
                        type='text'
                        placeholder='Full name as per IC'
                      />
                      {errors.redeemerName && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.redeemerName.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Redeemer Contact</label>
                      <Input
                        {...register('redeemerContact')}
                        className={cn(
                          errors.redeemerContact && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}
                        type='text'
                        placeholder='+65 XXXX XXXX'
                      />
                      {errors.redeemerContact && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.redeemerContact.message}
                        </div>
                      )}
                    </div>
                    <div className='form-group'>
                      <label className='form-label required'>Relationship to Customer</label>
                      <Select
                        onValueChange={(value) => setValue('relationshipToCustomer', value as 'parent' | 'self' | 'other' | 'relative' | 'spouse' | 'child' | 'sibling' | 'authorized')}
                        defaultValue={watch('relationshipToCustomer')}
                      >
                        <SelectTrigger className={cn(
                          errors.relationshipToCustomer && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='self'>Self</SelectItem>
                          <SelectItem value='spouse'>Spouse</SelectItem>
                          <SelectItem value='child'>Child</SelectItem>
                          <SelectItem value='parent'>Parent</SelectItem>
                          <SelectItem value='sibling'>Sibling</SelectItem>
                          <SelectItem value='relative'>Other Relative</SelectItem>
                          <SelectItem value='authorized'>Authorized Representative</SelectItem>
                          <SelectItem value='other'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.relationshipToCustomer && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.relationshipToCustomer.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Identity Verification Status */}
                  <div className={cn(
                    'mt-4 p-3 rounded-lg border',
                    isDifferentRedeemer 
                      ? 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20' 
                      : 'bg-[var(--color-success)]/10 border-[var(--color-success)]/20'
                  )}>
                    <div className={cn(
                      'text-body-small',
                      isDifferentRedeemer ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'
                    )}>
                      <strong>
                        {isDifferentRedeemer ? 'Different Redeemer Detected:' : 'Same Person Redemption:'}
                      </strong> 
                      {isDifferentRedeemer 
                        ? ' Enhanced security verification required.' 
                        : ' Standard verification process applies.'
                      }
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
                    <CreditCard className='h-5 w-5' />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='form-group'>
                      <label className='form-label'>Principal Amount</label>
                      <Input
                        {...register('principal', { valueAsNumber: true })}
                        className='monetary-value bg-muted'
                        type='number'
                        step='0.01'
                        readOnly
                      />
                    </div>
                    <div className='form-group'>
                      <label className='form-label'>Interest Amount</label>
                      <Input
                        {...register('interest', { valueAsNumber: true })}
                        className='monetary-value bg-muted'
                        type='number'
                        step='0.01'
                        readOnly
                      />
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label'>Total Redemption Amount</label>
                      <Input
                        {...register('totalAmount', { valueAsNumber: true })}
                        className='monetary-value bg-muted text-h3 font-semibold'
                        type='number'
                        step='0.01'
                        readOnly
                      />
                    </div>
                    <div className='form-group md:col-span-2'>
                      <label className='form-label required'>Payment to Customer</label>
                      <Input
                        {...register('paymentAmount', { valueAsNumber: true })}
                        className={cn(
                          'monetary-value',
                          errors.paymentAmount && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}
                        type='number'
                        step='0.01'
                        placeholder='Amount to pay customer'
                      />
                      {errors.paymentAmount && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.paymentAmount.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Summary */}
                  <div className='mt-6 p-4 bg-muted rounded-lg'>
                    <h4 className='font-semibold text-foreground mb-3'>Payment Summary</h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between text-body-small'>
                        <span>Total Redemption Value:</span>
                        <span className='font-mono font-semibold'>{formatCurrency(watch('totalAmount') || 0)}</span>
                      </div>
                      <div className='flex justify-between text-body-small'>
                        <span>Amount to Pay Customer:</span>
                        <span className={cn(
                          'font-mono',
                          (watch('paymentAmount') || 0) === (watch('totalAmount') || 0) ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
                        )}>
                          {formatCurrency(watch('paymentAmount') || 0)}
                        </span>
                      </div>
                      <div className='mt-3 pt-2 border-t'>
                        <div className='flex items-center gap-2 text-body-small'>
                          {(watch('paymentAmount') || 0) === (watch('totalAmount') || 0) ? (
                            <>
                              <CheckCircle2 className='h-4 w-4 text-[var(--color-success)]' />
                              <span className='text-[var(--color-success)]'>Payment amount correct</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className='h-4 w-4 text-[var(--color-warning)]' />
                              <span className='text-[var(--color-warning)]'>Payment amount mismatch</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Staff Authentication Section */}
            {isTicketFound && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='h-5 w-5' />
                    Staff Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='form-group'>
                      <label className='form-label required' htmlFor='staff-code'>
                        Primary Staff Code
                      </label>
                      <Input
                        id='staff-code'
                        {...register('staffCode')}
                        className={cn(
                          errors.staffCode && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}
                        type='password'
                        placeholder='Enter your staff code'
                      />
                      {errors.staffCode && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.staffCode.message}
                        </div>
                      )}
                    </div>
                    
                    {requiresDualAuth && (
                      <div className='form-group'>
                        <label className='form-label required' htmlFor='secondary-staff-code'>
                          Secondary Staff Code
                        </label>
                        <Input
                          id='secondary-staff-code'
                          {...register('secondStaffCode')}
                          className={cn(
                            errors.secondStaffCode && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                          )}
                          type='password'
                          placeholder='Required for different redeemer'
                        />
                        {errors.secondStaffCode && (
                          <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                            <AlertCircle className='h-4 w-4' />
                            {errors.secondStaffCode.message}
                          </div>
                        )}
                        <div className='text-caption'>
                          Required when redeemer is not the original customer
                        </div>
                      </div>
                    )}
                    
                    <div className='form-group'>
                      <label className='form-label'>Additional Remarks</label>
                      <Textarea
                        {...register('remarks')}
                        className={cn(
                          errors.remarks && 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                        )}
                        rows={3}
                        placeholder='Optional remarks or notes'
                      />
                    </div>
                    
                    <div className='form-group'>
                      <label className='flex items-center gap-2'>
                        <Checkbox
                          {...register('termsAccepted')}
                          className={cn(
                            errors.termsAccepted && 'border-[var(--color-error)]'
                          )}
                        />
                        <span className='text-body-small'>
                          I confirm that all redemption terms and conditions have been explained and accepted
                        </span>
                      </label>
                      {errors.termsAccepted && (
                        <div className='flex items-center gap-1 mt-1 text-body-small text-[var(--color-error)]'>
                          <AlertCircle className='h-4 w-4' />
                          {errors.termsAccepted.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Authentication Status */}
                  {requiresDualAuth && (
                    <div className='mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                      <div className='text-body-small text-amber-800'>
                        <strong>Dual Authentication Required:</strong> Different redeemer detected. Secondary staff approval needed.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Transaction Error Display */}
        {Object.keys(transactionErrors).length > 0 && (
          <Card className='bg-[var(--color-error)]/10 border-[var(--color-error)]/20'>
            <CardContent className='p-4'>
              <h4 className='font-semibold text-[var(--color-error)] mb-2 flex items-center gap-2'>
                <AlertCircle className='h-5 w-5' />
                Transaction Errors
              </h4>
              <div className='space-y-1'>
                {Object.entries(transactionErrors).map(([field, error]) => (
                  <p key={field} className='text-[var(--color-error)] text-body-small'>
                    <strong>{field}:</strong> {error}
                  </p>
                ))}
              </div>
            </CardContent>
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
                message: 'Redemption data has been saved as draft',
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
              'Process Redemption'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}