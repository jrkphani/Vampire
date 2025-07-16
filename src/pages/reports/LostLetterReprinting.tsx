import React, { useState } from 'react';
import { Search, FileText, Printer, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

interface CustomerDetails {
  name: string;
  nric: string;
  contact: string;
  address: string;
}

interface TransactionDetails {
  ticketNumber: string;
  pledgeItem: string;
  transactionType: string;
  amount: number;
  transactionDate: string;
  expiryDate: string;
}

export function LostLetterReprinting() {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [letterType, setLetterType] = useState('renewal');
  const [printFormat, setPrintFormat] = useState('original');
  const [copies, setCopies] = useState(1);
  const [isLookupPerformed, setIsLookupPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sample data for demonstration
  const customerDetails: CustomerDetails = {
    name: 'Sarah Chen Li Min',
    nric: 'S8765432C',
    contact: '+65 9876 5432',
    address: '123 Orchard Road, #12-34, Singapore 238895'
  };

  const transactionDetails: TransactionDetails = {
    ticketNumber: 'S/0724/0067',
    pledgeItem: '18K Gold Necklace with pendant',
    transactionType: 'Renewal',
    amount: 185.50,
    transactionDate: '2024-07-14',
    expiryDate: '2024-10-14'
  };

  const handleReceiptLookup = async () => {
    if (!receiptNumber.trim()) {
      return;
    }

    setIsSearching(true);
    // TODO: Implement actual receipt lookup
    setTimeout(() => {
      setIsLookupPerformed(true);
      setIsSearching(false);
    }, 800);
  };

  const handleReceiptKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleReceiptLookup();
    }
  };

  const handleClearForm = () => {
    setReceiptNumber('');
    setTransactionDate('');
    setLetterType('renewal');
    setPrintFormat('original');
    setCopies(1);
    setIsLookupPerformed(false);
  };

  const handlePreviewLetter = () => {
    // TODO: Implement letter preview
    console.log('Preview letter:', { letterType, printFormat, copies });
  };

  const handleGeneratePrint = () => {
    // TODO: Implement generate and print
    console.log('Generate and print:', { receiptNumber, letterType, printFormat, copies });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <PageHeader 
        title="Lost Letter Reprinting"
        description="Reprint lost letters and receipts for existing transactions with receipt verification"
      />

      {/* Receipt Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className='h-5 w-5' />
            Receipt Lookup
          </CardTitle>
          <p className='text-body-small text-muted-foreground mt-1'>
            Enter receipt details to locate the transaction for reprinting
          </p>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='form-group'>
              <label className='form-label required' htmlFor='receipt-number'>
                Receipt Number
              </label>
              <Input
                id='receipt-number'
                className='input-field text-mono'
                type='text'
                placeholder='RCP20250714001'
                value={receiptNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                  const value = typeof e === 'string' ? e : e.target.value;
                  setReceiptNumber(value);
                }}
                onKeyPress={handleReceiptKeyPress}
                required
              />
              <div className='text-caption'>Format: RCP + Date + Sequence</div>
            </div>
            <div className='form-group'>
              <label className='form-label' htmlFor='transaction-date'>
                Transaction Date
              </label>
              <Input
                id='transaction-date'
                className='input-field'
                type='date'
                value={transactionDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                  const value = typeof e === 'string' ? e : e.target.value;
                  setTransactionDate(value);
                }}
              />
              <div className='text-caption'>Optional filter for faster lookup</div>
            </div>
          </div>
          <div className='mt-6'>
            <Button 
              className="flex items-center gap-2"
              onClick={handleReceiptLookup}
              disabled={!receiptNumber.trim() || isSearching}
            >
              {isSearching ? (
                <>
                  <div className='loading-spinner w-4 h-4'></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className='h-4 w-4' />
                  Lookup Receipt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lost Letter Details Display Section */}
      {isLookupPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Lost Letter Details
            </CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              Transaction details for receipt: <span className='text-mono font-semibold'>{receiptNumber}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Customer Details */}
              <div>
                <h4 className='font-semibold text-foreground mb-3'>Customer Details</h4>
                <dl className='space-y-2'>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Name:</dt>
                    <dd className='text-body-small font-medium text-foreground'>{customerDetails.name}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>NRIC:</dt>
                    <dd className='text-body-small font-medium text-foreground text-mono'>{customerDetails.nric}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Contact:</dt>
                    <dd className='text-body-small font-medium text-foreground'>{customerDetails.contact}</dd>
                  </div>
                  <div className='flex flex-col'>
                    <dt className='text-body-small text-muted-foreground'>Address:</dt>
                    <dd className='text-body-small font-medium text-foreground mt-1'>{customerDetails.address}</dd>
                  </div>
                </dl>
              </div>

              {/* Transaction Details */}
              <div>
                <h4 className='font-semibold text-foreground mb-3'>Transaction Details</h4>
                <dl className='space-y-2'>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Ticket Number:</dt>
                    <dd className='text-body-small font-medium text-foreground text-mono'>{transactionDetails.ticketNumber}</dd>
                  </div>
                  <div className='flex flex-col'>
                    <dt className='text-body-small text-muted-foreground'>Pledge Item:</dt>
                    <dd className='text-body-small font-medium text-foreground mt-1'>{transactionDetails.pledgeItem}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Type:</dt>
                    <dd className='text-body-small font-medium text-foreground'>{transactionDetails.transactionType}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Amount:</dt>
                    <dd className='text-body-small font-medium text-foreground monetary-value'>{formatCurrency(transactionDetails.amount)}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Transaction Date:</dt>
                    <dd className='text-body-small font-medium text-foreground'>{formatDate(transactionDetails.transactionDate)}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='text-body-small text-muted-foreground'>Expiry Date:</dt>
                    <dd className='text-body-small font-medium text-foreground'>{formatDate(transactionDetails.expiryDate)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Success Notice */}
            <div className='mt-6 bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center gap-2 text-green-800'>
                <FileText className='h-5 w-5' />
                <span className='font-semibold'>Transaction Found</span>
              </div>
              <p className='text-body-small text-green-700 mt-1'>
                Original transaction located successfully. You can now proceed with reprinting the letter.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reprint Actions Section */}
      {isLookupPerformed && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Printer className='h-5 w-5' />
              Reprint Options
            </CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              Configure letter type, format, and number of copies for reprinting
            </p>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              <div className='form-group'>
                <label className='form-label required' htmlFor='letter-type'>
                  Letter Type
                </label>
                <select
                  id='letter-type'
                  className='input-field'
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  required
                >
                  <option value='renewal'>Renewal Letter</option>
                  <option value='redemption'>Redemption Receipt</option>
                  <option value='lost-pledge'>Lost Pledge Report</option>
                  <option value='payment'>Payment Receipt</option>
                  <option value='expiry'>Expiry Notice</option>
                </select>
              </div>
              <div className='form-group'>
                <label className='form-label required' htmlFor='print-format'>
                  Print Format
                </label>
                <select
                  id='print-format'
                  className='input-field'
                  value={printFormat}
                  onChange={(e) => setPrintFormat(e.target.value)}
                  required
                >
                  <option value='original'>Original Format</option>
                  <option value='duplicate'>Duplicate Copy</option>
                  <option value='summary'>Summary Format</option>
                  <option value='detailed'>Detailed Format</option>
                </select>
              </div>
              <div className='form-group'>
                <label className='form-label required' htmlFor='copies'>
                  Copies
                </label>
                <Input
                  id='copies'
                  className='input-field'
                  type='number'
                  min='1'
                  max='10'
                  value={copies}
                  onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                    const value = typeof e === 'string' ? e : e.target.value;
                    setCopies(parseInt(value) || 1);
                  }}
                  required
                />
                <div className='text-caption'>Maximum 10 copies allowed</div>
              </div>
            </div>

            {/* Print Summary */}
            <div className='bg-muted rounded-lg p-4 mb-6'>
              <h4 className='font-semibold text-foreground mb-3'>Print Summary</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-body-small'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span>Document Type:</span>
                    <span className='font-semibold capitalize'>{letterType.replace('-', ' ')}</span>
                  </div>
                  <div className='flex justify-between mb-2'>
                    <span>Print Format:</span>
                    <span className='font-semibold capitalize'>{printFormat.replace('-', ' ')}</span>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span>Number of Copies:</span>
                    <span className='font-semibold'>{copies}</span>
                  </div>
                  <div className='flex justify-between mb-2'>
                    <span>Receipt Reference:</span>
                    <span className='font-semibold text-mono'>{receiptNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleClearForm}
              >
                Clear Form
              </Button>
              <Button 
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handlePreviewLetter}
              >
                <Eye className='h-4 w-4' />
                Preview Letter
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={handleGeneratePrint}
              >
                <Printer className='h-4 w-4' />
                Generate & Print
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Notice */}
      <Card className='bg-blue-50'>
        <CardContent className='p-4'>
          <h4 className='font-semibold text-blue-800 mb-2'>Reprint Guidelines</h4>
          <div className='text-body-small text-blue-700 space-y-1'>
            <p>• Receipt number is required and must match the original transaction</p>
            <p>• Transaction date can be used as an additional filter for faster lookup</p>
            <p>• All reprinted documents will be marked as "DUPLICATE COPY"</p>
            <p>• Maximum of 10 copies can be printed per request</p>
            <p>• Reprint fees may apply according to current pricing schedule</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}