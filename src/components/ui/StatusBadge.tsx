import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Archive,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Badge, type BadgeProps } from './badge';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentType } from 'react';

// Extended badge variants to support business-specific styling
const statusBadgeVariants = cva(
  'inline-flex items-center gap-1 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        destructive: '',
        outline: '',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        info: 'bg-info text-info-foreground',
        subtle: 'bg-muted text-muted-foreground border border-border',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
        lg: 'px-4 py-1.5 text-base gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface StatusBadgeProps
  extends Omit<BadgeProps, 'variant'>,
    VariantProps<typeof statusBadgeVariants> {
  status: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

// Predefined status configurations for pawnshop operations
export const statusConfig = {
  // Ticket Status
  U: {
    label: 'Active',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Ticket is currently active',
  },
  R: {
    label: 'Renewed',
    variant: 'info' as const,
    icon: RefreshCw,
    description: 'Ticket has been renewed',
  },
  O: {
    label: 'Reopened',
    variant: 'warning' as const,
    icon: Archive,
    description: 'Ticket has been reopened',
  },
  D: {
    label: 'Redeemed',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Ticket has been redeemed',
  },
  X: {
    label: 'Expired',
    variant: 'destructive' as const,
    icon: XCircle,
    description: 'Ticket has expired',
  },
  L: {
    label: 'Lost',
    variant: 'destructive' as const,
    icon: AlertCircle,
    description: 'Ticket reported as lost',
  },

  // Transaction Status
  pending: {
    label: 'Pending',
    variant: 'warning' as const,
    icon: Clock,
    description: 'Transaction is pending',
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Transaction completed successfully',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive' as const,
    icon: XCircle,
    description: 'Transaction failed',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'secondary' as const,
    icon: XCircle,
    description: 'Transaction was cancelled',
  },
  processing: {
    label: 'Processing',
    variant: 'info' as const,
    icon: RefreshCw,
    description: 'Transaction is being processed',
  },

  // Payment Status
  paid: {
    label: 'Paid',
    variant: 'success' as const,
    icon: DollarSign,
    description: 'Payment completed',
  },
  unpaid: {
    label: 'Unpaid',
    variant: 'destructive' as const,
    icon: AlertCircle,
    description: 'Payment pending',
  },
  partial: {
    label: 'Partial',
    variant: 'warning' as const,
    icon: Clock,
    description: 'Partial payment received',
  },
  overdue: {
    label: 'Overdue',
    variant: 'destructive' as const,
    icon: AlertCircle,
    description: 'Payment is overdue',
  },

  // Document Status
  printed: {
    label: 'Printed',
    variant: 'success' as const,
    icon: FileText,
    description: 'Document has been printed',
  },
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileText,
    description: 'Document is in draft state',
  },
  sent: {
    label: 'Sent',
    variant: 'info' as const,
    icon: FileText,
    description: 'Document has been sent',
  },
} as const;

type StatusKey = keyof typeof statusConfig;

export function StatusBadge({
  status,
  variant,
  size = 'md',
  showIcon = true,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status as StatusKey];
  const displayText = children || config?.label || status;
  const Icon = config?.icon || CheckCircle;

  // Use config variant or passed variant, fallback to default
  const badgeVariant = variant || config?.variant || 'default';

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Map custom variants to shadcn/ui badge variants
  const mappedVariant = (() => {
    switch (badgeVariant) {
      case 'success':
      case 'info':
      case 'warning':
        return 'default';
      case 'subtle':
        return 'secondary';
      default:
        return badgeVariant;
    }
  })();

  return (
    <Badge
      variant={mappedVariant}
      className={cn(
        statusBadgeVariants({ variant: badgeVariant, size }),
        className
      )}
      title={config?.description || `Status: ${displayText}`}
      role='status'
      aria-label={`Status: ${displayText}`}
      {...props}
    >
      {showIcon && (
        <Icon className={iconSizeClasses[size || 'md']} aria-hidden='true' />
      )}
      <span>{displayText}</span>
    </Badge>
  );
}

// Convenience components for common statuses
export function TicketStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  status: 'U' | 'R' | 'O' | 'D' | 'X' | 'L';
}) {
  return <StatusBadge status={status} {...props} />;
}

export function TransactionStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
}) {
  return <StatusBadge status={status} {...props} />;
}

export function PaymentStatusBadge({
  status,
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  status: 'paid' | 'unpaid' | 'partial' | 'overdue';
}) {
  return <StatusBadge status={status} {...props} />;
}

// Custom status badge for non-predefined statuses
export function CustomStatusBadge({
  label,
  variant = 'secondary',
  icon,
  description,
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  label: string;
  variant?:
    | 'success'
    | 'destructive'
    | 'warning'
    | 'info'
    | 'secondary'
    | 'default'
    | 'outline'
    | 'subtle';
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  const Icon = icon || CheckCircle;
  const { showIcon = true, size = 'md', className } = props;

  // Ensure variant is never undefined
  const safeVariant = variant || 'secondary';

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Map custom variants to shadcn/ui badge variants
  const mappedVariant = (() => {
    switch (safeVariant) {
      case 'success':
      case 'info':
      case 'warning':
        return 'default';
      case 'subtle':
        return 'secondary';
      default:
        return safeVariant;
    }
  })();

  return (
    <Badge
      variant={mappedVariant}
      className={cn(
        statusBadgeVariants({ variant: safeVariant, size }),
        className
      )}
      title={description || `Status: ${label}`}
      role='status'
      aria-label={`Status: ${label}`}
    >
      {showIcon && (
        <Icon className={iconSizeClasses[size || 'md']} aria-hidden='true' />
      )}
      <span>{label}</span>
    </Badge>
  );
}

// Priority badge for urgent items
export function PriorityBadge({
  priority,
  ...props
}: Omit<StatusBadgeProps, 'status' | 'variant'> & {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}) {
  const priorityConfig: Record<
    'low' | 'medium' | 'high' | 'urgent',
    {
      variant:
        | 'success'
        | 'destructive'
        | 'warning'
        | 'info'
        | 'secondary'
        | 'default';
      icon: any;
    }
  > = {
    low: { variant: 'secondary', icon: Clock },
    medium: { variant: 'secondary', icon: Clock },
    high: { variant: 'secondary', icon: AlertCircle },
    urgent: { variant: 'destructive', icon: AlertCircle },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  const safeVariant:
    | 'success'
    | 'destructive'
    | 'warning'
    | 'info'
    | 'secondary'
    | 'default' = config.variant;

  return (
    <CustomStatusBadge
      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
      variant={safeVariant}
      icon={config.icon}
      description={`Priority: ${priority}`}
      showIcon={true}
      {...props}
    />
  );
}

// Amount badge for displaying monetary values
export function AmountBadge({
  amount,
  currency = 'S$',
  variant = 'subtle',
  ...props
}: Omit<StatusBadgeProps, 'status'> & {
  amount: number;
  currency?: string;
  variant?: 'subtle' | 'default' | 'outline';
}) {
  const formattedAmount = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount);

  return (
    <CustomStatusBadge
      label={formattedAmount}
      variant={variant === 'subtle' ? 'secondary' : 'default'}
      icon={DollarSign as ComponentType<{ className?: string }>}
      description={`Amount: ${formattedAmount}`}
      showIcon={true}
      {...props}
    />
  );
}
