import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Modal,
  ConfirmModal,
  CommandPalette,
  useCommandPalette,
  TicketStatusBadge,
  PaymentStatusBadge,
  PriorityBadge,
  AmountBadge,
  // Breadcrumb,
  SkipLink,
  ScreenReaderOnly,
  LiveRegion,
  Heading,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from './index';
import { Search, Plus } from 'lucide-react';

// Sample data for demonstrations
const sampleTickets = [
  {
    id: 1,
    ticketNumber: 'B/0724/001',
    customer: 'John Doe',
    amount: 1500.0,
    status: 'U',
    dueDate: '2024-08-15',
    description: 'Gold Ring - 18K',
  },
  {
    id: 2,
    ticketNumber: 'B/0724/002',
    customer: 'Jane Smith',
    amount: 2500.0,
    status: 'R',
    dueDate: '2024-08-20',
    description: 'Diamond Necklace',
  },
  {
    id: 3,
    ticketNumber: 'B/0724/003',
    customer: 'Bob Johnson',
    amount: 800.0,
    status: 'D',
    dueDate: '2024-08-10',
    description: 'Silver Watch',
  },
];

const tableColumns = [
  { key: 'ticketNumber' as const, header: 'Ticket Number', sortable: true },
  {
    key: 'customer' as const,
    header: 'Customer',
    sortable: true,
    searchable: true,
  },
  {
    key: 'amount' as const,
    header: 'Amount',
    align: 'right' as const,
    sortable: true,
    format: (value: unknown) => `S$${(value as number).toFixed(2)}`,
  },
  {
    key: 'status' as const,
    header: 'Status',
    format: (value: unknown) => <TicketStatusBadge status={value as any} />,
  },
  { key: 'dueDate' as const, header: 'Due Date', sortable: true },
  { key: 'description' as const, header: 'Description', searchable: true },
];

// const breadcrumbItems = [
//   { label: 'Transactions', href: '/transactions' },
//   { label: 'Renewals', href: '/transactions/renewals' },
//   { label: 'Ticket Details', current: true },
// ]

export function UIShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // const [selectedTicket, setSelectedTicket] = useState(null)
  const [liveMessage, setLiveMessage] = useState('');

  const { toast } = useToast();
  const commandPalette = useCommandPalette();

  const handleShowToast = (
    variant: 'success' | 'error' | 'warning' | 'info'
  ) => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred. Please try again.',
      warning: 'Please review the information before proceeding.',
      info: 'New information is available.',
    };

    toast({
      title: variant.charAt(0).toUpperCase() + variant.slice(1),
      description: messages[variant],
      variant: variant === 'error' ? 'destructive' : 'default',
    });
  };

  const handleTableRowClick = (row: any) => {
    // setSelectedTicket(row) // Disabled for demo
    setLiveMessage(
      `Selected ticket ${row.ticketNumber} for customer ${row.customer}`
    );
  };

  return (
    <div className='p-8 space-y-12 max-w-7xl mx-auto'>
      {/* Skip Link */}
      <SkipLink href='#main-content'>Skip to main content</SkipLink>

      {/* Live Region for Announcements */}
      <LiveRegion>{liveMessage}</LiveRegion>

      {/* Header */}
      <div className='text-center'>
        <Heading level={1} className='mb-4'>
          ValueMax Vampire UI Components
        </Heading>
        <p className='text-text-secondary text-h3'>
          Professional pawnshop interface components with comprehensive
          accessibility
        </p>
      </div>

      {/* Breadcrumbs */}
      <section className='space-y-4'>
        <Heading level={2}>Breadcrumb Navigation</Heading>
        <div className='bg-surface p-4 rounded-lg'>
          {/* <Breadcrumb items={breadcrumbItems} /> */}
          <p>Breadcrumb component disabled for demo</p>
        </div>
      </section>

      {/* Buttons */}
      <section className='space-y-4'>
        <Heading level={2}>Button Variants</Heading>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Primary Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button>Default Button</Button>
              {/* <PrimaryButton>Primary Button</PrimaryButton> */}
              {/* <SecondaryButton>Secondary Button</SecondaryButton> */}
              <p>Legacy button variants disabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secondary Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {/* <OutlineButton>Outline Button</OutlineButton> */}
              {/* <GhostButton>Ghost Button</GhostButton> */}
              {/* <DangerButton>Danger Button</DangerButton> */}
              <p>Legacy button variants disabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Icon Buttons</CardTitle>
            </CardHeader>
            <CardContent className='flex gap-3'>
              {/* <IconButton icon={Search} label='Search' /> */}
              {/* <IconButton icon={Plus} label='Add' variant='primary' /> */}
              {/* <IconButton icon={Edit} label='Edit' variant='secondary' /> */}
              {/* <IconButton icon={Trash2} label='Delete' variant='danger' /> */}
              <p>Legacy icon buttons disabled</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status Badges */}
      <section className='space-y-4'>
        <Heading level={2}>Status Badges</Heading>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Ticket Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                <TicketStatusBadge status='U' />
                <TicketStatusBadge status='R' />
                <TicketStatusBadge status='O' />
                <TicketStatusBadge status='D' />
                <TicketStatusBadge status='X' />
                <TicketStatusBadge status='L' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                <PaymentStatusBadge status='paid' />
                <PaymentStatusBadge status='unpaid' />
                <PaymentStatusBadge status='partial' />
                <PaymentStatusBadge status='overdue' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority & Amount</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                <PriorityBadge priority='urgent' />
                <PriorityBadge priority='high' />
                <PriorityBadge priority='medium' />
                <PriorityBadge priority='low' />
              </div>
              <div className='flex flex-wrap gap-2'>
                <AmountBadge amount={1500.0} />
                <AmountBadge amount={2500.0} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Table */}
      <section className='space-y-4'>
        <Heading level={2}>Enhanced Data Table</Heading>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map(column => (
                    <TableHead
                      key={column.key}
                      className={column.align === 'right' ? 'text-right' : ''}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTickets.map(ticket => (
                  <TableRow
                    key={ticket.id}
                    onClick={() => handleTableRowClick(ticket)}
                    className='cursor-pointer hover:bg-muted/50'
                  >
                    {tableColumns.map(column => (
                      <TableCell
                        key={column.key}
                        className={column.align === 'right' ? 'text-right' : ''}
                      >
                        {column.format
                          ? column.format(ticket[column.key])
                          : ticket[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Interactive Elements */}
      <section className='space-y-4'>
        <Heading level={2}>Interactive Components</Heading>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Modals & Dialogs</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button onClick={() => setShowModal(true)}>Open Modal</Button>
              <Button
                variant='destructive'
                onClick={() => setShowConfirmModal(true)}
              >
                Confirm Action
              </Button>
              <Button onClick={() => commandPalette.toggle()}>
                Command Palette (Ctrl+K)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toast Notifications</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShowToast('success')}
                >
                  Success
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShowToast('error')}
                >
                  Error
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShowToast('warning')}
                >
                  Warning
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShowToast('info')}
                >
                  Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className='space-y-4'>
        <Heading level={2}>Accessibility Features</Heading>
        <Card>
          <CardHeader>
            <CardTitle>WCAG 2.1 AA Compliance</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h4 className='font-semibold mb-2'>Keyboard Navigation</h4>
                <ul className='text-body-small text-text-secondary space-y-1'>
                  <li>• Tab/Shift+Tab for focus management</li>
                  <li>• Arrow keys for table navigation</li>
                  <li>• Enter/Space for activation</li>
                  <li>• Escape for closing modals</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold mb-2'>Screen Reader Support</h4>
                <ul className='text-body-small text-text-secondary space-y-1'>
                  <li>• ARIA labels and descriptions</li>
                  <li>• Live regions for announcements</li>
                  <li>• Semantic HTML structure</li>
                  <li>• High contrast mode support</li>
                </ul>
              </div>
            </div>
            <div className='mt-4 p-3 bg-surface rounded-lg'>
              <p className='text-body-small text-text-secondary'>
                <strong>Try:</strong> Press{' '}
                <kbd className='px-2 py-1 bg-white border border-border rounded text-caption'>
                  Ctrl+K
                </kbd>{' '}
                to open command palette, or{' '}
                <kbd className='px-2 py-1 bg-white border border-border rounded text-caption'>
                  Tab
                </kbd>{' '}
                to navigate through components.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Sample Modal'
        footer={
          <>
            <Button variant='outline' onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)}>Save Changes</Button>
          </>
        }
      >
        <p className='text-text-secondary'>
          This is a sample modal demonstrating the professional styling and
          keyboard navigation. You can press Tab to navigate through the
          buttons, or Escape to close.
        </p>
      </Modal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          toast({
            title: 'Success',
            description: 'Action confirmed successfully!',
            variant: 'default',
          });
        }}
        title='Confirm Action'
        message='Are you sure you want to proceed with this action? This cannot be undone.'
        variant='danger'
      />

      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        actions={[
          {
            id: 'search',
            label: 'Search Tickets',
            description: 'Search through all tickets',
            icon: Search,
            section: 'Search',
            action: () =>
              toast({
                title: 'Info',
                description: 'Search functionality activated',
              }),
          },
          {
            id: 'new-ticket',
            label: 'New Ticket',
            description: 'Create a new pawn ticket',
            icon: Plus,
            section: 'Actions',
            action: () =>
              toast({ title: 'Info', description: 'New ticket form opened' }),
          },
          {
            id: 'refresh',
            label: 'Refresh Data',
            description: 'Reload all data from server',
            // icon: RefreshCw, // Commented out - import missing
            section: 'Actions',
            shortcut: 'F5',
            action: () =>
              toast({ title: 'Info', description: 'Data refreshed' }),
          },
        ]}
        recentActions={commandPalette.recentActions}
        onRecentAction={commandPalette.handleRecentAction}
      />

      {/* Screen Reader Content */}
      <ScreenReaderOnly>
        <p>
          This page demonstrates the ValueMax Vampire UI component library with
          comprehensive accessibility features including keyboard navigation,
          screen reader support, and WCAG 2.1 AA compliance.
        </p>
      </ScreenReaderOnly>
    </div>
  );
}
