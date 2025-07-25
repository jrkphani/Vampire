import React, { useState } from 'react';
import { Plus, Upload, FileText, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

interface SelectedTicket {
  ticketNumber: string;
  customerName: string;
  status: 'active' | 'expired' | 'renewed';
  id: string;
}

export function LostPledgeManagement() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([
    {
      id: '1',
      ticketNumber: 'B/0124/0078',
      customerName: 'Sarah Lim Wei Ling',
      status: 'active'
    }
  ]);
  const [lostDescription, setLostDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleAddTicket = () => {
    if (ticketNumber.trim() && !selectedTickets.find(t => t.ticketNumber === ticketNumber)) {
      const newTicket: SelectedTicket = {
        id: Date.now().toString(),
        ticketNumber: ticketNumber.trim(),
        customerName: 'John Tan Wei Ming', // Mock data
        status: 'active'
      };
      setSelectedTickets([...selectedTickets, newTicket]);
      setTicketNumber('');
    }
  };

  const handleRemoveTicket = (id: string) => {
    setSelectedTickets(selectedTickets.filter(ticket => ticket.id !== id));
  };

  const handleTicketKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTicket();
    }
  };

  const handleUploadClick = () => {
    setIsUploading(true);
    // TODO: Implement file upload logic
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);
  };

  const getStatusBadgeClass = (status: SelectedTicket['status']) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active';
      case 'expired':
        return 'status-badge status-error';
      case 'renewed':
        return 'status-badge status-pending';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <PageHeader 
        title="Lost Pledge Management"
        description="Report lost pledges with detailed documentation and supporting evidence"
      />

      {/* Main Layout - Single Column with Cards */}
      <div className='space-y-6'>
        {/* Ticket Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Selection</CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              Add tickets for lost pledge reporting (multiple tickets supported)
            </p>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div className='md:col-span-3'>
                <div className='form-group'>
                  <label className='form-label required' htmlFor='ticket-number'>
                    Ticket Number
                  </label>
                  <Input
                    id='ticket-number'
                    className='input-field text-mono'
                    type='text'
                    placeholder='B/MMYY/XXXX or S/MMYY/XXXX'
                    value={ticketNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                      const value = typeof e === 'string' ? e : e.target.value;
                      setTicketNumber(value);
                    }}
                    onKeyPress={handleTicketKeyPress}
                    required
                  />
                  <div className='text-caption'>Press Enter to add ticket</div>
                </div>
              </div>
              <div className='form-group'>
                <label className='form-label opacity-0 select-none' aria-hidden='true'>
                  Action
                </label>
                <Button 
                  variant="outline"
                  className='flex items-center gap-2 w-full h-10'
                  onClick={handleAddTicket}
                  disabled={!ticketNumber.trim()}
                >
                  <Plus className='h-4 w-4' />
                  Add Ticket
                </Button>
              </div>
            </div>

            {/* Selected Tickets Table */}
            <div>
              <h4 className='font-semibold text-foreground mb-3'>
                Selected Tickets ({selectedTickets.length})
              </h4>
              <table className='data-table'>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Customer Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className='text-mono'>{ticket.ticketNumber}</td>
                      <td>{ticket.customerName}</td>
                      <td>
                        <span className={getStatusBadgeClass(ticket.status)}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <Button 
                          variant="outline"
                          size="sm"
                          className='flex items-center gap-2'
                          onClick={() => handleRemoveTicket(ticket.id)}
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
          </CardContent>
        </Card>

        {/* Lost Item Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Lost Item Details</CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              Provide detailed description of lost items and circumstances
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <div className='form-group'>
                <label className='form-label required' htmlFor='lost-description'>
                  Detailed Description
                </label>
                <textarea
                  id='lost-description'
                  className='input-field resize-y'
                  style={{ minHeight: 'var(--space-30)' }}
                  placeholder='Describe the lost item(s) and circumstances of the loss in detail. Include when and where the item was lost, any relevant details about the incident, and any supporting documentation available.'
                  value={lostDescription}
                  onChange={(e) => setLostDescription(e.target.value)}
                  required
                />
                <div className='text-caption'>
                  Include item description, loss circumstances, date/time, and location
                </div>
              </div>

              {/* Document Upload Area */}
              <div className='form-group'>
                <label className='form-label'>Supporting Documents</label>
                <div 
                  className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer'
                  onClick={handleUploadClick}
                >
                  <div className='flex flex-col items-center gap-3'>
                    <div className='p-3 bg-muted rounded-full'>
                      <Upload className={cn('h-6 w-6 text-muted-foreground', isUploading && 'animate-pulse')} />
                    </div>
                    <div>
                      <p className='font-semibold text-foreground'>
                        {isUploading ? 'Uploading...' : 'Upload Documents'}
                      </p>
                      <p className='text-body-small text-muted-foreground'>
                        Police reports, statutory declarations, or other supporting evidence
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                    >
                      Browse Files
                    </Button>
                  </div>
                </div>
                <div className='text-caption'>
                  Supported formats: PDF, JPG, PNG (Max 10MB per file)
                </div>
              </div>

              {/* Requirements Notice */}
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='h-5 w-5 text-amber-600 mt-0.5' />
                  <div>
                    <h4 className='font-semibold text-amber-800 mb-1'>Documentation Requirements</h4>
                    <ul className='text-body-small text-amber-700 space-y-1'>
                      <li>• Police report for stolen items (mandatory)</li>
                      <li>• Statutory declaration for lost items (if no police report)</li>
                      <li>• Original pawn ticket or receipt (if available)</li>
                      <li>• Valid identification of the person reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Report Generation</CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              Generate official lost pledge report and documentation
            </p>
          </CardHeader>
          <CardContent>
            <div className='bg-muted rounded-lg p-4 mb-6'>
              <h4 className='font-semibold text-foreground mb-3'>Report Summary</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-body-small'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span>Total Tickets:</span>
                    <span className='font-semibold'>{selectedTickets.length}</span>
                  </div>
                  <div className='flex justify-between mb-2'>
                    <span>Report Type:</span>
                    <span className='font-semibold'>Lost Pledge Report</span>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span>Supporting Documents:</span>
                    <span className='font-semibold'>0 uploaded</span>
                  </div>
                  <div className='flex justify-between mb-2'>
                    <span>Status:</span>
                    <span className='font-semibold text-amber-600'>Draft</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex gap-4'>
              <Button variant="outline" className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Preview Report
              </Button>
              <Button className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Generate Lost Pledge Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4 justify-end'>
        <Button variant="outline">
          Cancel
        </Button>
        <Button variant="secondary">
          Save Draft
        </Button>
        <Button 
          disabled={selectedTickets.length === 0 || !lostDescription.trim()}
        >
          Submit Report
        </Button>
      </div>
    </div>
  );
}
