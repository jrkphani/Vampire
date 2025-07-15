/**
 * Compatibility layer for gradual migration from custom components to shadcn/ui
 *
 * This module provides wrapper components that maintain the existing API
 * while using shadcn/ui components under the hood.
 */

import React, { forwardRef } from 'react';
import { Input as BaseInput } from '@/components/ui/input-base';
import { useFormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';

// Legacy Input component interface
export interface LegacyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string | undefined;
  helper?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

/**
 * Compatibility wrapper for Input component
 * Maintains legacy API while using shadcn/ui components
 */
export const InputCompat = forwardRef<HTMLInputElement, LegacyInputProps>(
  ({ label, error, helper, required, onChange, className, ...props }, ref) => {
    // If used within a Form context, use FormField components
    const inFormContext = (() => {
      try {
        useFormField();
        return true;
      } catch {
        return false;
      }
    })();

    if (inFormContext && !label && !error) {
      // When used with react-hook-form, just return the base input
      return (
        <BaseInput
          ref={ref}
          className={className}
          {...props}
          onChange={e => onChange?.(e.target.value)}
        />
      );
    }

    // Standalone usage with label and error handling
    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'block text-body-small font-semibold text-foreground mb-2',
              required &&
                "after:content-['*'] after:text-destructive after:ml-1"
            )}
          >
            {label}
          </label>
        )}

        <BaseInput
          ref={ref}
          className={cn(
            error && 'border-destructive bg-destructive/5',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
          onChange={e => onChange?.(e.target.value)}
        />

        {helper && !error && (
          <p className='mt-1 text-body-small text-muted-foreground'>{helper}</p>
        )}

        {error && (
          <p id={`${props.id}-error`} className='mt-1 text-body-small text-destructive'>
            {error}
          </p>
        )}
      </div>
    );
  }
);
InputCompat.displayName = 'InputCompat';

/**
 * Migration helper: Maps old component imports to new ones
 * Usage: import { Input } from '@/components/ui/compat'
 */
export { InputCompat as Input };

// Re-export other UI components that don't need compatibility wrappers
export { Button } from '@/components/ui';
export { Card } from '@/components/ui/Card';

// Export form components for use in migrated components
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
