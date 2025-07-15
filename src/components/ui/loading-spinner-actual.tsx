import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  LoadingSpinnerProps
>(({ size = 'md', className, children, ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {children && <span className='ml-2'>{children}</span>}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Re-export Skeleton from shadcn/ui if it exists
export { Skeleton } from './skeleton';
