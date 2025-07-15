// Export all authentication components
export { Login } from '@/pages/auth/Login';
export { AuthGuard, withAuthGuard, useAuthGuard } from './AuthGuard';
export { SessionManager, SessionStatus } from './SessionManager';

// Types are defined locally in components and not exported

// Common authentication utilities
export const AUTH_PERMISSIONS = {
  TICKET_RENEWAL: 'ticket:renewal',
  TICKET_REDEMPTION: 'ticket:redemption',
  CUSTOMER_ENQUIRY: 'customer:enquiry',
  LOST_PLEDGE: 'lost:pledge',
  CREDIT_RATING: 'credit:rating',
  COMBINED_OPERATIONS: 'combined:operations',
  ADMIN_FUNCTIONS: 'admin:functions',
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  SYSTEM_SETTINGS: 'system:settings',
} as const;

export type AuthPermission = typeof AUTH_PERMISSIONS[keyof typeof AUTH_PERMISSIONS];

// Authentication helper functions
export const authHelpers = {
  isStaffAuthenticated: (staff: any) => Boolean(staff?.id && staff?.code),
  getStaffDisplayName: (staff: any) => staff?.name || 'Unknown Staff',
  hasAnyPermission: (staff: any, permissions: AuthPermission[]) => 
    permissions.some(permission => staff?.permissions?.includes(permission)),
  hasAllPermissions: (staff: any, permissions: AuthPermission[]) => 
    permissions.every(permission => staff?.permissions?.includes(permission)),
};