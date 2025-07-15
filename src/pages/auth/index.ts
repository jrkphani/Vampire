// Export authentication pages
export { Login } from './Login';

// Re-export authentication components for convenience
export { AuthGuard, withAuthGuard, useAuthGuard } from '@/components/auth/AuthGuard';
export { SessionManager, SessionStatus } from '@/components/auth/SessionManager';
export { AUTH_PERMISSIONS, authHelpers } from '@/components/auth';
export type { AuthPermission } from '@/components/auth';