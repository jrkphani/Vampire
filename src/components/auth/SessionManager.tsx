import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';

interface SessionManagerProps {
  children: React.ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    isAuthenticated, 
    refreshToken, 
    getTimeUntilExpiry, 
    updateToken, 
    logout 
  } = useAuthStore();
  
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session status every 30 seconds
    const sessionCheckInterval = setInterval(() => {
      const timeLeft = getTimeUntilExpiry();
      setTimeUntilExpiry(timeLeft);

      // Show warning 10 minutes before expiry
      const warningThreshold = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      if (timeLeft <= warningThreshold && timeLeft > 0) {
        setShowSessionWarning(true);
      } else {
        setShowSessionWarning(false);
      }

      // Auto-logout when session expires
      if (timeLeft <= 0) {
        logout();
        addToast({
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired. Please sign in again.',
          persistent: true,
        });
      }
    }, 30000); // Check every 30 seconds

    // Initial check
    const timeLeft = getTimeUntilExpiry();
    setTimeUntilExpiry(timeLeft);

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated, getTimeUntilExpiry, logout, addToast]);

  const handleRefreshSession = async () => {
    if (!refreshToken) {
      logout();
      return;
    }

    setIsRefreshing(true);
    
    try {
      const refreshResponse = await authService.refreshToken(refreshToken);
      updateToken(refreshResponse.token, refreshResponse.expiresIn);
      
      setShowSessionWarning(false);
      
      addToast({
        type: 'success',
        title: 'Session Renewed',
        message: 'Your session has been successfully renewed.',
      });
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
      addToast({
        type: 'error',
        title: 'Session Refresh Failed',
        message: 'Unable to renew session. Please sign in again.',
        persistent: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
    });
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <h3 className="text-h3 font-semibold text-foreground">
                    Session Expiring Soon
                  </h3>
                  <p className="text-body-small text-muted-foreground">
                    Your session will expire in {formatTime(timeUntilExpiry)}
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock className="h-5 w-5" />
                  <span className="text-body-small">
                    Please choose an option to continue or you will be automatically logged out.
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleRefreshSession}
                  disabled={isRefreshing}
                  className="flex-1"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Renewing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew Session
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Component to display session status in the UI
export function SessionStatus() {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const { isAuthenticated, staff, getTimeUntilExpiry } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setTimeUntilExpiry(getTimeUntilExpiry());
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, getTimeUntilExpiry]);

  if (!isAuthenticated || !staff) return null;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (ms: number) => {
    const minutes = ms / (1000 * 60);
    if (minutes <= 10) return 'text-destructive';
    if (minutes <= 30) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center gap-2 text-body-small">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground">
        {staff.name} ({staff.code})
      </span>
      <span className="text-muted-foreground">•</span>
      <span className={getStatusColor(timeUntilExpiry)}>
        {formatTime(timeUntilExpiry)} left
      </span>
    </div>
  );
}