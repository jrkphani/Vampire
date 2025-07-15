import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/compat';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { validateStaffAuth } from '@/utils/validation';
import { validateStaffPin, maskSensitiveInfo } from '@/utils/business-helpers';
import type { StaffAuthentication, StaffInfo } from '@/types/business';

interface StaffAuthenticationProps {
  onAuthenticated: (auth: StaffAuthentication) => void;
  onError?: (error: string) => void;
  title?: string;
  description?: string;
  requireDualAuth?: boolean;
  primaryStaffId?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

interface StaffAuthState {
  staffCode: string;
  pin: string;
  isLoading: boolean;
  error: string | null;
  staffInfo: StaffInfo | null;
  isAuthenticated: boolean;
}

export function StaffAuthentication({
  onAuthenticated,
  onError,
  title = 'Staff Authentication',
  description = 'Please enter your staff credentials to continue',
  requireDualAuth = false,
  primaryStaffId,
  disabled = false,
  autoFocus = true,
  className = '',
}: StaffAuthenticationProps) {
  const [state, setState] = useState<StaffAuthState>({
    staffCode: '',
    pin: '',
    isLoading: false,
    error: null,
    staffInfo: null,
    isAuthenticated: false,
  });

  const staffCodeRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && staffCodeRef.current) {
      staffCodeRef.current.focus();
    }
  }, [autoFocus]);

  // Handle staff code change
  const handleStaffCodeChange = (value: string) => {
    setState(prev => ({
      ...prev,
      staffCode: value.toUpperCase(),
      error: null,
    }));
  };

  // Handle PIN change
  const handlePinChange = (value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setState(prev => ({
        ...prev,
        pin: value,
        error: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.staffCode || !state.pin) {
      setState(prev => ({
        ...prev,
        error: 'Please enter both staff code and PIN',
      }));
      return;
    }

    // Validate staff authentication format
    const validationResult = validateStaffAuth({
      staffCode: state.staffCode,
      pin: state.pin,
    });

    if (!validationResult.isValid) {
      setState(prev => ({
        ...prev,
        error: validationResult.error || 'Invalid staff credentials format',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call for staff authentication
      const authResult = await mockStaffAuthentication(
        state.staffCode,
        state.pin
      );

      if (authResult.success && authResult.staffInfo) {
        // Check dual auth requirements
        if (requireDualAuth && primaryStaffId) {
          if (authResult.staffInfo.id === primaryStaffId) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Different staff member required for dual authentication',
            }));
            onError?.(
              'Different staff member required for dual authentication'
            );
            return;
          }
        }

        const authentication: StaffAuthentication = {
          staffCode: state.staffCode,
          pin: state.pin,
          staffInfo: authResult.staffInfo,
        };

        setState(prev => ({
          ...prev,
          isLoading: false,
          staffInfo: authResult.staffInfo!,
          isAuthenticated: true,
          error: null,
        }));

        onAuthenticated(authentication);
      } else {
        const errorMessage = authResult.error || 'Invalid staff credentials';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  };

  // Handle key navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    field: 'staffCode' | 'pin'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'staffCode' && pinRef.current) {
        pinRef.current.focus();
      } else if (field === 'pin') {
        handleSubmit(e);
      }
    }

    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Clear form
  const handleClear = () => {
    setState({
      staffCode: '',
      pin: '',
      isLoading: false,
      error: null,
      staffInfo: null,
      isAuthenticated: false,
    });
    staffCodeRef.current?.focus();
  };

  // Check if form is valid
  const isFormValid =
    state.staffCode.length >= 3 && validateStaffPin(state.pin);

  return (
    <Card className={`space-y-6 ${className}`}>
      <div className='card-header'>
        <h3 className='card-title'>{title}</h3>
        {description && (
          <p className='text-sm text-text-secondary mt-1'>{description}</p>
        )}
        {requireDualAuth && (
          <div className='mt-2 p-2 bg-warning/10 border border-warning/20 rounded-md'>
            <p className='text-sm text-warning font-medium'>
              Dual Authentication Required
            </p>
            <p className='text-xs text-warning/80 mt-1'>
              A different staff member must authenticate this transaction
            </p>
          </div>
        )}
      </div>

      {!state.isAuthenticated ? (
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            ref={staffCodeRef}
            label='Staff Code'
            value={state.staffCode}
            onChange={handleStaffCodeChange}
            onKeyDown={e => handleKeyDown(e, 'staffCode')}
            placeholder='Enter staff code'
            error={
              state.error && state.error.includes('staff code')
                ? state.error
                : undefined
            }
            disabled={disabled || state.isLoading}
            className='font-mono text-lg'
            maxLength={10}
            required
          />

          <Input
            ref={pinRef}
            label='PIN'
            type='password'
            value={state.pin}
            onChange={handlePinChange}
            onKeyDown={e => handleKeyDown(e, 'pin')}
            placeholder='Enter PIN'
            error={
              state.error && !state.error.includes('staff code')
                ? state.error
                : undefined
            }
            disabled={disabled || state.isLoading}
            className='font-mono text-lg'
            maxLength={8}
            required
          />

          <div className='flex gap-3 pt-2'>
            <Button
              type='submit'
              variant='primary'
              disabled={!isFormValid || disabled || state.isLoading}
              className='flex-1'
            >
              {state.isLoading && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Authenticate
            </Button>

            <Button
              type='button'
              variant='secondary'
              onClick={handleClear}
              disabled={state.isLoading}
              title='Clear form (Escape)'
            >
              Clear
            </Button>
          </div>
        </form>
      ) : (
        // Authenticated state
        <div className='space-y-4'>
          <div className='flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg'>
            <div className='w-3 h-3 bg-success rounded-full' />
            <div className='flex-1'>
              <div className='font-semibold text-success'>
                Authentication Successful
              </div>
              <div className='text-sm text-success/80'>
                Staff: {state.staffInfo?.name} ({state.staffInfo?.code})
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-text-secondary'>Staff Code:</span>{' '}
              <span className='font-mono font-semibold'>
                {state.staffInfo?.code}
              </span>
            </div>
            <div>
              <span className='text-text-secondary'>Role:</span>{' '}
              <span className='font-semibold'>{state.staffInfo?.role}</span>
            </div>
            <div>
              <span className='text-text-secondary'>PIN:</span>{' '}
              <span className='font-mono'>
                {maskSensitiveInfo(state.pin, 1)}
              </span>
            </div>
            <div>
              <span className='text-text-secondary'>ID:</span>{' '}
              <span className='font-mono text-xs'>{state.staffInfo?.id}</span>
            </div>
          </div>

          <div className='flex justify-end pt-2'>
            <Button
              variant='tertiary'
              onClick={handleClear}
              disabled={disabled}
              size='sm'
            >
              Re-authenticate
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Mock API function - replace with actual API integration
interface StaffAuthResult {
  success: boolean;
  staffInfo?: StaffInfo;
  error?: string;
}

async function mockStaffAuthentication(
  staffCode: string,
  pin: string
): Promise<StaffAuthResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock staff database
  const mockStaffDb: Record<string, { pin: string; info: StaffInfo }> = {
    STAFF001: {
      pin: '1234',
      info: {
        id: 'staff-001',
        code: 'STAFF001',
        name: 'John Manager',
        role: 'Manager',
        permissions: ['renewal', 'redemption', 'lost_report', 'dual_auth'],
      },
    },
    STAFF002: {
      pin: '5678',
      info: {
        id: 'staff-002',
        code: 'STAFF002',
        name: 'Jane Assistant',
        role: 'Assistant',
        permissions: ['renewal', 'redemption', 'lost_report'],
      },
    },
    STAFF003: {
      pin: '9876',
      info: {
        id: 'staff-003',
        code: 'STAFF003',
        name: 'Bob Supervisor',
        role: 'Supervisor',
        permissions: [
          'renewal',
          'redemption',
          'lost_report',
          'dual_auth',
          'system_admin',
        ],
      },
    },
  };

  const staffData = mockStaffDb[staffCode];

  if (!staffData) {
    return {
      success: false,
      error: 'Staff code not found',
    };
  }

  if (staffData.pin !== pin) {
    return {
      success: false,
      error: 'Invalid PIN',
    };
  }

  return {
    success: true,
    staffInfo: staffData.info,
  };
}

export default StaffAuthentication;
