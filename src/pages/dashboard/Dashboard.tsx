import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  RotateCcw,
  Package,
  Search,
  AlertTriangle,
  Calculator,
  TrendingUp,
  DollarSign,
  FileText,
  Loader2,
} from 'lucide-react';
import { transactionService, ticketService, customerService } from '@/services/api';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import type { Transaction } from '@/types/business';

interface DashboardStats {
  todayRenewals: number;
  todayRedemptions: number;
  todayLostReports: number;
  todayAmount: number;
  activeTickets: number;
  totalCustomers: number;
  pendingTasks: number;
  systemAlerts: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
  keyboardShortcut?: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRenewals: 0,
    todayRedemptions: 0,
    todayLostReports: 0,
    todayAmount: 0,
    activeTickets: 0,
    totalCustomers: 0,
    pendingTasks: 0,
    systemAlerts: 0,
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // Store hooks
  const { addToast } = useUIStore();
  const { } = useAuthStore(); // Removed unused staff

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch recent transactions to calculate today's stats
        const transactions = await transactionService.getRecentTransactions(50);
        setRecentTransactions(transactions);
        
        // Calculate today's statistics
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayTransactions = transactions.filter(txn => 
          new Date(txn.transactionDate) >= todayStart
        );
        
        const todayRenewals = todayTransactions.filter(txn => txn.type === 'renewal').length;
        const todayRedemptions = todayTransactions.filter(txn => txn.type === 'redemption').length;
        const todayLostReports = todayTransactions.filter(txn => txn.type === 'lost_report').length;
        const todayAmount = todayTransactions.reduce((sum, txn) => {
          if (txn.type === 'renewal') {
            return sum + txn.interestAmount;
          } else if (txn.type === 'redemption') {
            return sum + txn.totalAmount;
          } else if (txn.type === 'lost_report') {
            return sum + txn.feeAmount;
          }
          return sum;
        }, 0);
        
        // Fetch additional statistics
        const [activeTicketsData, customersData] = await Promise.all([
          ticketService.searchTickets({ page: 1, limit: 1 }).then(result => result.pagination.total),
          customerService.searchCustomers({ page: 1, limit: 1 }).then(result => result.pagination.total)
        ]);
        
        setStats({
          todayRenewals,
          todayRedemptions,
          todayLostReports,
          todayAmount,
          activeTickets: activeTicketsData,
          totalCustomers: customersData,
          pendingTasks: 5, // This would come from a tasks service
          systemAlerts: 1, // This would come from a system monitoring service
        });
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        addToast({
          type: 'error',
          title: 'Data Load Failed',
          message: 'Unable to load dashboard statistics. Please refresh the page.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Refresh dashboard data every 5 minutes
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [addToast]);

  const quickActions: QuickAction[] = [
    {
      id: 'renewals',
      title: 'Ticket Renewals',
      description: 'Process single or multiple renewals',
      icon: <RotateCcw className='h-6 w-6' />,
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/20',
      onClick: () => console.log('Navigate to renewals'),
      keyboardShortcut: 'F1',
    },
    {
      id: 'redemptions',
      title: 'Ticket Redemptions',
      description: 'Process item redemptions',
      icon: <Package className='h-6 w-6' />,
      color: 'text-success',
      bgColor: 'bg-success/10 border-success/20',
      onClick: () => console.log('Navigate to redemptions'),
      keyboardShortcut: 'F2',
    },
    {
      id: 'enquiry',
      title: 'Universal Enquiry',
      description: 'Search customers, tickets & transactions',
      icon: <Search className='h-6 w-6' />,
      color: 'text-brand-red',
      bgColor: 'bg-brand-red/10 border-brand-red/20',
      onClick: () => console.log('Navigate to enquiry'),
      keyboardShortcut: 'F3',
    },
    {
      id: 'lost',
      title: 'Lost Pledges',
      description: 'Report lost items & reprint letters',
      icon: <AlertTriangle className='h-6 w-6' />,
      color: 'text-error',
      bgColor: 'bg-error/10 border-error/20',
      onClick: () => console.log('Navigate to lost pledges'),
      keyboardShortcut: 'F4',
    },
    {
      id: 'combined',
      title: 'Combined Operations',
      description: 'Process multiple operations together',
      icon: <Calculator className='h-6 w-6' />,
      color: 'text-warning',
      bgColor: 'bg-warning/10 border-warning/20',
      onClick: () => console.log('Navigate to combined operations'),
      keyboardShortcut: 'F5',
    },
    {
      id: 'credit',
      title: 'Credit Rating',
      description: 'Customer risk assessment',
      icon: <TrendingUp className='h-6 w-6' />,
      color: 'text-info',
      bgColor: 'bg-info/10 border-info/20',
      onClick: () => console.log('Navigate to credit rating'),
      keyboardShortcut: 'F6',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className='space-y-8'>
      {/* Header Section */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-h1 text-text-primary mb-2'>
            Dashboard
          </h1>
          <p className='text-text-secondary'>
            Welcome to ValueMax Vampire - Your pawnshop operations center
          </p>
        </div>
        <div className='text-right'>
          <div className='text-body-small text-text-secondary'>Current Time</div>
          <div className='text-h3 text-text-primary'>
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        <Card className='bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-body-small text-primary'>
                  Today's Renewals
                </p>
                <p className='text-h1 text-foreground'>
                  {isLoading ? (
                    <Loader2 className='h-6 w-6 animate-spin' />
                  ) : (
                    stats.todayRenewals
                  )}
                </p>
              </div>
              <div className='p-3 bg-primary/20 rounded-full'>
                <RotateCcw className='h-6 w-6 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-success/5 to-success/10 border-success/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-body-small text-success'>
                  Today's Redemptions
                </p>
                <p className='text-h1 text-foreground'>
                  {isLoading ? (
                    <Loader2 className='h-6 w-6 animate-spin' />
                  ) : (
                    stats.todayRedemptions
                  )}
                </p>
              </div>
              <div className='p-3 bg-success/20 rounded-full'>
                <Package className='h-6 w-6 text-success' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-brand-red/5 to-brand-red/10 border-brand-red/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-body-small text-brand-red'>
                  Active Tickets
                </p>
                <p className='text-h1 text-foreground'>
                  {isLoading ? (
                    <Loader2 className='h-6 w-6 animate-spin' />
                  ) : (
                    stats.activeTickets.toLocaleString()
                  )}
                </p>
              </div>
              <div className='p-3 bg-brand-red/20 rounded-full'>
                <FileText className='h-6 w-6 text-brand-red' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-body-small text-destructive'>
                  Today's Amount
                </p>
                <p className='text-h1 text-foreground'>
                  {isLoading ? (
                    <Loader2 className='h-6 w-6 animate-spin' />
                  ) : (
                    formatCurrency(stats.todayAmount)
                  )}
                </p>
              </div>
              <div className='p-3 bg-destructive/20 rounded-full'>
                <DollarSign className='h-6 w-6 text-destructive' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className='text-h2 text-text-primary mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {quickActions.map(action => (
            <Card
              key={action.id}
              className={`${action.bgColor} hover:shadow-lg transition-all cursor-pointer hover:scale-105`}
              onClick={action.onClick}
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className={`p-3 rounded-lg ${action.color} bg-white/80`}>
                    {action.icon}
                  </div>
                  {action.keyboardShortcut && (
                    <div className='text-caption bg-white/60 px-2 py-1 rounded font-mono'>
                      {action.keyboardShortcut}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className='text-h3 text-text-primary mb-1'>
                    {action.title}
                  </h3>
                  <p className='text-body-small text-text-secondary'>
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <h2 className='text-h2 text-text-primary mb-4'>
          Recent Transactions
        </h2>
        <Card>
          <CardContent className='p-6'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='ml-2'>Loading recent transactions...</span>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className='space-y-4'>
                {recentTransactions.slice(0, 5).map(transaction => (
                  <div key={transaction.id} className='flex items-center justify-between py-3 border-b last:border-b-0'>
                    <div className='flex items-center space-x-3'>
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'renewal' ? 'bg-primary/10' :
                        transaction.type === 'redemption' ? 'bg-success/10' :
                        'bg-destructive/10'
                      }`}>
                        {transaction.type === 'renewal' ? (
                          <RotateCcw className='h-4 w-4 text-primary' />
                        ) : transaction.type === 'redemption' ? (
                          <Package className='h-4 w-4 text-success' />
                        ) : (
                          <AlertTriangle className='h-4 w-4 text-destructive' />
                        )}
                      </div>
                      <div>
                        <p className='text-body font-semibold'>{transaction.ticketNo}</p>
                        <p className='text-body-small text-muted-foreground'>Customer ID: {transaction.customerId}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-mono font-semibold'>{formatCurrency(
                        transaction.type === 'renewal' ? transaction.interestAmount :
                        transaction.type === 'redemption' ? transaction.totalAmount :
                        transaction.type === 'lost_report' ? transaction.feeAmount : 0
                      )}</p>
                      <p className='text-body-small text-muted-foreground'>
                        {new Date(transaction.transactionDate).toLocaleDateString('en-SG')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No recent transactions available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
