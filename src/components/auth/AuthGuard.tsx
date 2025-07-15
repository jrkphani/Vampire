import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/api';
import { Login } from '@/pages/auth/Login';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function AuthGuard({ children, requiredPermission }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { 
    isAuthenticated, 
    staff, 
    token, 
    refreshToken, 
    isSessionValid, 
    hasPermission, 
    updateToken, 
    logout 
  } = useAuthStore();
  
  const { addToast } = useUIStore();

  useEffect(() => {
    const validateAuth = async () => {
      setIsLoading(true);
      setAuthError(null);

      try {
        // If no authentication data exists, redirect to login
        if (!isAuthenticated || !staff || !token) {
          setIsLoading(false);
          return;
        }

        // Check if session is still valid
        if (!isSessionValid()) {
          // Try to refresh token if refresh token exists
          if (refreshToken) {
            try {
              const refreshResponse = await authService.refreshToken(refreshToken);
              updateToken(refreshResponse.token, refreshResponse.expiresIn);
              
              addToast({
                type: 'info',
                title: 'Session Renewed',
                message: 'Your session has been automatically renewed.',
              });
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              logout();
              addToast({
                type: 'warning',
                title: 'Session Expired',
                message: 'Please sign in again to continue.',
              });
              setIsLoading(false);
              return;
            }
          } else {
            logout();
            addToast({
              type: 'warning',
              title: 'Session Expired',
              message: 'Please sign in again to continue.',
            });
            setIsLoading(false);
            return;
          }
        }

        // Check permission if required
        if (requiredPermission && !hasPermission(requiredPermission)) {
          setAuthError(`Access denied. Required permission: ${requiredPermission}`);
          addToast({
            type: 'error',
            title: 'Access Denied',
            message: `You don't have permission to access this feature.`,
          });
          setIsLoading(false);
          return;
        }

        // Validate session with server periodically
        try {
          await authService.getProfile();
        } catch (error) {
          console.error('Profile validation failed:', error);
          logout();
          addToast({
            type: 'error',
            title: 'Authentication Error',
            message: 'Session validation failed. Please sign in again.',
          });
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth validation error:', error);
        setAuthError('Authentication validation failed');
        setIsLoading(false);
      }
    };

    validateAuth();
  }, [
    isAuthenticated, 
    staff, 
    token, 
    refreshToken, 
    requiredPermission, 
    isSessionValid, 
    hasPermission, 
    updateToken, 
    logout, 
    addToast
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Validating Authentication
          </h2>
          <p className="text-muted-foreground">
            Please wait while we verify your session...
          </p>
        </div>
      </div>
    );
  }

  // Permission error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <div className="card bg-destructive/5 border-destructive/20">
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Access Denied
              </h2>
              <p className="text-muted-foreground mb-4">
                {authError}
              </p>
              <button
                onClick={() => logout()}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated || !staff || !token) {
    return <Login />;
  }

  // Authenticated and authorized - show protected content
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...(requiredPermission ? { requiredPermission } : {})}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking authentication state
export function useAuthGuard(requiredPermission?: string) {
  const { isAuthenticated, staff, hasPermission } = useAuthStore();
  
  return {
    isAuthenticated,
    staff,
    hasAccess: requiredPermission ? hasPermission(requiredPermission) : true,
    requiredPermission,
  };
}