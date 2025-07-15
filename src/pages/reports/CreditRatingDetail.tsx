import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  FileText,
  DollarSign,
  Calendar,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-actual';
import { customerService } from '@/services/api';
import { useUIStore } from '@/stores/uiStore';
import type { CustomerCreditDetails } from '@/types/business';

export function CreditRatingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  
  const [creditDetails, setCreditDetails] = useState<CustomerCreditDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditDetails = async () => {
      if (!id) {
        setError('Customer ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const details = await customerService.getCustomerCreditDetails(id);
        setCreditDetails(details);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load credit details';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Error Loading Credit Details',
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreditDetails();
  }, [id, addToast]);

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
      day: 'numeric'
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent': return 'text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/20';
      case 'good': return 'text-[var(--color-info)] bg-[var(--color-info)]/10 border-[var(--color-info)]/20';
      case 'fair': return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20';
      case 'poor': return 'text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20';
      default: return 'text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-[var(--color-border)]';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-[var(--color-success)] bg-[var(--color-success)]/10';
      case 'medium': return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10';
      case 'high': return 'text-[var(--color-error)] bg-[var(--color-error)]/10';
      default: return 'text-[var(--color-text-secondary)] bg-[var(--color-surface)]';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/reports/credit-rating')}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-4" />
                <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !creditDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/reports/credit-rating')}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-h1 font-bold text-foreground">Credit Rating Details</h1>
            <p className="text-muted-foreground">Customer credit assessment report</p>
          </div>
        </div>

        <Card className="bg-[var(--color-error)]/10 border-[var(--color-error)]/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-[var(--color-error)] mx-auto mb-4" />
            <h3 className="text-h3 font-semibold text-[var(--color-error)] mb-2">Unable to Load Credit Details</h3>
            <p className="text-[var(--color-error)] mb-4">{error || 'Credit details not found'}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="secondary"
            >
              <Loader2 className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="secondary"
          onClick={() => navigate('/reports/credit-rating')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-h1 font-bold text-foreground">
            Credit Rating Details
          </h1>
          <p className="text-muted-foreground">
            Detailed credit assessment for {creditDetails.customer.name}
          </p>
        </div>
      </div>

      {/* Customer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-body-small text-muted-foreground">Full Name</div>
              <div className="font-semibold">{creditDetails.customer.name}</div>
            </div>
            <div>
              <div className="text-body-small text-muted-foreground">NRIC</div>
              <div className="font-mono font-semibold">{creditDetails.customer.nric}</div>
            </div>
            <div>
              <div className="text-body-small text-muted-foreground">Contact</div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{creditDetails.customer.contact}</span>
              </div>
            </div>
            <div>
              <div className="text-body-small text-muted-foreground">Address</div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-small">{creditDetails.customer.address}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Credit Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small text-muted-foreground">Credit Score</div>
                <div className="text-display font-bold text-foreground">
                  {creditDetails.creditScore}
                </div>
              </div>
              <div className="p-3 bg-[var(--color-info)]/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-[var(--color-info)]" />
              </div>
            </div>
            <div className="mt-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-caption font-medium border',
                getRatingColor(creditDetails.rating)
              )}>
                {creditDetails.rating}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small text-muted-foreground">Risk Level</div>
                <div className="text-h1 font-bold text-foreground">
                  {creditDetails.riskLevel}
                </div>
              </div>
              <div className="p-3 bg-[var(--color-warning)]/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-[var(--color-warning)]" />
              </div>
            </div>
            <div className="mt-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-caption font-medium',
                getRiskColor(creditDetails.riskLevel)
              )}>
                Risk Assessment
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Exposure */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small text-muted-foreground">Total Exposure</div>
                <div className="text-h1 font-bold text-foreground">
                  {formatCurrency(creditDetails.totalExposure)}
                </div>
              </div>
              <div className="p-3 bg-[var(--color-success)]/10 rounded-full">
                <DollarSign className="h-6 w-6 text-[var(--color-success)]" />
              </div>
            </div>
            <div className="mt-2 text-caption text-muted-foreground">
              Current outstanding amount
            </div>
          </CardContent>
        </Card>

        {/* Last Assessment */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small text-muted-foreground">Last Assessment</div>
                <div className="text-h3 font-bold text-foreground">
                  {formatDate(creditDetails.lastAssessmentDate)}
                </div>
              </div>
              <div className="p-3 bg-[var(--color-info)]/10 rounded-full">
                <Calendar className="h-6 w-6 text-[var(--color-info)]" />
              </div>
            </div>
            <div className="mt-2 text-caption text-muted-foreground">
              Assessment date
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History & Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {creditDetails.transactionHistory.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.type}</div>
                    <div className="text-body-small text-muted-foreground">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                    <div className={cn(
                      'text-caption',
                      transaction.status === 'completed' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'
                    )}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credit Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit Assessment Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {creditDetails.assessmentFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {factor.impact === 'positive' ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                    ) : factor.impact === 'negative' ? (
                      <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
                    ) : (
                      <Clock className="h-4 w-4 text-[var(--color-warning)]" />
                    )}
                    <span className="text-body-small">{factor.factor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-small font-medium">{factor.weight}%</span>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      factor.impact === 'positive' ? 'bg-[var(--color-success)]' :
                      factor.impact === 'negative' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-warning)]'
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {creditDetails.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 flex-shrink-0" />
                    <span className="text-body-small">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Risk Mitigation</h4>
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-body-small text-muted-foreground mb-2">Current Risk Level</div>
                <div className={cn(
                  'px-3 py-1 rounded-full text-body-small font-medium inline-block',
                  getRiskColor(creditDetails.riskLevel)
                )}>
                  {creditDetails.riskLevel} Risk
                </div>
                <div className="mt-3 text-body-small">
                  <strong>Recommended Credit Limit:</strong> {formatCurrency(creditDetails.recommendedCreditLimit)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="secondary">
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        <Button variant="default">
          <TrendingUp className="h-4 w-4 mr-2" />
          Update Assessment
        </Button>
      </div>
    </div>
  );
}