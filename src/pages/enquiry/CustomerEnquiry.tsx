import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';

interface CustomerResult {
  nric: string;
  name: string;
  phone: string;
  id: string;
}

interface TicketResult {
  ticketNumber: string;
  customerName: string;
  issueDate: string;
  status: 'active' | 'redeemed' | 'renewed' | 'expired';
  amount: number;
  id: string;
}

export function CustomerEnquiry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Sample customer data
  const customerResults: CustomerResult[] = [
    {
      id: '1',
      nric: 'S1234567A',
      name: 'John Tan Wei Ming',
      phone: '+65 9123 4567'
    },
    {
      id: '2', 
      nric: 'S9876543B',
      name: 'Mary Lim Hui Fen',
      phone: '+65 8765 4321'
    },
    {
      id: '3',
      nric: 'S5555666C',
      name: 'David Wong Kah Wai',
      phone: '+65 9111 2222'
    }
  ];

  // Sample ticket data
  const ticketResults: TicketResult[] = [
    {
      id: '1',
      ticketNumber: 'B/0124/0001',
      customerName: 'John Tan Wei Ming',
      issueDate: '2024-01-15',
      status: 'active',
      amount: 245.00
    },
    {
      id: '2',
      ticketNumber: 'S/0124/0145',
      customerName: 'Mary Lim Hui Fen', 
      issueDate: '2024-01-12',
      status: 'renewed',
      amount: 517.50
    },
    {
      id: '3',
      ticketNumber: 'B/0124/0089',
      customerName: 'David Wong Kah Wai',
      issueDate: '2024-01-08',
      status: 'redeemed',
      amount: 180.00
    },
    {
      id: '4',
      ticketNumber: 'S/0124/0067',
      customerName: 'Sarah Chen Li Min',
      issueDate: '2024-01-03',
      status: 'expired',
      amount: 95.00
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // TODO: Implement actual search logic
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  const handleViewCustomer = (customerId: string) => {
    console.log('View customer details for ID:', customerId);
    // In a real app, you would navigate here:
    // navigate(`/customers/${customerId}`);
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

  const getStatusBadgeClass = (status: TicketResult['status']) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active';
      case 'renewed':
        return 'status-badge status-pending';
      case 'redeemed':
        return 'status-badge status-completed';
      case 'expired':
        return 'status-badge status-error';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <PageHeader 
        title="Universal Enquiry"
        description="Search customers, tickets, and transactions across the entire system"
      />

      {/* Universal Search Bar */}
      <div className='search-container'>
        <form onSubmit={handleSearch} className='relative'>
          <div className='search-bar'>
            <div className='search-icon'>
              <Search className={cn('h-5 w-5 text-muted-foreground', isSearching && 'animate-pulse')} />
            </div>
            <Input
              className='search-input'
              type='text'
              placeholder='Search by NRIC, Ticket Number, Phone, or Name...'
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                const value = typeof e === 'string' ? e : e.target.value;
                setSearchQuery(value);
              }}
              onKeyPress={handleSearchKeyPress}
            />
            {isSearching && (
              <div className='absolute right-4 top-1/2 -translate-y-1/2'>
                <div className='loading-spinner w-4 h-4'></div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Search Results Display Area */}
      <div className='grid grid-cols-1 gap-6'>
        {/* Customer Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Results</CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              {customerResults.length} customers found
            </p>
          </CardHeader>
          <CardContent className='pt-0'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>NRIC</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customerResults.map((customer) => (
                  <tr key={customer.id}>
                    <td className='text-mono'>{customer.nric}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className='flex items-center gap-2'
                        onClick={() => handleViewCustomer(customer.id)}
                      >
                        <Eye className='h-4 w-4' />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Ticket Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Results</CardTitle>
            <p className='text-body-small text-muted-foreground mt-1'>
              {ticketResults.length} tickets found
            </p>
          </CardHeader>
          <CardContent className='pt-0'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Customer Name</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {ticketResults.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className='text-mono'>{ticket.ticketNumber}</td>
                    <td>{ticket.customerName}</td>
                    <td>{formatDate(ticket.issueDate)}</td>
                    <td>
                      <span className={getStatusBadgeClass(ticket.status)}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className='monetary-value'>{formatCurrency(ticket.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Search Tips */}
      <Card className='bg-muted/30'>
        <CardContent className='p-4'>
          <h4 className='font-semibold text-foreground mb-2'>Search Tips</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-body-small text-muted-foreground'>
            <div>
              <strong>NRIC:</strong> Enter full NRIC (e.g., S1234567A)
            </div>
            <div>
              <strong>Ticket:</strong> Use format B/MMYY/XXXX or S/MMYY/XXXX
            </div>
            <div>
              <strong>Phone:</strong> Include country code (+65 9123 4567)
            </div>
            <div>
              <strong>Name:</strong> Partial name matching supported
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
