import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  TrendingUp,
  Search,
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChart,
  Target,
  History,
  Download,
  RefreshCw,
  Info,
  Shield,
  X,
} from 'lucide-react';
import { Customer, CreditRating, TicketData } from '@/types/business';

interface CreditAssessment {
  customer: Customer | null;
  creditRating: CreditRating | null;
  transactionHistory: TicketData[];
  riskFactors: string[];
  recommendations: string[];
  lastUpdated: string;
}

export function CreditRatingAssessment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<CreditAssessment | null>(null);

  // Mock data for demonstration
  const mockCustomer: Customer = {
    id: 'C001',
    nric: 'S1234567A',
    name: 'John Tan Wei Ming',
    dob: '1985-03-15',
    gender: 'M',
    nationality: 'Singapore',
    race: 'Chinese',
    address: '123 Orchard Road, #12-34',
    postalCode: '238858',
    contact: '+65 9123 4567',
    email: 'john.tan@email.com',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-10T14:30:00Z',
  };

  const mockCreditRating: CreditRating = {
    customerId: 'C001',
    score: 750,
    rating: 'A',
    outstandingAmount: 0,
    creditLimit: 5000,
    riskFactors: [],
    lastUpdated: '2024-07-10T14:30:00Z',
  };

  const mockTransactionHistory: TicketData[] = [
    {
      ticketNo: 'B/0725/1234',
      pledgeNo: 'P123456',
      customerId: 'C001',
      customer: {
        id: 'C001',
        nric: 'S1234567A',
        name: 'John Tan Wei Ming',
        contact: '+65 9123 4567',
      },
      pledge: {
        pledgeNo: 'P123456',
        weight: '18.5g',
        description: '18K Gold Chain with pendant',
        scrambledNo: 'SC789',
        pledgeCode: 'GC001',
        stCode: 'ST001',
        pCode: 'P001',
      },
      financial: {
        principal: 200.0,
        interest: 24.0,
        months: 3,
        newAmount: 224.0,
        outstandings: 0,
        interestRate: 1.5,
      },
      dates: {
        pawnDate: '2024-04-25',
        expiryDate: '2024-07-25',
        renewalDate: '2024-07-10',
      },
      status: 'U' as any,
      createdAt: '2024-04-25T10:00:00Z',
      updatedAt: '2024-07-10T14:30:00Z',
    },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a customer name or NRIC');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate risk factors and recommendations
      const riskFactors = calculateRiskFactors(
        mockTransactionHistory,
        mockCreditRating
      );
      const recommendations = generateRecommendations(
        mockCreditRating,
        riskFactors
      );

      setAssessment({
        customer: mockCustomer,
        creditRating: mockCreditRating,
        transactionHistory: mockTransactionHistory,
        riskFactors,
        recommendations,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to load customer credit assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskFactors = (
    transactions: TicketData[],
    creditRating: CreditRating
  ): string[] => {
    const factors: string[] = [];

    // Example risk factor calculations
    if (creditRating.outstandingAmount > creditRating.creditLimit * 0.8) {
      factors.push('High credit utilization (>80% of limit)');
    }

    if (transactions.length < 3) {
      factors.push('Limited transaction history');
    }

    const recentDefaults = transactions.filter(
      t => new Date(t.dates.expiryDate) < new Date() && t.status === 'U'
    );

    if (recentDefaults.length > 0) {
      factors.push(`${recentDefaults.length} ticket(s) past expiry`);
    }

    return factors;
  };

  const generateRecommendations = (
    creditRating: CreditRating,
    riskFactors: string[]
  ): string[] => {
    const recommendations: string[] = [];

    if (creditRating.rating === 'A') {
      recommendations.push('Eligible for premium customer benefits');
      recommendations.push('Consider increased credit limit');
    }

    if (riskFactors.length === 0) {
      recommendations.push('Maintain current credit terms');
      recommendations.push('Suitable for high-value transactions');
    } else {
      recommendations.push('Monitor account closely');
      if (riskFactors.some(f => f.includes('utilization'))) {
        recommendations.push('Recommend payment of outstanding amounts');
      }
    }

    return recommendations;
  };

  const refreshAssessment = () => {
    if (assessment) {
      handleSearch();
    }
  };

  const exportAssessment = () => {
    if (!assessment) return;

    const exportData = {
      customer: assessment.customer,
      creditRating: assessment.creditRating,
      riskFactors: assessment.riskFactors,
      recommendations: assessment.recommendations,
      exportedAt: new Date().toISOString(),
    };

    console.log('Exporting credit assessment:', exportData);
    // TODO: Implement actual export functionality
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'text-success bg-success/10';
      case 'B':
        return 'text-primary bg-primary/10';
      case 'C':
        return 'text-warning bg-warning/10';
      case 'D':
        return 'text-warning bg-warning/10';
      case 'F':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-success';
    if (score >= 650) return 'text-primary';
    if (score >= 550) return 'text-warning';
    if (score >= 450) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-h1 font-bold text-text-primary mb-2'>
            Credit Rating Assessment
          </h1>
          <p className='text-text-secondary'>
            Comprehensive customer risk evaluation and credit analysis
          </p>
        </div>
        <div className='text-right'>
          <div className='text-sm text-text-secondary'>Function</div>
          <div className='text-lg font-semibold text-text-primary'>FUNC-07</div>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className='h-5 w-5' />
            Customer Credit Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                placeholder='Enter customer name or NRIC (e.g., John Tan, S1234567A)'
                value={searchTerm}
                onChange={setSearchTerm}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className='text-lg'
              />
            </div>
            <Button
              variant='primary'
              onClick={handleSearch}
              disabled={isLoading}
              className='px-8'
            >
              {isLoading ? <LoadingSpinner size='sm' /> : 'Assess Credit'}
            </Button>
          </div>

          {error && (
            <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-4'>
              <div className='flex items-center gap-2 text-destructive'>
                <AlertTriangle className='h-5 w-5' />
                <span>{error}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setError(null)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Assessment Results */}
      {assessment && (
        <div className='space-y-6'>
          {/* Customer Overview */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Customer Overview
              </CardTitle>
              <div className='flex gap-2'>
                <Button variant='ghost' size='sm' onClick={refreshAssessment}>
                  <RefreshCw className='h-4 w-4 mr-1' />
                  Refresh
                </Button>
                <Button variant='ghost' size='sm' onClick={exportAssessment}>
                  <Download className='h-4 w-4 mr-1' />
                  Export
                </Button>
                {assessment.customer && (
                  <Link to={`/reports/credit-rating/${assessment.customer.id}`}>
                    <Button variant='outline' size='sm'>
                      <Info className='h-4 w-4 mr-1' />
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>Name:</span>
                    <span className='font-semibold'>
                      {assessment.customer && (
                        <Link 
                          to={`/reports/credit-rating/${assessment.customer.id}`}
                          className='text-blue-600 hover:text-blue-800 hover:underline'
                        >
                          {assessment.customer.name}
                        </Link>
                      )}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>NRIC:</span>
                    <span className='font-mono'>
                      {assessment.customer?.nric}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>Contact:</span>
                    <span>{assessment.customer?.contact}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>Customer Since:</span>
                    <span>
                      {formatDate(assessment.customer?.createdAt || '')}
                    </span>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>Address:</span>
                    <span className='text-right'>
                      {assessment.customer?.address}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>Email:</span>
                    <span>{assessment.customer?.email || 'Not provided'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-text-secondary'>Last Updated:</span>
                    <span>{formatDate(assessment.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Rating Dashboard */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-primary font-medium'>
                      Credit Score
                    </p>
                    <p
                      className={`text-3xl font-bold ${getScoreColor(assessment.creditRating?.score || 0)}`}
                    >
                      {assessment.creditRating?.score}
                    </p>
                  </div>
                  <div className='p-3 bg-primary/20 rounded-full'>
                    <BarChart3 className='h-6 w-6 text-primary' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-success/5 to-success/10 border-success/20'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-success font-medium'>
                      Credit Rating
                    </p>
                    <div
                      className={`text-2xl font-bold px-3 py-1 rounded ${getRatingColor(assessment.creditRating?.rating || 'F')}`}
                    >
                      {assessment.creditRating?.rating}
                    </div>
                  </div>
                  <div className='p-3 bg-success/20 rounded-full'>
                    <Target className='h-6 w-6 text-success' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-primary font-medium'>
                      Credit Limit
                    </p>
                    <p className='text-2xl font-bold text-primary font-mono'>
                      {formatCurrency(
                        assessment.creditRating?.creditLimit || 0
                      )}
                    </p>
                  </div>
                  <div className='p-3 bg-primary/20 rounded-full'>
                    <DollarSign className='h-6 w-6 text-primary' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-warning font-medium'>
                      Outstanding
                    </p>
                    <p className='text-2xl font-bold text-warning font-mono'>
                      {formatCurrency(
                        assessment.creditRating?.outstandingAmount || 0
                      )}
                    </p>
                  </div>
                  <div className='p-3 bg-warning/20 rounded-full'>
                    <AlertTriangle className='h-6 w-6 text-warning' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5 text-destructive' />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.riskFactors.length > 0 ? (
                  <div className='space-y-3'>
                    {assessment.riskFactors.map((factor, index) => (
                      <div
                        key={index}
                        className='flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'
                      >
                        <AlertTriangle className='h-5 w-5 text-destructive mt-0.5 flex-shrink-0' />
                        <span className='text-sm text-destructive'>
                          {factor}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <CheckCircle2 className='h-12 w-12 text-success mx-auto mb-3' />
                    <p className='text-success font-semibold'>
                      No Risk Factors Identified
                    </p>
                    <p className='text-sm text-success'>
                      Customer shows good credit behavior
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-primary' />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {assessment.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg'
                    >
                      <Info className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
                      <span className='text-sm text-primary'>
                        {recommendation}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <History className='h-5 w-5' />
                Transaction History ({assessment.transactionHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.transactionHistory.length > 0 ? (
                <div className='space-y-4'>
                  {assessment.transactionHistory.map(transaction => (
                    <div
                      key={transaction.ticketNo}
                      className='border rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-4'>
                          <h4 className='font-semibold text-text-primary'>
                            {transaction.ticketNo}
                          </h4>
                          <span className='text-sm bg-primary/10 text-primary px-2 py-1 rounded'>
                            {transaction.status}
                          </span>
                        </div>
                        <div className='text-right'>
                          <div className='text-sm text-text-secondary'>
                            Principal
                          </div>
                          <div className='font-semibold font-mono'>
                            {formatCurrency(transaction.financial.principal)}
                          </div>
                        </div>
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary'>
                        <div>
                          <strong>Item:</strong>{' '}
                          {transaction.pledge.description}
                        </div>
                        <div>
                          <strong>Pawned:</strong>{' '}
                          {formatDate(transaction.dates.pawnDate)}
                        </div>
                        <div>
                          <strong>Expires:</strong>{' '}
                          {formatDate(transaction.dates.expiryDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-text-secondary'>
                  <History className='h-12 w-12 mx-auto mb-3' />
                  <p>No transaction history available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Utilization Chart */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PieChart className='h-5 w-5' />
                Credit Utilization Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-2'>
                      <span>Credit Utilization</span>
                      <span className='font-semibold'>
                        {(
                          ((assessment.creditRating?.outstandingAmount || 0) /
                            (assessment.creditRating?.creditLimit || 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className='w-full bg-muted rounded-full h-3'>
                      <div
                        className='bg-primary h-3 rounded-full transition-all duration-300'
                        style={{
                          width: `${Math.min(100, ((assessment.creditRating?.outstandingAmount || 0) / (assessment.creditRating?.creditLimit || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>
                        Available Credit:
                      </span>
                      <span className='font-semibold font-mono'>
                        {formatCurrency(
                          (assessment.creditRating?.creditLimit || 0) -
                            (assessment.creditRating?.outstandingAmount || 0)
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Total Limit:</span>
                      <span className='font-semibold font-mono'>
                        {formatCurrency(
                          assessment.creditRating?.creditLimit || 0
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-text-secondary'>Outstanding:</span>
                      <span className='font-semibold font-mono'>
                        {formatCurrency(
                          assessment.creditRating?.outstandingAmount || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='font-semibold text-text-primary'>
                    Credit Health Indicators
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          (assessment.creditRating?.score || 0) >= 750
                            ? 'bg-success'
                            : (assessment.creditRating?.score || 0) >= 650
                              ? 'bg-primary'
                              : 'bg-warning'
                        }`}
                      ></div>
                      <span className='text-sm'>Credit Score: Excellent</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          (assessment.creditRating?.outstandingAmount || 0) /
                            (assessment.creditRating?.creditLimit || 1) <
                          0.3
                            ? 'bg-success'
                            : (assessment.creditRating?.outstandingAmount ||
                                  0) /
                                  (assessment.creditRating?.creditLimit || 1) <
                                0.7
                              ? 'bg-warning'
                              : 'bg-destructive'
                        }`}
                      ></div>
                      <span className='text-sm'>Utilization: Low Risk</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          assessment.transactionHistory.length >= 5
                            ? 'bg-success'
                            : assessment.transactionHistory.length >= 2
                              ? 'bg-warning'
                              : 'bg-destructive'
                        }`}
                      ></div>
                      <span className='text-sm'>
                        History:{' '}
                        {assessment.transactionHistory.length >= 5
                          ? 'Extensive'
                          : assessment.transactionHistory.length >= 2
                            ? 'Moderate'
                            : 'Limited'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {!assessment && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              Quick Credit Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <Button
                variant='secondary'
                className='flex items-center gap-2 justify-start h-auto p-4'
              >
                <TrendingUp className='h-5 w-5 text-success' />
                <div className='text-left'>
                  <div className='font-semibold'>High Value Customers</div>
                  <div className='text-sm text-text-secondary'>
                    Credit limit &gt; $10,000
                  </div>
                </div>
              </Button>
              <Button
                variant='secondary'
                className='flex items-center gap-2 justify-start h-auto p-4'
              >
                <AlertTriangle className='h-5 w-5 text-warning' />
                <div className='text-left'>
                  <div className='font-semibold'>At-Risk Customers</div>
                  <div className='text-sm text-text-secondary'>
                    High utilization or defaults
                  </div>
                </div>
              </Button>
              <Button
                variant='secondary'
                className='flex items-center gap-2 justify-start h-auto p-4'
              >
                <BarChart3 className='h-5 w-5 text-primary' />
                <div className='text-left'>
                  <div className='font-semibold'>Credit Reports</div>
                  <div className='text-sm text-text-secondary'>
                    Bulk assessment tools
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
