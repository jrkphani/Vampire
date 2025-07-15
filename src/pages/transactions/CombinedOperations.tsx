import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, Package, CreditCard, User, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-actual';
import { useTransactionStore } from '@/stores/transactionStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  step1Schema,
  formatTicketNumber,
  calculateNetAmount,
  requiresDualAuthentication,
  requiresManagerApproval,
  type Step1Data
} from '@/schemas/combined-operations-schema';
import type { TicketData } from '@/types/business';
import { TicketStatus } from '@/types/business';

export function CombinedOperations() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [operationType, setOperationType] = useState<'renew' | 'redeem'>('renew');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Transaction store integration
  const {
    selectedTickets,
    validation,
    calculation,
    isProcessing,
    processingMessage,
    errors,
    hasActiveSession,
    startSession,
    endSession,
    addTicket,
    removeTicket,
    validateTickets,
    calculateTotals,
    proceedToNextStep,
    goToPreviousStep,
    canProceedToNextStep,
    getWorkflowProgress,
    processCombined,
    resetTransaction
  } = useTransactionStore();

  // Form management for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      tickets: [],
      currentOperationType: 'renew',
      currentTicketNumber: ''
    }
  });

  // Additional form instances would be defined here as needed

  // Initialize session on component mount
  useEffect(() => {
    if (!hasActiveSession()) {
      startSession('combined');
    }
    
    // Cleanup on unmount
    return () => {
      if (selectedTickets.length === 0) {
        endSession();
      }
    };
  }, []);

  // Update form data when store changes
  useEffect(() => {
    step1Form.setValue('tickets', selectedTickets.map(ticket => ({
      id: ticket.ticketNo,
      ticketNumber: ticket.ticketNo,
      customerName: ticket.customer.name,
      amount: ticket.financial.interest + ticket.financial.outstandings,
      operation: ticket.status === 'U' ? 'renew' : 'redeem'
    })));
  }, [selectedTickets]);

  // Calculate amounts from selected tickets
  const wizardData = React.useMemo(() => {
    const ticketItems = selectedTickets.map(ticket => ({
      id: ticket.ticketNo,
      ticketNumber: ticket.ticketNo,
      customerName: ticket.customer.name,
      amount: ticket.financial.interest + ticket.financial.outstandings,
      operation: ticket.status === 'U' ? 'renew' as const : 'redeem' as const
    }));
    
    const { totalRenewalAmount, totalRedemptionAmount, netAmount } = calculateNetAmount(ticketItems);
    
    return {
      tickets: ticketItems,
      totalRenewalAmount,
      totalRedemptionAmount,
      netAmount
    };
  }, [selectedTickets]);

  const handleAddTicket = async () => {
    const formattedTicketNumber = formatTicketNumber(ticketNumber.trim());
    
    if (!formattedTicketNumber || selectedTickets.some(t => t.ticketNo === formattedTicketNumber)) {
      return;
    }

    // Mock ticket data - in real app, this would come from API lookup
    const mockTicketData: TicketData = {
      ticketNo: formattedTicketNumber,
      pledgeNo: `PLG${Date.now()}`,
      customerId: `customer_${Date.now()}`,
      customer: {
        id: `customer_${Date.now()}`,
        nric: 'S1234567A',
        name: operationType === 'renew' ? 'John Tan Wei Ming' : 'Mary Lim Hui Fen',
        contact: '+65 9123 4567'
      },
      status: operationType === 'renew' ? TicketStatus.U : TicketStatus.R,
      financial: {
        principal: operationType === 'renew' ? 500.00 : 517.50,
        interest: operationType === 'renew' ? 24.00 : 0.00,
        months: 1,
        newAmount: 0,
        outstandings: 0.00,
        interestRate: 2.0
      },
      dates: {
        pawnDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      pledge: {
        pledgeNo: `PLG${Date.now()}`,
        weight: '18.5g',
        description: 'Gold Ring',
        scrambledNo: 'SCR123',
        pledgeCode: 'PC001',
        stCode: 'ST001',
        pCode: 'P001'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addTicket(mockTicketData);
    setTicketNumber('');
    
    // Auto-validate after adding ticket
    await validateTickets();
    await calculateTotals();
  };

  const handleRemoveTicket = async (ticketNo: string) => {
    removeTicket(ticketNo);
    
    // Recalculate after removal
    if (selectedTickets.length > 1) {
      await validateTickets();
      await calculateTotals();
    }
  };

  const handleTicketKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTicket();
    }
  };

  const handleNextStep = async () => {
    if (canProceedToNextStep()) {
      await proceedToNextStep();
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToPreviousStep();
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleProcessTransaction = async () => {
    try {
      await processCombined();
      // Success handling would be implemented here
    } catch (error) {
      console.error('Transaction processing failed:', error);
    }
  };

  const handleCancel = () => {
    resetTransaction();
    endSession();
    setCurrentStep(1);
    setTicketNumber('');
    setOperationType('renew');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <h3 className='text-h3 font-semibold text-foreground'>Ticket Selection & Operation Type</h3>
            
            {/* Operation Type Selection */}
            <RadioGroup onValueChange={(value) => setOperationType(value as 'renew' | 'redeem')} value={operationType}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    operationType === 'renew'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-muted-foreground/25 hover:border-blue-300'
                  )}
                  onClick={() => setOperationType('renew')}
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 rounded-full'>
                      <RotateCcw className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="renew" id="renew-option" />
                        <label htmlFor="renew-option"><strong>Renew</strong></label>
                      </div>
                      <p className='text-body-small text-muted-foreground'>Process ticket renewal</p>
                    </div>
                  </div>
                </div>
                
                <div
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    operationType === 'redeem'
                      ? 'border-green-500 bg-green-50'
                      : 'border-muted-foreground/25 hover:border-green-300'
                  )}
                  onClick={() => setOperationType('redeem')}
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-green-100 rounded-full'>
                      <Package className='h-5 w-5 text-green-600' />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="redeem" id="redeem-option" />
                        <label htmlFor="redeem-option"><strong>Redeem</strong></label>
                      </div>
                      <p className='text-body-small text-muted-foreground'>Process item redemption</p>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Ticket Lookup */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='md:col-span-3'>
                <div className='form-group'>
                  <label className='form-label required' htmlFor='ticket-lookup'>
                    Ticket Number
                  </label>
                  <Input
                    id='ticket-lookup'
                    className={cn(
                      'text-mono',
                      errors.ticketLookup && 'border-red-500 focus:border-red-500'
                    )}
                    type='text'
                    placeholder={operationType === 'renew' ? 'B/MMYY/XXXX' : 'S/MMYY/XXXX'}
                    value={ticketNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketNumber(formatTicketNumber(e.target.value))}
                    onKeyPress={handleTicketKeyPress}
                    disabled={isProcessing}
                    required
                  />
                  {errors.ticketLookup ? (
                    <div className='text-caption text-red-600 flex items-center gap-1 mt-1'>
                      <AlertCircle className='h-3 w-3' />
                      {errors.ticketLookup}
                    </div>
                  ) : (
                    <div className='text-caption'>Press Enter to add ticket</div>
                  )}
                </div>
              </div>
              <div className='form-group'>
                <label className='form-label opacity-0 select-none' aria-hidden='true'>
                  Action
                </label>
                <Button 
                  variant='outline'
                  className='flex items-center gap-2 w-full h-10'
                  onClick={handleAddTicket}
                  disabled={!ticketNumber.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <div className='h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full' />
                  ) : (
                    <Plus className='h-4 w-4' />
                  )}
                  Add Ticket
                </Button>
              </div>
            </div>

            {/* Validation Summary */}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
                <h4 className='font-semibold text-red-800 mb-2'>Validation Issues</h4>
                {validation.errors.map((error, index) => (
                  <div key={index} className='text-body-small text-red-700 flex items-center gap-2 mb-1'>
                    <AlertCircle className='h-4 w-4' />
                    <span><strong>{error.field}:</strong> {error.message}</span>
                  </div>
                ))}
                {validation.warnings.map((warning, index) => (
                  <div key={index} className='text-body-small text-yellow-700 flex items-center gap-2 mb-1'>
                    <AlertCircle className='h-4 w-4' />
                    <span><strong>{warning.field}:</strong> {warning.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Added Tickets Table */}
            {wizardData.tickets.length > 0 && (
              <div>
                <h4 className='font-semibold text-foreground mb-3'>
                  Added Tickets ({wizardData.tickets.length})
                </h4>
                <table className='data-table'>
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Customer Name</th>
                      <th>Operation</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wizardData.tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className='text-mono'>{ticket.ticketNumber}</td>
                        <td>{ticket.customerName}</td>
                        <td>
                          <span className={cn(
                            'status-badge',
                            ticket.operation === 'renew' ? 'status-pending' : 'status-completed'
                          )}>
                            {ticket.operation === 'renew' ? 'Renewal' : 'Redemption'}
                          </span>
                        </td>
                        <td className='monetary-value'>{formatCurrency(ticket.amount)}</td>
                        <td>
                          <Button 
                            variant='tertiary'
                            size='sm'
                            className='flex items-center gap-2'
                            onClick={() => handleRemoveTicket(ticket.ticketNumber)}
                            disabled={isProcessing}
                          >
                            <X className='h-4 w-4' />
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <h3 className='text-h3 font-semibold text-foreground'>Customer & Redeemer Verification</h3>
            
            {/* Authentication Requirements */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card className='bg-blue-50'>
                <CardContent className='p-4'>
                  <h4 className='font-semibold text-blue-800 mb-2 flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Authentication Required
                  </h4>
                  <div className='text-body-small text-blue-700 space-y-1'>
                    <p>• Dual Staff: {requiresDualAuthentication(wizardData.tickets, wizardData.netAmount) ? 'Yes' : 'No'}</p>
                    <p>• Manager Approval: {requiresManagerApproval(wizardData.tickets, wizardData.netAmount) ? 'Yes' : 'No'}</p>
                    <p>• Tickets Count: {wizardData.tickets.length}</p>
                    <p>• Net Amount: {formatCurrency(Math.abs(wizardData.netAmount))}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className='p-4'>
                  <h4 className='font-semibold text-foreground mb-2'>Verification Status</h4>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-body-small'>Primary Customer</span>
                      <span className='status-badge status-pending'>Pending</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-body-small'>Identity Documents</span>
                      <span className='status-badge status-pending'>Pending</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-body-small'>Authorization</span>
                      <span className='status-badge status-pending'>Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='bg-muted/30 p-6 rounded-lg text-center'>
              <User className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>Customer and redeemer verification forms will be implemented here</p>
              <p className='text-body-small text-muted-foreground mt-2'>NRIC validation, photo ID verification, and authorization checks</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <h3 className='text-h3 font-semibold text-foreground'>Payment Processing</h3>
            
            {/* Payment Summary */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardContent className='p-4'>
                  <h4 className='font-semibold text-foreground mb-3'>Transaction Summary</h4>
                  {calculation ? (
                    <div className='space-y-2'>
                      <div className='flex justify-between text-body-small'>
                        <span>Total Renewals:</span>
                        <span className='font-mono'>{formatCurrency(wizardData.totalRenewalAmount)}</span>
                      </div>
                      <div className='flex justify-between text-body-small'>
                        <span>Total Redemptions:</span>
                        <span className='font-mono'>-{formatCurrency(wizardData.totalRedemptionAmount)}</span>
                      </div>
                      <div className='border-t pt-2'>
                        <div className='flex justify-between font-semibold'>
                          <span>Net Amount:</span>
                          <span className={cn(
                            'font-mono',
                            wizardData.netAmount > 0 ? 'text-red-600' : 'text-green-600'
                          )}>
                            {formatCurrency(Math.abs(wizardData.netAmount))}
                          </span>
                        </div>
                        <div className='text-caption text-muted-foreground mt-1'>
                          {wizardData.netAmount > 0 ? 'Collect from customer' : 'Pay to customer'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-body-small text-muted-foreground'>Calculating totals...</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className='p-4'>
                  <h4 className='font-semibold text-foreground mb-3'>Payment Method</h4>
                  <RadioGroup onValueChange={(value) => setPaymentMethod(value)} value={paymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <label htmlFor="cash" className='text-body-small'>Cash</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <label htmlFor="card" className='text-body-small'>Card/NETS</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <label htmlFor="mixed" className='text-body-small'>Mixed Payment</label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div className='bg-muted/30 p-6 rounded-lg text-center'>
              <CreditCard className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>Payment collection forms will be implemented here</p>
              <p className='text-body-small text-muted-foreground mt-2'>Cash collection, card processing, and change calculation</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <h3 className='text-h3 font-semibold text-foreground'>Staff Authentication & Final Review</h3>
            
            {/* Transaction Review */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Review</CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h5 className='font-semibold mb-2'>Renewal Tickets</h5>
                    {wizardData.tickets.filter(t => t.operation === 'renew').map(ticket => (
                      <div key={ticket.id} className='text-body-small py-1 flex justify-between'>
                        <span className='font-mono'>{ticket.ticketNumber}</span>
                        <span className='font-mono'>{formatCurrency(ticket.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h5 className='font-semibold mb-2'>Redemption Tickets</h5>
                    {wizardData.tickets.filter(t => t.operation === 'redeem').map(ticket => (
                      <div key={ticket.id} className='text-body-small py-1 flex justify-between'>
                        <span className='font-mono'>{ticket.ticketNumber}</span>
                        <span className='font-mono'>{formatCurrency(ticket.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className='border-t mt-4 pt-4'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold'>Final Net Amount:</span>
                    <span className={cn(
                      'font-mono text-h3 font-bold',
                      wizardData.netAmount > 0 ? 'text-red-600' : 'text-green-600'
                    )}>
                      {formatCurrency(Math.abs(wizardData.netAmount))}
                    </span>
                  </div>
                  <div className='text-body-small text-muted-foreground mt-1'>
                    {wizardData.netAmount > 0 ? 'Amount to collect from customer' : 'Amount to pay to customer'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Requirements</CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className={cn(
                    'p-3 rounded-lg text-center',
                    requiresDualAuthentication(wizardData.tickets, wizardData.netAmount) 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  )}>
                    <div className='font-semibold'>Dual Staff Auth</div>
                    <div className='text-body-small'>
                      {requiresDualAuthentication(wizardData.tickets, wizardData.netAmount) ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                  
                  <div className={cn(
                    'p-3 rounded-lg text-center',
                    requiresManagerApproval(wizardData.tickets, wizardData.netAmount) 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  )}>
                    <div className='font-semibold'>Manager Approval</div>
                    <div className='text-body-small'>
                      {requiresManagerApproval(wizardData.tickets, wizardData.netAmount) ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                  
                  <div className='p-3 rounded-lg text-center bg-blue-50 text-blue-700'>
                    <div className='font-semibold'>Workflow Progress</div>
                    <div className='text-body-small'>{Math.round(getWorkflowProgress())}% Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='bg-muted/30 p-6 rounded-lg text-center'>
              <CheckCircle2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>Staff authentication forms will be implemented here</p>
              <p className='text-body-small text-muted-foreground mt-2'>PIN entry, manager approval, and final confirmation</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-h1 font-bold text-foreground mb-2'>
            Combined Operations
          </h1>
          <p className='text-muted-foreground'>
            Process multiple renewals and redemptions simultaneously with net settlement
          </p>
        </div>
        <div className='text-right'>
          <div className='text-body-small text-muted-foreground'>Function</div>
          <div className='text-h3 font-semibold text-foreground font-mono'>FUNC-06</div>
        </div>
      </div>

      {/* Two-Column Grid Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Form Area (2/3 width) */}
        <div className='lg:col-span-2'>
          <Card>
            {/* Step Progress Indicator */}
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Multi-Step Wizard</CardTitle>
                <div className='flex items-center gap-2'>
                  {[1, 2, 3, 4].map((step, index) => (
                    <React.Fragment key={step}>
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-body-small font-semibold',
                        step === currentStep
                          ? 'bg-brand-red text-white'
                          : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {step}
                      </div>
                      {index < 3 && (
                        <div className={cn(
                          'w-8 h-0.5',
                          step < currentStep ? 'bg-green-500' : 'bg-muted'
                        )} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className='text-body-small text-muted-foreground mt-2'>
                Step {currentStep} of 4
              </div>
            </CardHeader>

            {/* Step Content */}
            <CardContent className='p-6 pt-0'>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar (1/3 width) */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className='p-6 pt-0 space-y-4'>
              {/* Renewals Section */}
              <div>
                <h4 className='font-semibold text-foreground mb-2 flex items-center gap-2'>
                  <RotateCcw className='h-4 w-4 text-blue-600' />
                  Renewals
                </h4>
                <div className='bg-blue-50 p-3 rounded-lg'>
                  <div className='text-body-small text-muted-foreground'>
                    {wizardData.tickets.filter(t => t.operation === 'renew').length} tickets
                  </div>
                  <div className='font-semibold text-blue-700 font-mono'>
                    {formatCurrency(wizardData.totalRenewalAmount)}
                  </div>
                  {wizardData.tickets.filter(t => t.operation === 'renew').length > 0 && (
                    <div className='mt-2 space-y-1'>
                      {wizardData.tickets.filter(t => t.operation === 'renew').map(ticket => (
                        <div key={ticket.id} className='text-caption text-blue-600 flex justify-between'>
                          <span>{ticket.ticketNumber}</span>
                          <span>{formatCurrency(ticket.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Redemptions Section */}
              <div>
                <h4 className='font-semibold text-foreground mb-2 flex items-center gap-2'>
                  <Package className='h-4 w-4 text-green-600' />
                  Redemptions
                </h4>
                <div className='bg-green-50 p-3 rounded-lg'>
                  <div className='text-body-small text-muted-foreground'>
                    {wizardData.tickets.filter(t => t.operation === 'redeem').length} tickets
                  </div>
                  <div className='font-semibold text-green-700 font-mono'>
                    {formatCurrency(wizardData.totalRedemptionAmount)}
                  </div>
                  {wizardData.tickets.filter(t => t.operation === 'redeem').length > 0 && (
                    <div className='mt-2 space-y-1'>
                      {wizardData.tickets.filter(t => t.operation === 'redeem').map(ticket => (
                        <div key={ticket.id} className='text-caption text-green-600 flex justify-between'>
                          <span>{ticket.ticketNumber}</span>
                          <span>{formatCurrency(ticket.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className='border-t pt-4'>
                <h4 className='font-semibold text-foreground mb-2'>Net Amount</h4>
                <div className={cn(
                  'p-3 rounded-lg font-mono text-h3 font-bold',
                  wizardData.netAmount > 0
                    ? 'bg-red-50 text-red-700'
                    : wizardData.netAmount < 0
                    ? 'bg-green-50 text-green-700'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {formatCurrency(Math.abs(wizardData.netAmount))}
                </div>
                <div className='text-caption text-muted-foreground mt-1'>
                  {wizardData.netAmount > 0
                    ? 'Collect from customer'
                    : wizardData.netAmount < 0
                    ? 'Pay to customer'
                    : 'Net zero transaction'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wizard Navigation */}
      <div className='flex gap-4 justify-between'>
        <div>
          {currentStep > 1 && (
            <Button variant='secondary' onClick={handlePrevStep}>
              Previous
            </Button>
          )}
        </div>
        <div className='flex gap-4'>
          <Button 
            variant='tertiary'
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          {currentStep < 4 ? (
            <Button 
              variant='primary'
              onClick={handleNextStep}
              disabled={!canProceedToNextStep() || (currentStep === 1 && wizardData.tickets.length === 0)}
            >
              {isProcessing ? (
                <>
                  <div className='h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2' />
                  {processingMessage || 'Processing...'}
                </>
              ) : (
                'Next Step'
              )}
            </Button>
          ) : (
            <Button 
              variant='primary'
              onClick={handleProcessTransaction}
              disabled={!canProceedToNextStep() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className='h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2' />
                  {processingMessage || 'Processing...'}
                </>
              ) : (
                'Process All Transactions'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
