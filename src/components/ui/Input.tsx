import * as React from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';

export interface CustomInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  label?: string;
  helper?: string;
  onChange?:
    | ((value: string) => void)
    | React.ChangeEventHandler<HTMLInputElement>
    | React.Dispatch<React.SetStateAction<string>>;
}

const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, type, label, onChange, ...props }, ref) => {
    // Handle multiple onChange patterns: string handler, event handler, or setState
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        if (onChange.length === 1) {
          // Custom onChange that expects a string value OR setState function
          (onChange as (value: string) => void)(e.target.value);
        } else {
          // Standard onChange that expects an event
          (onChange as React.ChangeEventHandler<HTMLInputElement>)(e);
        }
      }
    };

    const input = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-body ring-offset-background file:border-0 file:bg-transparent file:text-body-small file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-body-small',
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );

    if (label) {
      return (
        <div className='space-y-2'>
          <Label htmlFor={props.id}>{label}</Label>
          {input}
        </div>
      );
    }

    return input;
  }
);
Input.displayName = 'Input';

export { Input, type CustomInputProps as InputProps };
