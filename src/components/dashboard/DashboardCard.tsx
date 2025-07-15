import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

export function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className,
  children 
}: DashboardCardProps) {
  return (
    <div className={cn('card card-hover', className)}>
      <div className="card-header">
        <h3 className="card-title flex items-center justify-between">
          <span>{title}</span>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </h3>
      </div>
      <div className="card-content p-6 pt-0">
        <div className="text-h1 font-bold text-foreground mb-2">
          {value}
        </div>
        {trend && (
          <div className={cn(
            'text-body-small flex items-center gap-1',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{trend.value}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}